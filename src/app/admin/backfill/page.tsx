"use client";

import { useState, useEffect, useRef } from "react";
import { supabase, supabaseUrl, supabaseAnonKey } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2, RefreshCw, ArrowRight, Bug, RotateCcw, Zap, Square,
  AlertTriangle, Search, ChevronDown, ChevronUp,
} from "lucide-react";

/* ───────────────────────────── types ───────────────────────────── */
interface AnalysisResult {
  success: boolean;
  mode: string;
  method?: string;
  total_profiles: number;
  shopify_linked_profiles: number;
  empty_column_counts: Record<string, number>;
  fillable_from_shopify: Record<string, { available: number; canFill: number }>;
}

interface BatchResult {
  success: boolean;
  has_more: boolean;
  next_offset: number | null;
  batch_start: number;
  batch_end: number;
  batch_size: number;
  shopify_linked_profiles: number;
  backfill_updates: number;
  processed_count: number;
  skipped_count: number;
  api_errors: number;
  backfill_errors: string[];
  force_overwrite: boolean;
}

interface ProgressData {
  status: string;
  total_profiles: number;
  processed: number;
  updated: number;
  skipped: number;
  api_errors: number;
  current_salon: string;
  started_at: string | null;
}

/* ───────────────────────────── component ───────────────────────── */
export default function BackfillPage() {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [backfilling, setBackfilling] = useState(false);
  const [debugging, setDebugging] = useState(false);
  const [debugData, setDebugData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [forceOverwrite, setForceOverwrite] = useState(false);
  const [batchSize, setBatchSize] = useState(10);
  const [batchLog, setBatchLog] = useState<string[]>([]);
  const [allErrors, setAllErrors] = useState<string[]>([]);
  const [totalUpdated, setTotalUpdated] = useState(0);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(true);
  const [discoveredKeys, setDiscoveredKeys] = useState<any>(null);
  const [discovering, setDiscovering] = useState(false);

  // Diagnose state
  const [diagnosing, setDiagnosing] = useState(false);
  const [diagnoseData, setDiagnoseData] = useState<any>(null);
  const [diagnoseField, setDiagnoseField] = useState('address');

  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(true);
  const abortRef = useRef(false);

  /* ─── cleanup ─────────────────────────────────────────────────── */
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (pollRef.current) clearInterval(pollRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  /* ─── elapsed timer — ticks every second while backfilling ────── */
  useEffect(() => {
    if (progress?.started_at && (progress.status === "running" || progress.status === "batch_done")) {
      // Immediately compute elapsed
      setElapsedSeconds(Math.round((Date.now() - new Date(progress.started_at).getTime()) / 1000));
      // Tick every second
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        if (!mountedRef.current) return;
        setElapsedSeconds(Math.round((Date.now() - new Date(progress.started_at!).getTime()) / 1000));
      }, 1000);
    } else {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    }
    return () => {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    };
  }, [progress?.started_at, progress?.status]);

  /* ─── edge function call ──────────────────────────────────────── */
  const callEdgeFunction = async (payload: Record<string, any>) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 300_000);

    try {
      let accessToken = supabaseAnonKey;
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) accessToken = session.access_token;
      } catch { /* use anon key */ }

      const response = await fetch(
        `${supabaseUrl}/functions/v1/supabase-functions-backfill-salon-profiles`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            apikey: supabaseAnonKey,
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText.substring(0, 300)}`);
      }

      return response.json();
    } finally {
      clearTimeout(timeout);
    }
  };

  /* ─── poll progress ───────────────────────────────────────────── */
  const pollProgress = async () => {
    try {
      const { data } = await supabase
        .from("backfill_progress")
        .select("*")
        .eq("id", "current")
        .single();
      if (!mountedRef.current) return;
      if (data) {
        setProgress(data);
        if (data.status === "finished" || data.status === "error") {
          if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
        }
      }
    } catch { /* ignore */ }
  };

  const startPolling = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollProgress();
    pollRef.current = setInterval(pollProgress, 1500);
  };

  /* ─── analyze ─────────────────────────────────────────────────── */
  const runAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await callEdgeFunction({ mode: "analyze" });
      if (mountedRef.current) setAnalysis(data);
    } catch (err: any) {
      if (mountedRef.current) setError(err.message);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  /* ─── discover metafield keys ─────────────────────────────────── */
  const runDiscover = async () => {
    setDiscovering(true);
    setError(null);
    try {
      const data = await callEdgeFunction({ mode: "discover", discover_count: 10 });
      if (mountedRef.current) setDiscoveredKeys(data);
    } catch (err: any) {
      if (mountedRef.current) setError(err.message);
    } finally {
      if (mountedRef.current) setDiscovering(false);
    }
  };

  /* ─── diagnose ─────────────────────────────────────────────────── */
  const runDiagnose = async () => {
    setDiagnosing(true);
    setError(null);
    setDiagnoseData(null);
    try {
      const data = await callEdgeFunction({ mode: "diagnose", field: diagnoseField, limit: 50, offset: 0 });
      if (mountedRef.current) setDiagnoseData(data);
    } catch (err: any) {
      if (mountedRef.current) setError(err.message);
    } finally {
      if (mountedRef.current) setDiagnosing(false);
    }
  };

  /* ─── helper: read DB progress to recover offset ──────────────── */
  const getProgressFromDB = async (): Promise<{ processed: number; status: string } | null> => {
    try {
      const { data } = await supabase
        .from("backfill_progress")
        .select("*")
        .eq("id", "current")
        .single();
      return data;
    } catch { return null; }
  };

  /* ─── backfill (auto-resume batches) ──────────────────────────── */
  const runBackfill = async (resumeFromOffset?: number) => {
    const isResume = typeof resumeFromOffset === "number";
    const overwriteLabel = forceOverwrite ? "\n⚠️ Force Overwrite 開咗！會覆蓋已有嘅值！" : "";
    const resumeLabel = isResume ? `\n📍 從 offset ${resumeFromOffset} 繼續` : "";
    if (!confirm(`確定要${isResume ? "繼續" : "執行"} backfill？\n\n每批處理 ${batchSize} 個美容院，自動續跑直到全部完成。${overwriteLabel}${resumeLabel}\n\n按「確定」開始。`)) return;

    setBackfilling(true);
    setError(null);
    if (!isResume) {
      setProgress(null);
      setBatchLog([]);
      setAllErrors([]);
      setTotalUpdated(0);
    }
    abortRef.current = false;

    startPolling();

    let currentOffset = isResume ? resumeFromOffset : 0;
    let hasMore = true;
    let batchNum = isResume ? Math.floor(resumeFromOffset / batchSize) : 0;
    let cumulativeUpdated = totalUpdated;
    const cumulativeErrors: string[] = [...allErrors];

    if (isResume) {
      setBatchLog(prev => [...prev, `🔄 從 offset ${resumeFromOffset} 繼續...`]);
    }

    try {
      while (hasMore && !abortRef.current) {
        batchNum++;
        setBatchLog(prev => [...prev, `⏳ 批次 #${batchNum}: offset ${currentOffset}, batch_size ${batchSize}...`]);

        try {
          const result: BatchResult = await callEdgeFunction({
            mode: "backfill",
            offset: currentOffset,
            batch_size: batchSize,
            force_overwrite: forceOverwrite,
          });

          if (!mountedRef.current) return;

          cumulativeUpdated = result.backfill_updates || cumulativeUpdated;
          setTotalUpdated(cumulativeUpdated);

          if (result.backfill_errors?.length > 0) {
            cumulativeErrors.push(...result.backfill_errors);
            setAllErrors([...cumulativeErrors]);
          }

          setBatchLog(prev => [
            ...prev.slice(0, -1),
            `✅ 批次 #${batchNum}: ${result.batch_start}-${result.batch_end} / ${result.shopify_linked_profiles} (更新: ${result.backfill_updates}, 錯誤: ${result.api_errors})`,
          ]);

          hasMore = result.has_more;
          currentOffset = result.next_offset || 0;

          if (hasMore && !abortRef.current) await new Promise(r => setTimeout(r, 1000));
        } catch (batchErr: any) {
          if (!mountedRef.current) return;
          const isTimeout = batchErr.name === "AbortError" || batchErr.message?.includes("aborted");
          setBatchLog(prev => [...prev.slice(0, -1), `❌ 批次 #${batchNum} ${isTimeout ? "超時" : "失敗"}: ${batchErr.message}`]);
          
          // Try to recover actual progress from DB
          const dbProgress = await getProgressFromDB();
          if (dbProgress && dbProgress.processed > currentOffset) {
            const recoveredOffset = dbProgress.processed;
            setBatchLog(prev => [...prev, `📊 從 DB 恢復進度: 已處理 ${recoveredOffset}，從呢度繼續...`]);
            currentOffset = recoveredOffset;
            // Short pause then continue
            await new Promise(r => setTimeout(r, 2000));
            if (abortRef.current) break;
            continue; // Skip retry, just continue from recovered offset
          }

          setBatchLog(prev => [...prev, `🔄 等3秒後重試...`]);
          await new Promise(r => setTimeout(r, 3000));
          if (abortRef.current) break;

          try {
            const retryResult: BatchResult = await callEdgeFunction({
              mode: "backfill",
              offset: currentOffset,
              batch_size: batchSize,
              force_overwrite: forceOverwrite,
            });
            if (!mountedRef.current) return;
            cumulativeUpdated = retryResult.backfill_updates || cumulativeUpdated;
            setTotalUpdated(cumulativeUpdated);
            setBatchLog(prev => [...prev.slice(0, -1), `✅ 重試成功: ${retryResult.batch_start}-${retryResult.batch_end}`]);
            hasMore = retryResult.has_more;
            currentOffset = retryResult.next_offset || 0;
          } catch (retryErr: any) {
            // On second failure, try DB recovery again instead of giving up
            const dbProgress2 = await getProgressFromDB();
            if (dbProgress2 && dbProgress2.processed > currentOffset) {
              setBatchLog(prev => [...prev.slice(0, -1), `📊 重試失敗但從 DB 恢復: offset ${dbProgress2.processed}`]);
              currentOffset = dbProgress2.processed;
              await new Promise(r => setTimeout(r, 2000));
              if (abortRef.current) break;
              continue;
            }
            setBatchLog(prev => [...prev.slice(0, -1), `❌ 重試再次失敗: ${retryErr.message}。停止。`]);
            setError(`批次 #${batchNum} 失敗: ${retryErr.message}`);
            break;
          }
        }
      }

      if (abortRef.current) {
        setBatchLog(prev => [...prev, `🛑 已手動停止。處理到 offset ${currentOffset}。`]);
      } else {
        setBatchLog(prev => [...prev, `🎉 全部完成！共 ${batchNum} 個批次，更新 ${cumulativeUpdated} 個 profile。`]);
      }

      if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
      await pollProgress();
      await runAnalysis();
    } catch (err: any) {
      if (!mountedRef.current) return;
      setError(err.message);
    } finally {
      if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
      if (mountedRef.current) setBackfilling(false);
    }
  };

  const stopBackfill = () => { abortRef.current = true; };

  /* ─── debug ───────────────────────────────────────────────────── */
  const runDebug = async () => {
    setDebugging(true);
    setError(null);
    try {
      const data = await callEdgeFunction({ mode: "debug", debug_count: 5 });
      if (mountedRef.current) setDebugData(data);
    } catch (err: any) {
      if (mountedRef.current) setError(err.message);
    } finally {
      if (mountedRef.current) setDebugging(false);
    }
  };

  /* ─── reset progress ──────────────────────────────────────────── */
  const resetProgress = async () => {
    try {
      await callEdgeFunction({ mode: "reset_progress" });
      setProgress(null);
      setBatchLog([]);
      setAllErrors([]);
      setTotalUpdated(0);
    } catch (err: any) {
      setError(err.message);
    }
  };

  /* ─── initial load (stable deps — no infinite loop) ───────────── */
  useEffect(() => {
    let cancelled = false;
    runAnalysis();

    // Check if there's an ongoing backfill
    supabase
      .from("backfill_progress")
      .select("*")
      .eq("id", "current")
      .single()
      .then(({ data }) => {
        if (cancelled || !mountedRef.current) return;
        if (data) {
          setProgress(data);
          if (data.status === "running") startPolling();
          // Show stalled batch_done status so Resume button appears
        }
      })
      .catch(() => {});

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ─── helpers ─────────────────────────────────────────────────── */
  const getEmptyPct = (empty: number, total: number) => total === 0 ? 0 : Math.round((empty / total) * 100);
  const badgeVariant = (pct: number) => pct >= 80 ? "destructive" : pct >= 50 ? "secondary" : "default";

  /* ═══════════════════════════════ RENDER ═══════════════════════════════ */
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-5">
        {/* ─── Header ──────────────────────────────────────────────── */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold">Salon Profile Backfill</h1>
            <p className="text-gray-500 mt-1 text-sm">
              從 Shopify REST API 拎 metafield data 填充 salon profile 空白欄位
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button onClick={runAnalysis} disabled={loading} variant="outline" size="sm">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <RefreshCw className="h-4 w-4 mr-1" />}
              分析
            </Button>
            <Button onClick={runDiscover} disabled={discovering} variant="outline" size="sm">
              {discovering ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Search className="h-4 w-4 mr-1" />}
              探索 Metafield Keys
            </Button>
            <Button onClick={runDebug} disabled={debugging} variant="secondary" size="sm">
              {debugging ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Bug className="h-4 w-4 mr-1" />}
              Debug (5個)
            </Button>
            <Button onClick={resetProgress} variant="ghost" size="sm">
              <RotateCcw className="h-4 w-4 mr-1" /> 重設
            </Button>
          </div>
        </div>

        {/* ─── Backfill Controls ───────────────────────────────────── */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">每批:</label>
                <select
                  value={batchSize}
                  onChange={e => setBatchSize(Number(e.target.value))}
                  className="border rounded px-2 py-1 text-sm"
                  disabled={backfilling}
                >
                  {[5, 10, 15, 20, 25, 30, 40, 50].map(n => (
                    <option key={n} value={n}>{n}{n === 10 ? "（推薦）" : ""}</option>
                  ))}
                </select>
              </div>

              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={forceOverwrite}
                  onChange={e => setForceOverwrite(e.target.checked)}
                  disabled={backfilling}
                  className="rounded"
                />
                <span className={forceOverwrite ? "text-orange-600 font-medium" : ""}>
                  {forceOverwrite && <AlertTriangle className="h-3 w-3 inline mr-1" />}
                  強制覆蓋已有值
                </span>
              </label>

              <div className="flex gap-2 ml-auto">
                {backfilling ? (
                  <Button onClick={stopBackfill} variant="destructive" size="sm">
                    <Square className="h-4 w-4 mr-1" /> 停止
                  </Button>
                ) : (
                  <>
                    {progress && progress.status === "batch_done" && progress.processed > 0 && progress.processed < progress.total_profiles && (
                      <Button
                        onClick={() => runBackfill(progress.processed)}
                        variant="secondary"
                      >
                        <ArrowRight className="h-4 w-4 mr-1" /> 從 {progress.processed} 繼續
                      </Button>
                    )}
                    <Button onClick={() => runBackfill()} disabled={loading} variant="default">
                      <Zap className="h-4 w-4 mr-1" /> 開始 Backfill
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ─── Error ───────────────────────────────────────────────── */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-4">
              <p className="text-red-600 text-sm whitespace-pre-wrap">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* ─── Live Progress ───────────────────────────────────────── */}
        {(progress && (progress.status === "running" || progress.status === "batch_done")) || backfilling ? (
          <Card className={`border-blue-200 ${!backfilling && progress?.status === "batch_done" ? "bg-amber-50 border-amber-200" : "bg-blue-50"}`}>
            <CardContent className="pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {backfilling ? (
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                  )}
                  <span className={`font-medium ${!backfilling && progress?.status === "batch_done" ? "text-amber-800" : "text-blue-800"}`}>
                    {backfilling ? "Backfill 進行中..." : progress?.status === "batch_done" ? "⚠️ Backfill 已停頓 — 需要繼續" : "Backfill 進行中..."}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-blue-600">
                    {progress ? `${progress.processed} / ${progress.total_profiles}` : "初始化中..."}
                  </span>
                  {!backfilling && progress?.status === "batch_done" && progress.processed > 0 && progress.processed < progress.total_profiles && (
                    <Button
                      onClick={() => runBackfill(progress.processed)}
                      size="sm"
                      variant="default"
                      className="bg-amber-600 hover:bg-amber-700"
                    >
                      <ArrowRight className="h-3 w-3 mr-1" /> 繼續
                    </Button>
                  )}
                </div>
              </div>
              {progress && (
                <>
                  <div className="w-full bg-blue-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${progress.total_profiles > 0 ? (progress.processed / progress.total_profiles) * 100 : 0}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div className="bg-blue-100 p-2 rounded text-center">
                      <p className="text-blue-800 font-bold">{progress.processed}</p>
                      <p className="text-blue-600">已處理</p>
                    </div>
                    <div className="bg-green-100 p-2 rounded text-center">
                      <p className="text-green-800 font-bold">{progress.updated}</p>
                      <p className="text-green-600">已更新</p>
                    </div>
                    <div className="bg-yellow-100 p-2 rounded text-center">
                      <p className="text-yellow-800 font-bold">{progress.skipped}</p>
                      <p className="text-yellow-600">跳過</p>
                    </div>
                    <div className="bg-red-100 p-2 rounded text-center">
                      <p className="text-red-800 font-bold">{progress.api_errors}</p>
                      <p className="text-red-600">API 錯誤</p>
                    </div>
                  </div>
                  {progress.current_salon && <p className="text-xs text-blue-500">📍 等待下一批... ({progress.processed}/{progress.total_profiles})</p>}
                  {progress.started_at && (
                    <p className="text-xs text-blue-400">
                      開始: {new Date(progress.started_at).toLocaleString("zh-HK")}
                      {" • "}已用時: {elapsedSeconds >= 60 ? `${Math.floor(elapsedSeconds / 60)}分${elapsedSeconds % 60}秒` : `${elapsedSeconds}秒`}
                      {backfilling && <span className="ml-2 inline-block animate-pulse">🔄 處理中...</span>}
                    </p>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        ) : null}

        {/* ─── Batch Log ───────────────────────────────────────────── */}
        {batchLog.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center justify-between">
                <span>批次記錄</span>
                {totalUpdated > 0 && <Badge variant="default">共更新 {totalUpdated} 個</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 text-gray-100 p-3 rounded-lg text-xs font-mono max-h-60 overflow-y-auto space-y-0.5">
                {batchLog.map((line, i) => (
                  <div key={i} className={
                    line.startsWith("✅") ? "text-green-400" :
                    line.startsWith("❌") ? "text-red-400" :
                    line.startsWith("🔄") ? "text-yellow-400" :
                    line.startsWith("🎉") ? "text-emerald-300 font-bold" :
                    line.startsWith("🛑") ? "text-orange-400" :
                    "text-blue-300"
                  }>
                    {line}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ─── Accumulated Errors ──────────────────────────────────── */}
        {allErrors.length > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-red-700">⚠️ {allErrors.length} 個錯誤</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-red-100 p-2 rounded text-xs max-h-40 overflow-y-auto whitespace-pre-wrap">
                {allErrors.join("\n")}
              </pre>
            </CardContent>
          </Card>
        )}

        {/* ─── Discover Metafield Keys ─────────────────────────────── */}
        {discoveredKeys && (
          <Card className="border-teal-200 bg-teal-50">
            <CardHeader>
              <CardTitle className="text-teal-700 flex items-center gap-2">
                <Search className="h-5 w-5" />
                Metafield Keys 探索結果 (掃描咗 {discoveredKeys.scanned_count} 個 salon)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {discoveredKeys.all_metafield_keys && (
                <div>
                  <p className="text-xs font-bold text-teal-800 mb-2">
                    搵到嘅 metafield keys（頻率）：
                  </p>
                  <div className="bg-white p-3 rounded border border-teal-200 space-y-1">
                    {Object.entries(discoveredKeys.all_metafield_keys as Record<string, number>)
                      .sort(([, a], [, b]) => (b as number) - (a as number))
                      .map(([key, count]) => {
                        const isMapped = discoveredKeys.mapped_keys?.includes(key);
                        return (
                          <div key={key} className="text-xs flex items-center gap-2">
                            <Badge variant={isMapped ? "default" : "secondary"} className="text-[10px] font-mono">
                              {key}
                            </Badge>
                            <span className="text-gray-500">× {count as number}</span>
                            {isMapped && <span className="text-green-600">→ ✓ mapped</span>}
                            {!isMapped && <span className="text-orange-500">→ ✗ unmapped</span>}
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
              {discoveredKeys.sample_values && (
                <div>
                  <p className="text-xs font-bold text-teal-800 mb-1">Sample values (未映射嘅 key):</p>
                  <pre className="bg-white p-2 rounded text-xs overflow-x-auto whitespace-pre-wrap border border-teal-200 max-h-40 overflow-y-auto">
                    {JSON.stringify(discoveredKeys.sample_values, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* ─── Debug Data ──────────────────────────────────────────── */}
        {debugData && (
          <Card className="border-purple-200 bg-purple-50">
            <CardHeader>
              <CardTitle className="text-purple-700 flex items-center gap-2">
                <Bug className="h-5 w-5" />
                Debug: {debugData.shopify_profiles} 個 Shopify profiles
              </CardTitle>
              <p className="text-sm text-purple-600">{debugData.method}</p>
            </CardHeader>
            <CardContent>
              {debugData.samples?.map((s: any, idx: number) => (
                <div key={idx} className="mb-6 last:mb-0 border-b border-purple-200 pb-4 last:border-0">
                  <h3 className="font-bold text-sm mb-2 text-purple-900">
                    #{idx + 1} {s.salon_name} (ID: {s.numeric_id})
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                    <div>Product: <Badge variant={s.product_fetched ? "default" : "destructive"} className="text-[10px]">{s.product_fetched ? "✓" : "✗"}</Badge></div>
                    <div>Metafields: <Badge variant={s.metafields_count > 0 ? "default" : "destructive"} className="text-[10px]">{s.metafields_count} 個</Badge></div>
                    {s.product_error && <div className="col-span-2 text-red-600">{s.product_error}</div>}
                    {s.metafields_error && <div className="col-span-2 text-red-600">{s.metafields_error}</div>}
                  </div>
                  {s.body_html_present && (
                    <div className="mb-2 bg-yellow-50 p-2 rounded border border-yellow-300">
                      <p className="text-[10px] font-bold text-yellow-800">body_html ✓</p>
                      <pre className="text-[10px] max-h-20 overflow-y-auto whitespace-pre-wrap">{s.body_html_sample}</pre>
                    </div>
                  )}
                  {s.metafields_list?.length > 0 && (
                    <div className="mb-2">
                      <p className="text-[10px] font-bold text-blue-700">Metafields ({s.metafields_list.length}):</p>
                      <div className="bg-blue-50 p-2 rounded space-y-0.5">
                        {s.metafields_list.map((mf: any, mi: number) => (
                          <div key={mi} className="text-[10px] flex gap-1 items-start">
                            <Badge variant="outline" className="shrink-0 text-[9px]">{mf.key}</Badge>
                            <span className="text-gray-400">→</span>
                            <Badge variant={mf.maps_to !== "(unmapped)" ? "default" : "secondary"} className="shrink-0 text-[9px]">{mf.maps_to}</Badge>
                            <span className="text-gray-600 truncate">{mf.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-[10px] font-bold text-green-700">Extracted:</p>
                      <pre className="bg-green-50 p-1 rounded text-[10px] overflow-x-auto whitespace-pre-wrap max-h-28 overflow-y-auto">
                        {JSON.stringify(s.extracted_fields, null, 2)}
                      </pre>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-orange-700">目前 Profile:</p>
                      <pre className="bg-orange-50 p-1 rounded text-[10px] overflow-x-auto whitespace-pre-wrap max-h-28 overflow-y-auto border border-orange-200">
                        {JSON.stringify(s.current_profile, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* ─── Analysis ────────────────────────────────────────────── */}
        {loading && !analysis ? (
          <Card>
            <CardContent className="py-8 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-500">分析緊...</span>
            </CardContent>
          </Card>
        ) : analysis ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500">總 Profiles</CardTitle></CardHeader>
                <CardContent><p className="text-3xl font-bold">{analysis.total_profiles}</p></CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500">有 Shopify 連結</CardTitle></CardHeader>
                <CardContent><p className="text-3xl font-bold">{analysis.shopify_linked_profiles}</p></CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500">無 Shopify 連結</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{analysis.total_profiles - analysis.shopify_linked_profiles}</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="cursor-pointer" onClick={() => setShowAnalysis(!showAnalysis)}>
                <CardTitle className="flex items-center justify-between">
                  <span>空白欄位統計</span>
                  {showAnalysis ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </CardTitle>
              </CardHeader>
              {showAnalysis && (
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 pr-4">欄位</th>
                          <th className="text-right py-2 px-4">空白</th>
                          <th className="text-right py-2 px-4">%</th>
                          <th className="text-right py-2 px-4">有值</th>
                          <th className="text-left py-2 pl-4">狀態</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(analysis.empty_column_counts)
                          .sort(([, a], [, b]) => b - a)
                          .map(([col, empty]) => {
                            const pct = getEmptyPct(empty, analysis.total_profiles);
                            return (
                              <tr key={col} className="border-b hover:bg-gray-50">
                                <td className="py-1.5 pr-4 font-mono text-xs">{col}</td>
                                <td className="text-right py-1.5 px-4 text-red-600">{empty}</td>
                                <td className="text-right py-1.5 px-4">
                                  <Badge variant={badgeVariant(pct) as any} className="text-[10px]">{pct}%</Badge>
                                </td>
                                <td className="text-right py-1.5 px-4 text-green-600">{analysis.total_profiles - empty}</td>
                                <td className="py-1.5 pl-4">
                                  <div className="w-20 bg-gray-200 rounded-full h-2">
                                    <div className="bg-green-500 h-2 rounded-full" style={{ width: `${100 - pct}%` }} />
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              )}
            </Card>

            {showAnalysis && (
              <Card>
                <CardHeader>
                  <CardTitle>可以用 Shopify Data 填充嘅欄位</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 pr-4">欄位</th>
                          <th className="text-right py-2 px-4">Shopify 有值</th>
                          <th className="text-right py-2 px-4">可以填充</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(analysis.fillable_from_shopify)
                          .filter(([, v]) => v.available > 0 || v.canFill > 0)
                          .sort(([, a], [, b]) => b.canFill - a.canFill)
                          .map(([col, info]) => (
                            <tr key={col} className="border-b hover:bg-gray-50">
                              <td className="py-1.5 pr-4 font-mono text-xs">{col}</td>
                              <td className="text-right py-1.5 px-4">{info.available}</td>
                              <td className="text-right py-1.5 px-4">
                                {info.canFill > 0 ? (
                                  <span className="text-blue-600 font-medium flex items-center justify-end gap-1">
                                    <ArrowRight className="h-3 w-3" /> {info.canFill}
                                  </span>
                                ) : (
                                  <span className="text-gray-400">0</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        {Object.entries(analysis.fillable_from_shopify).every(([, v]) => v.available === 0 && v.canFill === 0) && (
                          <tr>
                            <td colSpan={3} className="py-4 text-center text-gray-500 text-sm">
                              Shopify raw_data 入面搵唔到可以填充嘅欄位。<br />
                              用「探索 Metafield Keys」睇下 Shopify 入面有咩 key。
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        ) : null}

        {/* ─── Diagnose Section ──────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              診斷模式 (Diagnose)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-500">
              檢查邊啲 profile 缺少某個 field，以及 Shopify 入面有冇 data 可以補返。
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">檢查欄位:</label>
                <select
                  className="border rounded px-2 py-1 text-sm"
                  value={diagnoseField}
                  onChange={(e) => setDiagnoseField(e.target.value)}
                >
                  <option value="address">address (地址)</option>
                  <option value="contact_number">contact_number (聯絡電話)</option>
                  <option value="contact_person">contact_person (聯絡人)</option>
                  <option value="email">email</option>
                  <option value="website">website</option>
                  <option value="whatsapp_number">whatsapp_number</option>
                  <option value="description">description (描述)</option>
                  <option value="office_hr_mon">office_hr_mon (星期一營業時間)</option>
                  <option value="office_hr_tue">office_hr_tue (星期二)</option>
                  <option value="office_hr_wed">office_hr_wed (星期三)</option>
                  <option value="office_hr_thu">office_hr_thu (星期四)</option>
                  <option value="office_hr_fri">office_hr_fri (星期五)</option>
                  <option value="office_hr_sat">office_hr_sat (星期六)</option>
                  <option value="office_hr_sun">office_hr_sun (星期日)</option>
                  <option value="seo_title">seo_title</option>
                  <option value="seo_description">seo_description</option>
                </select>
              </div>
              <Button onClick={runDiagnose} disabled={diagnosing} size="sm">
                {diagnosing ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Search className="h-4 w-4 mr-1" />}
                跑診斷
              </Button>
            </div>

            {diagnoseData && (
              <div className="space-y-3">
                {/* Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-xs text-blue-600 font-medium">Total Profiles</p>
                    <p className="text-xl font-bold text-blue-900">{diagnoseData.total_profiles}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-xs text-green-600 font-medium">有值 (Currently Has Value)</p>
                    <p className="text-xl font-bold text-green-900">{diagnoseData.currently_has_value}</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-3">
                    <p className="text-xs text-red-600 font-medium">缺失 (Missing)</p>
                    <p className="text-xl font-bold text-red-900">{diagnoseData.currently_missing}</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3">
                    <p className="text-xs text-purple-600 font-medium">Shopify 有值 (可補)</p>
                    <p className="text-xl font-bold text-purple-900">{diagnoseData.shopify_has_data_for_missing}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 font-medium">Scanned</p>
                    <p className="text-lg font-bold">{diagnoseData.scanned_missing}</p>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-3">
                    <p className="text-xs text-yellow-700 font-medium">Shopify 都冇</p>
                    <p className="text-lg font-bold text-yellow-900">{diagnoseData.shopify_also_empty}</p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-3">
                    <p className="text-xs text-orange-600 font-medium">404 (Product 唔存在)</p>
                    <p className="text-lg font-bold text-orange-900">{diagnoseData.product_not_found_404}</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-3">
                    <p className="text-xs text-red-600 font-medium">API Errors</p>
                    <p className="text-lg font-bold text-red-900">{diagnoseData.api_errors}</p>
                  </div>
                </div>

                {/* Interpretation */}
                {diagnoseData.shopify_has_data_for_missing > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                    <span className="font-medium text-blue-800">💡 建議:</span>{" "}
                    <span className="text-blue-700">
                      有 {diagnoseData.shopify_has_data_for_missing} 個 profile 嘅 <code className="bg-blue-100 px-1 rounded">{diagnoseData.field}</code> 可以從 Shopify 補回。
                      用 <code className="bg-blue-100 px-1 rounded">force_overwrite: true</code> 再跑 backfill 就可以更新。
                    </span>
                  </div>
                )}
                {diagnoseData.product_not_found_404 > 0 && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm">
                    <span className="font-medium text-orange-800">⚠️ 注意:</span>{" "}
                    <span className="text-orange-700">
                      有 {diagnoseData.product_not_found_404} 個 product 已經喺 Shopify 被刪除 (404)，冇辦法補 data。
                    </span>
                  </div>
                )}

                {/* Sample Results Table */}
                {diagnoseData.sample_results && diagnoseData.sample_results.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Sample Results (最多 20 個)</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b bg-gray-50">
                            <th className="text-left py-2 px-2">Salon</th>
                            <th className="text-left py-2 px-2">Product ID</th>
                            <th className="text-center py-2 px-2">Shopify 有值?</th>
                            <th className="text-left py-2 px-2">Extracted Value</th>
                            <th className="text-left py-2 px-2">Error</th>
                            <th className="text-left py-2 px-2">Metafield Keys</th>
                          </tr>
                        </thead>
                        <tbody>
                          {diagnoseData.sample_results.map((r: any, i: number) => (
                            <tr key={i} className="border-b hover:bg-gray-50">
                              <td className="py-1.5 px-2 max-w-[150px] truncate" title={r.salon_name}>{r.salon_name}</td>
                              <td className="py-1.5 px-2 font-mono">{r.numeric_id}</td>
                              <td className="py-1.5 px-2 text-center">
                                {r.error ? (
                                  <Badge variant="destructive" className="text-[10px]">{r.error.substring(0, 20)}</Badge>
                                ) : r.shopify_has_value ? (
                                  <Badge className="text-[10px] bg-green-500">✓ 有</Badge>
                                ) : (
                                  <Badge variant="secondary" className="text-[10px]">✗ 冇</Badge>
                                )}
                              </td>
                              <td className="py-1.5 px-2 max-w-[200px] truncate" title={r.extracted_value || ''}>{r.extracted_value || '-'}</td>
                              <td className="py-1.5 px-2 text-red-500 max-w-[150px] truncate" title={r.error || ''}>{r.error || '-'}</td>
                              <td className="py-1.5 px-2 max-w-[250px]">
                                <div className="flex flex-wrap gap-0.5">
                                  {r.all_metafield_keys?.slice(0, 8).map((k: string) => (
                                    <span key={k} className="bg-gray-100 text-gray-600 text-[9px] px-1 rounded">{k}</span>
                                  ))}
                                  {r.all_metafield_keys?.length > 8 && (
                                    <span className="text-gray-400 text-[9px]">+{r.all_metafield_keys.length - 8}</span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
