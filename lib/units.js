export const OVER = 2 * 3600; // > 2 jam = overtime
export const WARN = 1 * 3600; // > 1 jam = mendekati batas
export const STALE_MS = 30 * 60 * 1000; // data GPS > 30 menit = basi

export const STATES = {
  overtime: { label: 'Parkir > 2 jam', color: '#dc2626' },
  warning: { label: 'Parkir > 1 jam', color: '#eab308' },
  normal: { label: 'Parkir normal', color: '#16a34a' },
  driving: { label: 'Driving', color: '#2563eb' },
  idle: { label: 'Idle / data basi', color: '#9ca3af' },
};

// Durasi dihitung dari parking.start_time (bukan duration.value yang tidak konsisten)
export function enrich(list, now) {
  return list.map((u) => {
    const parkSec =
      u.status === 0 && u.parkStart
        ? Math.max(0, (now - new Date(u.parkStart).getTime()) / 1000)
        : null;
    const stale = now - new Date(u.gpsTime).getTime() > STALE_MS;
    let state = 'idle';
    if (!stale) {
      if (u.status === 2) state = 'driving';
      else if (u.status === 0)
        state = parkSec > OVER ? 'overtime' : parkSec > WARN ? 'warning' : 'normal';
    }
    return { ...u, parkSec, state, color: STATES[state].color };
  });
}

export function fmt(sec) {
  if (sec == null) return '-';
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return h ? `${h} jam ${m} menit` : `${m} menit`;
}

export const timeId = (iso) =>
  iso ? new Date(iso).toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta', hour12: false }) : '-';
