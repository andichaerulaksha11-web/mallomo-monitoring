import { redis, KEY } from '../../../lib/redis';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

// Dipanggil cron-job.org tiap 1 menit
export async function GET(req) {
  if (!process.env.CRON_SECRET || req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }
  try {
        const res = await fetch(
      process.env.EASYGO_URL || 'https://vtsapi.easygo-gps.co.id/api/report/lastposition',
      {
        method: 'POST',
        headers: {
          token: process.env.EASYGO_TOKEN,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          list_vehicle_id: [],
          list_nopol: [],
          list_no_aset: [],
          status_vehicle: null,
          geo_code: [],
          min_lastupdate_hour: null,
          page: 0,
          encrypted: 0,
          lat: null,
          lon: null,
          sort_by_distance: false,
          max_distance: null,
        }),
        cache: 'no-store',
        signal: AbortSignal.timeout(8000),
      }
    );
    if (!res.ok) throw new Error(`EasyGO HTTP ${res.status}`);
    const json = await res.json();
    if (json.ResponseCode !== 1) throw new Error(json.ResponseMessage || 'EasyGO error');

    const units = (json.Data || [])
      .filter((u) => u.lat && u.lon)
      .map((u) => {
        const p = u.currentStatusVehicle?.parking;
        return {
          nopol: u.nopol,
          company: u.company_nm,
          group: u.group_nm,
          model: u.car_model,
          lat: u.lat,
          lon: u.lon,
          status: u.currentStatusVehicle?.status,
          speed: u.speed,
          gpsTime: u.gps_time,
          parkStart: p?.start_time || null,
          addr: p?.addr || u.addr,
          geo: p?.geo_location_nm || '',
        };
      });

    await redis.set(KEY, { updatedAt: new Date().toISOString(), units });
    return Response.json({ ok: true, count: units.length });
  } catch (e) {
    return Response.json({ ok: false, error: e.message }, { status: 500 });
  }
}
