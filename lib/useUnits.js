'use client';
import { useEffect, useState } from 'react';

export function useUnits() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    let on = true;
    const load = async () => {
      try {
        const r = await fetch('/api/units', { cache: 'no-store' });
        const j = await r.json();
        if (on) { setData(j); setError(false); }
      } catch { if (on) setError(true); }
    };
    load();
    const a = setInterval(load, 60000);
    const b = setInterval(() => setNow(Date.now()), 15000);
    return () => { on = false; clearInterval(a); clearInterval(b); };
  }, []);

  const stale = !data?.updatedAt || now - new Date(data.updatedAt).getTime() > 3 * 60000;
  return { data, error, now, stale };
}
