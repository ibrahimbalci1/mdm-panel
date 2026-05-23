import { useState, useEffect } from "react";

const API_URL = "https://mdm-backend-rk5x.onrender.com/api/v1";

const MOCK_APPS = [
  { id: "a001", name: "Şirket Portalı", package_name: "com.sirket.portal", version: "3.2.1", install_count: 0, is_required: true },
  { id: "a002", name: "Teams", package_name: "com.microsoft.teams", version: "1416/1.0.0", install_count: 0, is_required: true },
  { id: "a003", name: "Google Chrome", package_name: "com.android.chrome", version: "120.0.6099", install_count: 0, is_required: false },
];

const statusColor = (s) => ({ online: "#22c55e", offline: "#6b7280", locked: "#f59e0b", wiped: "#ef4444", pending: "#818cf8" }[s] || "#6b7280");
const statusLabel = (s) => ({ online: "Çevrimiçi", offline: "Çevrimdışı", locked: "Kilitli", wiped: "Silindi", pending: "Bekliyor" }[s] || s);

export default function MDMDashboard() {
  const [token, setToken] = useState(() => localStorage.getItem("mdm_token") || null);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [tab, setTab] = useState("overview");
  const [devices, setDevices] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [apps, setApps] = useState(MOCK_APPS);
  const [stats, setStats] = useState({ total_devices: 0, online_devices: 0, offline_devices: 0, locked_devices: 0, non_compliant_devices: 0, pending_commands: 0, total_policies: 0, total_managed_apps: 0 });
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [commandLog, setCommandLog] = useState([]);
  const [showCommandModal, setShowCommandModal] = useState(false);
  const [pendingCommand, setPendingCommand] = useState(null);
  const [toast, setToast] = useState(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const login = async () => {
    setLoginLoading(true);
    setLoginError("");
    try {
      const resp = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `username=${encodeURIComponent(loginEmail)}&password=${encodeURIComponent(loginPassword)}`,
      });
      const data = await resp.json();
      if (resp.ok) {
        localStorage.setItem("mdm_token", data.access_token);
        setToken(data.access_token);
      } else {
        setLoginError("E-posta veya şifre hatalı");
      }
    } catch {
      setLoginError("Sunucuya bağlanılamadı. Lütfen bekleyin (~60 sn soğuk başlatma)");
    }
    setLoginLoading(false);
  };

  const logout = () => {
    localStorage.removeItem("mdm_token");
    setToken(null);
    setDevices([]);
    setQrData(null);
  };

  const authHeaders = () => ({ Authorization: `Bearer ${token}`, "Content-Type": "application/json" });

  const fetchAll = async () => {
    setApiLoading(true);
    try {
      const [devResp, statsResp, polResp] = await Promise.all([
        fetch(`${API_URL}/devices/`, { headers: authHeaders() }),
        fetch(`${API_URL}/dashboard/stats`, { headers: authHeaders() }),
        fetch(`${API_URL}/policies/`, { headers: authHeaders() }),
      ]);
      if (devResp.status === 401) { logout(); return; }
      if (devResp.ok) setDevices(await devResp.json());
      if (statsResp.ok) setStats(await statsResp.json());
      if (polResp.ok) setPolicies(await polResp.json());
    } catch { showToast("Veri yüklenemedi", "error"); }
    setApiLoading(false);
  };

  const generateQr = async (policyId = null) => {
    setQrLoading(true);
    setQrData(null);
    try {
      const url = policyId
        ? `${API_URL}/enrollment/qr?policy_id=${policyId}`
        : `${API_URL}/enrollment/qr`;
      const resp = await fetch(url, { headers: authHeaders() });
      if (resp.ok) {
        const data = await resp.json();
        setQrData(data);
        showToast("QR kod oluşturuldu");
      } else {
        showToast("QR oluşturulamadı", "error");
      }
    } catch {
      showToast("Bağlantı hatası", "error");
    }
    setQrLoading(false);
  };

  useEffect(() => { if (token) fetchAll(); }, [token]);

  const sendCommand = async (device, cmd) => {
    const cmdMap = { lock: "Cihaz Kilitle", unlock: "Kilidi Aç", wipe: "Fabrika Sıfırla", reboot: "Yeniden Başlat", locate: "Konum Al", push_policy: "Politika Gönder" };
    setShowCommandModal(false);
    setPendingCommand(null);
    try {
      const resp = await fetch(`${API_URL}/commands/device/${device.id}`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ command_type: cmd, payload: {} }),
      });
      const success = resp.ok;
      setCommandLog(prev => [{
        id: Date.now(),
        device: device.name || device.model,
        cmd: cmdMap[cmd] || cmd,
        time: new Date().toLocaleTimeString("tr-TR"),
        status: success ? "Gönderildi" : "Başarısız",
        ok: success,
      }, ...prev.slice(0, 19)]);
      if (success) {
        showToast(`"${cmdMap[cmd]}" komutu gönderildi`);
        if (cmd === "lock") setDevices(prev => prev.map(d => d.id === device.id ? { ...d, status: "locked" } : d));
        if (cmd === "wipe") setDevices(prev => prev.map(d => d.id === device.id ? { ...d, status: "wiped" } : d));
      } else {
        showToast("Komut gönderilemedi", "error");
      }
    } catch { showToast("Bağlantı hatası", "error"); }
  };

  const filteredDevices = devices.filter(d => {
    const name = (d.name || `${d.manufacturer} ${d.model}`).toLowerCase();
    const owner = (d.owner_name || "").toLowerCase();
    const matchSearch = name.includes(searchQuery.toLowerCase()) || owner.includes(searchQuery.toLowerCase());
    const matchStatus = filterStatus === "all" || d.status === filterStatus;
    return matchSearch && matchStatus;
  });

  // ─── Giriş Ekranı ─────────────────────────────────────────────────────────
  if (!token) return (
    <div style={{ fontFamily: "'DM Sans', system-ui", background: "#0f1117", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap'); * { box-sizing: border-box; margin: 0; padding: 0; }`}</style>
      <div style={{ background: "#161925", border: "1px solid #1e2130", borderRadius: 16, padding: "44px 48px", width: 400, maxWidth: "95vw" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: "linear-gradient(135deg,#3b5bdb,#228be6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 700, color: "#fff", margin: "0 auto 16px" }}>M</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#f1f5f9" }}>MDM Konsol</div>
          <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>Yönetim paneline giriş yapın</div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>E-posta</div>
          <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
            onKeyDown={e => e.key === "Enter" && login()} placeholder="admin@sirket.com"
            style={{ width: "100%", background: "#0f1117", border: "1px solid #2a3048", borderRadius: 8, padding: "10px 14px", color: "#e2e8f0", fontSize: 14, fontFamily: "inherit", outline: "none" }} />
        </div>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>Şifre</div>
          <input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && login()} placeholder="••••••••"
            style={{ width: "100%", background: "#0f1117", border: "1px solid #2a3048", borderRadius: 8, padding: "10px 14px", color: "#e2e8f0", fontSize: 14, fontFamily: "inherit", outline: "none" }} />
        </div>
        {loginError && <div style={{ color: "#f87171", fontSize: 12, marginBottom: 16, textAlign: "center", background: "#2d1a1a", padding: "8px 12px", borderRadius: 8 }}>{loginError}</div>}
        <button onClick={login} disabled={loginLoading}
          style={{ width: "100%", background: loginLoading ? "#2a3048" : "#3b5499", border: "none", borderRadius: 8, padding: "12px", color: "#fff", fontSize: 14, fontWeight: 600, cursor: loginLoading ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
          {loginLoading ? "⏳ Bağlanıyor..." : "Giriş Yap"}
        </button>
        <div style={{ textAlign: "center", marginTop: 16, fontSize: 11, color: "#475569" }}>İlk açılışta ~60 sn uyandırma süresi olabilir</div>
      </div>
    </div>
  );

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: "#0f1117", minHeight: "100vh", color: "#e2e8f0" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #1e2130; }
        ::-webkit-scrollbar-thumb { background: #3a3f52; border-radius: 3px; }
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

      <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
        {/* Sidebar */}
        <div style={{ width: 220, background: "#0d0f18", borderRight: "1px solid #1e2130", display: "flex", flexDirection: "column", flexShrink: 0 }}>
          <div style={{ padding: "22px 20px 18px", borderBottom: "1px solid #1e2130" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#3b5bdb,#228be6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700, color: "#fff" }}>M</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9" }}>MDM Konsol</div>
                <div style={{ fontSize: 11, color: "#64748b" }}>v1.0 Enterprise</div>
              </div>
            </div>
          </div>

          <nav style={{ padding: "12px 10px", flex: 1 }}>
            {[
              { id: "overview", icon: "⬡",  label: "Genel Bakış" },
              { id: "devices",  icon: "📱", label: "Cihazlar",       badge: stats.total_devices || null },
              { id: "policies", icon: "🛡️", label: "Politikalar" },
              { id: "apps",     icon: "📦", label: "Uygulamalar" },
              { id: "qr",       icon: "📷", label: "QR Kayıt" },
              { id: "logs",     icon: "📋", label: "Komut Geçmişi",  badge: commandLog.length || null },
            ].map(item => (
              <button key={item.id} onClick={() => setTab(item.id)}
                style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "9px 12px", borderRadius: 8, border: "none", background: tab === item.id ? "#1e2340" : "transparent", color: tab === item.id ? "#60a5fa" : "#8892a4", fontSize: 13, fontFamily: "inherit", fontWeight: 500, cursor: "pointer", marginBottom: 2, textAlign: "left", transition: "all .15s" }}>
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                {item.label}
                {item.badge ? <span style={{ marginLeft: "auto", background: "#1e2a40", color: "#60a5fa", fontSize: 11, padding: "1px 7px", borderRadius: 10 }}>{item.badge}</span> : null}
              </button>
            ))}
          </nav>

          <div style={{ padding: "14px 16px", borderTop: "1px solid #1e2130" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 6px #22c55e" }}></div>
              <span style={{ fontSize: 12, color: "#94a3b8" }}>API Çevrimiçi</span>
              {apiLoading && <span style={{ fontSize: 11, color: "#64748b", marginLeft: "auto" }}>⟳</span>}
            </div>
            <button onClick={fetchAll} style={{ background: "#1e2130", border: "1px solid #2a3048", borderRadius: 6, padding: "5px 10px", color: "#64748b", fontSize: 11, cursor: "pointer", fontFamily: "inherit", width: "100%", marginBottom: 6 }}>🔄 Yenile</button>
            <button onClick={logout} style={{ background: "none", border: "1px solid #2a3048", borderRadius: 6, padding: "5px 10px", color: "#64748b", fontSize: 11, cursor: "pointer", fontFamily: "inherit", width: "100%" }}>Çıkış Yap</button>
          </div>
        </div>

        {/* Main */}
        <div style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "16px 28px", borderBottom: "1px solid #1e2130", background: "#0d0f18", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 600, color: "#f1f5f9" }}>
                {{ overview: "Genel Bakış", devices: "Cihaz Yönetimi", policies: "Politika Yönetimi", apps: "Uygulama Yönetimi", qr: "QR Kayıt", logs: "Komut Geçmişi" }[tab]}
              </div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>Son güncelleme: {new Date().toLocaleString("tr-TR")}</div>
            </div>
            {stats.non_compliant_devices > 0 && (
              <div style={{ background: "#2d1a1a", border: "1px solid #5c2525", borderRadius: 8, padding: "6px 14px", fontSize: 12, color: "#f87171" }}>
                ⚠️ {stats.non_compliant_devices} uyumsuz cihaz
              </div>
            )}
          </div>

          <div style={{ padding: 28, flex: 1 }}>

            {/* OVERVIEW */}
            {tab === "overview" && (
              <div>
                <div style={{ display: "flex", gap: 16, marginBottom: 28 }}>
                  {[
                    { label: "Toplam Cihaz",  val: stats.total_devices,         color: "#60a5fa", icon: "📱" },
                    { label: "Çevrimiçi",     val: stats.online_devices,        color: "#22c55e", icon: "🟢" },
                    { label: "Çevrimdışı",    val: stats.offline_devices,       color: "#6b7280", icon: "⚫" },
                    { label: "Uyumsuz",       val: stats.non_compliant_devices, color: "#f87171", icon: "⚠️" },
                    { label: "Kilitli",       val: stats.locked_devices,        color: "#f59e0b", icon: "🔒" },
                  ].map(s => (
                    <div key={s.label} className="stat-card" style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
                      <div style={{ fontSize: 32, fontWeight: 700, color: s.color, fontFamily: "'DM Mono', monospace" }}>{s.val}</div>
                      <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                  <div style={{ background: "#161925", borderRadius: 14, border: "1px solid #1e2130", padding: 20 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9", marginBottom: 16 }}>Son Aktif Cihazlar</div>
                    {devices.filter(d => d.status === "online").slice(0, 5).map(d => (
                      <div key={d.id} onClick={() => { setTab("devices"); setSelectedDevice(d); }}
                        style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid #1e2130", cursor: "pointer" }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: "#1e2340", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📱</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 500, color: "#e2e8f0" }}>{d.name || `${d.manufacturer} ${d.model}`}</div>
                          <div style={{ fontSize: 11, color: "#64748b" }}>{d.owner_name || "—"}</div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ width: 7, height: 7, borderRadius: "50%", background: statusColor(d.status) }}></div>
                          <span style={{ fontSize: 11, color: "#64748b" }}>{statusLabel(d.status)}</span>
                        </div>
                      </div>
                    ))}
                    {devices.filter(d => d.status === "online").length === 0 && (
                      <div style={{ color: "#64748b", fontSize: 13, padding: "20px 0", textAlign: "center" }}>Çevrimiçi cihaz yok</div>
                    )}
                  </div>
                  <div style={{ background: "#161925", borderRadius: 14, border: "1px solid #1e2130", padding: 20 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9", marginBottom: 16 }}>Uyumluluk & İstatistik</div>
                    {[
                      { label: "Uyumlu",  val: devices.filter(d => d.is_compliant !== false).length, color: "#22c55e" },
                      { label: "Uyumsuz", val: devices.filter(d => d.is_compliant === false).length,  color: "#f87171" },
                    ].map(item => (
                      <div key={item.label} style={{ marginBottom: 16 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                          <span style={{ fontSize: 13, color: "#94a3b8" }}>{item.label}</span>
                          <span style={{ fontSize: 13, fontWeight: 600, color: item.color, fontFamily: "monospace" }}>{item.val} / {devices.length || 0}</span>
                        </div>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: devices.length ? `${(item.val / devices.length) * 100}%` : "0%", background: item.color }} />
                        </div>
                      </div>
                    ))}
                    <div style={{ marginTop: 16, padding: 14, background: "#0f1117", borderRadius: 10 }}>
                      <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>Bekleyen Komutlar</div>
                      <div style={{ fontSize: 28, fontWeight: 700, color: "#f59e0b", fontFamily: "monospace" }}>{stats.pending_commands}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* DEVICES */}
            {tab === "devices" && (
              <div style={{ display: "flex", gap: 20 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 12, marginBottom: 18 }}>
                    <input type="text" placeholder="🔍 Cihaz veya kullanıcı ara..." value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)} style={{ flex: 1 }} />
                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                      <option value="all">Tüm Durumlar</option>
                      <option value="online">Çevrimiçi</option>
                      <option value="offline">Çevrimdışı</option>
                      <option value="locked">Kilitli</option>
                    </select>
                  </div>
                  <div className="device-row" style={{ background: "#0d0f18", color: "#64748b", fontWeight: 600, fontSize: 11, letterSpacing: "0.05em", textTransform: "uppercase", cursor: "default", borderRadius: "10px 10px 0 0", border: "1px solid #1e2130", borderBottom: "none" }}>
                    <span>Cihaz / Kullanıcı</span><span>Model / OS</span><span>Durum</span><span>Batarya</span><span>Depolama</span><span>Kayıt</span><span>İşlem</span>
                  </div>
                  <div style={{ border: "1px solid #1e2130", borderRadius: "0 0 10px 10px", overflow: "hidden" }}>
                    {filteredDevices.length === 0 ? (
                      <div style={{ padding: "50px", textAlign: "center", color: "#64748b", background: "#0d0f18", fontSize: 13 }}>
                        {devices.length === 0 ? "Kayıtlı cihaz yok. QR Kayıt sekmesinden cihaz ekleyin." : "Sonuç bulunamadı"}
                      </div>
                    ) : filteredDevices.map(device => (
                      <div key={device.id} className={`device-row ${selectedDevice?.id === device.id ? "selected" : ""}`}
                        onClick={() => setSelectedDevice(device)}>
                        <div>
                          <div style={{ fontWeight: 500, color: "#e2e8f0", fontSize: 13 }}>{device.name || `${device.manufacturer} ${device.model}`}</div>
                          <div style={{ color: "#64748b", fontSize: 11 }}>{device.owner_name || "—"}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 12, color: "#94a3b8" }}>{device.model}</div>
                          <div style={{ fontSize: 11, color: "#64748b" }}>Android {device.android_version}</div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ width: 7, height: 7, borderRadius: "50%", background: statusColor(device.status), boxShadow: device.status === "online" ? `0 0 5px ${statusColor(device.status)}` : "none", flexShrink: 0 }}></div>
                          <span style={{ fontSize: 12, color: statusColor(device.status) }}>{statusLabel(device.status)}</span>
                        </div>
                        <div>
                          <div style={{ fontSize: 12, color: device.battery_level < 20 ? "#f87171" : "#94a3b8", fontFamily: "monospace" }}>%{device.battery_level}</div>
                          <div className="progress-bar" style={{ width: 60, marginTop: 4 }}>
                            <div className="progress-fill" style={{ width: `${device.battery_level}%`, background: device.battery_level < 20 ? "#ef4444" : device.battery_level < 50 ? "#f59e0b" : "#22c55e" }} />
                          </div>
                        </div>
                        <div style={{ fontSize: 12, color: "#94a3b8", fontFamily: "monospace" }}>{device.storage_used_gb}/{device.storage_total_gb} GB</div>
                        <div style={{ fontSize: 11, color: "#64748b" }}>{device.enrolled_at ? new Date(device.enrolled_at).toLocaleDateString("tr-TR") : "—"}</div>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button className="cmd-btn" onClick={e => { e.stopPropagation(); setPendingCommand({ device, cmd: "lock" }); setShowCommandModal(true); }} title="Kilitle">🔒</button>
                          <button className="cmd-btn danger" onClick={e => { e.stopPropagation(); setPendingCommand({ device, cmd: "wipe" }); setShowCommandModal(true); }} title="Sil">🗑️</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedDevice && (
                  <div style={{ width: 300, background: "#161925", borderRadius: 14, border: "1px solid #1e2130", padding: 22, flexShrink: 0, alignSelf: "flex-start" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9" }}>Cihaz Detayı</div>
                      <button onClick={() => setSelectedDevice(null)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: 16 }}>✕</button>
                    </div>
                    <div style={{ textAlign: "center", marginBottom: 20 }}>
                      <div style={{ fontSize: 48, marginBottom: 8 }}>📱</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9" }}>{selectedDevice.name || `${selectedDevice.manufacturer} ${selectedDevice.model}`}</div>
                      <div style={{ fontSize: 12, color: "#64748b" }}>{selectedDevice.owner_name || "—"}</div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: statusColor(selectedDevice.status) }}></div>
                        <span style={{ fontSize: 12, color: statusColor(selectedDevice.status) }}>{statusLabel(selectedDevice.status)}</span>
                      </div>
                    </div>
                    {[
                      ["Model",     selectedDevice.model],
                      ["Üretici",   selectedDevice.manufacturer],
                      ["Android",   selectedDevice.android_version],
                      ["Batarya",   `%${selectedDevice.battery_level}`],
                      ["Depolama",  `${selectedDevice.storage_used_gb}/${selectedDevice.storage_total_gb} GB`],
                      ["Politika",  selectedDevice.policy_name || "—"],
                      ["Uyumluluk", selectedDevice.is_compliant ? "✓ Uyumlu" : "✗ Uyumsuz"],
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
                          { cmd: "lock",        label: "🔒 Kilitle",         danger: false },
                          { cmd: "unlock",      label: "🔓 Aç",              danger: false },
                          { cmd: "reboot",      label: "🔁 Yeniden Başlat",  danger: false },
                          { cmd: "locate",      label: "📍 Konum Al",        danger: false },
                          { cmd: "push_policy", label: "🛡️ Politika Gönder", danger: false },
                          { cmd: "wipe",        label: "🗑️ Fabrika Sıfırla", danger: true },
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
                {policies.map(policy => (
                  <div key={policy.id} className="policy-card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 600, color: "#f1f5f9" }}>{policy.name}</div>
                        <div style={{ fontSize: 12, color: "#64748b", marginTop: 3 }}>{policy.device_count || 0} cihaz</div>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button className="cmd-btn" style={{ fontSize: 12 }} onClick={() => { setTab("qr"); generateQr(policy.id); }}>📷 QR Oluştur</button>
                        <button className="cmd-btn" style={{ fontSize: 12 }} onClick={() => showToast(`"${policy.name}" politikası gönderildi`)}>📤 Gönder</button>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {policy.rules && Object.entries(policy.rules).map(([k, v]) => (
                        <span key={k} className="tag" style={{ background: "#1e2340", color: "#94a3b8", padding: "4px 12px", fontSize: 12 }}>
                          ✓ {k}{typeof v !== "boolean" ? `: ${v}` : ""}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
                {policies.length === 0 && (
                  <div style={{ color: "#64748b", fontSize: 13, textAlign: "center", padding: "40px" }}>Politika yok.</div>
                )}
              </div>
            )}

            {/* APPS */}
            {tab === "apps" && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                {apps.map(app => (
                  <div key={app.id} style={{ background: "#161925", borderRadius: 14, border: "1px solid #1e2130", padding: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: "#1e2340", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>📦</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9" }}>{app.name}</div>
                        <div style={{ fontSize: 10, color: "#64748b", fontFamily: "monospace" }}>{app.package_name}</div>
                      </div>
                      {app.is_required && <span className="tag" style={{ background: "#1a2d1a", color: "#4ade80", fontSize: 10 }}>Zorunlu</span>}
                    </div>
                    <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>Sürüm: <span style={{ color: "#94a3b8", fontFamily: "monospace" }}>{app.version || "—"}</span></div>
                    <button className="cmd-btn" style={{ width: "100%", fontSize: 11, marginTop: 8 }} onClick={() => showToast(`"${app.name}" dağıtım isteği gönderildi`)}>📤 Dağıt</button>
                  </div>
                ))}
              </div>
            )}

            {/* QR KAYIT */}
            {tab === "qr" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: "#f1f5f9" }}>QR Kod ile Cihaz Kaydı</div>
                    <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>Telefonda MDM Agent'ı açın → QR Tara → Otomatik kayıt</div>
                  </div>
                  <button onClick={() => generateQr()} disabled={qrLoading}
                    style={{ background: "#3b5499", border: "none", borderRadius: 8, padding: "10px 20px", color: "#fff", fontSize: 13, cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>
                    {qrLoading ? "⏳ Oluşturuluyor..." : "🔄 Yeni QR Oluştur"}
                  </button>
                </div>

                {/* Politikaya göre QR butonları */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16, marginBottom: 28 }}>
                  <div style={{ background: "#161925", borderRadius: 14, border: "1px solid #1e2130", padding: 20 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9", marginBottom: 6 }}>Varsayılan Politika</div>
                    <div style={{ fontSize: 12, color: "#64748b", marginBottom: 16 }}>Temel kısıtlamalarla kayıt</div>
                    <button onClick={() => generateQr(null)} disabled={qrLoading}
                      style={{ background: "#1e2340", border: "1px solid #3b5499", borderRadius: 8, padding: "8px 16px", color: "#60a5fa", fontSize: 13, cursor: "pointer", fontFamily: "inherit", width: "100%" }}>
                      📷 QR Oluştur
                    </button>
                  </div>
                  {policies.map(policy => (
                    <div key={policy.id} style={{ background: "#161925", borderRadius: 14, border: "1px solid #1e2130", padding: 20 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9", marginBottom: 6 }}>{policy.name}</div>
                      <div style={{ fontSize: 12, color: "#64748b", marginBottom: 16 }}>{policy.device_count || 0} cihaz bu politikada</div>
                      <button onClick={() => generateQr(policy.id)} disabled={qrLoading}
                        style={{ background: "#1e2340", border: "1px solid #3b5499", borderRadius: 8, padding: "8px 16px", color: "#60a5fa", fontSize: 13, cursor: "pointer", fontFamily: "inherit", width: "100%" }}>
                        📷 QR Oluştur
                      </button>
                    </div>
                  ))}
                </div>

                {/* QR Görüntüle */}
                {qrData && (
                  <div style={{ background: "#161925", borderRadius: 14, border: "1px solid #1e2130", padding: 40, textAlign: "center" }}>
                    <div style={{ fontSize: 16, fontWeight: 600, color: "#f1f5f9", marginBottom: 6 }}>📷 Kayıt QR Kodu</div>
                    <div style={{ fontSize: 12, color: "#64748b", marginBottom: 28 }}>
                      Geçerlilik: {new Date(qrData.expires_at).toLocaleString("tr-TR")} (24 saat)
                    </div>
                    <div style={{ display: "inline-block", background: "white", padding: 16, borderRadius: 12 }}>
                      <img src={qrData.qr_image} alt="QR Kod" style={{ width: 240, height: 240, display: "block" }} />
                    </div>
                    <div style={{ marginTop: 24, fontSize: 13, color: "#64748b", lineHeight: 1.8 }}>
                      1. Telefonda <strong style={{ color: "#60a5fa" }}>MDM Agent</strong> uygulamasını aç<br />
                      2. <strong style={{ color: "#60a5fa" }}>"QR ile Kayıt"</strong> butonuna bas<br />
                      3. Kamerayı QR koda tut → Otomatik kayıt başlar
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* LOGS */}
            {tab === "logs" && (
              <div style={{ background: "#161925", borderRadius: 14, border: "1px solid #1e2130", overflow: "hidden" }}>
                <div style={{ padding: "16px 20px", borderBottom: "1px solid #1e2130", display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9" }}>Komut Geçmişi</span>
                  <span style={{ fontSize: 12, color: "#64748b" }}>{commandLog.length} kayıt</span>
                </div>
                {commandLog.length === 0 ? (
                  <div style={{ padding: "60px 20px", textAlign: "center", color: "#64748b", fontSize: 13 }}>
                    Henüz komut gönderilmedi.
                  </div>
                ) : commandLog.map(log => (
                  <div key={log.id} style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 20px", borderBottom: "1px solid #1e2130", fontSize: 13 }}>
                    <span style={{ fontSize: 18 }}>{log.ok ? "✅" : "❌"}</span>
                    <div style={{ flex: 1 }}>
                      <span style={{ color: "#e2e8f0", fontWeight: 500 }}>{log.cmd}</span>
                      <span style={{ color: "#64748b" }}> → {log.device}</span>
                    </div>
                    <span style={{ fontSize: 11, color: "#64748b", fontFamily: "monospace" }}>{log.time}</span>
                    <span className="tag" style={{ background: log.ok ? "#1a2d1a" : "#2d1a1a", color: log.ok ? "#4ade80" : "#f87171", fontSize: 11 }}>{log.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Komut Onay Modal */}
      {showCommandModal && pendingCommand && (
        <div className="modal-overlay" onClick={() => { setShowCommandModal(false); setPendingCommand(null); }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 16, fontWeight: 600, color: "#f1f5f9", marginBottom: 10 }}>
              {pendingCommand.cmd === "wipe" ? "⚠️ Tehlikeli İşlem" : "Komutu Onayla"}
            </div>
            <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 22, lineHeight: 1.6 }}>
              <strong style={{ color: "#e2e8f0" }}>{pendingCommand.device.name || pendingCommand.device.model}</strong> cihazına{" "}
              {pendingCommand.cmd === "wipe"
                ? <span style={{ color: "#f87171" }}>fabrika sıfırlama komutu gönderilecek. Tüm veriler silinecek!</span>
                : `"${pendingCommand.cmd}" komutu gönderilecek.`}
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
        <div style={{ position: "fixed", bottom: 28, right: 28, background: toast.type === "error" ? "#2d1a1a" : "#1e2340", border: `1px solid ${toast.type === "error" ? "#7c2626" : "#3b5499"}`, borderRadius: 10, padding: "12px 20px", color: toast.type === "error" ? "#f87171" : "#60a5fa", fontSize: 13, zIndex: 200, maxWidth: 380, boxShadow: "0 8px 30px rgba(0,0,0,.5)" }}>
          {toast.type === "error" ? "❌" : "✅"} {toast.msg}
        </div>
      )}
    </div>
  );
}
