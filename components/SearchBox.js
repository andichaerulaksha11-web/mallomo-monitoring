'use client';
import { useEffect, useRef, useState } from 'react';

// Kolom cari nopol + dropdown checklist jenis unit (group_nm)
export default function SearchBox({ query, onQuery, groups, selected, onToggle, onClear }) {
  const [open, setOpen] = useState(false);
  const box = useRef(null);

  useEffect(() => {
    const close = (e) => { if (box.current && !box.current.contains(e.target)) setOpen(false); };
    const esc = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', esc); };
  }, []);

  return (
    <div className="search" ref={box}>
      <input
        type="text"
        placeholder="Cari nopol, perusahaan, atau grup"
        aria-label="Cari unit"
        value={query}
        onChange={(e) => onQuery(e.target.value)}
      />
      <button type="button" className={'sbtn' + (open ? ' on' : '')} aria-label="Filter jenis unit" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        {selected.length > 0 && <span className="badge">{selected.length}</span>}
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
          <path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div className="panel" role="group" aria-label="Jenis unit">
          <div className="panelhead">
            <b>Jenis unit</b>
            {selected.length > 0 && <button type="button" className="link" onClick={onClear}>Hapus pilihan</button>}
          </div>
          {groups.length === 0 && <div className="none">Belum ada data.</div>}
          {groups.map((g) => (
            <label key={g.name} className="row">
              <input type="checkbox" checked={selected.includes(g.name)} onChange={() => onToggle(g.name)} />
              <span>{g.name || '(Tanpa grup)'} ({g.count})</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
