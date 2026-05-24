export default function Policies({ policies, devices, setPolicyModal, setEditPolicy, setPolicyForm, setConfirmModal, setCommandLog, toast$, H, API, setTab, generateQr, setEnrollPolicyId, sendAll }) {

  const sendPolicy = async (p) => {
    if (!devices.length) { toast$("Kayıtlı cihaz yok", "error"); return; }
    toast$(`⏳ "${p.name}" tüm cihazlara gönderiliyor...`);
    let ok = 0, fail = 0;
    for (const d of devices) {
      try {
        const r = await fetch(`${API}/commands/device/${d.id}`, {
          method: "POST", headers: H(),
          body: JSON.stringify({ command_type: "push_policy", payload: { policy_id: p.id, policy_name: p.name, rules: p.rules || {} } }),
        });
        if (r.ok) ok++; else { fail++; const e = await r.json().catch(() => ({})); console.warn("Politika gönder:", r.status, e); }
      } catch (e) { fail++; console.error(e); }
    }
    setCommandLog(prev => [{ id: Date.now(), device: `${ok}/${devices.length} cihaz`, cmd: `Politika: ${p.name}`, time: new Date().toLocaleTimeString("tr-TR"), ok: ok > 0 }, ...prev.slice(0, 49)]);
    toast$(ok > 0 ? `✅ "${p.name}" → ${ok} cihaza gönderildi` : `❌ Gönderilemedi`, ok === 0 ? "error" : "success");
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
          <div style={{ fontSize: 12, color: "#475569", marginTop: 2 }}>{policies.length} politika</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn" onClick={() => sendAll("push_policy", "Politika Güncelle")}>📤 Tüm Cihazlara</button>
          <button className="btn pr" onClick={() => { setEditPolicy(null); setPolicyForm({ name: "", description: "", rules: {} }); setPolicyModal(true); }}>+ Yeni Politika</button>
        </div>
      </div>

      {policies.map(p => (
        <div key={p.id} className="card" style={{ padding: 18, marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9" }}>{p.name}</div>
                {p.is_default && <span className="tag" style={{ background: "#1e3a1e", color: "#22c55e", fontSize: 10 }}>Varsayılan</span>}
              </div>
              <div style={{ fontSize: 12, color: "#475569" }}>{p.description || "Açıklama yok"} · {p.device_count || 0} cihaz</div>
            </div>
            <div style={{ display: "flex", gap: 7 }}>
              <button className="btn" style={{ fontSize: 11, padding: "5px 11px" }} onClick={() => { setTab("enrollment"); setEnrollPolicyId(p.id); generateQr(p.id, "provisioning"); }}>📱 QR</button>
              <button className="btn pr" style={{ fontSize: 11, padding: "5px 11px" }} onClick={() => sendPolicy(p)}>📤 Gönder</button>
              <button className="btn" style={{ fontSize: 11, padding: "5px 11px" }} onClick={() => { setEditPolicy(p); setPolicyForm({ name: p.name, description: p.description || "", rules: { ...p.rules } }); setPolicyModal(true); }}>✏️</button>
              <button className="btn dg" style={{ fontSize: 11, padding: "5px 11px" }} onClick={() => setConfirmModal({ title: "Politikayı Sil", msg: `"${p.name}" silinecek. Emin misiniz?`, onOk: () => {} /* deletePolicy dışarıda */ })}>🗑️</button>
            </div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {p.rules && Object.entries(p.rules).map(([k, v]) => (
              <span key={k} className="tag" style={{ background: "#141830", color: "#60a5fa", border: "1px solid #2a3048", fontSize: 11 }}>✓ {k}{typeof v !== "boolean" ? `: ${v}` : ""}</span>
            ))}
            {(!p.rules || Object.keys(p.rules).length === 0) && <span style={{ fontSize: 12, color: "#475569" }}>Kural yok</span>}
          </div>
        </div>
      ))}

      {policies.length === 0 && (
        <div style={{ textAlign: "center", padding: "50px", color: "#475569" }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>🛡️</div>
          <div>Politika yok. Yeni politika oluşturun.</div>
        </div>
      )}
    </div>
  );
}
