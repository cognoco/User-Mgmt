import { NextResponse } from 'next/server';
import spec from '@/../docs/api/openapi.json' assert { type: 'json' };

export const GET = async () => {
  return NextResponse.json(spec);
};
