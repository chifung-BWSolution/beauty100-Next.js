'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import AdminLogsClient from '@/components/admin/AdminLogsClient';

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const { data } = await supabase
          .from('user_activity_logs')
          .select('*')
          .order('created_date', { ascending: false })
          .limit(500);
        setLogs(data || []);
      } catch (e) {
        console.error('Failed to fetch logs:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
      </div>
    );
  }

  return <AdminLogsClient logs={logs} />;
}


