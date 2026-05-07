'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/StatusBadge';
import { format } from 'date-fns';
import { Clock, CheckCircle, XCircle, FileText, Store } from 'lucide-react';

interface Application {
  id: string;
  salon_name: string;
  status: string;
  created_date: string;
  contact_number?: string;
  district?: string;
  application_type?: string;
  rejection_reason?: string;
}

interface Props {
  applications: Application[];
}

function getStatusInfo(status: string) {
  switch (status) {
    case 'pending':
      return { icon: Clock, iconBg: 'bg-amber-100', iconColor: 'text-amber-600', title: '申請審核中', description: '您的申請正由我們的團隊審核，通常需要 1-3 個工作天。' };
    case 'approved':
      return { icon: CheckCircle, iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600', title: '申請已批准！', description: '恭喜！您的美容院已獲批准，現在可以設定您的美容院資料。' };
    case 'rejected':
      return { icon: XCircle, iconBg: 'bg-red-100', iconColor: 'text-red-600', title: '申請未獲批准', description: '很遺憾，您的申請未能獲得批准。' };
    default:
      return { icon: FileText, iconBg: 'bg-slate-100', iconColor: 'text-slate-600', title: '狀態未知', description: '請聯絡客服以獲取協助。' };
  }
}

export default function ApplicationList({ applications }: Props) {
  const router = useRouter();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {applications.map((application) => {
        const statusInfo = getStatusInfo(application.status);
        const StatusIcon = statusInfo.icon;
        const accentColor =
          application.status === 'approved'
            ? 'linear-gradient(90deg, #10b981, #059669)'
            : application.status === 'rejected'
            ? 'linear-gradient(90deg, #f43f5e, #e11d48)'
            : 'linear-gradient(90deg, #f59e0b, #d97706)';

        return (
          <div
            key={application.id}
            className="rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
            style={{
              background: 'rgba(255,255,255,0.92)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.7)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
            }}
          >
            <div className="h-1.5" style={{ background: accentColor }} />
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 ${statusInfo.iconBg} rounded-2xl flex items-center justify-center`}>
                  <StatusIcon className={`w-6 h-6 ${statusInfo.iconColor}`} />
                </div>
                <StatusBadge status={application.status} />
              </div>
              <h3 className="font-bold text-slate-800 text-base mb-1 line-clamp-2">{application.salon_name}</h3>
              <p className="text-sm text-slate-400 mb-4">
                {format(new Date(application.created_date), 'yyyy年MM月dd日')}
              </p>
              <p className="text-sm text-slate-500 mb-4">{statusInfo.title}</p>

              {application.status === 'rejected' && application.rejection_reason && (
                <div
                  className="mb-4 p-3 rounded-2xl border border-red-100"
                  style={{ background: 'linear-gradient(135deg, #fff1f2, #ffe4e6)' }}
                >
                  <p className="text-sm font-semibold text-red-600 mb-1">拒絕原因：</p>
                  <p className="text-sm text-red-500">{application.rejection_reason}</p>
                </div>
              )}

              <div className="space-y-2.5 mb-4 pb-4 border-t border-slate-50 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">聯絡電話</span>
                  <span className="font-semibold text-slate-700">{application.contact_number}</span>
                </div>
                {application.district && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">地區</span>
                    <span className="font-semibold text-slate-700">{application.district}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">申請類型</span>
                  <span className="font-semibold text-slate-700">
                    {application.application_type === 'new' ? '新增申請' : '認領申請'}
                  </span>
                </div>
              </div>

              {application.status === 'approved' && (
                <Button
                  onClick={() => router.push('/salon-profile')}
                  className="w-full h-10 rounded-xl font-semibold text-white border-0 shadow-md shadow-emerald-200/50 gap-2"
                  style={{ background: 'linear-gradient(135deg, #34d399, #059669)' }}
                  size="sm"
                >
                  <Store className="w-4 h-4" />設定美容院
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
