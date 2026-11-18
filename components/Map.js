'use client';
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { STATES, fmt } from '../lib/units';

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export default function MapView({ units, selected, fitKey }) {
  const el = useRef(null);
  const map = useRef(null);
  const layer = useRef(null);
  const markers = useRef({});
  const lastFit = useRef(null);
  const flown = useRef(null);

  useEffect(() => {
    map.current = L.map(el.current).setView([-4.95, 119.6], 8);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map.current);
    layer.current = L.layerGroup().addTo(map.current);
    return () => map.current.remove();
  }, []);

  useEffect(() => {
    layer.current.clearLayers();
    markers.current = {};
    const over = [];
    units.forEach((u) => {
      const isOver = u.state === 'overtime';
      const m = L.circleMarker([u.lat, u.lon], {
        radius: isOver ? 10 : 8, color: '#fff', weight: 2, fillColor: u.color, fillOpacity: 1,
        className: isOver ? 'blink' : '',
      }).bindPopup(
        `<b>${esc(u.nopol)}</b><br>${esc(u.company)} · ${esc(u.group)}<br>` +
        `Status: ${STATES[u.state].label}` +
        (u.parkSec != null ? `<br>Parkir: ${fmt(u.parkSec)}` : '') +
        `<br>${esc(u.geo || u.addr)}`
      );
      m.addTo(layer.current);
      markers.current[u.nopol] = m;
      if (isOver) over.push(m);
    });
    over.forEach((m) => m.bringToFront()); // unit merah selalu di atas

    // Zoom ulang tiap kali pencarian/filter status berubah
    if (fitKey !== lastFit.current && units.length && !selected) {
      map.current.fitBounds(L.latLngBounds(units.map((u) => [u.lat, u.lon])), { padding: [40, 40], maxZoom: 14 });
      lastFit.current = fitKey;
    }
    const m = selected && markers.current[selected];
    if (m) {
      if (flown.current !== selected) { map.current.flyTo(m.getLatLng(), 16); flown.current = selected; lastFit.current = fitKey; }
      m.openPopup();
    }
  }, [units, selected, fitKey]);

  return <div ref={el} style={{ height: '100%', width: '100%' }} />;
}
