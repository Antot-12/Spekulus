
import { NextResponse } from 'next/server';
import { getAuditLogsAsCsv } from '@/lib/db/actions';

export async function GET() {
  try {
    const csvData = await getAuditLogsAsCsv();
    const headers = new Headers();
    headers.set('Content-Type', 'text/csv');
    headers.set('Content-Disposition', `attachment; filename="spekulus-audit-logs-${new Date().toISOString()}.csv"`);
    return new NextResponse(csvData, { status: 200, headers });
  } catch (error) {
    console.error('Failed to export CSV:', error);
    return new NextResponse('Failed to export logs.', { status: 500 });
  }
}
