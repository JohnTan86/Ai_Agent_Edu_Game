import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const devDataFile = path.join(process.cwd(), '.leaderboard_dev.json');

function getDevEntries() {
  if (fs.existsSync(devDataFile)) {
    try {
      return JSON.parse(fs.readFileSync(devDataFile, 'utf8'));
    } catch {
      return [];
    }
  }
  return [];
}

function saveDevEntries(entries: any[]) {
  try {
    fs.writeFileSync(devDataFile, JSON.stringify(entries, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to save dev leaderboard:', err);
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city') || 'all';
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)));

  let entries = getDevEntries();

  if (city !== 'all') {
    entries = entries.filter((e: any) => e.city_id === city);
  }

  entries.sort((a: any, b: any) => {
    if (b.net_profit !== a.net_profit) {
      return b.net_profit - a.net_profit;
    }
    return b.on_time_rate - a.on_time_rate;
  });

  const rankedEntries = entries.slice(0, limit).map((e: any, idx: number) => ({
    ...e,
    rank: idx + 1
  }));

  const stats = {
    totalParticipants: entries.length,
    topProfit: entries.length > 0 ? entries[0].net_profit : 0,
    avgOnTimeRate: entries.length > 0
      ? +(entries.reduce((acc: number, curr: any) => acc + curr.on_time_rate, 0) / entries.length).toFixed(1)
      : 0
  };

  return NextResponse.json({
    success: true,
    count: rankedEntries.length,
    stats,
    entries: rankedEntries,
    timestamp: new Date().toISOString()
  });
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const name = (payload.name || 'Anonymous Student').trim();
    const userId = (payload.userId || payload.email || name).trim();
    const netProfit = +(Number(payload.netProfit || 0).toFixed(2));
    const totalRevenue = +(Number(payload.totalRevenue || 0).toFixed(2));
    const totalExpenses = +(Number(payload.totalExpenses || 0).toFixed(2));
    const onTimeRate = +(Number(payload.onTimeRate || 100).toFixed(1));
    const ordersDelivered = parseInt(payload.ordersDelivered || '100', 10);
    const targetOrders = parseInt(payload.targetOrders || '100', 10);
    const durationTicks = parseInt(payload.durationTicks || '0', 10);
    const cityId = payload.cityId || 'singapore';
    const email = payload.email || '';
    const avatar = payload.avatar || '';
    const schoolClass = payload.schoolClass || '';
    const promptSnippet = (payload.promptSnippet || '').slice(0, 300);

    const entries = getDevEntries();
    const existingIdx = entries.findIndex((e: any) => e.user_id === userId && e.city_id === cityId);

    const record = {
      id: `dev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      user_id: userId,
      name,
      email,
      avatar,
      school_class: schoolClass,
      net_profit: netProfit,
      total_revenue: totalRevenue,
      total_expenses: totalExpenses,
      on_time_rate: onTimeRate,
      orders_delivered: ordersDelivered,
      target_orders: targetOrders,
      duration_ticks: durationTicks,
      city_id: cityId,
      prompt_snippet: promptSnippet,
      created_at: new Date().toISOString()
    };

    if (existingIdx >= 0) {
      if (netProfit >= entries[existingIdx].net_profit) {
        entries[existingIdx] = { ...record, id: entries[existingIdx].id };
      }
    } else {
      entries.push(record);
    }

    entries.sort((a: any, b: any) => b.net_profit - a.net_profit);
    saveDevEntries(entries);

    const rank = entries.findIndex((e: any) => e.user_id === userId && e.city_id === cityId) + 1;

    return NextResponse.json({
      success: true,
      message: 'Tournament score saved in local dev!',
      rank,
      totalParticipants: entries.length,
      entry: { ...record, rank }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
