import { sColor, sLabel, PLATFORMS } from "../utils";

export default function Dashboard({ devices, stats, policies, apps, alerts, setTab, setSelectedDevice, sendAll, exportCSV, generateQr }) {
  return (
    <div>
      {/* KPI Kartları */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 14, marginBottom: 22 }}>
        {[
          { l: "Toplam",    v: stats.total_devices,         c: "#60a5fa", i: "📱" },
          { l: "Çevrimiçi", v: stats.online_devices,        c: "#22c55e", i: "🟢" },
          { l: "Çevrimdışı",v: stats.offline_devices,       c: "#64748b", i: "⚫" },
          { l: "Kilitli",   v: stats.locked_devices,        c: "#f59e0b", i: "🔒" },
          { l: "Uyumsuz",   v: stats.non_compliant_devices, c: "#f87171", i: "⚠️" },
          { l: "Uyarı",     v: alerts.length,               c: "#a78bfa", i: "🔔" },
        ].map(s => (
          <div key={s.l} className="card" style={{ padding: 16 }}>
            <div style={{ fontSize: 18, marginBottom: 8 }}>{s.i}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: s.c, fontFamily: "'JetBrains Mono',monospace" }}>{s.v}</div>
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 3 }}>{s.l}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 18, marginBottom: 18 }}>
        {/* Son Cihazlar */}
        <div className="card" style={{ overflow: "hidden" }}>
          <div style={{ padding: "13px 16px", borderBottom: "1px solid #1a1f35", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#f1f5f9" }}>📱 Son Cihazlar</span>
            <button className="btn" style={{ fontSize: 11, padding: "4px 10px" }} onClick={() => setTab("devices")}>Tümü →</button>
          </div>
          {devices.slice(0, 6).map(d => (
            <div key={d.id} onClick={() => { setTab("devices"); setSelectedDevice(d); }} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", borderBottom: "1px solid #1a1f35", cursor: "pointer" }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "#1a1f35", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>📱</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: "#e2e8f0" }}>{d.name || `${d.manufacturer || ""} ${d.model || ""}`}</div>
                <div style={{ fontSize: 11, color: "#475569" }}>{d.owner_name || "—"}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: sColor(d.status) }}></div>
                <span style={{ fontSize: 11, color: sColor(d.status) }}>{sLabel(d.status)}</span>
              </div>
            </div>
          ))}
          {devices.length === 0 && <div style={{ padding: "30px", textAlign: "center", color: "#475569", fontSize: 13 }}>Kayıtlı cihaz yok</div>}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Platform */}
          <div className="card" style={{ padding: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#f1f5f9", marginBottom: 12 }}>Platform Dağılımı</div>
            {PLATFORMS.map(p => (
              <div key={p.id} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: "#94a3b8" }}>{p.icon} {p.label}</span>
                  <span style={{ fontSize: 12, color: p.color, fontFamily: "monospace" }}>{p.id === "android" ? devices.length : 0}</span>
                </div>
                <div className="bar"><div className="bf" style={{ width: p.id === "android" && devices.length > 0 ? "100%" : "0%", background: p.color }} /></div>
              </div>
            ))}
          </div>

          {/* Hızlı İşlemler */}
          <div className="card" style={{ padding: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#f1f5f9", marginBottom: 10 }}>⚡ Hızlı İşlemler</div>
            <button className="btn" style={{ width: "100%", marginBottom: 7, fontSize: 12 }} onClick={() => sendAll("push_policy", "Politika Güncelle")}>🛡️ Tüm Cihazlara Politika</button>
            <button className="btn" style={{ width: "100%", marginBottom: 7, fontSize: 12 }} onClick={() => { setTab("enrollment"); generateQr(null, "provisioning"); }}>📱 Hızlı QR Oluştur</button>
            <button className="btn" style={{ width: "100%", marginBottom: 7, fontSize: 12 }} onClick={() => exportCSV(devices.map(d => ({ ad: d.name || `${d.manufacturer} ${d.model}`, kullanici: d.owner_name || "", durum: sLabel(d.status), batarya: d.battery_level || 0 })), "cihazlar.csv")}>📥 Cihaz Listesi CSV</button>
          </div>
        </div>
      </div>

      {/* Alt Kartlar */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#f1f5f9", marginBottom: 12 }}>✅ Uyumluluk</div>
          {[{ l: "Uyumlu", v: devices.filter(d => d.is_compliant !== false).length, c: "#22c55e" }, { l: "Uyumsuz", v: devices.filter(d => d.is_compliant === false).length, c: "#f87171" }].map(i => (
            <div key={i.l} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: "#94a3b8" }}>{i.l}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: i.c }}>{i.v}/{devices.length || 0}</span>
              </div>
              <div className="bar"><div className="bf" style={{ width: devices.length ? `${(i.v / devices.length) * 100}%` : "0%", background: i.c }} /></div>
            </div>
          ))}
        </div>

        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#f1f5f9", marginBottom: 12 }}>📦 Uygulamalar</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: "#60a5fa", fontFamily: "monospace", marginBottom: 4 }}>{apps.length}</div>
          <div style={{ fontSize: 11, color: "#475569", marginBottom: 10 }}>yönetilen uygulama</div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span style={{ fontSize: 12, color: "#94a3b8" }}>Zorunlu</span><span style={{ fontSize: 12, color: "#22c55e" }}>{apps.filter(a => a.is_required).length}</span></div>
          <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: 12, color: "#94a3b8" }}>İsteğe Bağlı</span><span style={{ fontSize: 12, color: "#60a5fa" }}>{apps.filter(a => !a.is_required).length}</span></div>
        </div>

        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#f1f5f9", marginBottom: 12 }}>🛡️ Politikalar</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: "#a78bfa", fontFamily: "monospace", marginBottom: 4 }}>{policies.length}</div>
          <div style={{ fontSize: 11, color: "#475569", marginBottom: 10 }}>aktif politika</div>
          {policies.slice(0, 3).map(p => (
            <div key={p.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 120 }}>{p.name}</span>
              <span style={{ fontSize: 11, color: "#475569" }}>{p.device_count || 0}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
