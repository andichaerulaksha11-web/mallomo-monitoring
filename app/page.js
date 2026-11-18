'use client';
import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useUnits } from '../lib/useUnits';
import { enrich, STATES, lastUpdate } from '../lib/units';
import SearchBox from '../components/SearchBox';

const MapView = dynamic(() => import('../components/Map'), { ssr: false });

export default function Tracking() {
  const { data, error, now, stale } = useUnits();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [active, setActive] = useState([]); // filter status; kosong = semua
  const [groups, setGroups] = useState([]); // filter jenis unit (group_nm); kosong = semua

  // Dari tombol "Track": /?track=NOPOL
  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get('track');
    if (t) { setQuery(t); setSelected(t); }
  }, []);

  const all = useMemo(() => enrich(data?.units || [], now), [data, now]);

  const byQuery = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all.filter((u) => !q || [u.nopol, u.company, u.group].some((v) => String(v || '').toLowerCase().includes(q)));
  }, [all, query]);

  // Jumlah di tombol status mengikuti pencarian + jenis unit
  const statusCounts = useMemo(() => {
    const c = {};
    byQuery.forEach((u) => {
      if (!groups.length || groups.includes(u.group || '')) c[u.state] = (c[u.state] || 0) + 1;
    });
    return c;
  }, [byQuery, groups]);

  // Jumlah per jenis unit mengikuti pencarian + status
  const groupList = useMemo(() => {
    const c = {};
    all.forEach((u) => { c[u.group || ''] = 0; });
    byQuery.forEach((u) => {
      if (!active.length || active.includes(u.state)) c[u.group || '']++;
    });
    return Object.entries(c)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([name, count]) => ({ name, count }));
  }, [all, byQuery, active]);

  const units = useMemo(
    () => byQuery.filter((u) => (!groups.length || groups.includes(u.group || '')) && (!active.length || active.includes(u.state))),
    [byQuery, groups, active]
  );

  const toggleStatus = (k) => {
    setActive((a) => (a.includes(k) ? a.filter((x) => x !== k) : [...a, k]));
    setSelected(null);
  };
  const toggleGroup = (g) => {
    setGroups((a) => (a.includes(g) ? a.filter((x) => x !== g) : [...a, g]));
    setSelected(null);
  };

  return (
    <>
      <div className="tools">
        <SearchBox
          query={query}
          onQuery={(v) => { setQuery(v); setSelected(null); }}
          groups={groupList}
          selected={groups}
          onToggle={toggleGroup}
          onClear={() => { setGroups([]); setSelected(null); }}
        />
        <div className="legend">
          {Object.entries(STATES).map(([k, s]) => (
            <button
              key={k}
              type="button"
              className={'chip' + (active.includes(k) ? ' on' : '')}
              aria-pressed={active.includes(k)}
              onClick={() => toggleStatus(k)}
            >
              <span className={'dot' + (k === 'overtime' ? ' blink' : '')} style={{ background: s.color }} />
              {s.label} ({statusCounts[k] || 0})
            </button>
          ))}
          {(active.length > 0 || groups.length > 0) && (
            <button type="button" className="chip" onClick={() => { setActive([]); setGroups([]); setSelected(null); }}>
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
        <MapView
          units={units}
          selected={selected}
          fitKey={query + '|' + [...active].sort().join(',') + '|' + [...groups].sort().join(',')}
        />
      </div>
    </>
  );
}
