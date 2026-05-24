import { useEffect } from "react";
import { API, authHeaders, toast } from "../utils";

const PROFILE_TYPES = [
  { type: "wifi",        icon: "📶", label: "Wi-Fi",     color: "#22c55e", bg: "#1e3a1e" },
  { type: "vpn",         icon: "🔐", label: "VPN",       color: "#3b82f6", bg: "#1a1f3a" },
  { type: "email",       icon: "📧", label: "E-posta",   color: "#a78bfa", bg: "#2a1a3a" },
  { type: "certificate", icon: "🔏", label: "Sertifika", color: "#f59e0b", bg: "#2a2a1a" },
];

export default function Profiles({
  profiles = [],
  setProfiles,
  setProfileModal,
  setEditProfile,
  setProfileForm,
  setConfirmModal,
  devices = [],
  currentUser,
}) {
  const isAdmin = currentUser?.role === "admin";

  // Profilleri localStorage'a persist et
  useEffect(() => {
    try {
      localStorage.setItem("mdm_profiles", JSON.stringify(profiles));
    } catch {}
  }, [profiles]);

  const deployProfile = async (p) => {
    if (!devices.length) { toast("Kayıtlı cihaz yok", "error"); return; }
    toast(`⏳ "${p.name}" gönderiliyor...`);
    let ok = 0;
    for (const d of devices) {
      try {
        const r = await fetch(`${API}/commands/device/${d.id}`, {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({
            command_type: "push_profile",
            payload: { profile_type: p.type, profile_name: p.name, config: p.config || {} },
          }),
        });
        if (r.ok) ok++;
      } catch {}
    }
    setProfiles && setProfiles(prev => prev.map(x => x.id === p.id ? { ...x, devices: ok, last_deployed_at: new Date().toISOString() } : x));
    toast(ok > 0 ? `✅ "${p.name}" → ${ok}/${devices.length} cihaza gönderildi` : "❌ Gönderilemedi", ok === 0 ? "error" : "success");
  };

  const typeMeta = (t) => PROFILE_TYPES.find(x => x.type === t) || { icon: "⚙️", label: (t || "?").toUpperCase(), color: "#94a3b8", bg: "#1a1f35" };

  const configSummary = (p) => {
    const c = p.config || {};
    if (p.type === "wifi")        return `SSID: ${c.ssid || "—"}`;
    if (p.type === "vpn")         return c.server || "—";
    if (p.type === "email")       return c.server || c.email || "—";
    if (p.type === "certificate") return c.name || "—";
    return "—";
  };

  const openNew = (type) => {
    if (!isAdmin) { toast("❌ Yönetici yetkisi gerekir", "error"); return; }
    setEditProfile && setEditProfile(null);
    setProfileForm && setProfileForm({ name: "", type, config: {} });
    setProfileModal && setProfileModal(true);
  };

  const openEdit = (p) => {
    if (!isAdmin) { toast("❌ Yönetici yetkisi gerekir", "error"); return; }
    setEditProfile && setEditProfile(p);
    setProfileForm && setProfileForm({ name: p.name, type: p.type, config: { ...(p.config || {}) } });
    setProfileModal && setProfileModal(true);
  };

  const toggleActive = (p) => {
    if (!isAdmin) { toast("❌ Yönetici yetkisi gerekir", "error"); return; }
    setProfiles && setProfiles(prev => prev.map(x => x.id === p.id ? { ...x, active: !x.active } : x));
    toast(p.active ? `⏸ "${p.name}" pasifleştirildi` : `▶ "${p.name}" aktifleştirildi`);
  };

  const askDelete = (p) => {
    if (!isAdmin) { toast("❌ Yönetici yetkisi gerekir", "error"); return; }
    setConfirmModal && setConfirmModal({
      title: "Profili Sil",
      msg: `"${p.name}" silinecek. Bu işlem geri alınamaz.`,
      confirmText: "Sil",
      danger: true,
      onConfirm: () => {
        setProfiles && setProfiles(prev => prev.filter(x => x.id !== p.id));
        toast(`🗑️ "${p.name}" silindi`);
      },
    });
  };

  return (
    <div>
      {/* Tür Kartları */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
        {PROFILE_TYPES.map(t => (
          <div
            key={t.type}
            className="card"
            style={{ padding: 14, cursor: isAdmin ? "pointer" : "not-allowed", opacity: isAdmin ? 1 : 0.6 }}
            onClick={() => openNew(t.type)}
          >
            <div style={{ fontSize: 24, marginBottom: 7 }}>{t.icon}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: t.color }}>{t.label}</div>
            <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>
              {profiles.filter(p => p.type === t.type).length} profil
            </div>
            <div style={{ fontSize: 11, color: t.color, marginTop: 6 }}>+ Ekle →</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9" }}>
          Tüm Profiller <span style={{ fontSize: 12, color: "#475569", fontWeight: 400 }}>({profiles.length})</span>
        </div>
        <button className="btn pr" disabled={!isAdmin} onClick={() => openNew("wifi")}>+ Yeni Profil</button>
      </div>

      {profiles.length === 0 ? (
        <div style={{ textAlign: "center", padding: "50px", color: "#475569" }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>⚙️</div>
          Profil yok. Yukarıdan tür seçerek ekleyin.
        </div>
      ) : (
        <div className="card" style={{ overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1.5fr 1fr 160px", gap: 10, padding: "10px 14px", background: "#0a0c18", color: "#475569", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em", borderBottom: "1px solid #1a1f35" }}>
            <span>Profil Adı</span><span>Tür</span><span>Yapılandırma</span><span>Durum</span><span>İşlemler</span>
          </div>

          {profiles.map(p => {
            const meta = typeMeta(p.type);
            return (
              <div
                key={p.id}
                style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1.5fr 1fr 160px", gap: 10, alignItems: "center", padding: "13px 14px", borderBottom: "1px solid #1a1f35", fontSize: 13 }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 8, background: meta.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
                    {meta.icon}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "#e2e8f0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {p.name}
                    </div>
                    <div style={{ fontSize: 11, color: "#475569" }}>
                      {(p.devices || 0) > 0 ? `${p.devices} cihaza gönderildi` : "Henüz gönderilmedi"}
                    </div>
                  </div>
                </div>
                <span className="tag" style={{ background: "#141830", color: "#60a5fa", border: "1px solid #2a3048", fontSize: 11 }}>{meta.label}</span>
                <div style={{ fontSize: 11, color: "#64748b", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={configSummary(p)}>
                  {configSummary(p)}
                </div>
                <span className="tag" style={{ background: p.active ? "#1e3a1e" : "#2d1a1a", color: p.active ? "#22c55e" : "#f87171" }}>
                  {p.active ? "● Aktif" : "○ Pasif"}
                </span>
                <div style={{ display: "flex", gap: 5 }}>
                  <button
                    className="btn pr"
                    style={{ fontSize: 11, padding: "5px 9px" }}
                    disabled={!devices.length || !p.active}
                    title={!p.active ? "Pasif profil gönderilemez" : !devices.length ? "Cihaz yok" : "Cihazlara gönder"}
                    onClick={() => deployProfile(p)}
                  >
                    📤
                  </button>
                  <button className="btn" style={{ fontSize: 11, padding: "5px 9px" }} disabled={!isAdmin} onClick={() => openEdit(p)}>✏️</button>
                  <button
                    className="btn"
                    style={{ fontSize: 11, padding: "5px 9px", color: p.active ? "#f59e0b" : "#22c55e" }}
                    disabled={!isAdmin}
                    onClick={() => toggleActive(p)}
                  >
                    {p.active ? "⏸" : "▶"}
                  </button>
                  <button className="btn dg" style={{ fontSize: 11, padding: "5px 9px" }} disabled={!isAdmin} onClick={() => askDelete(p)}>🗑️</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
