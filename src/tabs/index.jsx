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
export function Kiosk({ sendAll, setTab, devices, policies, toast$ }) {
  const [kioskPolicyId, setKioskPolicyId] = React.useState("");
  const [kioskApps, setKioskApps] = React.useState([""]);
  const [kioskMode, setKioskMode] = React.useState("single");
  const [applying, setApplying] = React.useState(false);

  const applyKiosk = async () => {
    if (!devices.length) { toast$("Kayıtlı cihaz yok", "error"); return; }
    setApplying(true);
    const filtered = kioskApps.filter(a => a.trim());
    const payload = {
      kiosk_mode: kioskMode,
      allowed_apps: filtered,
      policy_id: kioskPolicyId || null,
      disable_status_bar: true,
      disable_home_button: true,
      disable_back_button: kioskMode === "single",
    };
    let ok = 0;
    for (const d of devices) {
      try {
        const r = await fetch(`https://mdm-backend-rk5x.onrender.com/api/v1/commands/device/${d.id}`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${localStorage.getItem("mdm_token")}`, "Content-Type": "application/json" },
          body: JSON.stringify({ command_type: "push_policy", payload }),
        });
        if (r.ok) ok++;
      } catch {}
    }
    toast$(ok > 0 ? `✅ Kiosk modu ${ok}/${devices.length} cihaza uygulandı` : "❌ Gönderilemedi", ok === 0 ? "error" : "success");
    setApplying(false);
  };

  return (
    <div>
      <div style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9", marginBottom: 16 }}>Kiosk Modu Yapılandırması</div>

      {/* Mod seçimi */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
        {[{ id:"single", icon:"📱", t:"Tek Uygulama", d:"Cihaz yalnızca seçilen uygulamayı çalıştırır. Geri ve ev tuşları devre dışı bırakılır." },
          { id:"multi",  icon:"🖥️", t:"Çoklu Uygulama", d:"Belirlenen uygulamalar listesinden seçim yapılabilir. Diğer uygulamalara erişim engellenir." }
        ].map(k => (
          <div key={k.id} className="card" style={{ padding: 18, cursor:"pointer", border: kioskMode===k.id ? "1px solid #3b5bdb" : "1px solid #1a1f35" }}
            onClick={() => setKioskMode(k.id)}>
            <div style={{ display:"flex", gap:12, marginBottom:10, alignItems:"center" }}>
              <div style={{ width:40, height:40, borderRadius:10, background: kioskMode===k.id?"#1a1f3a":"#0c0e1a", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>{k.icon}</div>
              <div style={{ fontSize:14, fontWeight:600, color: kioskMode===k.id?"#60a5fa":"#f1f5f9" }}>{k.t}</div>
              {kioskMode===k.id && <span className="tag" style={{ marginLeft:"auto", background:"#1a1f3a", color:"#60a5fa", fontSize:10 }}>SEÇİLİ</span>}
            </div>
            <div style={{ fontSize:12, color:"#64748b", lineHeight:1.6 }}>{k.d}</div>
          </div>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
        {/* Uygulama Listesi */}
        <div className="card" style={{ padding:18 }}>
          <div style={{ fontSize:13, fontWeight:600, color:"#f1f5f9", marginBottom:12 }}>
            📱 İzin Verilen Uygulamalar
          </div>
          {kioskApps.map((pkg, i) => (
            <div key={i} style={{ display:"flex", gap:8, marginBottom:8 }}>
              <input className="fi" placeholder="com.sirket.portal" value={pkg}
                onChange={e => { const a=[...kioskApps]; a[i]=e.target.value; setKioskApps(a); }}
                style={{ flex:1 }} />
              <button className="btn" style={{ padding:"7px 10px", fontSize:12, color:"#f87171" }}
                onClick={() => setKioskApps(kioskApps.filter((_,j)=>j!==i))}>✕</button>
            </div>
          ))}
          <button className="btn" style={{ width:"100%", fontSize:12, marginTop:4 }}
            onClick={() => setKioskApps([...kioskApps,""])}>+ Uygulama Ekle</button>
        </div>

        {/* Politika & Ayarlar */}
        <div className="card" style={{ padding:18 }}>
          <div style={{ fontSize:13, fontWeight:600, color:"#f1f5f9", marginBottom:12 }}>⚙️ Ayarlar</div>
          <div className="fg">
            <label className="fl">Bağlı Politika (opsiyonel)</label>
            <select className="fi" value={kioskPolicyId} onChange={e=>setKioskPolicyId(e.target.value)}>
              <option value="">Politika seçme</option>
              {(policies||[]).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginTop:8 }}>
            {[["📵","Durum Çubuğu","Gizle"],["🏠","Ev Tuşu","Kapat"],["◀","Geri Tuşu",kioskMode==="single"?"Kapat":"Aktif"],
              ["📲","Bildirimler","Gizle"],["📷","Kamera","Politikaya bağlı"],["🔆","Parlaklık","Sabit"]].map(([icon,label,val])=>(
              <div key={label} style={{ padding:10, background:"#0c0e1a", borderRadius:8, border:"1px solid #1a1f35", display:"flex", gap:8, alignItems:"center" }}>
                <span style={{ fontSize:16 }}>{icon}</span>
                <div><div style={{ fontSize:11, color:"#e2e8f0", fontWeight:500 }}>{label}</div><div style={{ fontSize:10, color:"#f59e0b" }}>{val}</div></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Uygula */}
      <div style={{ display:"flex", gap:10, alignItems:"center" }}>
        <button className="btn pr" style={{ padding:"10px 24px", fontSize:13 }} onClick={applyKiosk} disabled={applying}>
          {applying ? "⏳ Uygulanıyor..." : `🔒 ${devices.length} Cihaza Kiosk Uygula`}
        </button>
        <button className="btn" style={{ fontSize:12 }} onClick={() => sendAll("unlock","Kiosk Kaldır")}>🔓 Kiosk Kaldır</button>
        <span style={{ fontSize:12, color:"#475569" }}>
          {devices.length} cihaz hedefleniyor
        </span>
        <button className="btn" style={{ fontSize:11, marginLeft:"auto" }} onClick={() => setTab("policies")}>
          Politika Yönetimi →
        </button>
      </div>
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
