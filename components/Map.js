'use client';
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { STATES, fmt } from '../lib/units';

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export default function MapView({ units, selected }) {
  const el = useRef(null);
  const map = useRef(null);
  const layer = useRef(null);
  const markers = useRef({});
  const fitted = useRef(false);
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
    units.forEach((u) => {
      const m = L.circleMarker([u.lat, u.lon], {
        radius: 8, color: '#fff', weight: 2, fillColor: u.color, fillOpacity: 1,
      }).bindPopup(
        `<b>${esc(u.nopol)}</b><br>${esc(u.company)} · ${esc(u.group)}<br>` +
        `Status: ${STATES[u.state].label}` +
        (u.parkSec != null ? `<br>Parkir: ${fmt(u.parkSec)}` : '') +
        `<br>${esc(u.geo || u.addr)}`
      );
      m.addTo(layer.current);
      markers.current[u.nopol] = m;
    });
    if (!fitted.current && units.length && !selected) {
      map.current.fitBounds(L.latLngBounds(units.map((u) => [u.lat, u.lon])), { padding: [40, 40], maxZoom: 14 });
      fitted.current = true;
    }
    const m = selected && markers.current[selected];
    if (m) {
      if (flown.current !== selected) { map.current.flyTo(m.getLatLng(), 16); flown.current = selected; fitted.current = true; }
      m.openPopup();
    }
  }, [units, selected]);

  return <div ref={el} style={{ height: '100%', width: '100%' }} />;
}
