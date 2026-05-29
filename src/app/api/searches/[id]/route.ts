import { NextRequest, NextResponse } from 'next/server';
import { getSearchJob } from '@/lib/services/search-orchestrator';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const job = getSearchJob(id);

  if (!job) {
    return NextResponse.json({ error: 'Search job not found' }, { status: 404 });
  }

  return NextResponse.json(job);
}
