export const OVER = 2 * 3600; // > 2 jam = overtime
export const WARN = 1 * 3600; // > 1 jam = mendekati batas

// Unit yang parkir di geofence ini selalu dianggap "Parkir normal"
export const NORMAL_GEO = ['workshop mallomo', 'kantor mallomo'];
const inSafeZone = (code) => {
  const c = String(code || '').toLowerCase();
  return NORMAL_GEO.some((g) => c.includes(g));
};

export const STATES = {
  overtime: { label: 'Parkir > 2 jam', color: '#dc2626' },
  warning: { label: 'Parkir > 1 jam', color: '#eab308' },
  normal: { label: 'Parkir normal', color: '#16a34a' },
  driving: { label: 'Driving', color: '#2563eb' },
  idle: { label: 'Idle', color: '#9ca3af' },
};

// Durasi dihitung dari parking.start_time (bukan duration.value yang tidak konsisten)
export function enrich(list, now) {
  return list.map((u) => {
    const parkSec =
      u.status === 0 && u.parkStart
        ? Math.max(0, (now - new Date(u.parkStart).getTime()) / 1000)
        : null;
    // Status mengikuti data terakhir dari EasyGO, tanpa memedulikan umur datanya
    let state = 'idle';
    if (u.status === 2) state = 'driving';
    else if (u.status === 0)
      state = inSafeZone(u.geoCode)
        ? 'normal'
        : parkSec > OVER ? 'overtime' : parkSec > WARN ? 'warning' : 'normal';
    return { ...u, parkSec, state, color: STATES[state].color };
  });
}

export function fmt(sec) {
  if (sec == null) return '-';
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return h ? `${h} jam ${m} menit` : `${m} menit`;
}

const TZ = 'Asia/Makassar'; // WITA (GMT+8)

export const timeId = (iso) =>
  iso ? new Date(iso).toLocaleTimeString('id-ID', { timeZone: TZ, hour12: false }) : '-';

export function lastUpdate(iso) {
  if (!iso) return 'LAST UPDATE: -';
  const d = new Date(iso);
  const date = d.toLocaleDateString('id-ID', { timeZone: TZ, day: 'numeric', month: 'long', year: 'numeric' });
  const time = d.toLocaleTimeString('id-ID', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hour12: false });
  return `LAST UPDATE: ${date} (${time} WITA)`;
}
