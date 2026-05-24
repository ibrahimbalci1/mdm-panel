export default function Profiles({ profiles, setProfiles, setProfileModal, setEditProfile, setProfileForm, setConfirmModal, devices, toast$, H, API }) {

  const deployProfile = async (p) => {
    if (!devices.length) { toast$("Kayıtlı cihaz yok", "error"); return; }
    toast$(`⏳ "${p.name}" gönderiliyor...`);
    let ok = 0;
    for (const d of devices) {
      try {
        const r = await fetch(`${API}/commands/device/${d.id}`, {
          method: "POST", headers: H(),
          body: JSON.stringify({ command_type: "push_policy", payload: { profile_type: p.type, profile_name: p.name, config: p.config } }),
        });
        if (r.ok) ok++;
      } catch {}
    }
    setProfiles(prev => prev.map(x => x.id === p.id ? { ...x, devices: ok } : x));
    toast$(ok > 0 ? `✅ "${p.name}" → ${ok}/${devices.length} cihaza gönderildi` : `❌ Gönderilemedi`, ok === 0 ? "error" : "success");
  };

  const typeIcon  = t => ({ wifi: "📶", vpn: "🔐", email: "📧", certificate: "🔏" }[t] || "⚙️");
  const typeColor = t => ({ wifi: "#1e3a1e", vpn: "#1a1f3a", email: "#2a1a3a", certificate: "#2a2a1a" }[t] || "#1a1f35");
  const typeLabel = t => ({ wifi: "WI-FI", vpn: "VPN", email: "E-POSTA", certificate: "SERTİFİKA" }[t] || t.toUpperCase());
  const configSummary = p => {
    if (p.type === "wifi")        return `SSID: ${p.config?.ssid || "—"}`;
    if (p.type === "vpn")         return p.config?.server || "—";
    if (p.type === "email")       return p.config?.server || "—";
    if (p.type === "certificate") return p.config?.name || "—";
    return "—";
  };

  return (
    <div>
      {/* Tür Kartları */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { type: "wifi",        icon: "📶", label: "Wi-Fi",     color: "#22c55e" },
          { type: "vpn",         icon: "🔐", label: "VPN",       color: "#3b82f6" },
          { type: "email",       icon: "📧", label: "E-posta",   color: "#a78bfa" },
          { type: "certificate", icon: "🔏", label: "Sertifika", color: "#f59e0b" },
        ].map(t => (
          <div key={t.type} className="card" style={{ padding: 14, cursor: "pointer" }}
            onClick={() => { setEditProfile(null); setProfileForm({ name: "", type: t.type, config: {} }); setProfileModal(true); }}>
            <div style={{ fontSize: 24, marginBottom: 7 }}>{t.icon}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: t.color }}>{t.label}</div>
            <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>{profiles.filter(p => p.type === t.type).length} profil</div>
            <div style={{ fontSize: 11, color: t.color, marginTop: 6 }}>+ Ekle →</div>
          </div>
        ))}
      </div>

      {/* Yeni Profil Butonu */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9" }}>Tüm Profiller <span style={{ fontSize: 12, color: "#475569", fontWeight: 400 }}>({profiles.length})</span></div>
        <button className="btn pr" onClick={() => { setEditProfile(null); setProfileForm({ name: "", type: "wifi", config: {} }); setProfileModal(true); }}>+ Yeni Profil</button>
      </div>

      {profiles.length === 0 ? (
        <div style={{ textAlign: "center", padding: "50px", color: "#475569" }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>⚙️</div>Profil yok. Yukarıdan tür seçerek ekleyin.
        </div>
      ) : (
        <div className="card" style={{ overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1.5fr 1fr 140px", gap: 10, padding: "10px 14px", background: "#0a0c18", color: "#475569", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em", borderBottom: "1px solid #1a1f35" }}>
            <span>Profil Adı</span><span>Tür</span><span>Yapılandırma</span><span>Durum</span><span>İşlemler</span>
          </div>

          {profiles.map(p => (
            <div key={p.id} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1.5fr 1fr 140px", gap: 10, alignItems: "center", padding: "13px 14px", borderBottom: "1px solid #1a1f35", fontSize: 13 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: typeColor(p.type), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{typeIcon(p.type)}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "#e2e8f0" }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: "#475569" }}>{p.devices > 0 ? `${p.devices} cihaza gönderildi` : "Henüz gönderilmedi"}</div>
                </div>
              </div>
              <span className="tag" style={{ background: "#141830", color: "#60a5fa", border: "1px solid #2a3048", fontSize: 11 }}>{typeLabel(p.type)}</span>
              <div style={{ fontSize: 11, color: "#64748b", fontFamily: "monospace" }}>{configSummary(p)}</div>
              <span className="tag" style={{ background: p.active ? "#1e3a1e" : "#2d1a1a", color: p.active ? "#22c55e" : "#f87171" }}>{p.active ? "● Aktif" : "○ Pasif"}</span>
              <div style={{ display: "flex", gap: 5 }}>
                <button className="btn pr" style={{ fontSize: 11, padding: "5px 9px" }} onClick={() => deployProfile(p)}>📤</button>
                <button className="btn" style={{ fontSize: 11, padding: "5px 9px" }} onClick={() => { setEditProfile(p); setProfileForm({ name: p.name, type: p.type, config: { ...p.config } }); setProfileModal(true); }}>✏️</button>
                <button className="btn" style={{ fontSize: 11, padding: "5px 9px", color: p.active ? "#f59e0b" : "#22c55e" }} onClick={() => setProfiles(prev => prev.map(x => x.id === p.id ? { ...x, active: !x.active } : x))}>{p.active ? "⏸" : "▶"}</button>
                <button className="btn dg" style={{ fontSize: 11, padding: "5px 9px" }} onClick={() => setConfirmModal({ title: "Profili Sil", msg: `"${p.name}" silinecek.`, onOk: () => setProfiles(prev => prev.filter(x => x.id !== p.id)) })}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
