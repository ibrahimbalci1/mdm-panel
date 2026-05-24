import { useState } from "react";

// ─── Komut Onay Modalı ────────────────────────────────────────────────────
export function CmdModal({ modal, onClose, onConfirm }) {
  if (!modal) return null;
  return (
    <div className="ov" onClick={onClose}>
      <div className="mo" onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9", marginBottom: 10 }}>
          {modal.cmd === "wipe" ? "⚠️ Tehlikeli İşlem" : "Komutu Onayla"}
        </div>
        <div style={{ fontSize: 13, color: "#64748b", marginBottom: 20, lineHeight: 1.7 }}>
          <strong style={{ color: "#e2e8f0" }}>{modal.device.name || modal.device.model}</strong> cihazına{" "}
          {modal.cmd === "wipe"
            ? <span style={{ color: "#f87171" }}>fabrika sıfırlama gönderilecek. TÜM VERİLER SİLİNECEK!</span>
            : `"${modal.cmd}" komutu gönderilecek.`}
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button className="btn" onClick={onClose}>İptal</button>
          <button className={`btn ${modal.cmd === "wipe" ? "dg" : "pr"}`} onClick={() => onConfirm(modal.device, modal.cmd)}>
            {modal.cmd === "wipe" ? "🗑️ Evet, Sıfırla" : "✅ Gönder"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Genel Onay Modalı ────────────────────────────────────────────────────
export function ConfirmModal({ modal, onClose }) {
  if (!modal) return null;
  return (
    <div className="ov" onClick={onClose}>
      <div className="mo" style={{ width: 400 }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9", marginBottom: 10 }}>⚠️ {modal.title}</div>
        <div style={{ fontSize: 13, color: "#64748b", marginBottom: 20, lineHeight: 1.7 }}>{modal.msg}</div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button className="btn" onClick={onClose}>İptal</button>
          <button className="btn dg" onClick={() => { modal.onOk(); onClose(); }}>Evet, Devam Et</button>
        </div>
      </div>
    </div>
  );
}

// ─── Kayıt Modalı ─────────────────────────────────────────────────────────
export function EnrollModal({ enrollMethod, setEnrollMethod, onClose, onContinue }) {
  return (
    <div className="ov" onClick={onClose}>
      <div className="mo" style={{ width: 500 }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9", marginBottom: 14 }}>➕ Yeni Cihaz Kayıt</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
          {[{ id: "provisioning", l: "🚀 Sıfır Kurulum", d: "Fabrika sıfırlı" }, { id: "simple", l: "📷 Hızlı QR", d: "Agent kurulu" }, { id: "email", l: "📧 E-posta", d: "Davet gönder" }, { id: "adb", l: "💻 ADB", d: "Manuel" }].map(m => (
            <div key={m.id} onClick={() => setEnrollMethod(m.id)} style={{ padding: 12, background: enrollMethod === m.id ? "#1a1f3a" : "#0c0e1a", border: `1px solid ${enrollMethod === m.id ? "#3b5bdb" : "#2a3048"}`, borderRadius: 9, cursor: "pointer" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#f1f5f9", marginBottom: 2 }}>{m.l}</div>
              <div style={{ fontSize: 11, color: "#475569" }}>{m.d}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button className="btn" onClick={onClose}>İptal</button>
          <button className="btn pr" onClick={onContinue}>Devam Et →</button>
        </div>
      </div>
    </div>
  );
}

// ─── Politika Modalı ──────────────────────────────────────────────────────
export function PolicyModal({ form, setForm, editPolicy, loading, onClose, onSave }) {
  const RULES = [
    ["camera_disabled", "Kamera Kapat"],
    ["usb_debugging_disabled", "USB Debug Kapat"],
    ["unknown_sources_disabled", "Bilinmeyen Kaynaklar"],
    ["status_bar_disabled", "Status Bar Gizle"],
    ["factory_reset_protection", "Fabrika Sıfırlamayı Koru"],
    ["screen_capture_disabled", "Ekran Görüntüsü Kapat"],
  ];
  return (
    <div className="ov" onClick={onClose}>
      <div className="mo" style={{ width: 520 }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9", marginBottom: 18 }}>{editPolicy ? "✏️ Politikayı Düzenle" : "🛡️ Yeni Politika"}</div>
        <div className="fg"><label className="fl">Politika Adı *</label><input className="fi" placeholder="Kurumsal Standart" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
        <div className="fg"><label className="fl">Açıklama</label><input className="fi" placeholder="Tüm cihazlar için..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
        <div style={{ marginBottom: 18 }}>
          <label className="fl">Kısıtlamalar</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {RULES.map(([k, l]) => (
              <label key={k} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#94a3b8", cursor: "pointer", padding: "4px 0" }}>
                <input type="checkbox" checked={!!form.rules[k]} onChange={e => setForm(p => ({ ...p, rules: { ...p.rules, [k]: e.target.checked || undefined } }))} style={{ accentColor: "#3b5bdb", width: 14, height: 14 }} />
                {l}
              </label>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button className="btn" onClick={onClose}>İptal</button>
          <button className="btn pr" disabled={loading} onClick={onSave}>{loading ? "⏳" : editPolicy ? "✅ Güncelle" : "✅ Oluştur"}</button>
        </div>
      </div>
    </div>
  );
}

// ─── Profil Modalı ────────────────────────────────────────────────────────
export function ProfileModal({ form, setForm, editProfile, loading, onClose, onSave }) {
  return (
    <div className="ov" onClick={onClose}>
      <div className="mo" style={{ width: 520 }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9", marginBottom: 18 }}>{editProfile ? "✏️ Profili Düzenle" : "⚙️ Yeni Profil"}</div>
        <div className="fg"><label className="fl">Profil Adı *</label><input className="fi" placeholder="Örn: Şirket Wi-Fi" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
        <div className="fg"><label className="fl">Tür</label>
          <select className="fi" value={form.type} onChange={e => setForm({ ...form, type: e.target.value, config: {} })}>
            <option value="wifi">📶 Wi-Fi</option>
            <option value="vpn">🔐 VPN</option>
            <option value="email">📧 E-posta</option>
            <option value="certificate">🔏 Sertifika</option>
          </select>
        </div>
        {form.type === "wifi" && <>
          <div className="fg"><label className="fl">SSID *</label><input className="fi" placeholder="SirketAgi" value={form.config?.ssid || ""} onChange={e => setForm(p => ({ ...p, config: { ...p.config, ssid: e.target.value } }))} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="fg"><label className="fl">Güvenlik</label>
              <select className="fi" value={form.config?.security || "WPA2"} onChange={e => setForm(p => ({ ...p, config: { ...p.config, security: e.target.value } }))}>
                <option value="WPA2">WPA2</option><option value="WPA3">WPA3</option><option value="WPA2-Enterprise">WPA2-Enterprise</option><option value="Open">Açık</option>
              </select>
            </div>
            <div className="fg"><label className="fl">Şifre</label><input className="fi" type="password" placeholder="••••••••" value={form.config?.password || ""} onChange={e => setForm(p => ({ ...p, config: { ...p.config, password: e.target.value } }))} /></div>
          </div>
        </>}
        {form.type === "vpn" && <>
          <div className="fg"><label className="fl">Sunucu *</label><input className="fi" placeholder="vpn.sirket.com" value={form.config?.server || ""} onChange={e => setForm(p => ({ ...p, config: { ...p.config, server: e.target.value } }))} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="fg"><label className="fl">Protokol</label>
              <select className="fi" value={form.config?.protocol || "IKEv2"} onChange={e => setForm(p => ({ ...p, config: { ...p.config, protocol: e.target.value } }))}>
                <option value="IKEv2">IKEv2</option><option value="OpenVPN">OpenVPN</option><option value="L2TP">L2TP/IPSec</option><option value="WireGuard">WireGuard</option>
              </select>
            </div>
            <div className="fg"><label className="fl">Port</label><input className="fi" placeholder="500" value={form.config?.port || ""} onChange={e => setForm(p => ({ ...p, config: { ...p.config, port: e.target.value } }))} /></div>
          </div>
        </>}
        {form.type === "email" && <>
          <div className="fg"><label className="fl">Exchange Sunucusu *</label><input className="fi" placeholder="mail.sirket.com" value={form.config?.server || ""} onChange={e => setForm(p => ({ ...p, config: { ...p.config, server: e.target.value } }))} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="fg"><label className="fl">Port</label><input className="fi" placeholder="443" value={form.config?.port || ""} onChange={e => setForm(p => ({ ...p, config: { ...p.config, port: e.target.value } }))} /></div>
            <div className="fg"><label className="fl">Domain</label><input className="fi" placeholder="SIRKET" value={form.config?.domain || ""} onChange={e => setForm(p => ({ ...p, config: { ...p.config, domain: e.target.value } }))} /></div>
          </div>
        </>}
        {form.type === "certificate" && <>
          <div className="fg"><label className="fl">Sertifika Adı *</label><input className="fi" placeholder="SirketCA" value={form.config?.name || ""} onChange={e => setForm(p => ({ ...p, config: { ...p.config, name: e.target.value } }))} /></div>
          <div className="fg"><label className="fl">Tür</label>
            <select className="fi" value={form.config?.certType || "CA"} onChange={e => setForm(p => ({ ...p, config: { ...p.config, certType: e.target.value } }))}>
              <option value="CA">Kök CA</option><option value="Client">İstemci</option><option value="Identity">Kimlik</option>
            </select>
          </div>
        </>}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
          <button className="btn" onClick={onClose}>İptal</button>
          <button className="btn pr" disabled={loading} onClick={onSave}>{editProfile ? "✅ Güncelle" : "✅ Oluştur"}</button>
        </div>
      </div>
    </div>
  );
}

// ─── Uygulama Ekleme Modalı ───────────────────────────────────────────────
export function AppModal({ form, setForm, loading, onClose, onSave }) {
  return (
    <div className="ov" onClick={onClose}>
      <div className="mo" onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9", marginBottom: 18 }}>📦 Uygulama Ekle</div>
        <div className="fg"><label className="fl">Uygulama Adı *</label><input className="fi" placeholder="Microsoft Teams" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
        <div className="fg"><label className="fl">Paket Adı *</label><input className="fi" placeholder="com.microsoft.teams" value={form.package_name} onChange={e => setForm({ ...form, package_name: e.target.value })} /></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div className="fg"><label className="fl">Versiyon</label><input className="fi" placeholder="1.0.0" value={form.version} onChange={e => setForm({ ...form, version: e.target.value })} /></div>
          <div className="fg"><label className="fl">Zorunlu</label>
            <select className="fi" value={form.is_required ? "true" : "false"} onChange={e => setForm({ ...form, is_required: e.target.value === "true" })}>
              <option value="false">İsteğe Bağlı</option><option value="true">Zorunlu</option>
            </select>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button className="btn" onClick={onClose}>İptal</button>
          <button className="btn pr" disabled={loading} onClick={onSave}>{loading ? "⏳" : "✅ Ekle"}</button>
        </div>
      </div>
    </div>
  );
}

// ─── Kullanıcı Modalı ─────────────────────────────────────────────────────
export function UserModal({ form, setForm, loading, onClose, onSave }) {
  return (
    <div className="ov" onClick={onClose}>
      <div className="mo" onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9", marginBottom: 18 }}>👥 Kullanıcı Ekle</div>
        <div className="fg"><label className="fl">Ad Soyad</label><input className="fi" type="text" placeholder="Ahmet Yılmaz" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} /></div>
        <div className="fg"><label className="fl">E-posta *</label><input className="fi" type="email" placeholder="ahmet@sirket.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
        <div className="fg"><label className="fl">Şifre *</label><input className="fi" type="password" placeholder="En az 8 karakter" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></div>
        <div className="fg"><label className="fl">Rol</label>
          <select className="fi" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
            <option value="operator">🔧 Operatör</option>
            <option value="viewer">👁️ Görüntüleyici</option>
            <option value="admin">👑 Admin</option>
          </select>
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button className="btn" onClick={onClose}>İptal</button>
          <button className="btn pr" disabled={loading} onClick={onSave}>{loading ? "⏳" : "✅ Oluştur"}</button>
        </div>
      </div>
    </div>
  );
}
