export const API = "https://mdm-backend-rk5x.onrender.com/api/v1";

export const sColor = s => ({ online:"#22c55e", offline:"#64748b", locked:"#f59e0b", wiped:"#ef4444", enrolled:"#3b82f6" }[s] || "#64748b");
export const sLabel = s => ({ online:"Çevrimiçi", offline:"Çevrimdışı", locked:"Kilitli", wiped:"Silindi", enrolled:"Kayıtlı" }[s] || s);
export const rColor = r => ({ admin:"#f87171", operator:"#60a5fa", viewer:"#94a3b8" }[r] || "#94a3b8");
export const rLabel = r => ({ admin:"Admin", operator:"Operatör", viewer:"Görüntüleyici" }[r] || r);

export const PLATFORMS = [
  { id:"android", label:"Android", icon:"🤖", color:"#22c55e" },
  { id:"ios",     label:"iOS",     icon:"🍎", color:"#94a3b8" },
  { id:"windows", label:"Windows", icon:"🪟", color:"#3b82f6" },
];

export const MOCK_APPS = [
  { id:"a1", name:"Şirket Portalı",  package_name:"com.sirket.portal",     version:"4.1.2",  category:"Kurumsal", size_mb:28,  is_required:true  },
  { id:"a2", name:"Microsoft Teams", package_name:"com.microsoft.teams",   version:"1440/1", category:"İletişim", size_mb:120, is_required:true  },
  { id:"a3", name:"Outlook",         package_name:"com.microsoft.outlook", version:"4.2310", category:"E-posta",  size_mb:95,  is_required:true  },
  { id:"a4", name:"Chrome",          package_name:"com.android.chrome",    version:"120.0",  category:"Tarayıcı", size_mb:78,  is_required:false },
  { id:"a5", name:"OneDrive",        package_name:"com.microsoft.skydrive",version:"6.89",   category:"Depolama", size_mb:55,  is_required:false },
  { id:"a6", name:"Zoom",            package_name:"us.zoom.videomeetings", version:"5.16.2", category:"Toplantı", size_mb:145, is_required:false },
];

export const DEFAULT_PROFILES = [
  { id:"p1", name:"Şirket Wi-Fi",     type:"wifi",        active:true, devices:0, config:{ ssid:"SirketAgi",       security:"WPA2" } },
  { id:"p2", name:"Merkez VPN",       type:"vpn",         active:true, devices:0, config:{ server:"vpn.sirket.com", protocol:"IKEv2" } },
  { id:"p3", name:"Exchange E-posta", type:"email",       active:true, devices:0, config:{ server:"mail.sirket.com",port:"443", ssl:true } },
  { id:"p4", name:"Kök Sertifika",    type:"certificate", active:true, devices:0, config:{ name:"SirketCA",         certType:"CA" } },
];

export const CMD_LABELS = {
  lock:"Kilitle", unlock:"Kilidi Aç", wipe:"Fabrika Sıfırla",
  reboot:"Yeniden Başlat", locate:"Konum Al", push_policy:"Politika Gönder",
  install_app:"Uygulama Yükle", uninstall_app:"Uygulama Kaldır",
  set_kiosk_launcher:"Kiosk Başlat", disable_kiosk:"Kiosk Kapat",
  set_kiosk_password:"Kiosk Şifresi",
};

export const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:#0d0f1e}::-webkit-scrollbar-thumb{background:#2a3048;border-radius:3px}
  @keyframes spin{to{transform:rotate(360deg)}}
  .btn{padding:7px 16px;border-radius:7px;border:1px solid #2a3048;background:#161a2e;color:#94a3b8;font-size:12px;cursor:pointer;font-family:inherit;font-weight:500;transition:all .15s}
  .btn:hover{background:#1e2340;color:#60a5fa;border-color:#3b5bdb}
  .pr{background:linear-gradient(135deg,#3b5bdb,#228be6)!important;border:none!important;color:#fff!important}
  .pr:hover{opacity:.9!important}
  .dg:hover{background:#2d1a1a!important;color:#f87171!important;border-color:#7c2626!important}
  .card{background:#0f1220;border:1px solid #1a1f35;border-radius:12px}
  .ni{display:flex;align-items:center;gap:9px;width:100%;padding:8px 10px;border-radius:7px;border:none;color:#5a6480;font-size:13px;font-family:inherit;cursor:pointer;background:transparent;text-align:left;transition:all .15s}
  .ni:hover{background:#13172a;color:#94a3b8}.ni.ac{background:#1a1f3a;color:#60a5fa}
  .stl{font-size:10px;color:#475569;font-weight:700;letter-spacing:.1em;text-transform:uppercase;padding:0 10px;margin:14px 0 4px}
  .tag{display:inline-flex;align-items:center;padding:2px 10px;border-radius:20px;font-size:11px;font-weight:500}
  .bar{height:4px;background:#1e2340;border-radius:2px;overflow:hidden}
  .bf{height:100%;border-radius:2px;transition:width .4s}
  .dr{display:grid;grid-template-columns:2.5fr 1.2fr 1fr 1fr 1fr 1fr 90px;gap:10px;align-items:center;padding:13px 16px;border-bottom:1px solid #1a1f35;cursor:pointer;font-size:12.5px;transition:background .1s}
  .dr:hover{background:#13172a}.dr.ac{background:#141830;border-left:3px solid #3b5bdb}
  .ov{position:fixed;inset:0;background:rgba(0,0,0,.85);display:flex;align-items:center;justify-content:center;z-index:200;backdrop-filter:blur(4px)}
  .mo{background:#0f1220;border:1px solid #2a3048;border-radius:16px;padding:28px 32px;width:480px;max-width:95vw}
  .fi{width:100%;background:#0c0e1a;border:1px solid #2a3048;color:#e2e8f0;padding:10px 12px;border-radius:8px;font-size:13px;font-family:inherit;outline:none;transition:border .15s}
  .fi:focus{border-color:#3b5bdb}
  .fl{font-size:11px;color:#64748b;margin-bottom:5px;display:block;text-transform:uppercase;letter-spacing:.05em}
  .fg{margin-bottom:14px}
  select option{background:#0c0e1a}
  .mcard{padding:12px;border-radius:10px;border:1px solid #1a1f35;margin-bottom:8px;cursor:pointer;background:#0c0e1a;transition:all .15s}
  .mcard:hover{background:#13172a}.mcard.ac{background:#141830;border-color:#3b5bdb}
`;
