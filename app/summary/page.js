'use client';
import Link from 'next/link';
import { useMemo } from 'react';
import { useUnits } from '../../lib/useUnits';
import { enrich, fmt, lastUpdate } from '../../lib/units';

export default function ListUnitParkir() {
  const { data, error, now, stale } = useUnits();
  // Hanya unit parkir > 2 jam (status merah)
  const list = useMemo(
    () => enrich(data?.units || [], now).filter((u) => u.state === 'overtime').sort((a, b) => b.parkSec - a.parkSec),
    [data, now]
  );

  return (
    <div className="page">
      <h1>List Unit Parkir</h1>
      <div>
        <b>{list.length}</b> unit parkir lebih dari 2 jam · {lastUpdate(data?.updatedAt)}
      </div>
      {(stale || error) && (
        <div className="warn" role="alert" style={{ marginTop: 12 }}>
          {error ? 'Gagal mengambil data dari server.' : 'Data belum diperbarui lebih dari 3 menit.'}
        </div>
      )}
      {data && !list.length ? (
        <p className="empty">Tidak ada unit yang parkir lebih dari 2 jam.</p>
      ) : (
        <div className="tablewrap">
          <table>
            <thead>
              <tr><th>Nopol</th><th>Perusahaan / Grup</th><th>Durasi parkir</th><th>Alamat parkir</th><th></th></tr>
            </thead>
            <tbody>
              {list.map((u) => (
                <tr key={u.nopol}>
                  <td><b>{u.nopol}</b></td>
                  <td>{u.company}<br />{u.group}</td>
                  <td className="dur">{fmt(u.parkSec)}</td>
                  <td>{u.geo && <b>{u.geo}<br /></b>}{u.addr}</td>
                  <td><Link className="btn" href={`/?track=${encodeURIComponent(u.nopol)}`}>Track</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
