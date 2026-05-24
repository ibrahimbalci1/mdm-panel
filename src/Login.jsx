export default function Login({ loginEmail, setLoginEmail, loginPassword, setLoginPassword, loginError, loginLoading, loginStatus, loginProgress, login, cancelLogin }) {
  return (
    <div style={{ fontFamily: "'Inter',system-ui", background: "#0c0e1a", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');*{box-sizing:border-box;margin:0;padding:0;}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ display: "flex", width: "100%", maxWidth: 1000, minHeight: "100vh" }}>
        {/* Sol panel */}
        <div style={{ flex: 1, background: "linear-gradient(135deg,#1a1f3a,#0c0e1a)", display: "flex", flexDirection: "column", justifyContent: "center", padding: "60px 70px", borderRight: "1px solid #1e2340" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 36 }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, background: "linear-gradient(135deg,#3b5bdb,#228be6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 700, color: "#fff" }}>M</div>
            <div><div style={{ fontSize: 18, fontWeight: 700, color: "#f1f5f9" }}>MDM Enterprise</div><div style={{ fontSize: 12, color: "#64748b" }}>Kurumsal Mobil Cihaz Yönetimi</div></div>
          </div>
          <h1 style={{ fontSize: 30, fontWeight: 700, color: "#f1f5f9", lineHeight: 1.3, marginBottom: 20 }}>Tüm cihazlarınızı<br /><span style={{ color: "#60a5fa" }}>tek noktadan</span> yönetin</h1>
          {[["📱", "Çoklu Platform", "Android, iOS, Windows"], ["🛡️", "Politika Yönetimi", "Kurallar oluşturun ve uygulayın"], ["📊", "Anlık Raporlar", "Batarya, depolama, uyumluluk"], ["🗺️", "Konum Takibi", "Canlı harita görünümü"]].map(([i, t, d]) => (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: "#1e2340", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>{i}</div>
              <div><div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{t}</div><div style={{ fontSize: 11, color: "#64748b" }}>{d}</div></div>
            </div>
          ))}
        </div>

        {/* Sağ panel — Form */}
        <div style={{ width: 420, background: "#0d0f1e", display: "flex", flexDirection: "column", justifyContent: "center", padding: "60px 48px" }}>
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#f1f5f9", marginBottom: 6 }}>Giriş Yapın</div>
            <div style={{ fontSize: 13, color: "#64748b" }}>MDM yönetim paneline erişin</div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, color: "#64748b", display: "block", marginBottom: 5 }}>E-posta</label>
            <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && login()} placeholder="admin@sirket.com"
              style={{ width: "100%", background: "#161925", border: "1px solid #2a3048", borderRadius: 8, padding: "11px 13px", color: "#e2e8f0", fontSize: 14, fontFamily: "inherit", outline: "none" }} />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, color: "#64748b", display: "block", marginBottom: 5 }}>Şifre</label>
            <input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && login()} placeholder="••••••••"
              style={{ width: "100%", background: "#161925", border: "1px solid #2a3048", borderRadius: 8, padding: "11px 13px", color: "#e2e8f0", fontSize: 14, fontFamily: "inherit", outline: "none" }} />
          </div>

          {loginLoading && loginStatus && (
            <div style={{ marginBottom: 16, background: "#0d1525", border: "1px solid #1e3055", borderRadius: 9, padding: "12px 14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ width: 14, height: 14, border: "2px solid #60a5fa", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite", flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: "#60a5fa", fontWeight: 500 }}>{loginStatus}</span>
              </div>
              {loginProgress > 0 && (
                <div style={{ height: 3, background: "#1e2340", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ height: "100%", background: "linear-gradient(90deg,#3b5bdb,#60a5fa)", borderRadius: 2, width: `${loginProgress}%`, transition: "width 1s linear" }} />
                </div>
              )}
            </div>
          )}

          {loginError && <div style={{ color: "#f87171", fontSize: 12, marginBottom: 16, background: "#2d1a1a", padding: "10px 13px", borderRadius: 8, border: "1px solid #5c2525" }}>{loginError}</div>}

          {loginLoading ? (
            <button onClick={cancelLogin} style={{ width: "100%", background: "#2a1a1a", border: "1px solid #5c2525", borderRadius: 8, padding: "12px", color: "#f87171", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>✕ İptal Et</button>
          ) : (
            <button onClick={login} style={{ width: "100%", background: "linear-gradient(135deg,#3b5bdb,#228be6)", border: "none", borderRadius: 8, padding: "12px", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Giriş Yap →</button>
          )}

          <div style={{ marginTop: 18, background: "#0c0e1a", border: "1px solid #1e2340", borderRadius: 8, padding: "11px 13px", fontSize: 11, color: "#475569", lineHeight: 1.8 }}>
            <div style={{ color: "#64748b", fontWeight: 600, marginBottom: 3 }}>ℹ️ Render Ücretsiz Tier</div>
            <div>• 15dk hareketsizlik sonrası uyku moduna girer</div>
            <div>• Giriş butonu <strong style={{ color: "#e2e8f0" }}>90 sn</strong> boyunca otomatik bekler</div>
          </div>
        </div>
      </div>
    </div>
  );
}
