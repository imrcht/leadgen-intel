import { NextRequest, NextResponse } from 'next/server';
import { createSearchJob, getAllSearchJobs } from '@/lib/services/search-orchestrator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { category, location, radius = 5, filters } = body;

    if (!category || !location) {
      return NextResponse.json(
        { error: 'category and location are required' },
        { status: 400 }
      );
    }

    const job = await createSearchJob({ category, location, radius, filters });
    return NextResponse.json(job, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  const jobs = getAllSearchJobs();
  return NextResponse.json(jobs);
}
