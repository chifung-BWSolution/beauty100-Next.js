import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  buildBeauty100Row,
  buildMpsKolApplyRow,
  type KolApplyFormPayload,
} from '@/lib/kol-apply-map';

function getBeautyClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Beauty100 Supabase env missing');
  return createClient(url, key);
}

function getMpsClient() {
  const url = process.env.MPS_SUPABASE_URL;
  const key = process.env.MPS_SUPABASE_SERVICE_KEY || process.env.MPS_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('MPS Supabase env missing');
  return createClient(url, key);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as KolApplyFormPayload;

    if (!body?.name || !body?.email || !body?.phone) {
      return NextResponse.json({ error: '缺少必要欄位' }, { status: 400 });
    }
    if (!body.publishPlatforms?.length) {
      return NextResponse.json({ error: '請至少選擇一個發佈平台' }, { status: 400 });
    }
    if (!body.contentTopics?.length) {
      return NextResponse.json({ error: '請至少選擇一個內容主題' }, { status: 400 });
    }
    if (!body.availableTimes?.length) {
      return NextResponse.json({ error: '請至少選擇一個可參加活動時間' }, { status: 400 });
    }

    const beauty = getBeautyClient();
    const mps = getMpsClient();

    const beautyRow = buildBeauty100Row(body);
    const { data: beautyData, error: beautyError } = await beauty
      .from('kol_applications')
      .insert(beautyRow)
      .select('id')
      .single();

    if (beautyError) {
      console.error('Beauty100 kol_applications insert failed:', beautyError);
      return NextResponse.json(
        { error: beautyError.message || 'Beauty100 提交失敗' },
        { status: 500 }
      );
    }

    const mpsRow = buildMpsKolApplyRow(body);
    const { data: mpsData, error: mpsError } = await mps
      .from('kol_apply')
      .insert(mpsRow)
      .select('id')
      .single();

    if (mpsError) {
      console.error('MPS kol_apply insert failed:', mpsError);
      return NextResponse.json(
        {
          error: `Beauty100 已儲存，但 MPS 同步失敗：${mpsError.message}`,
          beautyId: beautyData?.id,
          mpsSynced: false,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      ok: true,
      beautyId: beautyData?.id,
      mpsId: mpsData?.id,
      mpsSynced: true,
    });
  } catch (err: any) {
    console.error('kol-apply API error:', err);
    return NextResponse.json(
      { error: err?.message || '提交失敗，請稍後再試' },
      { status: 500 }
    );
  }
}
