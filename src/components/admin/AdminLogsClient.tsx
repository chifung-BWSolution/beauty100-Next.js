'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Activity, RefreshCw, AlertCircle, Calendar, Clock } from 'lucide-react';
import { format, startOfDay, endOfDay, subDays } from 'date-fns';
import { supabase } from '@/lib/supabase';

interface Log {
  id: string;
  user_email: string;
  user_name: string;
  action: string;
  details: string;
  is_error: boolean;
  error_message: string;
  created_date: string;
}

type DatePreset = 'today' | '7days' | '30days' | 'custom';

export default function AdminLogsClient({ logs: initialLogs }: { logs: Log[] }) {
  const [logs, setLogs] = useState<Log[]>(initialLogs);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [datePreset, setDatePreset] = useState<DatePreset>('today');
  const [dateFrom, setDateFrom] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [dateTo, setDateTo] = useState(format(new Date(), 'yyyy-MM-dd'));

  const fetchLogs = useCallback(async (from: string, to: string) => {
    setLoading(true);
    try {
      const fromDate = startOfDay(new Date(from)).toISOString();
      const toDate = endOfDay(new Date(to)).toISOString();
      const { data } = await supabase
        .from('user_activity_logs')
        .select('*')
        .gte('created_date', fromDate)
        .lte('created_date', toDate)
        .order('created_date', { ascending: false })
        .limit(2000);
      setLogs(data || []);
    } catch (e) {
      console.error('Failed to fetch logs:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on date preset change
  useEffect(() => {
    const today = new Date();
    let from: string;
    let to: string = format(today, 'yyyy-MM-dd');

    switch (datePreset) {
      case 'today':
        from = format(today, 'yyyy-MM-dd');
        break;
      case '7days':
        from = format(subDays(today, 6), 'yyyy-MM-dd');
        break;
      case '30days':
        from = format(subDays(today, 29), 'yyyy-MM-dd');
        break;
      case 'custom':
        from = dateFrom;
        to = dateTo;
        break;
      default:
        from = format(today, 'yyyy-MM-dd');
    }

    setDateFrom(from);
    setDateTo(to);

    if (datePreset !== 'custom') {
      fetchLogs(from, to);
    }
  }, [datePreset]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCustomDateSearch = () => {
    fetchLogs(dateFrom, dateTo);
  };

  const filteredLogs = logs.filter(log => {
    const matchSearch =
      (log.user_email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.user_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.details || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.action || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchAction = actionFilter === 'all' || log.action === actionFilter;
    return matchSearch && matchAction;
  });

  const uniqueActions = Array.from(new Set(logs.map(log => log.action))).filter(Boolean).sort();

  const errorCount = filteredLogs.filter(l => l.is_error).length;

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">用戶日誌</h1>
          <p className="text-slate-500">查看所有 Admin 後台操作記錄</p>
        </div>
        <Button
          variant="outline"
          onClick={() => fetchLogs(dateFrom, dateTo)}
          disabled={loading}
          className="gap-2 self-start sm:self-auto border-pink-200 text-pink-600 hover:bg-pink-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />重新整理
        </Button>
      </div>

      {/* Date Range Filter Section */}
      <Card className="border-0 shadow-sm mb-4">
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-col gap-3">
            {/* Quick Preset Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-600 mr-1">日期範圍：</span>
              <Button
                size="sm"
                variant={datePreset === 'today' ? 'default' : 'outline'}
                onClick={() => setDatePreset('today')}
                className={`text-xs h-8 ${datePreset === 'today' ? 'bg-pink-600 hover:bg-pink-700' : ''}`}
              >
                今日
              </Button>
              <Button
                size="sm"
                variant={datePreset === '7days' ? 'default' : 'outline'}
                onClick={() => setDatePreset('7days')}
                className={`text-xs h-8 ${datePreset === '7days' ? 'bg-pink-600 hover:bg-pink-700' : ''}`}
              >
                最近 7 日
              </Button>
              <Button
                size="sm"
                variant={datePreset === '30days' ? 'default' : 'outline'}
                onClick={() => setDatePreset('30days')}
                className={`text-xs h-8 ${datePreset === '30days' ? 'bg-pink-600 hover:bg-pink-700' : ''}`}
              >
                最近 30 日
              </Button>
              <Button
                size="sm"
                variant={datePreset === 'custom' ? 'default' : 'outline'}
                onClick={() => setDatePreset('custom')}
                className={`text-xs h-8 ${datePreset === 'custom' ? 'bg-pink-600 hover:bg-pink-700' : ''}`}
              >
                自訂範圍
              </Button>
            </div>

            {/* Custom Date Range Inputs */}
            {datePreset === 'custom' && (
              <div className="flex flex-wrap items-center gap-2 pl-6">
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-40 h-8 text-sm"
                />
                <span className="text-slate-400 text-sm">至</span>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-40 h-8 text-sm"
                />
                <Button
                  size="sm"
                  onClick={handleCustomDateSearch}
                  disabled={loading}
                  className="h-8 text-xs bg-pink-600 hover:bg-pink-700"
                >
                  搜尋
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="bg-white rounded-lg border px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
            <Activity className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="text-lg font-bold text-slate-800">{filteredLogs.length}</p>
            <p className="text-xs text-slate-500">總記錄數</p>
          </div>
        </div>
        <div className="bg-white rounded-lg border px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center">
            <AlertCircle className="w-4 h-4 text-red-600" />
          </div>
          <div>
            <p className="text-lg font-bold text-slate-800">{errorCount}</p>
            <p className="text-xs text-slate-500">錯誤記錄</p>
          </div>
        </div>
        <div className="bg-white rounded-lg border px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center">
            <Clock className="w-4 h-4 text-purple-600" />
          </div>
          <div>
            <p className="text-lg font-bold text-slate-800">{uniqueActions.length}</p>
            <p className="text-xs text-slate-500">操作類型</p>
          </div>
        </div>
        <div className="bg-white rounded-lg border px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center">
            <Calendar className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <p className="text-lg font-bold text-slate-800">
              {datePreset === 'today' ? '今日' : datePreset === '7days' ? '7日' : datePreset === '30days' ? '30日' : '自訂'}
            </p>
            <p className="text-xs text-slate-500">查詢範圍</p>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">活動記錄</CardTitle>
              <Badge variant="outline" className="text-xs">
                顯示 {filteredLogs.length} / {logs.length} 筆
              </Badge>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="搜尋電郵、名稱、操作或詳情..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-full"
                />
              </div>
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="h-10 px-3 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 sm:w-56"
              >
                <option value="all">所有操作 ({uniqueActions.length} 種)</option>
                {uniqueActions.map(action => (
                  <option key={action as string} value={action as string}>{action as string}</option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin" />
            </div>
          ) : (
            <div className="overflow-auto max-h-[60vh]">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="font-semibold whitespace-nowrap">時間</TableHead>
                    <TableHead className="font-semibold whitespace-nowrap">用戶</TableHead>
                    <TableHead className="font-semibold whitespace-nowrap">操作</TableHead>
                    <TableHead className="font-semibold whitespace-nowrap">詳情</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id} className="hover:bg-slate-50/50">
                      <TableCell className="text-slate-500 text-sm whitespace-nowrap">
                        {format(new Date(log.created_date), 'yyyy-MM-dd HH:mm:ss')}
                      </TableCell>
                      <TableCell className="whitespace-normal">
                        <div className="min-w-0">
                          <p className="font-medium text-slate-800 break-words">{log.user_name || log.user_email}</p>
                          {log.user_name && <p className="text-sm text-slate-400 break-all">{log.user_email}</p>}
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${log.is_error ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-800'}`}>
                          {log.action}
                        </span>
                      </TableCell>
                      <TableCell className="text-slate-600 whitespace-normal max-w-[400px]">
                        <div className={log.is_error ? 'text-red-600 font-medium flex items-start gap-1.5' : ''}>
                          {log.is_error && <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />}
                          <div>
                            <p className="break-words">{log.details || '-'}</p>
                            {log.error_message && (
                              <p className="text-xs mt-1 text-red-500 bg-red-50 p-2 rounded border border-red-100 font-mono break-all">
                                {log.error_message}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredLogs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-12">
                        <Activity className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500">
                          {logs.length === 0 ? '此日期範圍內無活動記錄' : '找不到符合篩選條件的記錄'}
                        </p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
