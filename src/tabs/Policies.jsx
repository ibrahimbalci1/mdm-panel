import { API, authHeaders, toast } from "../utils";

export default function Policies({
  policies = [],
  devices = [],
  apps = [],
  setPolicyModal,
  setEditPolicy,
  setPolicyForm,
  setConfirmModal,
  deletePolicy,
  setCommandLog,
  setTab,
  generateQr,
  setEnrollPolicyId,
  sendAll,
  currentUser,
}) {
  const isAdmin = currentUser?.role === "admin";

  // Tek politikayı tüm cihazlara gönder
  const sendPolicy = async (p) => {
    if (!devices.length) { toast("Kayıtlı cihaz yok", "error"); return; }
    toast(`⏳ "${p.name}" tüm cihazlara gönderiliyor...`);
    let ok = 0, fail = 0;
    for (const d of devices) {
      try {
        const r = await fetch(`${API}/commands/device/${d.id}`, {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({
            command_type: "push_policy",
            payload: {
              policy_id: p.id,
              policy_name: p.name,
              rules: p.rules || {},
              allowed_apps: p.allowed_apps || [],
            },
          }),
        });
        if (r.ok) ok++; else { fail++; const e = await r.json().catch(() => ({})); console.warn("Politika gönder:", r.status, e); }
      } catch (e) { fail++; console.error(e); }
    }
    setCommandLog && setCommandLog(prev => [
      { id: Date.now(), device: `${ok}/${devices.length} cihaz`, cmd: `Politika: ${p.name}`, time: new Date().toLocaleTimeString("tr-TR"), ok: ok > 0 },
      ...prev.slice(0, 49)
    ]);
    toast(ok > 0 ? `✅ "${p.name}" → ${ok}/${devices.length} cihaza gönderildi` : `❌ Gönderilemedi`, ok === 0 ? "error" : "success");
  };

  const editP = (p) => {
    if (!isAdmin) { toast("❌ Yönetici yetkisi gerekir", "error"); return; }
    setEditPolicy && setEditPolicy(p);
    setPolicyForm && setPolicyForm({
      name: p.name || "",
      description: p.description || "",
      rules: { ...(p.rules || {}) },
      allowed_apps: [...(p.allowed_apps || [])],
    });
    setPolicyModal && setPolicyModal(true);
  };

  const newP = () => {
    if (!isAdmin) { toast("❌ Yönetici yetkisi gerekir", "error"); return; }
    setEditPolicy && setEditPolicy(null);
    setPolicyForm && setPolicyForm({ name: "", description: "", rules: {}, allowed_apps: [] });
    setPolicyModal && setPolicyModal(true);
  };

  const askDelete = (p) => {
    if (!isAdmin) { toast("❌ Yönetici yetkisi gerekir", "error"); return; }
    if (p.is_default) { toast("Varsayılan politika silinemez", "error"); return; }
    setConfirmModal && setConfirmModal({
      title: "Politikayı Sil",
      msg: `"${p.name}" silinecek. Bu işlem geri alınamaz.`,
      confirmText: "Sil",
      danger: true,
      onConfirm: () => deletePolicy && deletePolicy(p),
    });
  };

  return (
    <div>
      {/* Bilgi Bandı */}
      <div style={{ padding: "10px 14px", background: "#0d1a0d", border: "1px solid #1e3a1e", borderRadius: 8, marginBottom: 14, fontSize: 12, color: "#4ade80", display: "flex", gap: 10 }}>
        <span>ℹ️</span>
        <span>Politika gönderildiğinde backend'e ulaşır. Cihaz sonraki heartbeat (5 dk) veya FCM bildirimi geldiğinde uygular.</span>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9" }}>Güvenlik Politikaları</div>
          <div style={{ fontSize: 12, color: "#475569", marginTop: 2 }}>{policies.length} politika · {devices.length} cihaz</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            className="btn"
            disabled={!devices.length}
            onClick={() => sendAll && sendAll("push_policy", "Politika Güncelle")}
          >
            📤 Tüm Cihazlara
          </button>
          <button className="btn pr" disabled={!isAdmin} onClick={newP}>+ Yeni Politika</button>
        </div>
      </div>

      {policies.map(p => (
        <div key={p.id} className="card" style={{ padding: 18, marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12, gap: 12 }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3, flexWrap: "wrap" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9" }}>{p.name}</div>
                {p.is_default && <span className="tag" style={{ background: "#1e3a1e", color: "#22c55e", fontSize: 10 }}>Varsayılan</span>}
              </div>
              <div style={{ fontSize: 12, color: "#475569" }}>
                {p.description || "Açıklama yok"} · {p.device_count || 0} cihaz
              </div>
            </div>
            <div style={{ display: "flex", gap: 7, flexShrink: 0 }}>
              <button
                className="btn"
                style={{ fontSize: 11, padding: "5px 11px" }}
                onClick={() => {
                  setTab && setTab("enrollment");
                  setEnrollPolicyId && setEnrollPolicyId(p.id);
                  generateQr && generateQr(p.id, "provisioning");
                }}
              >
                📱 QR
              </button>
              <button
                className="btn pr"
                style={{ fontSize: 11, padding: "5px 11px" }}
                disabled={!devices.length}
                onClick={() => sendPolicy(p)}
              >
                📤 Gönder
              </button>
              <button
                className="btn"
                style={{ fontSize: 11, padding: "5px 11px" }}
                disabled={!isAdmin}
                onClick={() => editP(p)}
                title={isAdmin ? "Düzenle" : "Yönetici yetkisi gerekir"}
              >
                ✏️
              </button>
              <button
                className="btn dg"
                style={{ fontSize: 11, padding: "5px 11px" }}
                disabled={!isAdmin || p.is_default}
                onClick={() => askDelete(p)}
                title={p.is_default ? "Varsayılan politika silinemez" : (isAdmin ? "Sil" : "Yönetici yetkisi gerekir")}
              >
                🗑️
              </button>
            </div>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {p.rules && Object.entries(p.rules).map(([k, v]) => (
              <span
                key={k}
                className="tag"
                style={{ background: "#141830", color: "#60a5fa", border: "1px solid #2a3048", fontSize: 11 }}
                title={`${k}: ${JSON.stringify(v)}`}
              >
                ✓ {k}{typeof v !== "boolean" && v != null ? `: ${String(v).slice(0, 20)}` : ""}
              </span>
            ))}
            {(!p.rules || Object.keys(p.rules).length === 0) && (p.allowed_apps || []).length === 0 && (
              <span style={{ fontSize: 12, color: "#475569" }}>Kural yok</span>
            )}
          </div>

          {/* İzin verilen uygulamalar */}
          {(p.allowed_apps || []).length > 0 && (
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #1a1f35" }}>
              <div style={{ fontSize: 11, color: "#475569", marginBottom: 6, textTransform: "uppercase", letterSpacing: ".05em" }}>
                ✅ İzin Verilen Uygulamalar ({p.allowed_apps.length})
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {p.allowed_apps.slice(0, 8).map(pkg => {
                  const app = apps.find(a => a.package_name === pkg);
                  const label = app?.name || pkg.split(".").pop();
                  return (
                    <span
                      key={pkg}
                      className="tag"
                      style={{ background: "#1e2a1e", color: "#4ade80", border: "1px solid #2a5c2a", fontSize: 11 }}
                      title={pkg}
                    >
                      {label}
                    </span>
                  );
                })}
                {p.allowed_apps.length > 8 && (
                  <span className="tag" style={{ background: "#141830", color: "#60a5fa", fontSize: 11 }}>
                    +{p.allowed_apps.length - 8} daha
                  </span>
                )}
              </div>
            </div>
          )}

          {(p.allowed_apps === undefined || p.allowed_apps === null) && (
            <span className="tag" style={{ background: "#1a1a2a", color: "#475569", fontSize: 11, marginTop: 8, display: "inline-block" }}>
              Tüm uygulamalara izin var
            </span>
          )}
        </div>
      ))}

      {policies.length === 0 && (
        <div style={{ textAlign: "center", padding: "50px", color: "#475569" }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>🛡️</div>
          <div>Politika yok. {isAdmin ? "Yeni politika oluşturun." : "Bir yöneticiden politika eklemesini isteyin."}</div>
        </div>
      )}
    </div>
  );
}
