import { NextResponse } from 'next/server';
import { getServiceMetadata } from '@/lib/service';

export function GET() {
  return NextResponse.json(getServiceMetadata());
}
