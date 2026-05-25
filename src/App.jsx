import { useState, useEffect, useRef } from "react";
import { API, CSS, MOCK_APPS, DEFAULT_PROFILES, CMD_LABELS, sLabel } from "./utils";
import Login from "./Login";
import Sidebar from "./components/Sidebar";
import Dashboard from "./tabs/Dashboard";
import Devices from "./tabs/Devices";
import Policies from "./tabs/Policies";
import Profiles from "./tabs/Profiles";
import { Apps, Kiosk, Geofence, Reports, Alerts, Logs, Users, Settings, Enrollment } from "./tabs/index";
import { CmdModal, ConfirmModal, PolicyModal, ProfileModal, AppModal, UserModal } from "./modals/index";

export default function App() {
  // ─── Auth ─────────────────────────────────────────────────────────────
  const [token, setToken] = useState(() => localStorage.getItem("mdm_token") || null);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginStatus, setLoginStatus] = useState("");
  const [loginProgress, setLoginProgress] = useState(0);
  const abortRef = useRef(null);

  // ─── Navigasyon ────────────────────────────────────────────────────────
  const [currentUser, setCurrentUser] = useState(null);
  const [tab, setTab] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // ─── Veri ─────────────────────────────────────────────────────────────
  const [devices, setDevices] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [apps, setApps] = useState(MOCK_APPS);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ total_devices: 0, online_devices: 0, offline_devices: 0, locked_devices: 0, non_compliant_devices: 0, pending_commands: 0 });
  const [reports, setReports] = useState({ summary: null, battery: null, storage: null, commands: null, devices: [] });
  const [reportsLoading, setReportsLoading] = useState(false);
  const [apiLoading, setApiLoading] = useState(false);

  // ─── Cihaz UI ─────────────────────────────────────────────────────────
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // ─── Harita ────────────────────────────────────────────────────────────
  const [mapLocations, setMapLocations] = useState([]);
  const [mapLoading, setMapLoading] = useState(false);
  const [selectedMapDev, setSelectedMapDev] = useState(null);

  // ─── QR & Kayıt ────────────────────────────────────────────────────────
  const [qrData, setQrData] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [enrollMethod, setEnrollMethod] = useState("provisioning");
  const [enrollPolicyId, setEnrollPolicyId] = useState("");

  // ─── Komutlar ─────────────────────────────────────────────────────────
  const [commandLog, setCommandLog] = useState([]);
  const [cmdModal, setCmdModal] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);

  // ─── Politika ─────────────────────────────────────────────────────────
  const [policyModal, setPolicyModal] = useState(false);
  const [policyForm, setPolicyForm] = useState({ name: "", description: "", rules: {}, allowed_apps: [] });
  const [policyLoading, setPolicyLoading] = useState(false);
  const [editPolicy, setEditPolicy] = useState(null);

  // ─── Profil ────────────────────────────────────────────────────────────
  const [profiles, setProfiles] = useState(() => {
    try { return JSON.parse(localStorage.getItem("mdm_profiles") || "null") || DEFAULT_PROFILES; } catch { return DEFAULT_PROFILES; }
  });
  const [profileModal, setProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: "", type: "wifi", config: {} });
  const [profileLoading, setProfileLoading] = useState(false);
  const [editProfile, setEditProfile] = useState(null);

  // ─── Uygulama ─────────────────────────────────────────────────────────
  const [appModal, setAppModal] = useState(false);
  const [appForm, setAppForm] = useState({ name:"", package_name:"", version:"", is_required:false, category:"Diğer", size_mb:"", apk_url:"", description:"" });
  const [editApp, setEditApp] = useState(null);
  const [appLoading, setAppLoading] = useState(false);

  // ─── Kullanıcı ────────────────────────────────────────────────────────
  const [userModal, setUserModal] = useState(false);
  const [userForm, setUserForm] = useState({ email: "", password: "", full_name: "", role: "operator" });
  const [userLoading, setUserLoading] = useState(false);

  // ─── Uyarılar (cihazlardan hesaplanan) ─────────────────────────────────
  const alerts = [
    ...devices.filter(d => (d.battery_level || 100) < 20).map(d => ({ id: `b${d.id}`, type: "critical", msg: `${d.name || d.model} batarya kritik (%${d.battery_level})`, device: d.name || d.model })),
    ...devices.filter(d => d.is_compliant === false).map(d => ({ id: `nc${d.id}`, type: "warning", msg: `${d.name || d.model} politika uyumsuz`, device: d.name || d.model })),
    ...devices.filter(d => d.status === "wiped").map(d => ({ id: `w${d.id}`, type: "critical", msg: `${d.name || d.model} silindi!`, device: d.name || d.model })),
    ...devices.filter(d => d.status === "offline").slice(0, 3).map(d => ({ id: `o${d.id}`, type: "info", msg: `${d.name || d.model} çevrimdışı`, device: d.name || d.model })),
  ];

  // ─── Yardımcılar ──────────────────────────────────────────────────────
  const toast$ = (msg, type = "success") => {
    const el = document.getElementById("mdm-toast");
    if (!el) return;
    el.textContent = (type === "error" ? "❌ " : "✅ ") + msg;
    el.style.background = type === "error" ? "#1a0a0a" : "#0a140a";
    el.style.borderColor = type === "error" ? "#7c2626" : "#2a5c2a";
    el.style.color = type === "error" ? "#f87171" : "#4ade80";
    el.style.display = "flex";
    clearTimeout(el._tid);
    el._tid = setTimeout(() => { el.style.display = "none"; }, 3500);
  };
  const H = () => ({ Authorization: `Bearer ${token}`, "Content-Type": "application/json" });

  // ─── Effects ──────────────────────────────────────────────────────────
  useEffect(() => { if (token) fetchAll(); }, [token]);
  useEffect(() => {
    if (!token) return;
    const interval = setInterval(() => {
      fetchAll();
    }, 30 * 1000); // 30 saniyede bir otomatik yenile
    return () => clearInterval(interval);
  }, [token]);
  useEffect(() => { if (token && tab === "reports") fetchReports(); }, [tab]);
  useEffect(() => { if (token && tab === "users") fetchUsers(); }, [tab]);
  useEffect(() => { if (token && tab === "geofence") fetchMap(); }, [tab]);
  useEffect(() => { try { localStorage.setItem("mdm_profiles", JSON.stringify(profiles)); } catch {} }, [profiles]);

  // ─── API Çağrıları ─────────────────────────────────────────────────────
  const fetchAll = async () => {
    setApiLoading(true);
    try {
      const [dr, sr, pr, mr] = await Promise.all([
        fetch(`${API}/devices/`, { headers: H() }),
        fetch(`${API}/dashboard/stats`, { headers: H() }),
        fetch(`${API}/policies/`, { headers: H() }),
        fetch(`${API}/auth/me`, { headers: H() }),
      ]);
      if (dr.status === 401) { logout(); return; }
      if (dr.ok) setDevices(await dr.json());
      if (sr.ok) setStats(await sr.json());
      if (pr.ok) setPolicies(await pr.json());
      if (mr.ok) setCurrentUser(await mr.json());
      try { const ar = await fetch(`${API}/apps/`, { headers: H() }); if (ar.ok) { const d = await ar.json(); if (d.length > 0) setApps(d); } } catch {}
    } catch (e) { toast$(`Veri yüklenemedi: ${e.message}`, "error"); }
    setApiLoading(false);
  };


  const fetchDevices = async () => {
    try {
      const r = await fetch(`${API}/devices/`, { headers: H() });
      if (r.ok) setDevices(await r.json());
    } catch {}
  };

  const fetchUsers = async () => {
    try { const r = await fetch(`${API}/auth/users`, { headers: H() }); if (r.ok) setUsers(await r.json()); } catch {}
  };

  const fetchReports = async () => {
    setReportsLoading(true);
    try {
      const [a, b, c, d, e] = await Promise.all([
        fetch(`${API}/reports/summary`, { headers: H() }),
        fetch(`${API}/reports/battery`, { headers: H() }),
        fetch(`${API}/reports/storage`, { headers: H() }),
        fetch(`${API}/reports/commands?days=7`, { headers: H() }),
        fetch(`${API}/reports/devices`, { headers: H() }),
      ]);
      setReports({ summary: a.ok ? await a.json() : null, battery: b.ok ? await b.json() : null, storage: c.ok ? await c.json() : null, commands: d.ok ? await d.json() : null, devices: e.ok ? await e.json() : [] });
    } catch { toast$("Raporlar yüklenemedi", "error"); }
    setReportsLoading(false);
  };

  const fetchMap = async () => {
    setMapLoading(true);
    try { const r = await fetch(`${API}/devices/locations/all`, { headers: H() }); setMapLocations(r.ok ? await r.json() : []); }
    catch { setMapLocations([]); }
    setMapLoading(false);
  };

  const login = async () => {
    if (!loginEmail || !loginPassword) { setLoginError("E-posta ve şifre girin"); return; }
    setLoginLoading(true); setLoginError(""); setLoginStatus("Bağlanıyor..."); setLoginProgress(0);
    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController(); abortRef.current = ctrl;
    const TIMEOUT = 90000;
    const tid = setTimeout(() => ctrl.abort(), TIMEOUT);
    let elapsed = 0;
    const iv = setInterval(() => {
      elapsed += 1;
      setLoginProgress(Math.min(95, Math.round((elapsed / (TIMEOUT / 1000)) * 100)));
      if (elapsed < 5) setLoginStatus("Bağlanıyor...");
      else if (elapsed < 20) setLoginStatus("Sunucu uyandırılıyor...");
      else setLoginStatus(`Sunucu açılıyor... (~${Math.max(0, Math.ceil((TIMEOUT / 1000) - elapsed))} sn)`);
    }, 1000);
    try {
      const r = await fetch(`${API}/auth/login`, { method: "POST", signal: ctrl.signal, headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: `username=${encodeURIComponent(loginEmail)}&password=${encodeURIComponent(loginPassword)}` });
      clearTimeout(tid); clearInterval(iv);
      if (r.ok) { const d = await r.json(); localStorage.setItem("mdm_token", d.access_token); setToken(d.access_token); setLoginStatus(""); }
      else { const d = await r.json().catch(() => {}); setLoginError(r.status === 401 ? "E-posta veya şifre hatalı" : `Hata: ${d?.detail || r.status}`); setLoginStatus(""); }
    } catch (e) {
      clearTimeout(tid); clearInterval(iv);
      setLoginError(e.name === "AbortError" ? "Bağlantı zaman aşımı (90sn)." : `Bağlantı hatası — CORS: allow_origins=["*"] olduğundan emin olun.`);
      setLoginStatus("");
    }
    setLoginProgress(0); setLoginLoading(false);
  };

  const cancelLogin = () => { if (abortRef.current) abortRef.current.abort(); setLoginLoading(false); setLoginStatus(""); setLoginProgress(0); setLoginError("İptal edildi."); };
  const logout = () => { localStorage.removeItem("mdm_token"); setToken(null); setDevices([]); setCurrentUser(null); };

  const sendCmd = async (device, cmd) => {
    setCmdModal(null);
    toast$(`⏳ ${CMD_LABELS[cmd] || cmd} gönderiliyor...`);
    try {
      const r = await fetch(`${API}/commands/device/${device.id}`, { method: "POST", headers: H(), body: JSON.stringify({ command_type: cmd, payload: {} }) });
      const data = await r.json().catch(() => ({}));
      setCommandLog(p => [{ id: Date.now(), device: device.name || device.model, cmd: CMD_LABELS[cmd] || cmd, time: new Date().toLocaleTimeString("tr-TR"), ok: r.ok }, ...p.slice(0, 49)]);
      if (r.ok) {
        toast$(`✅ ${CMD_LABELS[cmd] || cmd} başarıyla gönderildi`);
        if (cmd === "lock")  setDevices(p => p.map(d => d.id === device.id ? { ...d, status: "locked" } : d));
        if (cmd === "wipe")  setDevices(p => p.map(d => d.id === device.id ? { ...d, status: "wiped" } : d));
        setTimeout(fetchDevices, 2000); // Komut sonrası cihaz durumunu güncelle
      } else {
        toast$(`❌ HTTP ${r.status}: ${data?.detail || "Komut gönderilemedi"}`, "error");
      }
    } catch (e) { toast$(`❌ Bağlantı hatası: ${e.message}`, "error"); }
  };

  const sendAll = async (cmd, label) => {
    if (!devices.length) { toast$("Kayıtlı cihaz yok", "error"); return; }
    toast$(`⏳ ${label} gönderiliyor (${devices.length} cihaz)...`);
    let ok = 0, fail = 0;
    for (const d of devices) {
      try { const r = await fetch(`${API}/commands/device/${d.id}`, { method: "POST", headers: H(), body: JSON.stringify({ command_type: cmd, payload: {} }) }); if (r.ok) ok++; else fail++; }
      catch { fail++; }
    }
    setCommandLog(p => [{ id: Date.now(), device: `${ok}/${devices.length} cihaz`, cmd: label, time: new Date().toLocaleTimeString("tr-TR"), ok: fail === 0 }, ...p.slice(0, 49)]);
    toast$(fail === 0 ? `✅ ${label} → ${ok} cihaza gönderildi` : `⚠️ ${ok} başarılı, ${fail} başarısız`, fail > 0 && ok === 0 ? "error" : "success");
    setTimeout(fetchDevices, 2000);
  };

  const generateQr = async (policyId = null, type = "provisioning") => {
    setQrLoading(true); setQrData(null);
    try {
      const ep = type === "simple" ? `${API}/enrollment/qr/simple` : `${API}/enrollment/qr`;
      const r = await fetch(policyId ? `${ep}?policy_id=${policyId}` : ep, { headers: H() });
      if (r.ok) { setQrData({ ...await r.json(), type }); toast$("QR oluşturuldu"); }
      else toast$("QR oluşturulamadı", "error");
    } catch { toast$("Bağlantı hatası", "error"); }
    setQrLoading(false);
  };

  const createPolicy = async () => {
    if (!policyForm.name.trim()) { toast$("Politika adı zorunlu", "error"); return; }
    setPolicyLoading(true);
    try {
      const body = {
      name: policyForm.name,
      description: policyForm.description,
      rules: Object.fromEntries(Object.entries(policyForm.rules).filter(([, v]) => v)),
      allowed_apps: policyForm.allowed_apps || [],
    };
      if (editPolicy) {
        const r = await fetch(`${API}/policies/${editPolicy.id}`, { method: "PUT", headers: H(), body: JSON.stringify(body) });
        if (r.ok) { const c = await r.json(); setPolicies(p => p.map(x => x.id === editPolicy.id ? c : x)); toast$(`✅ "${policyForm.name}" güncellendi`); setPolicyModal(false); }
        else {
          // PUT yoksa PATCH dene
          const r2 = await fetch(`${API}/policies/${editPolicy.id}`, { method: "PATCH", headers: H(), body: JSON.stringify(body) });
          if (r2.ok) { const c = await r2.json(); setPolicies(p => p.map(x => x.id === editPolicy.id ? c : x)); toast$(`✅ "${policyForm.name}" güncellendi`); setPolicyModal(false); }
          else toast$("Güncellenemedi", "error");
        }
      } else {
        const r = await fetch(`${API}/policies/`, { method: "POST", headers: H(), body: JSON.stringify(body) });
        if (r.ok) { const c = await r.json(); setPolicies(p => [...p, c]); toast$(`✅ "${policyForm.name}" oluşturuldu`); setPolicyModal(false); setPolicyForm({ name: "", description: "", rules: {}, allowed_apps: [] }); }
        else { const e = await r.json().catch(() => {}); toast$(e?.detail || "Politika oluşturulamadı", "error"); }
      }
    } catch { toast$("Bağlantı hatası", "error"); }
    setPolicyLoading(false);
  };

  const deletePolicy = async (policy) => {
    try {
      const r = await fetch(`${API}/policies/${policy.id}`, { method: "DELETE", headers: H() });
      if (r.ok) { setPolicies(p => p.filter(x => x.id !== policy.id)); toast$(`"${policy.name}" silindi`); }
      else toast$("Silinemedi", "error");
    } catch { toast$("Bağlantı hatası", "error"); }
  };

  const addApp = async () => {
    if (!appForm.name.trim() || !appForm.package_name.trim()) { toast$("Uygulama adı ve paket adı zorunlu", "error"); return; }
    // paket adı format kontrolü
    if (!/^[a-zA-Z][a-zA-Z0-9_]*(\.[a-zA-Z][a-zA-Z0-9_]*)+$/.test(appForm.package_name)) {
      toast$("Paket adı geçersiz. Örnek: com.sirket.uygulama", "error"); return;
    }
    setAppLoading(true);
    const body = {
      name: appForm.name.trim(),
      package_name: appForm.package_name.trim(),
      version: appForm.version || "",
      is_required: appForm.is_required,
      category: appForm.category || "Diğer",
      size_mb: appForm.size_mb ? parseInt(appForm.size_mb) : null,
      apk_url: appForm.apk_url || null,
      description: appForm.description || "",
    };
    try {
      if (editApp) {
        // Düzenleme — PUT veya PATCH dene
        let r = await fetch(`${API}/apps/${editApp.id}`, { method:"PUT", headers:H(), body:JSON.stringify(body) });
        if (!r.ok) r = await fetch(`${API}/apps/${editApp.id}`, { method:"PATCH", headers:H(), body:JSON.stringify(body) });
        if (r.ok) {
          const c = await r.json();
          setApps(p => p.map(a => a.id === editApp.id ? c : a));
          toast$(`✅ "${appForm.name}" güncellendi`);
          setAppModal(false); setEditApp(null);
        } else {
          // API güncellemeyi desteklemiyorsa local güncelle
          setApps(p => p.map(a => a.id === editApp.id ? { ...a, ...body } : a));
          toast$(`✅ "${appForm.name}" güncellendi (local)`);
          setAppModal(false); setEditApp(null);
        }
      } else {
        // Yeni ekleme
        const r = await fetch(`${API}/apps/`, { method:"POST", headers:H(), body:JSON.stringify(body) });
        if (r.ok) {
          const c = await r.json();
          setApps(p => [...p, c]);
          toast$(`✅ "${appForm.name}" eklendi`);
        } else {
          // API'ye eklenemezse local listeye ekle (mock id ile)
          const mockApp = { ...body, id:`local_${Date.now()}` };
          setApps(p => [...p, mockApp]);
          toast$(`✅ "${appForm.name}" eklendi (local)`);
        }
        setAppModal(false);
      }
      setAppForm({ name:"", package_name:"", version:"", is_required:false, category:"Diğer", size_mb:"", apk_url:"", description:"" });
    } catch { toast$("Bağlantı hatası", "error"); }
    setAppLoading(false);
  };

  const deleteApp = async (app) => {
    try {
      const r = await fetch(`${API}/apps/${app.id}`, { method:"DELETE", headers:H() });
      const isLocal = String(app.id||"").startsWith("local_"); if (r.ok || isLocal) {
        setApps(p => p.filter(a => a.id !== app.id)); toast$(`"${app.name}" silindi`); } else { setApps(p => p.filter(a => a.id !== app.id)); toast$(`"${app.name}" silindi`); }
    } catch {
      setApps(p => p.filter(a => a.id !== app.id));
      toast$(`"${app.name}" silindi (local)`);
    }
  };

  const deployApp = async (app) => {
    if (!devices.length) { toast$("Kayıtlı cihaz yok", "error"); return; }
    toast$(`⏳ "${app.name}" ${devices.length} cihaza gönderiliyor...`);
    let ok = 0;
    for (const d of devices) {
      try { const r = await fetch(`${API}/commands/device/${d.id}`, { method: "POST", headers: H(), body: JSON.stringify({ command_type: "install_app", payload: { package_name: app.package_name, app_name: app.name, apk_url: app.apk_url || "" } }) }); if (r.ok) ok++; }
      catch {}
    }
    toast$(ok > 0 ? `✅ "${app.name}" ${ok}/${devices.length} cihaza gönderildi` : `❌ Gönderilemedi`, ok === 0 ? "error" : "success");
  };

  const createUser = async () => {
    if (!userForm.email || !userForm.password) { toast$("E-posta ve şifre zorunlu", "error"); return; }
    setUserLoading(true);
    try {
      const r = await fetch(`${API}/auth/users`, { method: "POST", headers: H(), body: JSON.stringify(userForm) });
      if (r.ok) { toast$("✅ Kullanıcı oluşturuldu"); setUserModal(false); setUserForm({ email: "", password: "", full_name: "", role: "operator" }); fetchUsers(); }
      else { const e = await r.json().catch(() => {}); toast$(e?.detail || "Oluşturulamadı", "error"); }
    } catch { toast$("Bağlantı hatası", "error"); }
    setUserLoading(false);
  };

  const exportCSV = (data, filename) => {
    if (!data?.length) { toast$("Veri yok", "error"); return; }
    const header = Object.keys(data[0]).join(",");
    const rows = data.map(r => Object.values(r).map(v => `"${String(v || "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + header + "\n" + rows], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = filename; a.click();
    toast$("CSV indirildi");
  };

  const saveProfile = () => {
    if (!profileForm.name.trim()) { toast$("Profil adı zorunlu", "error"); return; }
    setProfileLoading(true);
    if (editProfile) {
      setProfiles(prev => prev.map(p => p.id === editProfile.id ? { ...p, name: profileForm.name, type: profileForm.type, config: profileForm.config } : p));
      toast$(`✅ "${profileForm.name}" güncellendi`);
    } else {
      setProfiles(prev => [...prev, { id: `p${Date.now()}`, name: profileForm.name, type: profileForm.type, active: true, devices: 0, config: profileForm.config }]);
      toast$(`✅ "${profileForm.name}" oluşturuldu`);
    }
    setProfileModal(false); setEditProfile(null); setProfileLoading(false);
  };

  const [showAlerts, setShowAlerts] = useState(false);

  // Gerçek cihaz verisinden dinamik uyarılar
  const dynamicAlerts = [
    ...devices.filter(d => (d.battery_level||100) < 20)
      .map(d => ({ id:`bat_${d.id}`, type:"critical", msg:`${d.name||d.model} batarya kritik (%${d.battery_level})`, device:d.name||d.model })),
    ...devices.filter(d => d.is_compliant === false)
      .map(d => ({ id:`nc_${d.id}`, type:"warning", msg:`${d.name||d.model} politika uyumsuz`, device:d.name||d.model })),
    ...devices.filter(d => d.status === "wiped")
      .map(d => ({ id:`w_${d.id}`, type:"critical", msg:`${d.name||d.model} cihazı silindi!`, device:d.name||d.model })),
    ...devices.filter(d => d.status === "offline").slice(0,3)
      .map(d => ({ id:`off_${d.id}`, type:"info", msg:`${d.name||d.model} çevrimdışı`, device:d.name||d.model })),
    ...devices.filter(d => d.storage_used_gb && d.storage_total_gb && (d.storage_used_gb/d.storage_total_gb) > 0.9)
      .map(d => ({ id:`sto_${d.id}`, type:"warning", msg:`${d.name||d.model} depolama dolmak üzere (%${Math.round(d.storage_used_gb/d.storage_total_gb*100)})`, device:d.name||d.model })),
  ];
  const TITLES = { dashboard: "Dashboard", devices: "Cihaz Yönetimi", enrollment: "Kayıt Yönetimi", policies: "Politika Yönetimi", profiles: "Yapılandırma Profilleri", apps: "Uygulama Yönetimi", kiosk: "Kiosk Modu", geofence: "Konum & Geofence", reports: "Raporlar", alerts: "Uyarılar", logs: "Komut Geçmişi", users: "Kullanıcı Yönetimi", settings: "Sistem Ayarları" };

  if (!token) return <Login loginEmail={loginEmail} setLoginEmail={setLoginEmail} loginPassword={loginPassword} setLoginPassword={setLoginPassword} loginError={loginError} loginLoading={loginLoading} loginStatus={loginStatus} loginProgress={loginProgress} login={login} cancelLogin={cancelLogin} />;

  return (
    <div style={{ fontFamily: "'Inter',system-ui,sans-serif", background: "#0c0e1a", minHeight: "100vh", color: "#e2e8f0" }}>
      <style>{CSS}</style>
      <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>

        <Sidebar tab={tab} setTab={setTab} currentUser={currentUser} commandLog={commandLog} alerts={dynamicAlerts} sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed} logout={logout} apiLoading={apiLoading} />

        <div style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column" }}>
          {/* Topbar */}
          <div style={{ padding: "12px 22px", borderBottom: "1px solid #1a1f35", background: "#0a0c18", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
            <div><div style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9" }}>{TITLES[tab]}</div><div style={{ fontSize: 11, color: "#475569", marginTop: 1 }}>{new Date().toLocaleString("tr-TR")}</div></div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {apiLoading && <span style={{ fontSize: 11, color: "#475569" }}>⟳</span>}
              <button className="btn" onClick={fetchAll}>🔄 Yenile</button>
              <div style={{ position: "relative" }}>
                <button className="btn" onClick={() => setShowAlerts(!showAlerts)}>🔔</button>
                {dynamicAlerts.filter(a => a.type === "critical").length > 0 && <span style={{ position: "absolute", top: -4, right: -4, width: 15, height: 15, borderRadius: "50%", background: "#ef4444", fontSize: 9, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>{dynamicAlerts.filter(a => a.type === "critical").length}</span>}
              </div>
              {tab === "devices" && <button className="btn pr" onClick={() => setTab("enrollment")}>➕ Cihaz Ekle</button>}
            </div>
          </div>

          {/* Uyarılar dropdown */}
          {showAlerts && (
            <div style={{ position: "fixed", top: 56, right: 18, width: 360, background: "#0f1220", border: "1px solid #2a3048", borderRadius: 12, zIndex: 150, boxShadow: "0 20px 50px rgba(0,0,0,.7)", overflow: "hidden" }}>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid #1a1f35", display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#f1f5f9" }}>🔔 Uyarılar</span>
                <button onClick={() => setShowAlerts(false)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer" }}>✕</button>
              </div>
              {dynamicAlerts.length === 0 ? <div style={{ padding: "20px", textAlign: "center", color: "#475569", fontSize: 13 }}>✅ Uyarı yok</div>
                : dynamicAlerts.slice(0, 6).map(a => (
                  <div key={a.id} style={{ padding: "11px 16px", borderBottom: "1px solid #1a1f35", display: "flex", gap: 10 }}>
                    <span>{a.type === "critical" ? "🔴" : a.type === "warning" ? "🟡" : "🔵"}</span>
                    <div><div style={{ fontSize: 12, color: "#e2e8f0" }}>{a.msg}</div><div style={{ fontSize: 10, color: "#475569", marginTop: 2 }}>{a.device}</div></div>
                  </div>
                ))}
            </div>
          )}

          {/* İçerik */}
          <div style={{ padding: 22, flex: 1 }}>
            {tab === "dashboard"  && <Dashboard devices={devices} stats={stats} policies={policies} apps={apps} alerts={alerts} setTab={setTab} setSelectedDevice={setSelectedDevice} sendAll={sendAll} exportCSV={exportCSV} generateQr={generateQr} />}
            {tab === "devices"    && <Devices devices={devices} selectedDevice={selectedDevice} setSelectedDevice={setSelectedDevice} searchQuery={searchQuery} setSearchQuery={setSearchQuery} filterStatus={filterStatus} setFilterStatus={setFilterStatus} setCmdModal={setCmdModal} setTab={setTab} exportCSV={exportCSV} />}
            {tab === "enrollment" && <Enrollment policies={policies} enrollMethod={enrollMethod} setEnrollMethod={setEnrollMethod} enrollPolicyId={enrollPolicyId} setEnrollPolicyId={setEnrollPolicyId} generateQr={generateQr} qrData={qrData} qrLoading={qrLoading} />}
            {tab === "policies"   && <Policies policies={policies} devices={devices} apps={apps} setPolicyModal={setPolicyModal} setEditPolicy={setEditPolicy} setPolicyForm={setPolicyForm} setConfirmModal={setConfirmModal} deletePolicy={deletePolicy} setCommandLog={setCommandLog} toast$={toast$} H={H} API={API} setTab={setTab} generateQr={generateQr} setEnrollPolicyId={setEnrollPolicyId} sendAll={sendAll} />}
            {tab === "profiles"   && <Profiles profiles={profiles} setProfiles={setProfiles} setProfileModal={setProfileModal} setEditProfile={setEditProfile} setProfileForm={setProfileForm} setConfirmModal={setConfirmModal} devices={devices} toast$={toast$} H={H} API={API} />}
            {tab === "apps"       && <Apps apps={apps} devices={devices} setAppModal={setAppModal} setEditApp={setEditApp} setAppForm={setAppForm} deployApp={deployApp} deleteApp={deleteApp} setConfirmModal={setConfirmModal} sendAll={sendAll} />}
            {tab === "kiosk"      && <Kiosk sendAll={sendAll} setTab={setTab} devices={devices} policies={policies} toast$={toast$} apps={apps} />}
            {tab === "geofence"   && <Geofence mapLocations={mapLocations} mapLoading={mapLoading} selectedMapDev={selectedMapDev} setSelectedMapDev={setSelectedMapDev} fetchMap={fetchMap} sendAll={sendAll} />}
            {tab === "reports"    && <Reports reports={reports} reportsLoading={reportsLoading} fetchReports={fetchReports} exportCSV={exportCSV} />}
            {tab === "alerts"     && <Alerts alerts={dynamicAlerts} />}
            {tab === "logs"       && <Logs commandLog={commandLog} setCommandLog={setCommandLog} setConfirmModal={setConfirmModal} exportCSV={exportCSV} />}
            {tab === "users"      && <Users users={users} setUserModal={setUserModal} setUsers={setUsers} toast$={toast$} H={H} API={API} setConfirmModal={setConfirmModal} />}
            {tab === "settings"   && <Settings API={API} apiLoading={apiLoading} devices={devices} sendAll={sendAll} setCommandLog={setCommandLog} exportCSV={exportCSV} fetchAll={fetchAll} sLabel={sLabel} toast$={toast$} />}
          </div>
        </div>
      </div>

      {/* Modallar */}
      {cmdModal && <CmdModal modal={cmdModal} onClose={() => setCmdModal(null)} onConfirm={sendCmd} />}
      {confirmModal && <ConfirmModal modal={confirmModal} onClose={() => setConfirmModal(null)} />}
      {policyModal && <PolicyModal form={policyForm} setForm={setPolicyForm} editPolicy={editPolicy} loading={policyLoading} onClose={() => setPolicyModal(false)} onSave={createPolicy} apps={apps} />}
      {profileModal && <ProfileModal form={profileForm} setForm={setProfileForm} editProfile={editProfile} loading={profileLoading} onClose={() => { setProfileModal(false); setEditProfile(null); }} onSave={saveProfile} />}
      {appModal && <AppModal form={appForm} setForm={setAppForm} loading={appLoading} onClose={() => { setAppModal(false); setEditApp(null); }} onSave={addApp} editApp={editApp} />}
      {userModal && <UserModal form={userForm} setForm={setUserForm} loading={userLoading} onClose={() => setUserModal(false)} onSave={createUser} />}

      {/* Toast */}
      <div id="mdm-toast" style={{ display: "none", position: "fixed", bottom: 22, right: 22, background: "#0a140a", border: "1px solid #2a5c2a", borderRadius: 10, padding: "12px 18px", color: "#4ade80", fontSize: 13, zIndex: 300, maxWidth: 400, boxShadow: "0 16px 50px rgba(0,0,0,.7)", alignItems: "center", gap: 9 }}></div>
    </div>
  );
}
