import { NextRequest, NextResponse } from 'next/server';
import { getSearchJob } from '@/lib/services/search-orchestrator';
import { exportToCSV, exportToJSON } from '@/lib/services/export-service';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const job = getSearchJob(id);

  if (!job) {
    return NextResponse.json({ error: 'Search job not found' }, { status: 404 });
  }

  if (job.status !== 'completed') {
    return NextResponse.json({ error: 'Search not yet completed' }, { status: 400 });
  }

  const body = await request.json();
  const format = body.format || 'csv';

  let content: string;
  let contentType: string;
  let filename: string;

  switch (format) {
    case 'json':
      content = exportToJSON(job.results);
      contentType = 'application/json';
      filename = `leads_${id}.json`;
      break;
    case 'csv':
    default:
      content = exportToCSV(job.results);
      contentType = 'text/csv';
      filename = `leads_${id}.csv`;
      break;
  }

  return new NextResponse(content, {
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
