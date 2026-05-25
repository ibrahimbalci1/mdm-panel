import React from 'react';
const API = "https://mdm-backend-rk5x.onrender.com/api/v1";
import MapView from "../components/MapView";
import { sColor, sLabel, rColor, rLabel } from "../utils";

// ─── Uygulamalar ──────────────────────────────────────────────────────────
export function Apps({ apps, devices, setAppModal, setEditApp, setAppForm, deployApp, deleteApp, setConfirmModal, sendAll }) {
  const CAT_ICONS = { "Kurumsal":"🏢","İletişim":"💬","E-posta":"📧","Tarayıcı":"🌐","Depolama":"💾","Toplantı":"🎥","Güvenlik":"🔒","Araç":"🔧","Diğer":"📦" };

  return (
    <div>
      {/* Başlık */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
        <div>
          <div style={{ fontSize:14, fontWeight:600, color:"#f1f5f9" }}>Uygulama Yönetimi</div>
          <div style={{ fontSize:12, color:"#475569", marginTop:2 }}>
            {apps.length} uygulama · {apps.filter(a=>a.is_required).length} zorunlu · {apps.filter(a=>!a.is_required).length} isteğe bağlı
          </div>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button className="btn" onClick={()=>sendAll("push_policy","Uygulama Politikası")}>📤 Tüm Cihazlara Politika</button>
          <button className="btn pr" onClick={()=>{ setEditApp(null); setAppForm({name:"",package_name:"",version:"",is_required:false,category:"Diğer",size_mb:"",apk_url:"",description:""}); setAppModal(true); }}>+ Uygulama Ekle</button>
        </div>
      </div>

      {/* Filtre Özeti */}
      <div style={{ display:"flex", gap:10, marginBottom:16, flexWrap:"wrap" }}>
        {["Tümü","Zorunlu","İsteğe Bağlı"].map(f => (
          <span key={f} className="tag" style={{ background:"#141830", color:"#60a5fa", border:"1px solid #2a3048", cursor:"pointer", padding:"4px 14px" }}>{f} {f==="Tümü"?apps.length:f==="Zorunlu"?apps.filter(a=>a.is_required).length:apps.filter(a=>!a.is_required).length}</span>
        ))}
      </div>

      {apps.length === 0 ? (
        <div style={{ textAlign:"center", padding:"60px", color:"#475569" }}>
          <div style={{ fontSize:48, marginBottom:12 }}>📦</div>
          <div style={{ fontSize:14, fontWeight:600, color:"#f1f5f9", marginBottom:8 }}>Uygulama yok</div>
          <div style={{ fontSize:13, marginBottom:20 }}>İlk uygulamanızı ekleyin</div>
          <button className="btn pr" onClick={()=>{ setEditApp(null); setAppForm({name:"",package_name:"",version:"",is_required:false,category:"Diğer",size_mb:"",apk_url:"",description:""}); setAppModal(true); }}>+ İlk Uygulamayı Ekle</button>
        </div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:14 }}>
          {apps.map(app => (
            <div key={app.id} className="card" style={{ padding:18, position:"relative" }}>
              {/* Zorunlu rozeti */}
              {app.is_required && (
                <div style={{ position:"absolute", top:12, right:12 }}>
                  <span className="tag" style={{ background:"#1e3a1e", color:"#22c55e", fontSize:10 }}>Zorunlu</span>
                </div>
              )}

              {/* Uygulama Başlık */}
              <div style={{ display:"flex", gap:12, marginBottom:14 }}>
                <div style={{ width:48, height:48, borderRadius:12, background:"#1a1f35", display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, flexShrink:0 }}>
                  {CAT_ICONS[app.category] || "📦"}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:14, fontWeight:600, color:"#f1f5f9", marginBottom:2 }}>{app.name}</div>
                  <div style={{ fontSize:11, color:"#475569", fontFamily:"monospace", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{app.package_name}</div>
                </div>
              </div>

              {/* Detaylar */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6, marginBottom:12, fontSize:12 }}>
                <div style={{ color:"#64748b" }}>Versiyon: <span style={{ color:"#94a3b8" }}>{app.version||"—"}</span></div>
                <div style={{ color:"#64748b" }}>Boyut: <span style={{ color:"#94a3b8" }}>{app.size_mb?`${app.size_mb} MB`:"—"}</span></div>
                <div style={{ color:"#64748b" }}>Kategori: <span style={{ color:"#94a3b8" }}>{app.category||"—"}</span></div>
                <div style={{ color:"#64748b" }}>Cihaz: <span style={{ color:"#22c55e", fontWeight:600 }}>{devices.length}</span></div>
              </div>

              {/* Açıklama */}
              {app.description && (
                <div style={{ fontSize:12, color:"#64748b", marginBottom:12, lineHeight:1.5, borderTop:"1px solid #1a1f35", paddingTop:10 }}>{app.description}</div>
              )}

              {/* APK URL */}
              {app.apk_url && (
                <div style={{ fontSize:11, color:"#3b5bdb", marginBottom:10, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                  🔗 <a href={app.apk_url} target="_blank" rel="noreferrer" style={{ color:"#60a5fa" }}>APK Bağlantısı</a>
                </div>
              )}

              {/* Butonlar */}
              <div style={{ display:"flex", gap:7 }}>
                <button className="btn pr" style={{ flex:1, fontSize:12 }} onClick={()=>deployApp(app)}>
                  📤 {devices.length} Cihaza Dağıt
                </button>
                <button className="btn" style={{ fontSize:12, padding:"7px 10px" }} title="Düzenle"
                  onClick={()=>{ setEditApp(app); setAppForm({ name:app.name, package_name:app.package_name, version:app.version||"", is_required:app.is_required, category:app.category||"Diğer", size_mb:app.size_mb||"", apk_url:app.apk_url||"", description:app.description||"" }); setAppModal(true); }}>✏️</button>
                <button className="btn dg" style={{ fontSize:12, padding:"7px 10px" }} title="Sil"
                  onClick={()=>setConfirmModal({ title:"Uygulamayı Sil", msg:`"${app.name}" silinecek. Emin misiniz?`, onOk:()=>deleteApp(app) })}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Kiosk ────────────────────────────────────────────────────────────────
export function Kiosk({ sendAll, setTab, devices, policies, toast$, apps }) {
  const CAT_ICONS = { "Kurumsal":"🏢","İletişim":"💬","E-posta":"📧","Tarayıcı":"🌐","Depolama":"💾","Toplantı":"🎥","Güvenlik":"🔒","Araç":"🔧","Diğer":"📦" };
  const BG_COLORS = ["#0a0c18","#0a1628","#0d1a0d","#1a0d0d","#1a0a1a","#1a1200","#1a0808"];

  const [selectedApps, setSelectedApps] = React.useState([]);
  const [bgColor, setBgColor] = React.useState("#0a0c18");
  const [columns, setColumns] = React.useState(3);
  const [showLabels, setShowLabels] = React.useState(true);
  const [disableBack, setDisableBack] = React.useState(true);
  const [disableHome, setDisableHome] = React.useState(true);
  const [disableStatusBar, setDisableStatusBar] = React.useState(true);
  const [applying, setApplying] = React.useState(false);
  const [exitPassword, setExitPassword] = React.useState("");
  const [settingPassword, setSettingPassword] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("config");

  const toggleApp = (app) => {
    setSelectedApps(prev =>
      prev.find(a => a.id === app.id)
        ? prev.filter(a => a.id !== app.id)
        : [...prev, app]
    );
  };

  const removeFromKiosk = (appId) => {
    setSelectedApps(prev => prev.filter(a => a.id !== appId));
  };

  const applyKiosk = async () => {
    if (!devices.length) { toast$("Kayıtlı cihaz yok", "error"); return; }
    if (!selectedApps.length) { toast$("En az bir uygulama seçin", "error"); return; }
    setApplying(true);
    const payload = {
      command: "set_kiosk_launcher",
      allowed_apps: selectedApps.map(a => ({
        package_name: a.package_name,
        name: a.name,
        category: a.category,
      })),
      launcher_config: {
        background_color: bgColor,
        columns,
        show_labels: showLabels,
        disable_back_button: disableBack,
        disable_home_button: disableHome,
        disable_status_bar: disableStatusBar,
      },
    };
    let ok = 0;
    const token = localStorage.getItem("mdm_token");
    for (const d of devices) {
      try {
        const r = await fetch(`${API}/commands/device/${d.id}`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ command_type: "set_kiosk_launcher", payload }),
        });
        if (r.ok) ok++;
      } catch {}
    }
    toast$(ok > 0 ? `✅ Kiosk launcher ${ok}/${devices.length} cihaza uygulandı` : "❌ Gönderilemedi", ok === 0 ? "error" : "success");
    setApplying(false);
  };


  const setKioskPassword = async () => {
    if (!exitPassword) { toast$("Şifre boş olamaz", "error"); return; }
    if (!devices.length) { toast$("Kayıtlı cihaz yok", "error"); return; }
    setSettingPassword(true);
    const token = localStorage.getItem("mdm_token");
    let ok = 0;
    for (const d of devices) {
      try {
        const r = await fetch(`${API}/commands/device/${d.id}`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ command_type: "set_kiosk_password", payload: { password: exitPassword } }),
        });
        if (r.ok) ok++;
      } catch {}
    }
    toast$(ok > 0 ? `🔐 Şifre ${ok} cihaza gönderildi` : "❌ Gönderilemedi", ok === 0 ? "error" : "success");
    setSettingPassword(false);
  };

  const disableKiosk = async () => {
    if (!devices.length) { toast$("Kayıtlı cihaz yok", "error"); return; }
    const token = localStorage.getItem("mdm_token");
    let ok = 0;
    for (const d of devices) {
      try {
        const r = await fetch(`${API}/commands/device/${d.id}`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ command_type: "disable_kiosk", payload: {} }),
        });
        if (r.ok) ok++;
      } catch {}
    }
    toast$(ok > 0 ? `✅ Kiosk ${ok} cihazdan kaldırıldı` : "❌ Gönderilemedi", ok === 0 ? "error" : "success");
  };

  // Telefon önizleme ikonu
  const AppIcon = ({ app, small }) => (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", gap: small ? 3 : 5,
      cursor: "default",
    }}>
      <div style={{
        width: small ? 42 : 54, height: small ? 42 : 54, borderRadius: small ? 10 : 13,
        background: "linear-gradient(135deg,#1e2a50,#2a1e50)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: small ? 20 : 26, boxShadow: "0 4px 12px rgba(0,0,0,.5)",
        border: "1px solid rgba(255,255,255,.08)",
      }}>
        {CAT_ICONS[app.category] || "📦"}
      </div>
      {showLabels && (
        <div style={{
          fontSize: small ? 8 : 10, color: "#fff", textAlign: "center",
          maxWidth: small ? 44 : 58, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          textShadow: "0 1px 3px rgba(0,0,0,.8)",
        }}>{app.name}</div>
      )}
    </div>
  );

  return (
    <div>
      {/* Başlık */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div>
          <div style={{ fontSize:15, fontWeight:700, color:"#f1f5f9" }}>🔒 Kiosk Launcher</div>
          <div style={{ fontSize:12, color:"#475569", marginTop:2 }}>
            Cihaz ekranında yalnızca seçtiğiniz uygulamalar görünür. Menülere, ayarlara, diğer uygulamalara erişim tamamen engellenir.
          </div>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button className="btn" onClick={disableKiosk}>🔓 Kiosk Kaldır</button>
          <button className="btn pr" style={{ padding:"9px 20px" }} onClick={applyKiosk} disabled={applying || !selectedApps.length}>
            {applying ? "⏳ Uygulanıyor..." : `🚀 ${devices.length} Cihaza Uygula`}
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display:"flex", gap:4, marginBottom:18, borderBottom:"1px solid #1a1f35", paddingBottom:0 }}>
        {[["config","⚙️ Yapılandırma"],["preview","📱 Önizleme"],["apps","📦 Uygulama Seç"]].map(([id,label]) => (
          <button key={id} onClick={() => setActiveTab(id)} style={{
            padding:"8px 18px", border:"none", background:"none", cursor:"pointer",
            color: activeTab===id ? "#60a5fa" : "#475569", fontSize:13, fontWeight: activeTab===id ? 600 : 400,
            borderBottom: activeTab===id ? "2px solid #3b5bdb" : "2px solid transparent",
            marginBottom:-1, fontFamily:"inherit",
          }}>{label}</button>
        ))}
        <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:8, paddingBottom:8 }}>
          <span style={{ fontSize:12, color: selectedApps.length ? "#22c55e" : "#475569" }}>
            {selectedApps.length} uygulama seçili
          </span>
          {selectedApps.length > 0 && (
            <button className="btn" style={{ fontSize:11, color:"#f87171" }} onClick={() => setSelectedApps([])}>Temizle</button>
          )}
        </div>
      </div>

      {/* ─── Yapılandırma ─── */}
      {activeTab === "config" && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
          {/* Kısıtlamalar */}
          <div className="card" style={{ padding:18 }}>
            <div style={{ fontSize:13, fontWeight:600, color:"#f1f5f9", marginBottom:14 }}>🛡️ Kısıtlamalar</div>
            {[
              ["Geri Tuşu Kapat", disableBack, setDisableBack, "Kullanıcı uygulamadan çıkamaz"],
              ["Ev Tuşu Kapat",  disableHome, setDisableHome, "Ana ekrana dönüş engellenir"],
              ["Durum Çubuğu Gizle", disableStatusBar, setDisableStatusBar, "Bildirim ve ayarlar erişilemez"],
            ].map(([label, val, setter, desc]) => (
              <div key={label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"11px 0", borderBottom:"1px solid #1a1f35" }}>
                <div>
                  <div style={{ fontSize:13, color:"#e2e8f0", fontWeight:500 }}>{label}</div>
                  <div style={{ fontSize:11, color:"#475569", marginTop:2 }}>{desc}</div>
                </div>
                <div onClick={() => setter(!val)} style={{
                  width:40, height:22, borderRadius:11, cursor:"pointer",
                  background: val ? "#3b5bdb" : "#2a3048",
                  position:"relative", transition:"background .2s",
                }}>
                  <div style={{
                    position:"absolute", top:3, left: val ? 20 : 3,
                    width:16, height:16, borderRadius:"50%", background:"#fff",
                    transition:"left .2s", boxShadow:"0 1px 4px rgba(0,0,0,.4)",
                  }}/>
                </div>
              </div>
            ))}
            <div style={{ marginTop:14 }}>
              <div style={{ fontSize:12, color:"#64748b", marginBottom:6 }}>Ek kısıtlamalar (otomatik):</div>
              {["Uygulama yöneticisine erişim engellendi","Ayarlar menüsü gizlendi","Bilinmeyen uygulama kurulumu engellendi","USB hata ayıklama kapatıldı"].map(t => (
                <div key={t} style={{ display:"flex", gap:8, marginBottom:5, fontSize:12, color:"#475569" }}>
                  <span style={{ color:"#22c55e" }}>✓</span><span>{t}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Çıkış Şifresi Kartı */}
          <div className="card" style={{ padding:18, gridColumn:"1 / -1" }}>
            <div style={{ fontSize:13, fontWeight:600, color:"#f1f5f9", marginBottom:4 }}>🔐 Kiosk Çıkış Şifresi</div>
            <div style={{ fontSize:12, color:"#475569", marginBottom:14 }}>
              Cihaz ekranında gizli butona uzun basıldığında bu şifre sorulur. Doğru girilirse kiosk kapanır.
            </div>
            <div style={{ display:"flex", gap:10, alignItems:"center" }}>
              <input
                type="number"
                placeholder="Örn: 1234"
                value={exitPassword}
                onChange={e => setExitPassword(e.target.value)}
                style={{
                  flex:1, padding:"10px 14px", background:"#0c0e1a", border:"1px solid #2a3048",
                  borderRadius:8, color:"#f1f5f9", fontSize:15, fontFamily:"monospace",
                  outline:"none", letterSpacing:4,
                }}
              />
              <button className="btn pr" style={{ padding:"10px 20px", whiteSpace:"nowrap" }}
                onClick={setKioskPassword} disabled={settingPassword || !exitPassword}>
                {settingPassword ? "⏳" : "🔐 Şifreyi Gönder"}
              </button>
            </div>
            <div style={{ fontSize:11, color:"#475569", marginTop:8 }}>
              💡 Kiosk uygulanırken şifre otomatik gönderilir. Sonradan değiştirmek için buradan güncelleyin.
            </div>
          </div>

          {/* Görünüm */}
          <div className="card" style={{ padding:18 }}>
            <div style={{ fontSize:13, fontWeight:600, color:"#f1f5f9", marginBottom:14 }}>🎨 Görünüm</div>
            <div className="fg">
              <label className="fl">Arka Plan Rengi</label>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {BG_COLORS.map(c => (
                  <div key={c} onClick={() => setBgColor(c)} style={{
                    width:32, height:32, borderRadius:8, background:c, cursor:"pointer",
                    border: bgColor===c ? "2px solid #60a5fa" : "2px solid transparent",
                    transition:"border .15s",
                  }}/>
                ))}
              </div>
            </div>
            <div className="fg" style={{ marginTop:14 }}>
              <label className="fl">İkon Sütun Sayısı</label>
              <div style={{ display:"flex", gap:8 }}>
                {[2,3,4,5].map(n => (
                  <button key={n} onClick={() => setColumns(n)} style={{
                    flex:1, padding:"8px", borderRadius:7, border: columns===n ? "1px solid #3b5bdb" : "1px solid #2a3048",
                    background: columns===n ? "#1a1f3a" : "#0c0e1a", color: columns===n ? "#60a5fa" : "#64748b",
                    cursor:"pointer", fontSize:13, fontWeight:600, fontFamily:"inherit",
                  }}>{n}</button>
                ))}
              </div>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"11px 0", borderTop:"1px solid #1a1f35", marginTop:6 }}>
              <div>
                <div style={{ fontSize:13, color:"#e2e8f0", fontWeight:500 }}>Uygulama İsimleri</div>
                <div style={{ fontSize:11, color:"#475569", marginTop:2 }}>İkon altında isim göster</div>
              </div>
              <div onClick={() => setShowLabels(!showLabels)} style={{
                width:40, height:22, borderRadius:11, cursor:"pointer",
                background: showLabels ? "#3b5bdb" : "#2a3048", position:"relative", transition:"background .2s",
              }}>
                <div style={{
                  position:"absolute", top:3, left: showLabels ? 20 : 3,
                  width:16, height:16, borderRadius:"50%", background:"#fff",
                  transition:"left .2s", boxShadow:"0 1px 4px rgba(0,0,0,.4)",
                }}/>
              </div>
            </div>

            {/* Özet */}
            <div style={{ marginTop:14, padding:12, background:"#0c0e1a", borderRadius:8, border:"1px solid #1a1f35" }}>
              <div style={{ fontSize:11, color:"#475569", marginBottom:8 }}>ÖZET</div>
              <div style={{ fontSize:12, color:"#94a3b8" }}>
                <div>📦 {selectedApps.length} uygulama · {columns} sütun</div>
                <div style={{ marginTop:4 }}>🎯 {devices.length} cihaz hedefleniyor</div>
                <div style={{ marginTop:4, color: selectedApps.length ? "#22c55e" : "#f87171" }}>
                  {selectedApps.length ? "✅ Göndermeye hazır" : "⚠️ Uygulama seçilmedi"}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Önizleme ─── */}
      {activeTab === "preview" && (
        <div style={{ display:"flex", gap:20, alignItems:"flex-start" }}>
          {/* Telefon mockup */}
          <div style={{ flexShrink:0 }}>
            <div style={{ fontSize:12, color:"#475569", marginBottom:10, textAlign:"center" }}>Cihaz Önizlemesi</div>
            <div style={{
              width:240, borderRadius:36, background:"#1a1f35",
              padding:"8px", boxShadow:"0 20px 60px rgba(0,0,0,.6), 0 0 0 1px #2a3048",
            }}>
              {/* Kamera çentiği */}
              <div style={{ display:"flex", justifyContent:"center", marginBottom:6 }}>
                <div style={{ width:60, height:8, borderRadius:4, background:"#0a0c18" }}/>
              </div>
              {/* Ekran */}
              <div style={{
                background: bgColor, borderRadius:28, minHeight:440, padding:16,
                position:"relative", overflow:"hidden",
              }}>
                {/* Durum çubuğu (gizli görünümü) */}
                {disableStatusBar ? (
                  <div style={{ height:18, marginBottom:8, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <div style={{ fontSize:9, color:"rgba(255,255,255,.2)" }}>● ● ●</div>
                  </div>
                ) : (
                  <div style={{ height:18, marginBottom:8, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <span style={{ fontSize:9, color:"rgba(255,255,255,.6)" }}>09:41</span>
                    <span style={{ fontSize:9, color:"rgba(255,255,255,.6)" }}>▓▓▓ 🔋</span>
                  </div>
                )}

                {selectedApps.length === 0 ? (
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:340, color:"rgba(255,255,255,.3)", fontSize:12, gap:8 }}>
                    <div style={{ fontSize:32 }}>📱</div>
                    <div>Uygulama seçilmedi</div>
                  </div>
                ) : (
                  <div style={{
                    display:"grid", gridTemplateColumns:`repeat(${Math.min(columns, 4)}, 1fr)`,
                    gap:12, justifyItems:"center",
                  }}>
                    {selectedApps.map(app => <AppIcon key={app.id} app={app} small />)}
                  </div>
                )}

                {/* Alt nav çubuğu (kiosk'ta gizli) */}
                {disableHome ? (
                  <div style={{ position:"absolute", bottom:8, left:0, right:0, display:"flex", justifyContent:"center" }}>
                    <div style={{ width:60, height:4, borderRadius:2, background:"rgba(255,255,255,.1)" }}/>
                  </div>
                ) : (
                  <div style={{ position:"absolute", bottom:8, left:0, right:0, display:"flex", justifyContent:"space-around", padding:"0 20px" }}>
                    <div style={{ fontSize:14, opacity:.4 }}>◀</div>
                    <div style={{ width:20, height:20, borderRadius:"50%", border:"1.5px solid rgba(255,255,255,.3)" }}/>
                    <div style={{ fontSize:14, opacity:.4 }}>⬜</div>
                  </div>
                )}
              </div>
              {/* Alt kısım */}
              <div style={{ height:20, display:"flex", justifyContent:"center", alignItems:"center", marginTop:6 }}>
                <div style={{ width:80, height:4, borderRadius:2, background:"#2a3048" }}/>
              </div>
            </div>
          </div>

          {/* Seçili uygulamalar listesi */}
          <div style={{ flex:1 }}>
            <div style={{ fontSize:13, fontWeight:600, color:"#f1f5f9", marginBottom:12 }}>
              Kiosk Ekranındaki Uygulamalar ({selectedApps.length})
            </div>
            {selectedApps.length === 0 ? (
              <div style={{ padding:"40px", textAlign:"center", color:"#475569", background:"#0f1220", borderRadius:12, border:"1px solid #1a1f35" }}>
                <div style={{ fontSize:32, marginBottom:8 }}>📦</div>
                <div>Uygulama Seç sekmesinden ekleyin</div>
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {selectedApps.map((app, i) => (
                  <div key={app.id} style={{
                    display:"flex", alignItems:"center", gap:12, padding:"12px 14px",
                    background:"#0f1220", borderRadius:10, border:"1px solid #1a1f35",
                  }}>
                    <div style={{ width:8, height:8, borderRadius:"50%", background:"#22c55e", flexShrink:0 }}/>
                    <div style={{ width:36, height:36, borderRadius:9, background:"#1a1f35", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>
                      {CAT_ICONS[app.category] || "📦"}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, color:"#f1f5f9", fontWeight:500 }}>{app.name}</div>
                      <div style={{ fontSize:11, color:"#475569", fontFamily:"monospace" }}>{app.package_name}</div>
                    </div>
                    <span style={{ fontSize:10, color:"#475569" }}>#{i+1}</span>
                    <button className="btn" style={{ fontSize:11, padding:"4px 8px", color:"#f87171" }}
                      onClick={() => removeFromKiosk(app.id)}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Uygulama Seç ─── */}
      {activeTab === "apps" && (
        <div>
          <div style={{ fontSize:12, color:"#475569", marginBottom:14 }}>
            Panele eklenmiş uygulamalar aşağıda listeleniyor. Kiosk ekranında göstermek istediklerinizi seçin.
          </div>
          {apps.length === 0 ? (
            <div style={{ textAlign:"center", padding:"50px", color:"#475569" }}>
              <div style={{ fontSize:36, marginBottom:10 }}>📦</div>
              <div>Uygulama yok.</div>
              <button className="btn pr" style={{ marginTop:12 }} onClick={() => setTab("apps")}>
                Uygulama Yönetimine Git →
              </button>
            </div>
          ) : (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:10 }}>
              {apps.map(app => {
                const selected = !!selectedApps.find(a => a.id === app.id);
                return (
                  <div key={app.id} onClick={() => toggleApp(app)} style={{
                    display:"flex", gap:12, alignItems:"center", padding:"12px 14px",
                    background: selected ? "#141830" : "#0f1220", borderRadius:10,
                    border: selected ? "1px solid #3b5bdb" : "1px solid #1a1f35",
                    cursor:"pointer", transition:"all .15s",
                  }}>
                    <div style={{ width:40, height:40, borderRadius:10, background:"#1a1f35", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>
                      {CAT_ICONS[app.category] || "📦"}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:13, color:"#f1f5f9", fontWeight:500 }}>{app.name}</div>
                      <div style={{ fontSize:10, color:"#475569", fontFamily:"monospace", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{app.package_name}</div>
                    </div>
                    <div style={{
                      width:20, height:20, borderRadius:5, flexShrink:0,
                      background: selected ? "#3b5bdb" : "transparent",
                      border: selected ? "none" : "1px solid #2a3048",
                      display:"flex", alignItems:"center", justifyContent:"center",
                    }}>
                      {selected && <span style={{ color:"#fff", fontSize:12 }}>✓</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {selectedApps.length > 0 && (
            <div style={{ marginTop:16, padding:"12px 16px", background:"#0f1220", borderRadius:10, border:"1px solid #2a3048", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ fontSize:13, color:"#94a3b8" }}>
                <span style={{ color:"#60a5fa", fontWeight:600 }}>{selectedApps.length}</span> uygulama seçildi
              </span>
              <div style={{ display:"flex", gap:8 }}>
                <button className="btn" onClick={() => setActiveTab("preview")}>Önizle →</button>
                <button className="btn pr" onClick={applyKiosk} disabled={applying}>
                  {applying ? "⏳" : `🚀 ${devices.length} Cihaza Uygula`}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Konum & Geofence ─────────────────────────────────────────────────────
export function Geofence({ mapLocations, mapLoading, selectedMapDev, setSelectedMapDev, fetchMap, sendAll }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div><div style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9" }}>Konum & Geofence</div><div style={{ fontSize: 12, color: "#475569", marginTop: 2 }}>{mapLocations.length} konumlu cihaz</div></div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn" onClick={fetchMap}>{mapLoading ? "⟳" : "🔄 Yenile"}</button>
          <button className="btn" onClick={() => sendAll("locate", "Konum Al")}>📍 Tüm Cihazlardan Konum Al</button>
        </div>
      </div>
      {mapLoading ? <div style={{ textAlign: "center", padding: "60px", color: "#475569" }}>⏳ Yükleniyor...</div> : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 270px", gap: 14 }}>
          <div className="card" style={{ overflow: "hidden", height: 520 }}>
            {mapLocations.length === 0 ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", flexDirection: "column", gap: 12 }}>
                <div style={{ fontSize: 48 }}>🗺️</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9" }}>Konum Yok</div>
                <div style={{ fontSize: 12, color: "#475569", textAlign: "center", maxWidth: 280, lineHeight: 1.7 }}>Cihazlardan konum almak için butonu kullanın.</div>
                <button className="btn" onClick={() => sendAll("locate", "Konum Al")}>📍 Konum İste</button>
              </div>
            ) : <MapView locations={mapLocations} onSelect={setSelectedMapDev} selected={selectedMapDev} />}
          </div>
          <div className="card" style={{ padding: 14, height: 520, overflowY: "auto" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#f1f5f9", marginBottom: 10 }}>📍 {mapLocations.length} Konum</div>
            {mapLocations.map(loc => (
              <div key={loc.device_id} className={`mcard ${selectedMapDev?.device_id === loc.device_id ? "ac" : ""}`} onClick={() => setSelectedMapDev(loc)}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: sColor(loc.status), flexShrink: 0 }}></div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: "#e2e8f0" }}>{loc.name}</div>
                </div>
                <div style={{ fontSize: 11, color: "#475569", marginBottom: 2 }}>{loc.owner || "—"}</div>
                <div style={{ fontSize: 10, color: "#3a4260", fontFamily: "monospace" }}>{loc.lat?.toFixed(5)}, {loc.lng?.toFixed(5)}</div>
                <div style={{ fontSize: 10, color: "#3a4260", marginTop: 2 }}>🔋 %{loc.battery}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Raporlar ─────────────────────────────────────────────────────────────
export function Reports({ reports, reportsLoading, fetchReports, exportCSV }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9" }}>Raporlar & Analitik</div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn" onClick={fetchReports} disabled={reportsLoading}>{reportsLoading ? "⟳" : "🔄 Yenile"}</button>
          <button className="btn" onClick={() => exportCSV(reports.devices.map(d => ({ cihaz: d.name, sahip: d.owner || "", durum: sLabel(d.status), batarya: `%${d.battery}`, depolama: `%${d.storage_percent}` })), "rapor.csv")}>📥 CSV</button>
          <button className="btn" onClick={() => window.print()}>🖨️ Yazdır</button>
        </div>
      </div>
      {reportsLoading && <div style={{ textAlign: "center", padding: "50px", color: "#475569" }}>⏳ Yükleniyor...</div>}
      {!reportsLoading && reports.summary && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 16 }}>
            {[{ l: "Toplam", v: reports.summary.total_devices, c: "#60a5fa" }, { l: "Uyumluluk", v: `%${reports.summary.compliance?.rate || 0}`, c: "#22c55e" }, { l: "Çevrimiçi", v: reports.summary.by_status?.online || 0, c: "#22c55e" }, { l: "Uyumsuz", v: reports.summary.compliance?.non_compliant || 0, c: "#f87171" }].map(s => (
              <div key={s.l} className="card" style={{ padding: 16, textAlign: "center" }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: s.c, fontFamily: "monospace", marginBottom: 4 }}>{s.v}</div>
                <div style={{ fontSize: 11, color: "#475569" }}>{s.l}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            {reports.battery && (
              <div className="card" style={{ padding: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#f1f5f9", marginBottom: 12 }}>🔋 Batarya — Ort. %{reports.battery.average}</div>
                {reports.battery.critical?.map((d, i) => <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid #1a1f35", fontSize: 12 }}><span style={{ color: "#94a3b8" }}>⚠️ {d.name}</span><span style={{ color: "#f87171", fontFamily: "monospace" }}>%{d.battery}</span></div>)}
                {reports.battery.low?.map((d, i) => <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid #1a1f35", fontSize: 12 }}><span style={{ color: "#94a3b8" }}>⚡ {d.name}</span><span style={{ color: "#f59e0b", fontFamily: "monospace" }}>%{d.battery}</span></div>)}
                {(!reports.battery.critical?.length && !reports.battery.low?.length) && <div style={{ color: "#22c55e", fontSize: 13, textAlign: "center", padding: "16px 0" }}>✅ Tüm cihazlar normal</div>}
              </div>
            )}
            {reports.storage && (
              <div className="card" style={{ padding: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#f1f5f9", marginBottom: 12 }}>💾 Depolama</div>
                {reports.storage.critical?.map((d, i) => <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid #1a1f35", fontSize: 12 }}><span style={{ color: "#94a3b8" }}>⚠️ {d.name}</span><span style={{ color: "#f87171", fontFamily: "monospace" }}>%{d.percent}</span></div>)}
                {reports.storage.warning?.map((d, i) => <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid #1a1f35", fontSize: 12 }}><span style={{ color: "#94a3b8" }}>⚡ {d.name}</span><span style={{ color: "#f59e0b", fontFamily: "monospace" }}>%{d.percent}</span></div>)}
                {(!reports.storage.critical?.length && !reports.storage.warning?.length) && <div style={{ color: "#22c55e", fontSize: 13, textAlign: "center", padding: "16px 0" }}>✅ Tüm cihazlar normal</div>}
              </div>
            )}
          </div>
          {reports.devices?.length > 0 && (
            <div className="card" style={{ overflow: "hidden" }}>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid #1a1f35", fontSize: 13, fontWeight: 600, color: "#f1f5f9" }}>📱 Cihaz Envanteri</div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead><tr style={{ background: "#0a0c18" }}>{["Cihaz", "Sahip", "Durum", "Batarya", "Depolama", "Politika", "Son Görülme"].map(h => <th key={h} style={{ textAlign: "left", padding: "9px 13px", color: "#475569", fontWeight: 600, borderBottom: "1px solid #1a1f35", fontSize: 11, textTransform: "uppercase" }}>{h}</th>)}</tr></thead>
                  <tbody>{reports.devices.map(d => (
                    <tr key={d.id} style={{ borderBottom: "1px solid #1a1f35" }}>
                      <td style={{ padding: "10px 13px", color: "#e2e8f0", fontWeight: 500 }}>{d.name}</td>
                      <td style={{ padding: "10px 13px", color: "#94a3b8" }}>{d.owner || "—"}</td>
                      <td style={{ padding: "10px 13px" }}><span style={{ color: sColor(d.status), fontSize: 11 }}>{sLabel(d.status)}</span></td>
                      <td style={{ padding: "10px 13px", color: d.battery < 20 ? "#f87171" : "#94a3b8", fontFamily: "monospace" }}>%{d.battery}</td>
                      <td style={{ padding: "10px 13px", color: d.storage_percent > 90 ? "#f87171" : "#94a3b8", fontFamily: "monospace" }}>%{d.storage_percent}</td>
                      <td style={{ padding: "10px 13px", color: "#94a3b8" }}>{d.policy}</td>
                      <td style={{ padding: "10px 13px", color: "#475569", fontSize: 11 }}>{d.last_seen}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
      {!reportsLoading && !reports.summary && <div style={{ textAlign: "center", padding: "60px", color: "#475569" }}><div style={{ fontSize: 40, marginBottom: 12 }}>📊</div><button className="btn pr" onClick={fetchReports}>Raporları Yükle</button></div>}
    </div>
  );
}

// ─── Uyarılar ─────────────────────────────────────────────────────────────
export function Alerts({ alerts }) {
  return (
    <div>
      <div style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9", marginBottom: 16 }}>Sistem Uyarıları <span style={{ fontSize: 12, color: "#475569", fontWeight: 400 }}>({alerts.length} aktif)</span></div>
      {alerts.length === 0 ? (
        <div style={{ textAlign: "center", padding: "50px", color: "#475569" }}><div style={{ fontSize: 40, marginBottom: 10 }}>✅</div>Aktif uyarı yok</div>
      ) : (
        <div className="card" style={{ overflow: "hidden" }}>
          {alerts.map(a => (
            <div key={a.id} style={{ display: "flex", gap: 12, padding: "14px 16px", borderBottom: "1px solid #1a1f35", alignItems: "flex-start" }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: a.type === "critical" ? "#2d1a1a" : a.type === "warning" ? "#2a2310" : "#1a1f35", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>{a.type === "critical" ? "🔴" : a.type === "warning" ? "🟡" : "🔵"}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: "#e2e8f0", fontWeight: 500, marginBottom: 3 }}>{a.msg}</div>
                <div style={{ fontSize: 11, color: "#475569" }}>{a.device}</div>
              </div>
              <span className="tag" style={{ background: a.type === "critical" ? "#2d1a1a" : a.type === "warning" ? "#2a2310" : "#1a1f35", color: a.type === "critical" ? "#f87171" : a.type === "warning" ? "#f59e0b" : "#60a5fa" }}>{a.type === "critical" ? "Kritik" : a.type === "warning" ? "Uyarı" : "Bilgi"}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Komut Geçmişi ────────────────────────────────────────────────────────
export function Logs({ commandLog, setCommandLog, setConfirmModal, exportCSV }) {
  return (
    <div>
      <div style={{ padding: "10px 14px", background: "#0d0f1e", border: "1px solid #1a1f35", borderRadius: 8, marginBottom: 14, fontSize: 12, color: "#64748b", display: "flex", gap: 10 }}>
        <span>ℹ️</span>
        <span><strong style={{ color: "#94a3b8" }}>✅ Gönderildi</strong> = komut backend'e ulaştı. Cihaz FCM veya sonraki heartbeat (5 dk) ile alır.</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9" }}>Komut Geçmişi <span style={{ fontSize: 12, color: "#475569", fontWeight: 400 }}>({commandLog.length})</span></div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn" onClick={() => exportCSV(commandLog.map(l => ({ zaman: l.time, cihaz: l.device, komut: l.cmd, durum: l.ok ? "Başarılı" : "Başarısız" })), "komutlar.csv")}>📥 CSV</button>
          <button className="btn dg" onClick={() => setConfirmModal({ title: "Geçmişi Temizle", msg: "Tüm komut geçmişi silinecek.", onOk: () => setCommandLog([]) })}>🗑️ Temizle</button>
        </div>
      </div>
      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "120px 1fr 1.2fr 110px 110px", gap: 10, padding: "9px 14px", background: "#0a0c18", color: "#475569", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em", borderBottom: "1px solid #1a1f35" }}>
          <span>Zaman</span><span>Cihaz</span><span>Komut</span><span>Backend</span><span>Cihaz</span>
        </div>
        {commandLog.length === 0 ? <div style={{ padding: "50px", textAlign: "center", color: "#475569", fontSize: 13 }}>Henüz komut gönderilmedi.</div>
          : commandLog.map(l => (
            <div key={l.id} style={{ display: "grid", gridTemplateColumns: "120px 1fr 1.2fr 110px 110px", gap: 10, alignItems: "center", padding: "12px 14px", borderBottom: "1px solid #1a1f35", fontSize: 12 }}>
              <span style={{ color: "#475569", fontFamily: "monospace", fontSize: 11 }}>{l.time}</span>
              <span style={{ color: "#e2e8f0", fontWeight: 500 }}>{l.device}</span>
              <span style={{ color: "#94a3b8" }}>{l.cmd}</span>
              <span className="tag" style={{ background: l.ok ? "#1e3a1e" : "#2d1a1a", color: l.ok ? "#22c55e" : "#f87171" }}>{l.ok ? "✅ Gönderildi" : "❌ Hata"}</span>
              <span className="tag" style={{ background: "#1a1a2a", color: "#475569", fontSize: 10 }}>⏳ Bekliyor</span>
            </div>
          ))}
      </div>
    </div>
  );
}

// ─── Kullanıcılar ─────────────────────────────────────────────────────────
export function Users({ users, setUserModal, setUsers, toast$, H, API, setConfirmModal }) {
  const deleteUser = async (user) => {
    try {
      const r = await fetch(`${API}/auth/users/${user.id}`, { method:"DELETE", headers:H() });
      if (r.ok) { setUsers(p => p.filter(u => u.id !== user.id)); toast$(`"${user.full_name||user.email}" silindi`); }
      else toast$("Kullanıcı silinemedi — yetki gerekebilir", "error");
    } catch { toast$("Bağlantı hatası", "error"); }
  };

  const toggleActive = async (user) => {
    try {
      const r = await fetch(`${API}/auth/users/${user.id}`, {
        method:"PATCH", headers:H(),
        body: JSON.stringify({ is_active: !user.is_active })
      });
      if (r.ok) {
        setUsers(p => p.map(u => u.id===user.id ? {...u, is_active:!u.is_active} : u));
        toast$(`${user.full_name||user.email} ${!user.is_active?"aktif":"pasif"} yapıldı`);
      } else {
        // local güncelle
        setUsers(p => p.map(u => u.id===user.id ? {...u, is_active:!u.is_active} : u));
        toast$(`Durum güncellendi (local)`);
      }
    } catch { toast$("Bağlantı hatası", "error"); }
  };

  const ROLE_INFO = {
    admin:    { icon:"👑", label:"Admin",         color:"#f87171", desc:"Tam yetki" },
    operator: { icon:"🔧", label:"Operatör",      color:"#60a5fa", desc:"Cihaz yönetimi" },
    viewer:   { icon:"👁️", label:"Görüntüleyici", color:"#94a3b8", desc:"Salt okuma" },
  };

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <div>
          <div style={{ fontSize:14, fontWeight:600, color:"#f1f5f9" }}>Kullanıcı Yönetimi</div>
          <div style={{ fontSize:12, color:"#475569", marginTop:2 }}>{users.length} kullanıcı · {users.filter(u=>u.is_active).length} aktif</div>
        </div>
        <button className="btn pr" onClick={() => setUserModal(true)}>+ Kullanıcı Ekle</button>
      </div>

      {/* Rol Özeti */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:20 }}>
        {Object.entries(ROLE_INFO).map(([role,info]) => (
          <div key={role} className="card" style={{ padding:14 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
              <span style={{ fontSize:20 }}>{info.icon}</span>
              <div>
                <div style={{ fontSize:13, fontWeight:600, color:info.color }}>{info.label}</div>
                <div style={{ fontSize:11, color:"#475569" }}>{info.desc}</div>
              </div>
              <span style={{ marginLeft:"auto", fontSize:18, fontWeight:700, color:info.color }}>
                {users.filter(u=>u.role===role).length}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ overflow:"hidden" }}>
        <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr 100px", gap:10, padding:"10px 16px", background:"#0a0c18", color:"#475569", fontSize:11, fontWeight:600, textTransform:"uppercase", letterSpacing:".05em", borderBottom:"1px solid #1a1f35" }}>
          <span>Kullanıcı</span><span>Rol</span><span>Durum</span><span>Son Giriş</span><span>İşlemler</span>
        </div>
        {users.map(u => (
          <div key={u.id} style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr 100px", gap:10, alignItems:"center", padding:"12px 16px", borderBottom:"1px solid #1a1f35" }}>
            <div style={{ display:"flex", gap:10, alignItems:"center" }}>
              <div style={{ width:34, height:34, borderRadius:9, background:"#1a1f35", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>
                {ROLE_INFO[u.role]?.icon||"👤"}
              </div>
              <div>
                <div style={{ fontSize:13, fontWeight:600, color:"#f1f5f9" }}>{u.full_name||"—"}</div>
                <div style={{ fontSize:11, color:"#475569" }}>{u.email}</div>
              </div>
            </div>
            <span className="tag" style={{ background:"#141830", color:ROLE_INFO[u.role]?.color||"#94a3b8", border:"1px solid #2a3048" }}>
              {ROLE_INFO[u.role]?.label||u.role}
            </span>
            <span className="tag" style={{ background:u.is_active?"#1e3a1e":"#2d1a1a", color:u.is_active?"#22c55e":"#f87171" }}>
              {u.is_active?"● Aktif":"○ Pasif"}
            </span>
            <div style={{ fontSize:11, color:"#475569" }}>
              {u.last_login ? new Date(u.last_login).toLocaleDateString("tr-TR") : "Hiç giriş yok"}
            </div>
            <div style={{ display:"flex", gap:6 }}>
              <button className="btn" style={{ fontSize:11, padding:"4px 8px", color:u.is_active?"#f59e0b":"#22c55e" }}
                onClick={() => toggleActive(u)} title={u.is_active?"Pasif Yap":"Aktif Yap"}>
                {u.is_active?"⏸":"▶"}
              </button>
              <button className="btn dg" style={{ fontSize:11, padding:"4px 8px" }}
                onClick={() => setConfirmModal({ title:"Kullanıcıyı Sil", msg:`"${u.full_name||u.email}" silinecek.`, onOk:()=>deleteUser(u) })}>
                🗑️
              </button>
            </div>
          </div>
        ))}
        {users.length === 0 && <div style={{ padding:"40px", textAlign:"center", color:"#475569" }}>Kullanıcı yok.</div>}
      </div>
    </div>
  );
}

// ─── Sistem Ayarları ──────────────────────────────────────────────────────
export function Settings({ API, apiLoading, devices, sendAll, setCommandLog, exportCSV, fetchAll, sLabel, toast$ }) {
  return (
    <div>
      <div style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9", marginBottom: 16 }}>Sistem Ayarları</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {[
          { t: "🔗 Sunucu",    items: [["Backend URL", API.replace("/api/v1", "")], ["API", "v1 · REST"], ["Durum", apiLoading ? "⟳ Kontrol" : "✅ Çevrimiçi"]] },
          { t: "🔐 Güvenlik", items: [["JWT", "24 saat"], ["Şifreleme", "bcrypt"], ["CORS", "allow_origins=[*]"]] },
          { t: "🗄️ Veritabanı", items: [["Tür", "PostgreSQL 15"], ["Provider", "Render Managed"], ["⚠️ Uyarı", "90 gün ömür"]] },
          { t: "⚡ İşlemler",  items: null },
        ].map(s => (
          <div key={s.t} className="card" style={{ padding: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#f1f5f9", marginBottom: 12 }}>{s.t}</div>
            {s.items ? s.items.map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #1a1f35", fontSize: 12 }}>
                <span style={{ color: "#475569" }}>{k}</span>
                <span style={{ color: "#94a3b8", fontFamily: "monospace", fontSize: 11 }}>{v}</span>
              </div>
            )) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <button className="btn" style={{ fontSize: 12 }} onClick={fetchAll}>🔄 Tüm Veriyi Yenile</button>
                <button className="btn" style={{ fontSize: 12 }} onClick={async () => {
                  try {
                    const baseUrl = API.replace("/api/v1", "");
                    const r = await fetch(`${baseUrl}/health`);
                    if (r.ok) toast$("✅ Backend sağlıklı çalışıyor");
                    else toast$(`⚠️ Backend HTTP ${r.status}`, "error");
                  } catch(e) { toast$(`❌ Backend ulaşılamıyor: ${e.message}`, "error"); }
                }}>🔍 Backend Sağlık Testi</button>
                <button className="btn" style={{ fontSize: 12 }} onClick={() => exportCSV(devices.map(d => ({ ad:d.name||`${d.manufacturer} ${d.model}`, kullanici:d.owner_name||"", model:d.model||"", android:d.android_version||"", durum:sLabel(d.status), batarya:`%${d.battery_level||0}`, depolama:`${d.storage_used_gb||0}/${d.storage_total_gb||0}GB`, politika:d.policy_name||"", kayit:d.enrolled_at?new Date(d.enrolled_at).toLocaleDateString("tr-TR"):"" })), "cihaz_envanteri.csv")}>📥 Envanter CSV</button>
                <button className="btn" style={{ fontSize: 12 }} onClick={() => sendAll("push_policy", "Politika Sync")}>🛡️ Politikaları Senkronize Et</button>
                <button className="btn" style={{ fontSize: 12 }} onClick={() => { localStorage.removeItem("mdm_profiles"); window.location.reload(); }}>🔄 Profil Önbelleğini Temizle</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Kayıt (Enrollment) ───────────────────────────────────────────────────
export function Enrollment({ policies, enrollMethod, setEnrollMethod, enrollPolicyId, setEnrollPolicyId, generateQr, qrData, qrLoading }) {
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 22 }}>
        {[{ id: "provisioning", icon: "🚀", t: "Sıfır Kurulum", d: "Fabrika sıfırlı cihaz.", badge: "ÖNERİLEN" }, { id: "simple", icon: "📷", t: "Hızlı QR", d: "Agent kurulu cihazlar." }, { id: "email", icon: "📧", t: "E-posta", d: "Davet bağlantısı gönderir." }, { id: "bulk", icon: "📋", t: "Toplu Kayıt", d: "CSV ile çoklu kayıt." }].map(m => (
          <div key={m.id} className="card" style={{ padding: 16, cursor: "pointer", border: enrollMethod === m.id ? "1px solid #3b5bdb" : "1px solid #1a1f35" }} onClick={() => setEnrollMethod(m.id)}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{m.icon}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#f1f5f9", marginBottom: 3 }}>{m.t}</div>
            <div style={{ fontSize: 12, color: "#475569", lineHeight: 1.6 }}>{m.d}</div>
            {m.badge && <span className="tag" style={{ background: "#1e3a1e", color: "#22c55e", fontSize: 10, marginTop: 8 }}>{m.badge}</span>}
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        <div className="card" style={{ padding: 18 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9", marginBottom: 14 }}>QR Kod Oluştur</div>
          <div className="fg"><label className="fl">Politika</label>
            <select className="fi" value={enrollPolicyId} onChange={e => setEnrollPolicyId(e.target.value)}>
              <option value="">Varsayılan Politika</option>
              {policies.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn pr" style={{ flex: 1 }} onClick={() => generateQr(enrollPolicyId || null, "provisioning")} disabled={qrLoading}>{qrLoading ? "⏳" : "📱 Sıfır Kurulum QR"}</button>
            <button className="btn" style={{ flex: 1 }} onClick={() => generateQr(enrollPolicyId || null, "simple")} disabled={qrLoading}>📷 Hızlı QR</button>
          </div>
          {qrData && (
            <div style={{ marginTop: 18, textAlign: "center" }}>
              <div style={{ fontSize: 12, color: "#475569", marginBottom: 10 }}>Geçerlilik: {new Date(qrData.expires_at).toLocaleString("tr-TR")}</div>
              <div style={{ display: "inline-block", background: "#fff", padding: 10, borderRadius: 8 }}><img src={qrData.qr_image} alt="QR" style={{ width: 190, height: 190, display: "block" }} /></div>
              <div style={{ marginTop: 10 }}><button className="btn" style={{ fontSize: 11 }} onClick={() => { const a = document.createElement("a"); a.href = qrData.qr_image; a.download = "mdm_qr.png"; a.click(); }}>📥 İndir</button></div>
            </div>
          )}
        </div>
        <div className="card" style={{ padding: 18 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9", marginBottom: 14 }}>📋 Kurulum Adımları</div>
          {[["1.", "Telefonu fabrika ayarlarına sıfırlayın"], ["2.", "Dil seçimini yapın"], ["3.", "Wi-Fi ekranında ekrana 6 kez dokunun"], ["4.", "QR okuyucu açılır → QR'ı taratın"], ["5.", "Uygulama otomatik yüklenip Device Owner yapılır ✅"], ["6.", "Politikalar otomatik uygulanır"]].map(([n, t]) => (
            <div key={n} style={{ display: "flex", gap: 10, marginBottom: 9, fontSize: 13, color: "#64748b" }}>
              <span style={{ color: "#3b82f6", fontWeight: 600, flexShrink: 0 }}>{n}</span><span>{t}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
