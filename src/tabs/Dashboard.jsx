import { API, sColor, sLabel, PLATFORMS, toast } from "../utils";

export default function Dashboard({
  devices = [],
  stats = {},
  policies = [],
  apps = [],
  alerts = [],
  commandLog = [],
  setTab,
  setSelectedDevice,
  sendAll,
  exportCSV,
  generateQr,
}) {
  // Platform dağılımını cihaz nesnesinden hesapla
  const platformCount = (id) =>
    devices.filter(d => {
      const p = (d.platform || d.os || d.os_type || "android").toString().toLowerCase();
      return p.includes(id);
    }).length;

  const maxPlatform = Math.max(1, ...PLATFORMS.map(p => platformCount(p.id)));

  // Kritik uyarı sayısı
  const criticalCount = alerts.filter(a => a.type === "critical").length;

  const testApi = async () => {
    toast("⏳ API test ediliyor...");
    try {
      const r = await fetch(`${API.replace("/api/v1", "")}/health`);
      if (r.ok) toast("✅ Backend çalışıyor");
      else toast(`❌ HTTP ${r.status}`, "error");
    } catch (e) { toast(`❌ ${e.message}`, "error"); }
  };

  return (
    <div>
      {/* KPI Kartları */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 14, marginBottom: 22 }}>
        {[
          { l: "Toplam",    v: stats.total_devices ?? devices.length,                       c: "#60a5fa", i: "📱", tab: "devices" },
          { l: "Çevrimiçi", v: stats.online_devices ?? devices.filter(d=>d.status==="online").length,   c: "#22c55e", i: "🟢", tab: "devices" },
          { l: "Çevrimdışı",v: stats.offline_devices ?? devices.filter(d=>d.status==="offline").length, c: "#64748b", i: "⚫", tab: "devices" },
          { l: "Kilitli",   v: stats.locked_devices ?? devices.filter(d=>d.status==="locked").length,   c: "#f59e0b", i: "🔒", tab: "devices" },
          { l: "Uyumsuz",   v: stats.non_compliant_devices ?? devices.filter(d=>d.is_compliant===false).length, c: "#f87171", i: "⚠️", tab: "devices" },
          { l: "Uyarı",     v: alerts.length, badge: criticalCount, c: "#a78bfa", i: "🔔", tab: "alerts" },
        ].map(s => (
          <div
            key={s.l}
            className="card"
            style={{ padding: 16, cursor: setTab ? "pointer" : "default", position: "relative", transition: "transform .15s" }}
            onClick={() => setTab && setTab(s.tab)}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
          >
            <div style={{ fontSize: 18, marginBottom: 8 }}>{s.i}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: s.c, fontFamily: "'JetBrains Mono',monospace" }}>{s.v}</div>
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 3 }}>{s.l}</div>
            {s.badge > 0 && (
              <span style={{ position: "absolute", top: 10, right: 10, background: "#ef4444", color: "#fff", fontSize: 10, padding: "2px 6px", borderRadius: 10, fontWeight: 600 }}>
                {s.badge}
              </span>
            )}
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 18, marginBottom: 18 }}>
        {/* Son Cihazlar */}
        <div className="card" style={{ overflow: "hidden" }}>
          <div style={{ padding: "13px 16px", borderBottom: "1px solid #1a1f35", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#f1f5f9" }}>📱 Son Cihazlar</span>
            <button className="btn" style={{ fontSize: 11, padding: "4px 10px" }} onClick={() => setTab && setTab("devices")}>Tümü →</button>
          </div>
          {devices.slice(0, 6).map(d => (
            <div
              key={d.id}
              onClick={() => { setSelectedDevice && setSelectedDevice(d); setTab && setTab("devices"); }}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", borderBottom: "1px solid #1a1f35", cursor: "pointer" }}
            >
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "#1a1f35", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>📱</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: "#e2e8f0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {d.name || `${d.manufacturer || ""} ${d.model || ""}`.trim() || "İsimsiz"}
                </div>
                <div style={{ fontSize: 11, color: "#475569" }}>{d.owner_name || "—"}</div>
              </div>
              {typeof d.battery_level === "number" && (
                <div style={{ fontSize: 11, color: d.battery_level < 20 ? "#f87171" : "#94a3b8", fontFamily: "monospace" }}>
                  🔋{d.battery_level}%
                </div>
              )}
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
            {PLATFORMS.map(p => {
              const c = platformCount(p.id);
              return (
                <div key={p.id} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: "#94a3b8" }}>{p.icon} {p.label}</span>
                    <span style={{ fontSize: 12, color: p.color, fontFamily: "monospace" }}>{c}</span>
                  </div>
                  <div className="bar">
                    <div className="bf" style={{ width: `${(c / maxPlatform) * 100}%`, background: p.color }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Hızlı İşlemler */}
          <div className="card" style={{ padding: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#f1f5f9", marginBottom: 10 }}>⚡ Hızlı İşlemler</div>
            <button
              className="btn"
              style={{ width: "100%", marginBottom: 7, fontSize: 12 }}
              disabled={!sendAll || devices.length === 0}
              onClick={() => sendAll && sendAll("push_policy", "Politika Güncelle")}
            >
              🛡️ Tüm Cihazlara Politika
            </button>
            <button
              className="btn"
              style={{ width: "100%", marginBottom: 7, fontSize: 12 }}
              onClick={() => { setTab && setTab("enrollment"); generateQr && generateQr(null, "provisioning"); }}
            >
              📱 Hızlı QR Oluştur
            </button>
            <button
              className="btn"
              style={{ width: "100%", marginBottom: 7, fontSize: 12 }}
              disabled={!exportCSV || devices.length === 0}
              onClick={() => exportCSV && exportCSV(
                devices.map(d => ({
                  ad: d.name || `${d.manufacturer || ""} ${d.model || ""}`.trim(),
                  kullanici: d.owner_name || "",
                  durum: sLabel(d.status),
                  batarya: `%${d.battery_level || 0}`,
                  depolama: `${d.storage_used_gb || 0}/${d.storage_total_gb || 0}GB`,
                })),
                "cihazlar.csv"
              )}
            >
              📥 Cihaz Listesi CSV
            </button>
            <button
              className="btn"
              style={{ width: "100%", fontSize: 12, borderColor: "#2a5c2a", color: "#4ade80" }}
              onClick={testApi}
            >
              🔍 API Testi
            </button>
          </div>
        </div>
      </div>

      {/* Alt Kartlar */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#f1f5f9", marginBottom: 12 }}>✅ Uyumluluk</div>
          {[
            { l: "Uyumlu",  v: devices.filter(d => d.is_compliant !== false).length, c: "#22c55e" },
            { l: "Uyumsuz", v: devices.filter(d => d.is_compliant === false).length, c: "#f87171" }
          ].map(i => (
            <div key={i.l} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: "#94a3b8" }}>{i.l}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: i.c }}>{i.v}/{devices.length || 0}</span>
              </div>
              <div className="bar">
                <div className="bf" style={{ width: devices.length ? `${(i.v / devices.length) * 100}%` : "0%", background: i.c }} />
              </div>
            </div>
          ))}
        </div>

        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#f1f5f9", marginBottom: 12 }}>📦 Uygulamalar</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: "#60a5fa", fontFamily: "monospace", marginBottom: 4 }}>{apps.length}</div>
          <div style={{ fontSize: 11, color: "#475569", marginBottom: 10 }}>yönetilen uygulama</div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: "#94a3b8" }}>Zorunlu</span>
            <span style={{ fontSize: 12, color: "#22c55e" }}>{apps.filter(a => a.is_required).length}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 12, color: "#94a3b8" }}>İsteğe Bağlı</span>
            <span style={{ fontSize: 12, color: "#60a5fa" }}>{apps.filter(a => !a.is_required).length}</span>
          </div>
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
          {policies.length === 0 && <div style={{ fontSize: 12, color: "#475569", fontStyle: "italic" }}>Politika yok</div>}
        </div>
      </div>

      {/* Son Komutlar */}
      {commandLog.length > 0 && (
        <div className="card" style={{ padding: 16, marginTop: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#f1f5f9" }}>📋 Son Komutlar</span>
            <button className="btn" style={{ fontSize: 11, padding: "4px 10px" }} onClick={() => setTab && setTab("logs")}>Tümü →</button>
          </div>
          {commandLog.slice(0, 5).map(l => (
            <div key={l.id} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #1a1f35", fontSize: 12 }}>
              <span style={{ color: "#94a3b8" }}>{l.cmd} → <span style={{ color: "#e2e8f0" }}>{l.device}</span></span>
              <span style={{ color: l.ok ? "#22c55e" : "#f87171", fontSize: 11 }}>{l.ok ? "✓" : "✗"} {l.time}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
