import MapView from "../components/MapView";
import { sColor, sLabel, rColor, rLabel } from "../utils";

// ─── Uygulamalar ──────────────────────────────────────────────────────────
export function Apps({ apps, devices, setAppModal, deployApp, setConfirmModal, sendAll }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <div><div style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9" }}>Uygulama Yönetimi</div><div style={{ fontSize: 12, color: "#475569", marginTop: 2 }}>{apps.length} uygulama</div></div>
        <button className="btn pr" onClick={() => setAppModal(true)}>+ Uygulama Ekle</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 14 }}>
        {apps.map(app => (
          <div key={app.id} className="card" style={{ padding: 18 }}>
            <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 11, background: "#1a1f35", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>📦</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9" }}>{app.name}</div>
                <div style={{ fontSize: 11, color: "#475569", fontFamily: "monospace" }}>{app.package_name}</div>
              </div>
              {app.is_required && <span className="tag" style={{ background: "#1e3a1e", color: "#22c55e", fontSize: 10, alignSelf: "flex-start" }}>Zorunlu</span>}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7, marginBottom: 11, fontSize: 12, color: "#64748b" }}>
              <div>Ver: <span style={{ color: "#94a3b8" }}>{app.version || "—"}</span></div>
              <div>Boyut: <span style={{ color: "#94a3b8" }}>{app.size_mb ? `${app.size_mb} MB` : "—"}</span></div>
              <div>Kat: <span style={{ color: "#94a3b8" }}>{app.category || "—"}</span></div>
              <div>Cihaz: <span style={{ color: "#22c55e" }}>{devices.length}</span></div>
            </div>
            <div style={{ display: "flex", gap: 7 }}>
              <button className="btn pr" style={{ flex: 1, fontSize: 12 }} onClick={() => deployApp(app)}>📤 {devices.length} Cihaza Dağıt</button>
              <button className="btn dg" style={{ fontSize: 12, padding: "7px 11px" }} onClick={() => setConfirmModal({ title: "Uygulamayı Kaldır", msg: `"${app.name}" kaldırılacak.`, onOk: () => sendAll("uninstall_app", `Kaldır: ${app.name}`) })}>🗑️</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Kiosk ────────────────────────────────────────────────────────────────
export function Kiosk({ sendAll, setTab }) {
  return (
    <div>
      <div style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9", marginBottom: 16 }}>Kiosk Modu Yönetimi</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 18 }}>
        {[{ t: "Tek Uygulama", icon: "📱", d: "Cihaz yalnızca seçilen uygulamayı çalıştırır.", apps: ["Şirket Portalı"], c: "#3b5bdb" }, { t: "Çoklu Uygulama", icon: "🖥️", d: "Belirlenen uygulamalar listesinden seçim yapılabilir.", apps: ["Teams", "Outlook", "Chrome"], c: "#22c55e" }].map(k => (
          <div key={k.t} className="card" style={{ padding: 18 }}>
            <div style={{ display: "flex", gap: 12, marginBottom: 12, alignItems: "center" }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: k.c + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{k.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9" }}>{k.t}</div>
            </div>
            <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.7, marginBottom: 12 }}>{k.d}</div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: "#475569", marginBottom: 6 }}>UYGULAMALAR</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{k.apps.map(a => <span key={a} className="tag" style={{ background: "#141830", color: "#60a5fa", border: "1px solid #2a3048" }}>{a}</span>)}</div>
            </div>
            <button className="btn pr" style={{ width: "100%", fontSize: 12 }} onClick={() => sendAll("push_policy", `${k.t} Kiosk`)}>🔒 Tüm Cihazlara Uygula</button>
          </div>
        ))}
      </div>
      <div className="card" style={{ padding: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#f1f5f9", marginBottom: 12 }}>⚙️ Kıstlamalar</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 12 }}>
          {[["📵", "Durum Çubuğu"], ["🏠", "Ev Tuşu"], ["◀", "Geri Tuşu"], ["📲", "Bildirimler"], ["📷", "Kamera"], ["🔆", "Fabrika Sıfır"]].map(([i, l]) => (
            <div key={l} style={{ padding: 12, background: "#0c0e1a", borderRadius: 9, border: "1px solid #1a1f35", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 18 }}>{i}</span>
              <div><div style={{ fontSize: 12, fontWeight: 500, color: "#e2e8f0" }}>{l}</div><div style={{ fontSize: 11, color: "#f59e0b" }}>Politikaya bağlı</div></div>
            </div>
          ))}
        </div>
        <span style={{ fontSize: 12, color: "#60a5fa" }}>ℹ️ Detaylı kısıtlamalar için → </span>
        <button className="btn" style={{ fontSize: 11, padding: "3px 8px", marginLeft: 6 }} onClick={() => setTab("policies")}>Politikalar →</button>
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
          <button className="btn dg" onClick={() => setConfirmModal({ title: "Geçmişi Temizle", msg: "Komut geçmişi silinecek.", onOk: () => { setCommandLog([]); } })}>🗑️ Temizle</button>
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
export function Users({ users, setUserModal }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9" }}>Kullanıcı Yönetimi <span style={{ fontSize: 12, color: "#475569", fontWeight: 400 }}>({users.length})</span></div>
        <button className="btn pr" onClick={() => setUserModal(true)}>+ Kullanıcı Ekle</button>
      </div>
      <div className="card" style={{ overflow: "hidden" }}>
        {users.map(u => (
          <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 16px", borderBottom: "1px solid #1a1f35" }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: "#1a1f35", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>{u.role === "admin" ? "👑" : u.role === "operator" ? "🔧" : "👁️"}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#f1f5f9" }}>{u.full_name || "—"}</div>
              <div style={{ fontSize: 12, color: "#475569", marginTop: 2 }}>{u.email}</div>
            </div>
            <span className="tag" style={{ background: "#141830", color: rColor(u.role), border: "1px solid #2a3048" }}>{rLabel(u.role)}</span>
            <span className="tag" style={{ background: u.is_active ? "#1e3a1e" : "#2d1a1a", color: u.is_active ? "#22c55e" : "#f87171" }}>{u.is_active ? "Aktif" : "Pasif"}</span>
          </div>
        ))}
        {users.length === 0 && <div style={{ padding: "40px", textAlign: "center", color: "#475569" }}>Kullanıcı yok.</div>}
      </div>
    </div>
  );
}

// ─── Sistem Ayarları ──────────────────────────────────────────────────────
export function Settings({ API, apiLoading, devices, sendAll, setCommandLog, exportCSV, fetchAll, sLabel }) {
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
                <button className="btn" style={{ fontSize: 12 }} onClick={() => exportCSV(devices.map(d => ({ ad: d.name || `${d.manufacturer} ${d.model}`, durum: sLabel(d.status) })), "cihazlar.csv")}>📥 Cihaz Listesi CSV</button>
                <button className="btn" style={{ fontSize: 12 }} onClick={() => sendAll("push_policy", "Politika Sync")}>🛡️ Politikaları Senkronize Et</button>
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
