import { useState, useEffect } from "react";

const MOCK_DEVICES = [
  { id: "d001", name: "Samsung Galaxy S23", user: "Ahmet Yılmaz", model: "SM-S911B", os: "Android 14", status: "online", battery: 78, storage: 62, lastSeen: "Şimdi", enrolled: "2024-01-15", policy: "Kurumsal", location: "Ankara", compliance: true, apps: 42 },
  { id: "d002", name: "Xiaomi Redmi Note 12", user: "Mehmet Demir", model: "23021RAAEG", os: "Android 13", status: "online", battery: 45, storage: 81, lastSeen: "2 dk önce", enrolled: "2024-02-08", policy: "Saha Ekibi", location: "İstanbul", compliance: true, apps: 31 },
  { id: "d003", name: "Huawei P60 Pro", user: "Ayşe Kaya", model: "ALN-L29", os: "Android 12", status: "offline", battery: 12, storage: 44, lastSeen: "3 saat önce", enrolled: "2023-11-22", policy: "Yönetici", location: "İzmir", compliance: false, apps: 58 },
  { id: "d004", name: "Oppo Find X6", user: "Fatma Çelik", model: "CPH2525", os: "Android 14", status: "online", battery: 91, storage: 28, lastSeen: "Şimdi", enrolled: "2024-03-01", policy: "Kurumsal", location: "Bursa", compliance: true, apps: 27 },
  { id: "d005", name: "Samsung Galaxy A54", user: "Ali Öztürk", model: "SM-A546B", os: "Android 13", status: "locked", battery: 55, storage: 70, lastSeen: "1 saat önce", enrolled: "2023-12-10", policy: "Saha Ekibi", location: "Ankara", compliance: false, apps: 19 },
  { id: "d006", name: "Pixel 8 Pro", user: "Zeynep Arslan", model: "GC3VE", os: "Android 14", status: "online", battery: 67, storage: 35, lastSeen: "5 dk önce", enrolled: "2024-01-30", policy: "Yönetici", location: "İstanbul", compliance: true, apps: 63 },
];

const MOCK_POLICIES = [
  { id: "p001", name: "Kurumsal", devices: 28, rules: ["Şifre zorunlu (8+ karakter)", "Ekran kilidi: 30 sn", "VPN zorunlu", "Kamera kısıtlı", "USB hata ayıklama kapalı"], created: "2024-01-01" },
  { id: "p002", name: "Saha Ekibi", devices: 47, rules: ["Şifre zorunlu (6+ karakter)", "Ekran kilidi: 2 dk", "GPS zorunlu", "Wi-Fi kısıtlı"], created: "2024-01-15" },
  { id: "p003", name: "Yönetici", devices: 12, rules: ["Biyometrik giriş", "Uzaktan erişim açık", "Tüm uygulamalar izinli"], created: "2024-02-01" },
];

const MOCK_APPS = [
  { id: "a001", name: "Şirket Portalı", package: "com.sirket.portal", version: "3.2.1", installed: 87, required: true },
  { id: "a002", name: "Teams", package: "com.microsoft.teams", version: "1416/1.0.0", installed: 72, required: true },
  { id: "a003", name: "Google Chrome", package: "com.android.chrome", version: "120.0.6099", installed: 87, required: false },
  { id: "a004", name: "Zoom", package: "us.zoom.videomeetings", version: "5.16.10", installed: 45, required: false },
  { id: "a005", name: "SAP Fiori", package: "com.sap.fiori", version: "3.8.0", installed: 28, required: true },
];

const statusColor = (s) => ({ online: "#22c55e", offline: "#6b7280", locked: "#f59e0b", wiped: "#ef4444" }[s] || "#6b7280");
const statusLabel = (s) => ({ online: "Çevrimiçi", offline: "Çevrimdışı", locked: "Kilitli", wiped: "Silindi" }[s] || s);

export default function MDMDashboard() {
  const [tab, setTab] = useState("overview");
  const [devices, setDevices] = useState(MOCK_DEVICES);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [commandLog, setCommandLog] = useState([]);
  const [showCommandModal, setShowCommandModal] = useState(false);
  const [pendingCommand, setPendingCommand] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const sendCommand = (device, cmd) => {
    const cmdMap = {
      lock: "Cihaz Kilitle",
      unlock: "Kilidi Aç",
      wipe: "Fabrika Ayarları",
      reboot: "Yeniden Başlat",
      locate: "Konumu Al",
      push_policy: "Politika Gönder",
    };
    setCommandLog(prev => [{
      id: Date.now(),
      device: device.name,
      cmd: cmdMap[cmd] || cmd,
      time: new Date().toLocaleTimeString("tr-TR"),
      status: "Gönderildi",
    }, ...prev.slice(0, 9)]);

    if (cmd === "lock") {
      setDevices(prev => prev.map(d => d.id === device.id ? { ...d, status: "locked" } : d));
    }
    if (cmd === "wipe") {
      setDevices(prev => prev.map(d => d.id === device.id ? { ...d, status: "wiped", compliance: false } : d));
    }
    showToast(`"${cmdMap[cmd]}" komutu gönderildi → ${device.name}`);
    setShowCommandModal(false);
    setPendingCommand(null);
  };

  const filteredDevices = devices.filter(d => {
    const matchSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = filterStatus === "all" || d.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: devices.length,
    online: devices.filter(d => d.status === "online").length,
    offline: devices.filter(d => d.status === "offline").length,
    noncompliant: devices.filter(d => !d.compliance).length,
    locked: devices.filter(d => d.status === "locked").length,
  };

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: "#0f1117", minHeight: "100vh", color: "#e2e8f0" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #1e2130; }
        ::-webkit-scrollbar-thumb { background: #3a3f52; border-radius: 3px; }
        .tab-btn { padding: 8px 18px; border-radius: 8px; border: none; background: transparent; color: #8892a4; font-size: 13px; font-family: inherit; cursor: pointer; transition: all .2s; font-weight: 500; }
        .tab-btn:hover { color: #e2e8f0; background: #1e2130; }
        .tab-btn.active { background: #1e2130; color: #60a5fa; border-bottom: 2px solid #60a5fa; }
        .device-row { display: grid; grid-template-columns: 2fr 1.4fr 1fr 1fr 1fr 1fr 100px; gap: 12px; align-items: center; padding: 14px 18px; border-bottom: 1px solid #1e2130; cursor: pointer; transition: background .15s; font-size: 13px; }
        .device-row:hover { background: #161925; }
        .device-row.selected { background: #1a2236; }
        .cmd-btn { padding: 6px 14px; border-radius: 7px; border: 1px solid #2a3048; background: #161925; color: #94a3b8; font-size: 12px; cursor: pointer; transition: all .15s; font-family: inherit; font-weight: 500; }
        .cmd-btn:hover { background: #1e2a40; color: #60a5fa; border-color: #3b5499; }
        .cmd-btn.danger:hover { background: #2d1a1a; color: #f87171; border-color: #5c2525; }
        .stat-card { background: #161925; border-radius: 12px; padding: 20px 22px; border: 1px solid #1e2130; flex: 1; }
        .policy-card { background: #161925; border-radius: 12px; padding: 18px 20px; border: 1px solid #1e2130; margin-bottom: 14px; }
        input[type=text], select { background: #161925; border: 1px solid #2a3048; color: #e2e8f0; padding: 8px 14px; border-radius: 8px; font-size: 13px; font-family: inherit; outline: none; }
        input[type=text]:focus, select:focus { border-color: #3b5499; }
        select option { background: #161925; }
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,.7); display: flex; align-items: center; justify-content: center; z-index: 100; }
        .modal { background: #161925; border: 1px solid #2a3048; border-radius: 16px; padding: 28px 32px; width: 400px; max-width: 95vw; }
        .tag { display: inline-block; padding: 2px 10px; border-radius: 20px; font-size: 11px; font-weight: 500; }
        .progress-bar { height: 5px; border-radius: 3px; background: #2a3048; overflow: hidden; }
        .progress-fill { height: 100%; border-radius: 3px; transition: width .4s; }
      `}</style>

      {/* Sidebar + Header Layout */}
      <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>

        {/* Sidebar */}
        <div style={{ width: 220, background: "#0d0f18", borderRight: "1px solid #1e2130", display: "flex", flexDirection: "column", flexShrink: 0 }}>
          <div style={{ padding: "22px 20px 18px", borderBottom: "1px solid #1e2130" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #3b5bdb, #228be6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700 }}>M</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9" }}>MDM Konsol</div>
                <div style={{ fontSize: 11, color: "#64748b" }}>v1.0 Enterprise</div>
              </div>
            </div>
          </div>

          <nav style={{ padding: "12px 10px", flex: 1 }}>
            {[
              { id: "overview", icon: "⬡", label: "Genel Bakış" },
              { id: "devices", icon: "📱", label: "Cihazlar" },
              { id: "policies", icon: "🛡️", label: "Politikalar" },
              { id: "apps", icon: "📦", label: "Uygulamalar" },
              { id: "logs", icon: "📋", label: "Komut Geçmişi" },
            ].map(item => (
              <button key={item.id} onClick={() => setTab(item.id)}
                style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "9px 12px", borderRadius: 8, border: "none", background: tab === item.id ? "#1e2340" : "transparent", color: tab === item.id ? "#60a5fa" : "#8892a4", fontSize: 13, fontFamily: "inherit", fontWeight: 500, cursor: "pointer", marginBottom: 2, textAlign: "left", transition: "all .15s" }}>
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                {item.label}
                {item.id === "devices" && <span style={{ marginLeft: "auto", background: "#1e2a40", color: "#60a5fa", fontSize: 11, padding: "1px 7px", borderRadius: 10 }}>{stats.total}</span>}
              </button>
            ))}
          </nav>

          <div style={{ padding: "14px 16px", borderTop: "1px solid #1e2130" }}>
            <div style={{ fontSize: 11, color: "#64748b", marginBottom: 6 }}>Sistem Durumu</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 6px #22c55e" }}></div>
              <span style={{ fontSize: 12, color: "#94a3b8" }}>API Çevrimiçi</span>
            </div>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 8 }}>admin@sirket.com.tr</div>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column" }}>
          {/* Header */}
          <div style={{ padding: "16px 28px", borderBottom: "1px solid #1e2130", background: "#0d0f18", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 600, color: "#f1f5f9" }}>
                {{ overview: "Genel Bakış", devices: "Cihaz Yönetimi", policies: "Politika Yönetimi", apps: "Uygulama Yönetimi", logs: "Komut Geçmişi" }[tab]}
              </div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>Son güncelleme: {new Date().toLocaleString("tr-TR")}</div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              {stats.noncompliant > 0 && (
                <div style={{ background: "#2d1a1a", border: "1px solid #5c2525", borderRadius: 8, padding: "6px 14px", fontSize: 12, color: "#f87171" }}>
                  ⚠️ {stats.noncompliant} uyumsuz cihaz
                </div>
              )}
              <button onClick={() => showToast("Cihaz listesi yenilendi")} style={{ background: "#1e2130", border: "1px solid #2a3048", borderRadius: 8, padding: "7px 16px", color: "#94a3b8", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>🔄 Yenile</button>
            </div>
          </div>

          <div style={{ padding: 28, flex: 1 }}>

            {/* OVERVIEW */}
            {tab === "overview" && (
              <div>
                <div style={{ display: "flex", gap: 16, marginBottom: 28 }}>
                  {[
                    { label: "Toplam Cihaz", val: stats.total, color: "#60a5fa", icon: "📱" },
                    { label: "Çevrimiçi", val: stats.online, color: "#22c55e", icon: "🟢" },
                    { label: "Çevrimdışı", val: stats.offline, color: "#6b7280", icon: "⚫" },
                    { label: "Uyumsuz", val: stats.noncompliant, color: "#f87171", icon: "⚠️" },
                    { label: "Kilitli", val: stats.locked, color: "#f59e0b", icon: "🔒" },
                  ].map(s => (
                    <div key={s.label} className="stat-card" style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
                      <div style={{ fontSize: 32, fontWeight: 700, color: s.color, fontFamily: "'DM Mono', monospace" }}>{s.val}</div>
                      <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                  {/* Recent Devices */}
                  <div style={{ background: "#161925", borderRadius: 14, border: "1px solid #1e2130", padding: 20 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9", marginBottom: 16 }}>Son Aktif Cihazlar</div>
                    {devices.filter(d => d.status === "online").slice(0, 4).map(d => (
                      <div key={d.id} onClick={() => { setTab("devices"); setSelectedDevice(d); }}
                        style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid #1e2130", cursor: "pointer" }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: "#1e2340", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📱</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 500, color: "#e2e8f0" }}>{d.name}</div>
                          <div style={{ fontSize: 11, color: "#64748b" }}>{d.user} · {d.location}</div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ width: 7, height: 7, borderRadius: "50%", background: statusColor(d.status) }}></div>
                          <span style={{ fontSize: 11, color: "#64748b" }}>{d.lastSeen}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Compliance */}
                  <div style={{ background: "#161925", borderRadius: 14, border: "1px solid #1e2130", padding: 20 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9", marginBottom: 16 }}>Uyumluluk Özeti</div>
                    {[
                      { label: "Uyumlu", val: devices.filter(d => d.compliance).length, color: "#22c55e" },
                      { label: "Uyumsuz", val: devices.filter(d => !d.compliance).length, color: "#f87171" },
                    ].map(item => (
                      <div key={item.label} style={{ marginBottom: 16 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                          <span style={{ fontSize: 13, color: "#94a3b8" }}>{item.label}</span>
                          <span style={{ fontSize: 13, fontWeight: 600, color: item.color, fontFamily: "monospace" }}>{item.val} / {devices.length}</span>
                        </div>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${(item.val / devices.length) * 100}%`, background: item.color }} />
                        </div>
                      </div>
                    ))}
                    <div style={{ marginTop: 20 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#f1f5f9", marginBottom: 12 }}>Platform Dağılımı</div>
                      {[
                        { label: "Android 14", val: 3, color: "#60a5fa" },
                        { label: "Android 13", val: 2, color: "#818cf8" },
                        { label: "Android 12", val: 1, color: "#a78bfa" },
                      ].map(item => (
                        <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                          <div style={{ width: 10, height: 10, borderRadius: 2, background: item.color, flexShrink: 0 }}></div>
                          <span style={{ fontSize: 12, color: "#94a3b8", flex: 1 }}>{item.label}</span>
                          <span style={{ fontSize: 12, fontFamily: "monospace", color: item.color }}>{item.val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* DEVICES */}
            {tab === "devices" && (
              <div style={{ display: "flex", gap: 20 }}>
                {/* Device List */}
                <div style={{ flex: 1 }}>
                  {/* Filters */}
                  <div style={{ display: "flex", gap: 12, marginBottom: 18 }}>
                    <input type="text" placeholder="🔍 Cihaz, kullanıcı veya konum ara..." value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)} style={{ flex: 1 }} />
                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                      <option value="all">Tüm Durumlar</option>
                      <option value="online">Çevrimiçi</option>
                      <option value="offline">Çevrimdışı</option>
                      <option value="locked">Kilitli</option>
                    </select>
                  </div>

                  {/* Table Header */}
                  <div className="device-row" style={{ background: "#0d0f18", color: "#64748b", fontWeight: 600, fontSize: 11, letterSpacing: "0.05em", textTransform: "uppercase", cursor: "default", borderRadius: "10px 10px 0 0", border: "1px solid #1e2130", borderBottom: "none" }}>
                    <span>Cihaz / Kullanıcı</span>
                    <span>Model / OS</span>
                    <span>Durum</span>
                    <span>Batarya</span>
                    <span>Depolama</span>
                    <span>Politika</span>
                    <span>İşlem</span>
                  </div>

                  <div style={{ border: "1px solid #1e2130", borderRadius: "0 0 10px 10px", overflow: "hidden" }}>
                    {filteredDevices.map(device => (
                      <div key={device.id} className={`device-row ${selectedDevice?.id === device.id ? "selected" : ""}`}
                        onClick={() => setSelectedDevice(device)}>
                        <div>
                          <div style={{ fontWeight: 500, color: "#e2e8f0", fontSize: 13 }}>{device.name}</div>
                          <div style={{ color: "#64748b", fontSize: 11 }}>{device.user}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 12, color: "#94a3b8" }}>{device.model}</div>
                          <div style={{ fontSize: 11, color: "#64748b" }}>{device.os}</div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ width: 7, height: 7, borderRadius: "50%", background: statusColor(device.status), boxShadow: device.status === "online" ? `0 0 5px ${statusColor(device.status)}` : "none", flexShrink: 0 }}></div>
                          <span style={{ fontSize: 12, color: statusColor(device.status) }}>{statusLabel(device.status)}</span>
                        </div>
                        <div>
                          <div style={{ fontSize: 12, color: device.battery < 20 ? "#f87171" : "#94a3b8", fontFamily: "monospace" }}>%{device.battery}</div>
                          <div className="progress-bar" style={{ width: 60, marginTop: 4 }}>
                            <div className="progress-fill" style={{ width: `${device.battery}%`, background: device.battery < 20 ? "#ef4444" : device.battery < 50 ? "#f59e0b" : "#22c55e" }} />
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: 12, color: device.storage > 75 ? "#f87171" : "#94a3b8", fontFamily: "monospace" }}>%{device.storage}</div>
                          <div className="progress-bar" style={{ width: 60, marginTop: 4 }}>
                            <div className="progress-fill" style={{ width: `${device.storage}%`, background: device.storage > 75 ? "#ef4444" : "#60a5fa" }} />
                          </div>
                        </div>
                        <div>
                          <span className="tag" style={{ background: "#1e2340", color: "#60a5fa", fontSize: 11 }}>{device.policy}</span>
                        </div>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button className="cmd-btn" onClick={e => { e.stopPropagation(); setPendingCommand({ device, cmd: "lock" }); setShowCommandModal(true); }} title="Kilitle">🔒</button>
                          <button className="cmd-btn danger" onClick={e => { e.stopPropagation(); setPendingCommand({ device, cmd: "wipe" }); setShowCommandModal(true); }} title="Sil">🗑️</button>
                        </div>
                      </div>
                    ))}
                    {filteredDevices.length === 0 && (
                      <div style={{ padding: "40px", textAlign: "center", color: "#64748b", background: "#0d0f18" }}>Sonuç bulunamadı</div>
                    )}
                  </div>
                </div>

                {/* Device Detail Panel */}
                {selectedDevice && (
                  <div style={{ width: 300, background: "#161925", borderRadius: 14, border: "1px solid #1e2130", padding: 22, flexShrink: 0, alignSelf: "flex-start" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9" }}>Cihaz Detayı</div>
                      <button onClick={() => setSelectedDevice(null)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: 16 }}>✕</button>
                    </div>

                    <div style={{ textAlign: "center", marginBottom: 20 }}>
                      <div style={{ fontSize: 48, marginBottom: 8 }}>📱</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9" }}>{selectedDevice.name}</div>
                      <div style={{ fontSize: 12, color: "#64748b" }}>{selectedDevice.user}</div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: statusColor(selectedDevice.status), boxShadow: selectedDevice.status === "online" ? `0 0 6px ${statusColor(selectedDevice.status)}` : "none" }}></div>
                        <span style={{ fontSize: 12, color: statusColor(selectedDevice.status) }}>{statusLabel(selectedDevice.status)}</span>
                      </div>
                    </div>

                    {[
                      ["Model", selectedDevice.model],
                      ["OS", selectedDevice.os],
                      ["Politika", selectedDevice.policy],
                      ["Konum", selectedDevice.location],
                      ["Kayıt Tarihi", selectedDevice.enrolled],
                      ["Uygulamalar", `${selectedDevice.apps} adet`],
                      ["Son Görülme", selectedDevice.lastSeen],
                    ].map(([k, v]) => (
                      <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #1e2130", fontSize: 12 }}>
                        <span style={{ color: "#64748b" }}>{k}</span>
                        <span style={{ color: "#94a3b8", fontFamily: "monospace" }}>{v}</span>
                      </div>
                    ))}

                    <div style={{ marginTop: 18 }}>
                      <div style={{ fontSize: 11, color: "#64748b", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>Uzak Komutlar</div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        {[
                          { cmd: "lock", label: "🔒 Kilitle", danger: false },
                          { cmd: "unlock", label: "🔓 Aç", danger: false },
                          { cmd: "reboot", label: "🔁 Yeniden Başlat", danger: false },
                          { cmd: "locate", label: "📍 Konum Al", danger: false },
                          { cmd: "push_policy", label: "🛡️ Politika Gönder", danger: false },
                          { cmd: "wipe", label: "🗑️ Fabrika Sıfırla", danger: true },
                        ].map(({ cmd, label, danger }) => (
                          <button key={cmd} className={`cmd-btn ${danger ? "danger" : ""}`}
                            style={{ fontSize: 11, padding: "7px 4px", textAlign: "center" }}
                            onClick={() => { setPendingCommand({ device: selectedDevice, cmd }); setShowCommandModal(true); }}>
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* POLICIES */}
            {tab === "policies" && (
              <div>
                {MOCK_POLICIES.map(policy => (
                  <div key={policy.id} className="policy-card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 600, color: "#f1f5f9" }}>{policy.name}</div>
                        <div style={{ fontSize: 12, color: "#64748b", marginTop: 3 }}>Oluşturulma: {policy.created} · {policy.devices} cihaz</div>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button className="cmd-btn" style={{ fontSize: 12 }}>✏️ Düzenle</button>
                        <button className="cmd-btn" style={{ fontSize: 12 }} onClick={() => showToast(`"${policy.name}" politikası ${policy.devices} cihaza gönderildi`)}>📤 Gönder</button>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {policy.rules.map(rule => (
                        <span key={rule} className="tag" style={{ background: "#1e2340", color: "#94a3b8", padding: "4px 12px", fontSize: 12 }}>
                          ✓ {rule}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
                <button onClick={() => showToast("Yeni politika oluşturma ekranı (yakında)")} style={{ background: "#1e2130", border: "1px dashed #2a3048", borderRadius: 12, padding: "16px 24px", color: "#64748b", fontSize: 13, cursor: "pointer", width: "100%", fontFamily: "inherit" }}>
                  + Yeni Politika Oluştur
                </button>
              </div>
            )}

            {/* APPS */}
            {tab === "apps" && (
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                  {MOCK_APPS.map(app => (
                    <div key={app.id} style={{ background: "#161925", borderRadius: 14, border: "1px solid #1e2130", padding: 20 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: "#1e2340", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>📦</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9" }}>{app.name}</div>
                          <div style={{ fontSize: 10, color: "#64748b", fontFamily: "monospace" }}>{app.package}</div>
                        </div>
                        {app.required && <span className="tag" style={{ background: "#1a2d1a", color: "#4ade80", fontSize: 10 }}>Zorunlu</span>}
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 8 }}>
                        <span style={{ color: "#64748b" }}>Sürüm: <span style={{ color: "#94a3b8", fontFamily: "monospace" }}>{app.version}</span></span>
                        <span style={{ color: "#64748b" }}>{app.installed}/{stats.total} cihaz</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${(app.installed / stats.total) * 100}%`, background: "#60a5fa" }} />
                      </div>
                      <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                        <button className="cmd-btn" style={{ flex: 1, fontSize: 11 }} onClick={() => showToast(`"${app.name}" güncelleme gönderildi`)}>📤 Zorla Yükle</button>
                        <button className="cmd-btn danger" style={{ fontSize: 11 }} onClick={() => showToast(`"${app.name}" kaldırma isteği gönderildi`)}>🗑️</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* LOGS */}
            {tab === "logs" && (
              <div style={{ background: "#161925", borderRadius: 14, border: "1px solid #1e2130", overflow: "hidden" }}>
                <div style={{ padding: "16px 20px", borderBottom: "1px solid #1e2130", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9" }}>Komut Geçmişi</span>
                  <span style={{ fontSize: 12, color: "#64748b" }}>{commandLog.length} kayıt</span>
                </div>
                {commandLog.length === 0 ? (
                  <div style={{ padding: "60px 20px", textAlign: "center", color: "#64748b", fontSize: 13 }}>
                    Henüz komut gönderilmedi.<br />
                    <span style={{ fontSize: 12 }}>Cihazlar sekmesinden uzak komut göndererek başlayın.</span>
                  </div>
                ) : commandLog.map(log => (
                  <div key={log.id} style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 20px", borderBottom: "1px solid #1e2130", fontSize: 13 }}>
                    <span style={{ fontSize: 18 }}>✅</span>
                    <div style={{ flex: 1 }}>
                      <span style={{ color: "#e2e8f0", fontWeight: 500 }}>{log.cmd}</span>
                      <span style={{ color: "#64748b" }}> → {log.device}</span>
                    </div>
                    <span style={{ fontSize: 11, color: "#64748b", fontFamily: "monospace" }}>{log.time}</span>
                    <span className="tag" style={{ background: "#1a2d1a", color: "#4ade80", fontSize: 11 }}>{log.status}</span>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Command Confirm Modal */}
      {showCommandModal && pendingCommand && (
        <div className="modal-overlay" onClick={() => { setShowCommandModal(false); setPendingCommand(null); }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 16, fontWeight: 600, color: "#f1f5f9", marginBottom: 10 }}>
              {pendingCommand.cmd === "wipe" ? "⚠️ Tehlikeli İşlem" : "Komutu Onayla"}
            </div>
            <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 22, lineHeight: 1.6 }}>
              <strong style={{ color: "#e2e8f0" }}>{pendingCommand.device.name}</strong> cihazına{" "}
              {pendingCommand.cmd === "wipe"
                ? <span style={{ color: "#f87171" }}>fabrika ayarlarına sıfırlama komutu gönderilecek. Tüm veriler silinecek!</span>
                : pendingCommand.cmd === "lock"
                  ? "kilitleme komutu gönderilecek."
                  : `"${pendingCommand.cmd}" komutu gönderilecek.`
              }
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button className="cmd-btn" onClick={() => { setShowCommandModal(false); setPendingCommand(null); }}>İptal</button>
              <button onClick={() => sendCommand(pendingCommand.device, pendingCommand.cmd)}
                style={{ background: pendingCommand.cmd === "wipe" ? "#2d1a1a" : "#1e2a40", border: `1px solid ${pendingCommand.cmd === "wipe" ? "#7c2626" : "#3b5499"}`, borderRadius: 8, padding: "8px 20px", color: pendingCommand.cmd === "wipe" ? "#f87171" : "#60a5fa", fontSize: 13, cursor: "pointer", fontFamily: "inherit", fontWeight: 500 }}>
                {pendingCommand.cmd === "wipe" ? "🗑️ Evet, Sıfırla" : "✅ Onayla"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: 28, right: 28, background: "#1e2340", border: "1px solid #3b5499", borderRadius: 10, padding: "12px 20px", color: "#60a5fa", fontSize: 13, zIndex: 200, maxWidth: 350, boxShadow: "0 8px 30px rgba(0,0,0,.5)" }}>
          ✅ {toast.msg}
        </div>
      )}
    </div>
  );
}
