'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Banknote,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  RefreshCw,
  Store,
  Search,
  Filter,
  ChevronDown,
  Eye,
} from 'lucide-react';

interface Payout {
  id: string;
  salon_profile_id: string;
  period_start: string;
  period_end: string;
  total_amount: number;
  platform_fee: number;
  net_amount: number;
  item_count: number;
  status: string;
  paid_at: string | null;
  notes: string | null;
  created_at: string;
  salon_profiles?: { salon_name: string } | null;
}

interface PayoutItem {
  id: string;
  payout_id: string;
  order_item_id: string;
  amount: number;
  created_at: string;
  order_items?: {
    name: string;
    redeemed_at: string;
    orders?: { order_number: string } | null;
  } | null;
}

export default function AdminPayoutsPage() {
  const router = useRouter();
  const { user, isLoadingAuth } = useAuth();
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);
  const [payoutItems, setPayoutItems] = useState<PayoutItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [markingPaid, setMarkingPaid] = useState(false);
  const [feePercentage, setFeePercentage] = useState(30);

  useEffect(() => {
    if (isLoadingAuth) return;
    if (!user) {
      router.replace('/staff-login');
      return;
    }
    fetchPayouts();
    fetchFeePercentage();
  }, [user, isLoadingAuth]);

  const fetchFeePercentage = async () => {
    const { data } = await supabase.from('system_settings').select('value').eq('key', 'platform_fee_percentage').single();
    if (data) setFeePercentage(parseInt(data.value) || 30);
  };

  const fetchPayouts = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('payouts')
        .select('*, salon_profiles(salon_name)')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setPayouts(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoadingAuth && user) fetchPayouts();
  }, [statusFilter]);

  const openPayoutDetail = async (payout: Payout) => {
    setSelectedPayout(payout);
    setLoadingItems(true);
    try {
      const { data } = await supabase
        .from('payout_items')
        .select('*, order_items(name, redeemed_at, orders(order_number))')
        .eq('payout_id', payout.id)
        .order('created_at', { ascending: false });
      setPayoutItems(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingItems(false);
    }
  };

  const markAsPaid = async (payoutId: string) => {
    setMarkingPaid(true);
    try {
      await supabase.from('payouts').update({
        status: 'paid',
        paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }).eq('id', payoutId);
      
      // Update local state
      setPayouts(prev => prev.map(p => p.id === payoutId ? { ...p, status: 'paid', paid_at: new Date().toISOString() } : p));
      if (selectedPayout?.id === payoutId) {
        setSelectedPayout(prev => prev ? { ...prev, status: 'paid', paid_at: new Date().toISOString() } : null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setMarkingPaid(false);
    }
  };

  const filteredPayouts = payouts.filter(p => {
    if (searchTerm) {
      const salonName = (p.salon_profiles as any)?.salon_name || '';
      return salonName.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

  const totalPending = payouts.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.net_amount, 0);
  const totalPaid = payouts.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.net_amount, 0);
  const totalFees = payouts.reduce((sum, p) => sum + p.platform_fee, 0);

  const formatCurrency = (amount: number) => `HK$${amount.toLocaleString('en-HK', { minimumFractionDigits: 0 })}`;
  const formatDate = (d: string) => new Date(d).toLocaleDateString('zh-HK', { year: 'numeric', month: 'long', day: 'numeric' });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-700 border-amber-200"><Clock className="w-3 h-3 mr-1" />待發放</Badge>;
      case 'paid':
        return <Badge className="bg-green-100 text-green-700 border-green-200"><CheckCircle2 className="w-3 h-3 mr-1" />已發放</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoadingAuth || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md"
          style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }}>
          <Banknote className="text-white w-[18px] h-[18px]" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">結算管理</h1>
          <p className="text-slate-400 text-sm mt-0.5">管理美容院結算紀錄（平台抽成 {feePercentage}%）</p>
        </div>
      </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-amber-700 mb-1">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">待發放</span>
                </div>
                <p className="text-2xl font-bold text-amber-800">{formatCurrency(totalPending)}</p>
              </CardContent>
            </Card>
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-green-700 mb-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm font-medium">已發放</span>
                </div>
                <p className="text-2xl font-bold text-green-800">{formatCurrency(totalPaid)}</p>
              </CardContent>
            </Card>
            <Card className="border-purple-200 bg-purple-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-purple-700 mb-1">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-sm font-medium">平台收入</span>
                </div>
                <p className="text-2xl font-bold text-purple-800">{formatCurrency(totalFees)}</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="搜尋美容院名稱..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-9 border-slate-200"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'pending', 'paid'].map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    statusFilter === s ? 'bg-cyan-100 text-cyan-700 border border-cyan-200' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {s === 'all' ? '全部' : s === 'pending' ? '待發放' : '已發放'}
                </button>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={fetchPayouts} className="gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" /> 重新整理
            </Button>
          </div>

          {/* Payouts Table */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredPayouts.length === 0 ? (
            <Card className="border-slate-200">
              <CardContent className="p-12 text-center">
                <Banknote className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">暫無結算紀錄</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left px-4 py-3 font-semibold text-slate-600">美容院</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600">結算期間</th>
                      <th className="text-right px-4 py-3 font-semibold text-slate-600">訂單金額</th>
                      <th className="text-right px-4 py-3 font-semibold text-slate-600">平台費用</th>
                      <th className="text-right px-4 py-3 font-semibold text-slate-600">實付金額</th>
                      <th className="text-center px-4 py-3 font-semibold text-slate-600">項數</th>
                      <th className="text-center px-4 py-3 font-semibold text-slate-600">狀態</th>
                      <th className="text-center px-4 py-3 font-semibold text-slate-600">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayouts.map(payout => (
                      <tr key={payout.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Store className="w-4 h-4 text-slate-400" />
                            <span className="font-medium text-slate-700">{(payout.salon_profiles as any)?.salon_name || '未知'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-500">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDate(payout.period_start)} ~ {formatDate(payout.period_end)}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-slate-700">{formatCurrency(payout.total_amount)}</td>
                        <td className="px-4 py-3 text-right font-mono text-red-500">-{formatCurrency(payout.platform_fee)}</td>
                        <td className="px-4 py-3 text-right font-mono font-semibold text-green-700">{formatCurrency(payout.net_amount)}</td>
                        <td className="px-4 py-3 text-center text-slate-500">{payout.item_count}</td>
                        <td className="px-4 py-3 text-center">{getStatusBadge(payout.status)}</td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center gap-1 justify-center">
                            <Button variant="ghost" size="sm" onClick={() => openPayoutDetail(payout)} className="h-7 px-2">
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                            {payout.status === 'pending' && (
                              <Button
                                size="sm"
                                onClick={() => markAsPaid(payout.id)}
                                disabled={markingPaid}
                                className="h-7 px-2 bg-green-600 hover:bg-green-700 text-white text-xs"
                              >
                                確認發放
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

      {/* Detail Dialog */}
      <Dialog open={!!selectedPayout} onOpenChange={() => setSelectedPayout(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Banknote className="w-5 h-5 text-amber-500" />
              結算詳情
            </DialogTitle>
          </DialogHeader>
          {selectedPayout && (
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-slate-400 text-xs">美容院</p>
                  <p className="font-medium text-slate-700 mt-0.5">{(selectedPayout.salon_profiles as any)?.salon_name || '未知'}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-slate-400 text-xs">狀態</p>
                  <div className="mt-0.5">{getStatusBadge(selectedPayout.status)}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-slate-400 text-xs">結算期間</p>
                  <p className="font-medium text-slate-700 mt-0.5">{formatDate(selectedPayout.period_start)} ~ {formatDate(selectedPayout.period_end)}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-slate-400 text-xs">發放日期</p>
                  <p className="font-medium text-slate-700 mt-0.5">{selectedPayout.paid_at ? formatDate(selectedPayout.paid_at) : '尚未發放'}</p>
                </div>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">訂單總金額</span>
                  <span className="font-mono font-medium">{formatCurrency(selectedPayout.total_amount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-red-600">平台手續費 ({feePercentage}%)</span>
                  <span className="font-mono text-red-600">-{formatCurrency(selectedPayout.platform_fee)}</span>
                </div>
                <div className="border-t border-amber-300 pt-2 flex justify-between font-semibold">
                  <span className="text-green-700">美容院實收</span>
                  <span className="font-mono text-green-700">{formatCurrency(selectedPayout.net_amount)}</span>
                </div>
              </div>

              {/* Payout Items */}
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-2">包含項目 ({selectedPayout.item_count})</p>
                {loadingItems ? (
                  <div className="flex justify-center py-4">
                    <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : payoutItems.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-4">暫無項目</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {payoutItems.map(item => (
                      <div key={item.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg text-sm">
                        <div>
                          <p className="font-medium text-slate-700">{item.order_items?.name || '未知療程'}</p>
                          <p className="text-xs text-slate-400">
                            {item.order_items?.orders?.order_number && `#${item.order_items.orders.order_number} · `}
                            兌換於 {item.order_items?.redeemed_at ? formatDate(item.order_items.redeemed_at) : '未知'}
                          </p>
                        </div>
                        <span className="font-mono text-slate-700">{formatCurrency(item.amount)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedPayout.status === 'pending' && (
                <Button
                  onClick={() => markAsPaid(selectedPayout.id)}
                  disabled={markingPaid}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  {markingPaid ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                  確認已發放
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
