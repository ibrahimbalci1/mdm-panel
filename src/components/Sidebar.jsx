import { rColor, rLabel } from "../utils";

export default function Sidebar({ tab, setTab, currentUser, commandLog, alerts, sidebarCollapsed, setSidebarCollapsed, logout, apiLoading }) {
  const critCount = alerts.filter(a => a.type === "critical").length;

  const navGroups = [
    { label: "ANA MENÜ", items: [
      { id: "dashboard",  icon: "⬡",  label: "Dashboard" },
      { id: "devices",    icon: "📱", label: "Cihazlar" },
      { id: "enrollment", icon: "➕", label: "Kayıt" },
    ]},
    { label: "YÖNETİM", items: [
      { id: "policies", icon: "🛡️", label: "Politikalar" },
      { id: "profiles", icon: "⚙️", label: "Profiller" },
      { id: "apps",     icon: "📦", label: "Uygulamalar" },
      { id: "kiosk",    icon: "🖥️", label: "Kiosk" },
    ]},
    { label: "İZLEME", items: [
      { id: "geofence", icon: "🗺️", label: "Konum & Geofence" },
      { id: "reports",  icon: "📊", label: "Raporlar" },
      { id: "alerts",   icon: "🔔", label: "Uyarılar",       badge: critCount || null, badgeRed: true },
      { id: "logs",     icon: "📋", label: "Komut Geçmişi",  badge: commandLog.length || null },
    ]},
    { label: "AYARLAR", items: [
      ...(currentUser?.role === "admin" ? [{ id: "users", icon: "👥", label: "Kullanıcılar" }] : []),
      { id: "settings", icon: "🔧", label: "Ayarlar" },
    ]},
  ];

  return (
    <div style={{ width: sidebarCollapsed ? 60 : 224, background: "#0a0c18", borderRight: "1px solid #1a1f35", display: "flex", flexDirection: "column", flexShrink: 0, transition: "width .2s" }}>
      {/* Logo */}
      <div style={{ padding: "16px 14px", borderBottom: "1px solid #1a1f35", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#3b5bdb,#228be6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700, color: "#fff", flexShrink: 0 }}>M</div>
        {!sidebarCollapsed && <div><div style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9" }}>MDM Enterprise</div><div style={{ fontSize: 10, color: "#475569" }}>v2.0 Pro</div></div>}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
        {navGroups.map(g => (
          <div key={g.label}>
            {!sidebarCollapsed && <div className="stl">{g.label}</div>}
            {g.items.map(item => (
              <button key={item.id} className={`ni ${tab === item.id ? "ac" : ""}`} onClick={() => setTab(item.id)}>
                <span style={{ fontSize: 15, flexShrink: 0 }}>{item.icon}</span>
                {!sidebarCollapsed && <>
                  <span>{item.label}</span>
                  {item.badge ? <span style={{ marginLeft: "auto", background: item.badgeRed ? "#2d1a1a" : "#1e2a40", color: item.badgeRed ? "#f87171" : "#60a5fa", fontSize: 10, padding: "1px 6px", borderRadius: 10 }}>{item.badge}</span> : null}
                </>}
              </button>
            ))}
          </div>
        ))}
      </nav>

      {/* Alt bilgi */}
      <div style={{ padding: "10px", borderTop: "1px solid #1a1f35" }}>
        {!sidebarCollapsed && currentUser && (
          <div style={{ marginBottom: 8, padding: "8px 10px", background: "#13172a", borderRadius: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#e2e8f0", marginBottom: 2 }}>{currentUser.full_name || currentUser.email}</div>
            <span className="tag" style={{ background: "#1e2340", color: rColor(currentUser.role), fontSize: 10 }}>{rLabel(currentUser.role)}</span>
          </div>
        )}
        {!sidebarCollapsed && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, padding: "4px 10px" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: apiLoading ? "#f59e0b" : "#22c55e" }}></div>
            <span style={{ fontSize: 11, color: "#475569" }}>{apiLoading ? "Yükleniyor..." : "Çevrimiçi"}</span>
          </div>
        )}
        <button className="ni" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
          <span style={{ fontSize: 13 }}>{sidebarCollapsed ? "▶" : "◀"}</span>
          {!sidebarCollapsed && <span style={{ fontSize: 12 }}>Küçült</span>}
        </button>
        <button className="ni" onClick={logout}>
          <span style={{ fontSize: 13 }}>🚪</span>
          {!sidebarCollapsed && <span style={{ fontSize: 12 }}>Çıkış</span>}
        </button>
      </div>
    </div>
  );
}
