"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function BackfillPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
      <Card className="max-w-md w-full border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-slate-400" />
            功能已移除
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500">
            Shopify Backfill 功能已移除。所有美容院數據已直接存儲於 Supabase 資料庫中。
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
