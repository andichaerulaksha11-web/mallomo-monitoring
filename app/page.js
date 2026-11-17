'use client';
import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useUnits } from '../lib/useUnits';
import { enrich, STATES, timeId } from '../lib/units';

const MapView = dynamic(() => import('../components/Map'), { ssr: false });

export default function Tracking() {
  const { data, error, now, stale } = useUnits();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);

  // Dari tombol "Track": /?track=NOPOL
  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get('track');
    if (t) { setQuery(t); setSelected(t); }
  }, []);

  const units = useMemo(() => {
    const q = query.trim().toLowerCase();
    return enrich(data?.units || [], now).filter(
      (u) => !q || [u.nopol, u.company, u.group].some((v) => String(v || '').toLowerCase().includes(q))
    );
  }, [data, now, query]);

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
          {Object.values(STATES).map((s) => (
            <span key={s.label}><span className="dot" style={{ background: s.color }} />{s.label}</span>
          ))}
        </div>
        <span className="meta">{units.length} unit · update {timeId(data?.updatedAt)}</span>
      </div>
      {(stale || error) && (
        <div className="warn" role="alert">
          {error ? 'Gagal mengambil data dari server.' : 'Data belum diperbarui lebih dari 3 menit. Periksa cron job atau API EasyGO.'}
        </div>
      )}
      <div className="mapbox"><MapView units={units} selected={selected} /></div>
    </>
  );
}
