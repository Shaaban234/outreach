import { NextResponse } from "next/server";
import pool from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const client = await pool.connect();
  try {
    const stats = await client.query(`
      SELECT
        (SELECT COUNT(*) FROM leads) as total_leads,
        (SELECT COUNT(*) FROM emails WHERE status='sent') as total_sent,
        (SELECT COUNT(*) FROM emails WHERE status='sent' AND sent_at >= NOW() - INTERVAL '24 hours') as sent_today,
        (SELECT COUNT(*) FROM emails WHERE status='sent' AND sent_at >= NOW() - INTERVAL '7 days') as sent_week,
        (SELECT COUNT(*) FROM emails WHERE status='replied') as total_replied,
        (SELECT COUNT(*) FROM deals WHERE status='booked') as total_booked
    `);
    return NextResponse.json(stats.rows[0]);
  } finally {
    client.release();
  }
}
