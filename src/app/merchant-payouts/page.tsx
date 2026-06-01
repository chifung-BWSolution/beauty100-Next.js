'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Banknote,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Info,
  Settings,
  Wallet,
  ArrowLeft,
  Save,
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
    unit_price: number;
    quantity: number;
    voucher_number: string | null;
    orders?: { order_number: string } | null;
  } | null;
}

interface PayoutSettingsData {
  id?: string;
  salon_profile_id: string;
  payout_day: number;
  bank_name: string;
  bank_code: string;
  branch_code: string;
  bank_account_number: string;
  account_holder_name: string;
  payout_currency: string;
  notes: string;
}

export default function MerchantPayoutsPage() {
  const router = useRouter();
  const { user, isLoadingAuth } = useAuth();
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);
  const [payoutItems, setPayoutItems] = useState<PayoutItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [feePercentage, setFeePercentage] = useState(30);
  const [salonProfiles, setSalonProfiles] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  
  // Payout settings
  const [showSettings, setShowSettings] = useState(false);
  const [payoutSettings, setPayoutSettings] = useState<PayoutSettingsData>({
    salon_profile_id: '',
    payout_day: 7,
    bank_name: '',
    bank_code: '',
    branch_code: '',
    bank_account_number: '',
    account_holder_name: '',
    payout_currency: 'HKD',
    notes: '',
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  useEffect(() => {
    if (isLoadingAuth) return;
    if (!user) {
      router.replace('/login?returnTo=/merchant-payouts');
      return;
    }
    fetchData();
  }, [user, isLoadingAuth]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Get salon profiles owned by this user
      let profilesData: any[] | null = null;
      const { data: directProfiles } = await supabase
        .from('salon_profiles')
        .select('id, salon_name, salon_status')
        .eq('created_by', user!.id);

      profilesData = directProfiles;

      // Fallback: check salon_applications
      if (!profilesData || profilesData.length === 0) {
        const { data: apps } = await supabase
          .from('salon_applications')
          .select('salon_profile_id')
          .eq('created_by', user!.id)
          .eq('status', 'approved')
          .not('salon_profile_id', 'is', null);

        if (apps && apps.length > 0) {
          const profileIds = apps.map(a => a.salon_profile_id).filter(Boolean) as string[];
          if (profileIds.length > 0) {
            const { data: appProfiles } = await supabase
              .from('salon_profiles')
              .select('id, salon_name, salon_status')
              .in('id', profileIds);
            profilesData = appProfiles || [];
          }
        }
      }

      setSalonProfiles(profilesData || []);

      if (profilesData && profilesData.length > 0) {
        const profileIds = profilesData.map(p => p.id);
        
        // Fetch payouts for these salon profiles
        const { data: payoutsData } = await supabase
          .from('payouts')
          .select('*')
          .in('salon_profile_id', profileIds)
          .order('period_start', { ascending: false });

        setPayouts(payoutsData || []);

        // Fetch payout settings
        const { data: settingsData } = await supabase
          .from('payout_settings')
          .select('*')
          .in('salon_profile_id', profileIds)
          .limit(1)
          .maybeSingle();

        if (settingsData) {
          setPayoutSettings({
            id: settingsData.id,
            salon_profile_id: settingsData.salon_profile_id,
            payout_day: settingsData.payout_day || 7,
            bank_name: settingsData.bank_name || '',
            bank_code: settingsData.bank_code || '',
            branch_code: settingsData.branch_code || '',
            bank_account_number: settingsData.bank_account_number || '',
            account_holder_name: settingsData.account_holder_name || '',
            payout_currency: settingsData.payout_currency || 'HKD',
            notes: settingsData.notes || '',
          });
        } else {
          setPayoutSettings(prev => ({ ...prev, salon_profile_id: profileIds[0] }));
        }
      }

      // Fetch fee percentage
      const { data: feeData } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'platform_fee_percentage')
        .single();
      if (feeData) setFeePercentage(parseInt(feeData.value) || 30);

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openPayoutDetail = async (payout: Payout) => {
    setSelectedPayout(payout);
    setLoadingItems(true);
    try {
      const { data } = await supabase
        .from('payout_items')
        .select('*, order_items(name, redeemed_at, unit_price, quantity, voucher_number, orders(order_number))')
        .eq('payout_id', payout.id)
        .order('created_at', { ascending: false });
      setPayoutItems(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingItems(false);
    }
  };

  const savePayoutSettings = async () => {
    setSavingSettings(true);
    try {
      const payload = {
        salon_profile_id: payoutSettings.salon_profile_id,
        payout_day: payoutSettings.payout_day,
        bank_name: payoutSettings.bank_name,
        bank_code: payoutSettings.bank_code,
        branch_code: payoutSettings.branch_code,
        bank_account_number: payoutSettings.bank_account_number,
        account_holder_name: payoutSettings.account_holder_name,
        payout_currency: payoutSettings.payout_currency,
        notes: payoutSettings.notes,
        updated_at: new Date().toISOString(),
      };

      if (payoutSettings.id) {
        await supabase.from('payout_settings').update(payload).eq('id', payoutSettings.id);
      } else {
        const { data } = await supabase.from('payout_settings').insert(payload).select().single();
        if (data) setPayoutSettings(prev => ({ ...prev, id: data.id }));
      }
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setSavingSettings(false);
    }
  };

  const formatCurrency = (amount: number) => `HK$${amount.toLocaleString('en-HK', { minimumFractionDigits: 2 })}`;
  const formatDate = (d: string) => new Date(d).toLocaleDateString('zh-HK', { year: 'numeric', month: 'short', day: 'numeric' });
  const formatPayoutDate = (d: string) => new Date(d).toLocaleDateString('zh-HK', { year: 'numeric', month: 'long', day: 'numeric' });

  // Payout date = 7th of the period_start month
  const getPayoutDate = (payout: Payout) => {
    const d = new Date(payout.period_start);
    return new Date(d.getFullYear(), d.getMonth(), payoutSettings.payout_day || 7);
  };

  // Transaction dates = previous month (1st to last day)
  const getTransactionRange = (payout: Payout) => {
    const d = new Date(payout.period_start);
    const txStart = new Date(d.getFullYear(), d.getMonth() - 1, 1);
    const txEnd = new Date(d.getFullYear(), d.getMonth(), 0); // last day of prev month
    return { txStart, txEnd };
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs">待發放</Badge>;
      case 'paid':
        return <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">已發放</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs">{status}</Badge>;
    }
  };

  // Calculate payout balance (pending total)
  const totalPending = payouts.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.net_amount, 0);

  // Filter payouts by tab
  const filteredPayouts = activeTab === 'all' ? payouts : payouts.filter(p => p.status === activeTab);

  if (isLoadingAuth || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Payout Detail View (like Shopify payout detail - image 2)
  if (selectedPayout) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="overflow-y-auto">
          <div className="p-6 max-w-4xl mx-auto">
            {/* Back + Title */}
            <div className="flex items-center gap-3 mb-2">
              <Button variant="ghost" size="sm" onClick={() => setSelectedPayout(null)} className="gap-1 text-slate-600 -ml-2">
                <ArrowLeft className="w-4 h-4" />
                返回
              </Button>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-bold text-slate-800">結算詳情</h1>
              {getStatusBadge(selectedPayout.status)}
            </div>
            <p className="text-sm text-slate-400 mb-6">
              結算日期：{formatPayoutDate(getPayoutDate(selectedPayout).toISOString())}
              {' · '}交易期間：{(() => {
                const { txStart, txEnd } = getTransactionRange(selectedPayout);
                return `${formatDate(txStart.toISOString())} - ${formatDate(txEnd.toISOString())}`;
              })()}
            </p>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <Card className="border-slate-200">
                <CardContent className="p-5">
                  <p className="text-sm text-slate-500 mb-1">Total</p>
                  <p className="text-2xl font-bold text-slate-800">{formatCurrency(selectedPayout.net_amount)} HKD</p>
                  <p className="text-xs text-slate-400 mt-1">Beauty-100 Payments</p>
                  <div className="flex items-center gap-8 mt-4 text-xs text-slate-500">
                    <div>
                      <span className="text-slate-400">銀行帳戶</span>
                      <p className="font-medium text-slate-700 mt-0.5">
                        {payoutSettings.bank_name || '未設定'}{payoutSettings.bank_account_number ? ` (${payoutSettings.bank_account_number.slice(-4)})` : ''}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardContent className="p-5">
                  <p className="text-sm font-semibold text-slate-700 mb-3">Summary</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Charges</span>
                      <span className="font-mono">{formatCurrency(selectedPayout.total_amount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Fees</span>
                      <span className="font-mono text-red-600">-{formatCurrency(selectedPayout.platform_fee)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detail Table */}
            <Card className="border-slate-200">
              <CardContent className="p-0">

                {loadingItems ? (
                  <div className="flex justify-center py-12">
                    <div className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : payoutItems.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-sm">暫無項目</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-500 text-xs">
                          <th className="px-4 py-2.5 text-left font-medium">Date</th>
                          <th className="px-4 py-2.5 text-left font-medium">Order</th>
                          <th className="px-4 py-2.5 text-left font-medium">券號</th>
                          <th className="px-4 py-2.5 text-left font-medium">Payment method</th>
                          <th className="px-4 py-2.5 text-right font-medium">Amount</th>
                          <th className="px-4 py-2.5 text-right font-medium">Fee</th>
                          <th className="px-4 py-2.5 text-right font-medium">Net</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payoutItems.map(item => {
                          const amount = item.amount;
                          const fee = Math.round(item.amount * feePercentage) / 100;
                          const net = amount - fee;
                          return (
                            <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                              <td className="px-4 py-3 text-slate-600">
                                {item.order_items?.redeemed_at ? formatDate(item.order_items.redeemed_at) : '—'}
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-purple-600 font-medium">
                                  #{item.order_items?.orders?.order_number || '—'}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-xs font-mono font-medium text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                                  {item.order_items?.voucher_number || '—'}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-1.5">
                                  <div className="w-7 h-4.5 rounded-sm bg-gradient-to-r from-purple-500 to-violet-600 flex items-center justify-center">
                                    <CreditCard className="w-3 h-3 text-white" />
                                  </div>
                                  <span className="text-xs text-slate-600">Stripe</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-right font-mono text-slate-700">
                                {formatCurrency(amount)}
                              </td>
                              <td className="px-4 py-3 text-right font-mono text-red-500">
                                -{formatCurrency(fee)}
                              </td>
                              <td className="px-4 py-3 text-right font-mono font-medium text-slate-800">
                                {formatCurrency(net)} HKD
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Payout Settings View (like Shopify bank account form - image 3)
  if (showSettings) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="overflow-y-auto">
          <div className="p-6 max-w-2xl mx-auto">
            {/* Back + Title */}
            <div className="flex items-center gap-3 mb-6">
              <Button variant="ghost" size="sm" onClick={() => setShowSettings(false)} className="gap-1 text-slate-600 -ml-2">
                <ArrowLeft className="w-4 h-4" />
                返回
              </Button>
              <h1 className="text-xl font-bold text-slate-800">收款帳戶設定</h1>
            </div>

            {/* Bank Account Form */}
            <Card className="border-slate-200 mb-6">
              <CardContent className="p-6">
                <h3 className="font-semibold text-slate-800 mb-1">銀行帳戶</h3>
                <p className="text-sm text-purple-600 mb-5">結算金額將發放到此銀行帳戶</p>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-slate-600 mb-1.5 block">結算貨幣</label>
                    <select
                      value={payoutSettings.payout_currency}
                      onChange={e => setPayoutSettings(prev => ({ ...prev, payout_currency: e.target.value }))}
                      className="w-full h-10 px-3 border border-slate-200 rounded-md text-sm bg-slate-50 text-slate-500"
                      disabled
                    >
                      <option value="HKD">Hong Kong Dollar (HKD HK$)</option>
                    </select>
                    <p className="text-xs text-slate-400 mt-1">你的銀行需要能夠接收此貨幣</p>
                  </div>

                  <div>
                    <label className="text-sm text-slate-600 mb-1.5 block flex items-center gap-1">
                      帳戶持有人名稱
                      <Info className="w-3 h-3 text-slate-400" />
                    </label>
                    <Input
                      value={payoutSettings.account_holder_name}
                      onChange={e => setPayoutSettings(prev => ({ ...prev, account_holder_name: e.target.value }))}
                      placeholder="請輸入帳戶持有人名稱"
                      className="bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-slate-600 mb-1.5 block">銀行名稱</label>
                    <Input
                      value={payoutSettings.bank_name}
                      onChange={e => setPayoutSettings(prev => ({ ...prev, bank_name: e.target.value }))}
                      placeholder="例如：HSBC / 恒生 / 中銀"
                      className="bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-sm text-slate-600 mb-1.5 block">Bank code</label>
                      <Input
                        value={payoutSettings.bank_code}
                        onChange={e => setPayoutSettings(prev => ({ ...prev, bank_code: e.target.value }))}
                        placeholder="e.g. 004"
                        className="bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-600 mb-1.5 block">Branch code</label>
                      <Input
                        value={payoutSettings.branch_code}
                        onChange={e => setPayoutSettings(prev => ({ ...prev, branch_code: e.target.value }))}
                        placeholder="e.g. 652"
                        className="bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-600 mb-1.5 block">Account number</label>
                      <Input
                        value={payoutSettings.bank_account_number}
                        onChange={e => setPayoutSettings(prev => ({ ...prev, bank_account_number: e.target.value }))}
                        placeholder="帳戶號碼"
                        className="bg-white"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Save */}
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-400 max-w-sm">
                按儲存即表示我確認所提供的資料完整及正確。
              </p>
              <Button
                onClick={savePayoutSettings}
                disabled={savingSettings}
                className="bg-purple-600 hover:bg-purple-700 text-white gap-2"
              >
                {savingSettings ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {settingsSaved ? '已儲存 ✓' : '儲存'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Payouts List View (like Shopify payouts list - image 1)
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="overflow-y-auto">
        <div className="p-6 max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md shadow-purple-200/50"
                style={{ background: 'linear-gradient(135deg, #a78bfa, #7c3aed)' }}>
                <Wallet className="text-white w-[18px] h-[18px]" />
              </div>
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">結算紀錄</h1>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(true)}
              className="gap-1.5 text-sm"
            >
              <Settings className="w-4 h-4" />
              收款設定
            </Button>
          </div>

          {/* Payout Balance Card */}
          <Card className="border-slate-200 mb-6">
            <CardContent className="p-5">
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-2">Payout balance</p>
              <p className="text-sm text-slate-600 mb-0.5">
                {salonProfiles[0]?.salon_name || '我的美容院'}
              </p>
              <p className="text-2xl font-bold text-slate-800">
                {formatCurrency(totalPending)}
              </p>
            </CardContent>
          </Card>

          {/* Payout Transactions Section */}
          <Card className="border-slate-200">
            <CardContent className="p-0">
              <div className="px-5 py-4 border-b border-slate-100">
                <h2 className="text-base font-semibold text-slate-800">Payout transactions</h2>
              </div>

              {/* Filter Tabs */}
              <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="bg-transparent border-none h-auto p-0 gap-1">
                    <TabsTrigger value="all" className="text-xs data-[state=active]:bg-slate-100 rounded-md px-3 py-1.5">All</TabsTrigger>
                    <TabsTrigger value="pending" className="text-xs data-[state=active]:bg-slate-100 rounded-md px-3 py-1.5">Pending</TabsTrigger>
                    <TabsTrigger value="paid" className="text-xs data-[state=active]:bg-slate-100 rounded-md px-3 py-1.5">Deposited</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Payouts Table */}
              {loading ? (
                <div className="flex justify-center py-16">
                  <div className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : filteredPayouts.length === 0 ? (
                <div className="text-center py-16">
                  <Wallet className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm">暫無結算紀錄</p>
                  <p className="text-slate-400 text-xs mt-1">當客戶兌換療程後，系統會自動建立結算</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-500 text-xs">
                        <th className="px-5 py-2.5 text-left font-medium">Payout date</th>
                        <th className="px-5 py-2.5 text-left font-medium">Transaction dates</th>
                        <th className="px-5 py-2.5 text-left font-medium">Status</th>
                        <th className="px-5 py-2.5 text-right font-medium">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPayouts.map(payout => {
                        const payoutDate = getPayoutDate(payout);
                        const { txStart, txEnd } = getTransactionRange(payout);
                        return (
                        <tr
                          key={payout.id}
                          className="border-b border-slate-50 hover:bg-slate-50/80 cursor-pointer transition-colors"
                          onClick={() => openPayoutDetail(payout)}
                        >
                          <td className="px-5 py-3.5">
                            <span className="text-purple-600 font-medium hover:underline">
                              {formatDate(payoutDate.toISOString())}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-slate-600">
                            {formatDate(txStart.toISOString())} - {formatDate(txEnd.toISOString())}
                          </td>
                          <td className="px-5 py-3.5">
                            {getStatusBadge(payout.status)}
                          </td>
                          <td className="px-5 py-3.5 text-right font-mono font-medium text-slate-800">
                            {formatCurrency(payout.net_amount)} HKD
                          </td>
                        </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Info Note */}
          <div className="flex items-start gap-2 mt-4 px-1">
            <Info className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-slate-400">
              每月 {payoutSettings.payout_day || 7} 號進行結算。平台手續費 {feePercentage}%，實收 {100 - feePercentage}%。如有疑問請聯絡我們。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
