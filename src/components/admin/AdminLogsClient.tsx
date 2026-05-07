'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Search, Activity, RefreshCw, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

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

export default function AdminLogsClient({ logs }: { logs: Log[] }) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  const filteredLogs = logs.filter(log => {
    const matchSearch =
      (log.user_email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.user_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.details || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchAction = actionFilter === 'all' || log.action === actionFilter;
    return matchSearch && matchAction;
  });

  const uniqueActions = Array.from(new Set(logs.map(log => log.action))).filter(Boolean);

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">用戶日誌</h1>
          <p className="text-slate-500">查看所有用戶的活動記錄</p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.refresh()}
          className="gap-2 self-start sm:self-auto border-pink-200 text-pink-600 hover:bg-pink-50"
        >
          <RefreshCw className="w-4 h-4" />重新整理
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">活動記錄</CardTitle>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="搜尋電郵、名稱或詳情..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-full"
                />
              </div>
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="h-10 px-3 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 sm:w-48"
              >
                <option value="all">所有操作</option>
                {uniqueActions.map(action => (
                  <option key={action as string} value={action as string}>{action as string}</option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto max-h-[65vh]">
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
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${log.is_error ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-800'}`}>
                        {log.action}
                      </span>
                    </TableCell>
                    <TableCell className="text-slate-600 whitespace-normal">
                      <div className={log.is_error ? 'text-red-600 font-medium flex items-start gap-1.5' : ''}>
                        {log.is_error && <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />}
                        <div>
                          <p>{log.details || '-'}</p>
                          {log.error_message && (
                            <p className="text-sm mt-1 text-red-500 bg-red-50 p-2 rounded border border-red-100 font-mono text-sm break-all">
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
                      <p className="text-slate-500">找不到活動記錄</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
