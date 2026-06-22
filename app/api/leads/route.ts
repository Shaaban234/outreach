import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT
        l.id, l.company, l.contact_name, l.email, l.niche, l.created_at,
        COUNT(e.id) FILTER (WHERE e.status='sent') as emails_sent,
        MAX(e.sent_at) as last_contacted,
        MAX(e.sequence_num) as sequence,
        COALESCE(d.status, 'new') as deal_status
      FROM leads l
      LEFT JOIN emails e ON e.lead_id = l.id
      LEFT JOIN deals d ON d.lead_id = l.id
      GROUP BY l.id, d.status
      ORDER BY l.created_at DESC
      LIMIT 200
    `);
    return NextResponse.json(result.rows);
  } finally {
    client.release();
  }
}
