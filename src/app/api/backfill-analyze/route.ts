import { NextResponse } from 'next/server';

async function callBackfill(mode: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  const response = await fetch(
    `${supabaseUrl}/functions/v1/supabase-functions-backfill-salon-profiles`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'apikey': supabaseAnonKey,
      },
      body: JSON.stringify({ mode }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Edge function error ${response.status}: ${errorText}`);
  }

  return response.json();
}

export async function GET() {
  try {
    const data = await callBackfill('analyze');
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const mode = body.mode || 'analyze';
    const data = await callBackfill(mode);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
