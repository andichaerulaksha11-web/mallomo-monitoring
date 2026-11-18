'use client';
import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useUnits } from '../lib/useUnits';
import { enrich, STATES, lastUpdate } from '../lib/units';

const MapView = dynamic(() => import('../components/Map'), { ssr: false });

export default function Tracking() {
  const { data, error, now, stale } = useUnits();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [active, setActive] = useState([]); // status yang dipilih; kosong = semua

  // Dari tombol "Track": /?track=NOPOL
  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get('track');
    if (t) { setQuery(t); setSelected(t); }
  }, []);

  const searched = useMemo(() => {
    const q = query.trim().toLowerCase();
    return enrich(data?.units || [], now).filter(
      (u) => !q || [u.nopol, u.company, u.group].some((v) => String(v || '').toLowerCase().includes(q))
    );
  }, [data, now, query]);

  const counts = useMemo(() => {
    const c = {};
    searched.forEach((u) => { c[u.state] = (c[u.state] || 0) + 1; });
    return c;
  }, [searched]);

  const units = useMemo(
    () => (active.length ? searched.filter((u) => active.includes(u.state)) : searched),
    [searched, active]
  );

  const toggle = (k) => {
    setActive((a) => (a.includes(k) ? a.filter((x) => x !== k) : [...a, k]));
    setSelected(null);
  };

  return (
    <>
      <div className="tools">
        <input
          type="search"
          placeholder="Cari nopol, perusahaan, atau grup"
          aria-label="Cari unit"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setSelected(null); }}
        />
        <div className="legend">
          {Object.entries(STATES).map(([k, s]) => (
            <button
              key={k}
              type="button"
              className={'chip' + (active.includes(k) ? ' on' : '')}
              aria-pressed={active.includes(k)}
              onClick={() => toggle(k)}
            >
              <span className={'dot' + (k === 'overtime' ? ' blink' : '')} style={{ background: s.color }} />
              {s.label} ({counts[k] || 0})
            </button>
          ))}
          {active.length > 0 && (
            <button type="button" className="chip" onClick={() => { setActive([]); setSelected(null); }}>
              Tampilkan semua
            </button>
          )}
        </div>
        <span className="meta">{units.length} unit · {lastUpdate(data?.updatedAt)}</span>
      </div>
      {(stale || error) && (
        <div className="warn" role="alert">
          {error ? 'Gagal mengambil data dari server.' : 'Data belum diperbarui lebih dari 3 menit. Periksa cron job atau API EasyGO.'}
        </div>
      )}
      <div className="mapbox">
        <MapView units={units} selected={selected} fitKey={query + '|' + [...active].sort().join(',')} />
      </div>
    </>
  );
}
