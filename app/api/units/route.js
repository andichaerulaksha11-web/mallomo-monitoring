import { redis, KEY } from '../../../lib/redis';

export const dynamic = 'force-dynamic';

export async function GET() {
  const snap = (await redis.get(KEY)) || { updatedAt: null, units: [] };
  return Response.json(snap, { headers: { 'Cache-Control': 's-maxage=30, stale-while-revalidate=30' } });
}
