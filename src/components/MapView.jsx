import { useEffect, useRef } from "react";
import { sColor } from "../utils";

export default function MapView({ locations, onSelect, selected }) {
  const ref = useRef(null), map = useRef(null), marks = useRef([]);

  const build = () => {
    if (!ref.current || map.current) return;
    const L = window.L;
    const c = locations.length > 0 ? [locations[0].lat, locations[0].lng] : [39.9, 32.8];
    map.current = L.map(ref.current).setView(c, 10);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap", maxZoom: 18,
    }).addTo(map.current);
    draw();
  };

  const draw = () => {
    if (!map.current || !window.L) return;
    marks.current.forEach(m => m.remove());
    marks.current = [];
    locations.forEach(loc => {
      const col = sColor(loc.status);
      const icon = window.L.divIcon({
        className: "",
        html: `<div style="width:14px;height:14px;border-radius:50%;background:${col};border:2px solid #fff;box-shadow:0 0 8px ${col}"></div>`,
        iconSize: [14, 14], iconAnchor: [7, 7],
      });
      const m = window.L.marker([loc.lat, loc.lng], { icon })
        .addTo(map.current)
        .bindPopup(`<b>${loc.name}</b><br>${loc.owner || ""}<br>🔋 %${loc.battery}`);
      m.on("click", () => onSelect(loc));
      marks.current.push(m);
    });
    if (locations.length > 1) {
      const g = window.L.featureGroup(marks.current);
      map.current.fitBounds(g.getBounds().pad(0.1));
    }
  };

  useEffect(() => {
    if (!document.getElementById("lf-css")) {
      const l = document.createElement("link");
      l.id = "lf-css"; l.rel = "stylesheet";
      l.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(l);
    }
    if (window.L) { build(); return; }
    const s = document.createElement("script");
    s.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    s.onload = build;
    document.head.appendChild(s);
  }, [locations]);

  useEffect(() => {
    if (selected && map.current) map.current.setView([selected.lat, selected.lng], 14);
  }, [selected]);

  return <div ref={ref} style={{ width: "100%", height: "100%" }} />;
}
