import { sColor, sLabel, toast } from "../utils";

export default function Devices({
  devices = [],
  selectedDevice,
  setSelectedDevice,
  searchQuery = "",
  setSearchQuery,
  filterStatus = "all",
  setFilterStatus,
  setCmdModal,
  setConfirmModal,
  sendCmd,
  setTab,
  exportCSV,
  currentUser,
}) {
  const q = (searchQuery || "").toLowerCase();
  const isAdmin = currentUser?.role === "admin";

  const filtered = devices.filter(d => {
    const name  = (d.name || `${d.manufacturer || ""} ${d.model || ""}`).toLowerCase();
    const owner = (d.owner_name || "").toLowerCase();
    const imei  = (d.imei || d.serial_number || "").toLowerCase();
    const matchesQ = !q || name.includes(q) || owner.includes(q) || imei.includes(q);
    const matchesS = filterStatus === "all" || d.status === filterStatus;
    return matchesQ && matchesS;
  });

  // Yıkıcı komutlar için ConfirmModal
  const askDestructive = (device, cmd, label) => {
    if (!isAdmin) {
      toast("❌ Bu işlem için yönetici yetkisi gerekir", "error");
      return;
    }
    if (setConfirmModal) {
      setConfirmModal({
        title: `${label} - Onay`,
        msg: `"${device.name || device.model}" cihazı için "${label}" işlemini onaylıyor musunuz? Bu işlem geri alınamaz.`,
        confirmText: label,
        danger: true,
        onConfirm: () => setCmdModal && setCmdModal({ device, cmd }),
      });
    } else {
      setCmdModal && setCmdModal({ device, cmd });
    }
  };

  // Hızlı komut (modalsız) — listedeki butonlar için
  const quickCmd = (e, device, cmd) => {
    e.stopPropagation();
    if (sendCmd) sendCmd(device, cmd);
    else setCmdModal && setCmdModal({ device, cmd });
  };

  return (
    <div style={{ display: "flex", gap: 18 }}>
      {/* Liste */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
          <input
            type="text"
            placeholder="🔍 Cihaz, kullanıcı veya IMEI..."
            value={searchQuery}
            onChange={e => setSearchQuery && setSearchQuery(e.target.value)}
            style={{ flex: 1, minWidth: 180, background: "#0f1220", border: "1px solid #2a3048", color: "#e2e8f0", padding: "8px 13px", borderRadius: 8, fontSize: 13, fontFamily: "inherit", outline: "none" }}
          />
          <select
            value={filterStatus}
            onChange={e => setFilterStatus && setFilterStatus(e.target.value)}
            style={{ background: "#0f1220", border: "1px solid #2a3048", color: "#e2e8f0", padding: "8px 13px", borderRadius: 8, fontSize: 13, fontFamily: "inherit", outline: "none" }}
          >
            <option value="all">Tüm Durumlar ({devices.length})</option>
            <option value="online">Çevrimiçi</option>
            <option value="offline">Çevrimdışı</option>
            <option value="locked">Kilitli</option>
          </select>
          <button
            className="btn"
            disabled={filtered.length === 0}
            onClick={() => exportCSV && exportCSV(
              filtered.map(d => ({
                ad: d.name || `${d.manufacturer || ""} ${d.model || ""}`.trim(),
                kullanici: d.owner_name || "",
                model: d.model || "",
                imei: d.imei || "",
                durum: sLabel(d.status),
                batarya: d.battery_level || 0,
                depolama: `${d.storage_used_gb || 0}/${d.storage_total_gb || 0}GB`,
                son_gorulme: d.last_seen_at || "",
              })),
              "cihazlar.csv"
            )}
          >
            📥 CSV
          </button>
          <button className="btn pr" onClick={() => setTab && setTab("enrollment")}>➕ Yeni Cihaz</button>
        </div>

        {/* Tablo Başlığı */}
        <div className="dr" style={{ background: "#0a0c18", color: "#475569", fontWeight: 600, fontSize: 11, letterSpacing: ".05em", textTransform: "uppercase", cursor: "default", borderRadius: "10px 10px 0 0", border: "1px solid #1a1f35", borderBottom: "none" }}>
          <span>Cihaz</span><span>Platform</span><span>Durum</span><span>Batarya</span><span>Depolama</span><span>Son Görülme</span><span>İşlem</span>
        </div>

        <div style={{ border: "1px solid #1a1f35", borderRadius: "0 0 10px 10px", overflow: "hidden" }}>
          {filtered.length === 0 ? (
            <div style={{ padding: "50px", textAlign: "center", color: "#475569", background: "#0a0c18", fontSize: 13 }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>📱</div>
              {devices.length === 0
                ? "Cihaz yok. ➕ Yeni Cihaz butonunu kullanın."
                : "Filtreyle eşleşen sonuç yok."}
            </div>
          ) : filtered.map(d => (
            <div
              key={d.id}
              className={`dr ${selectedDevice?.id === d.id ? "ac" : ""}`}
              onClick={() => setSelectedDevice && setSelectedDevice(d)}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 500, color: "#e2e8f0", fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {d.name || `${d.manufacturer || ""} ${d.model || ""}`.trim() || "İsimsiz"}
                </div>
                <div style={{ color: "#475569", fontSize: 11, marginTop: 2 }}>{d.owner_name || "—"}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: "#94a3b8" }}>🤖 {d.platform || "Android"} {d.android_version || d.os_version || "—"}</div>
                <div style={{ fontSize: 11, color: "#475569", marginTop: 1 }}>{d.model || "—"}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: sColor(d.status), flexShrink: 0 }}></div>
                <span style={{ fontSize: 12, color: sColor(d.status) }}>{sLabel(d.status)}</span>
              </div>
              <div>
                <div style={{ fontSize: 12, color: (d.battery_level || 0) < 20 ? "#f87171" : "#94a3b8", fontFamily: "monospace" }}>%{d.battery_level || 0}</div>
                <div className="bar" style={{ width: 56, marginTop: 4 }}>
                  <div className="bf" style={{ width: `${d.battery_level || 0}%`, background: (d.battery_level || 0) < 20 ? "#ef4444" : (d.battery_level || 0) < 50 ? "#f59e0b" : "#22c55e" }} />
                </div>
              </div>
              <div style={{ fontSize: 12, color: "#94a3b8", fontFamily: "monospace" }}>{d.storage_used_gb || 0}/{d.storage_total_gb || 0} GB</div>
              <div style={{ fontSize: 11, color: "#475569" }}>{d.last_seen_at ? new Date(d.last_seen_at).toLocaleString("tr-TR") : "—"}</div>
              <div style={{ display: "flex", gap: 4 }}>
                <button
                  className="btn"
                  title={d.status === "locked" ? "Kilidi Aç" : "Kilitle"}
                  style={{ padding: "4px 6px", fontSize: 11 }}
                  onClick={e => quickCmd(e, d, d.status === "locked" ? "unlock" : "lock")}
                >
                  {d.status === "locked" ? "🔓" : "🔒"}
                </button>
                <button
                  className="btn"
                  title="Konum"
                  style={{ padding: "4px 6px", fontSize: 11 }}
                  onClick={e => quickCmd(e, d, "locate")}
                >
                  📍
                </button>
                <button
                  className="btn dg"
                  title="Fabrika Ayarları (geri alınamaz)"
                  style={{ padding: "4px 6px", fontSize: 11 }}
                  onClick={e => { e.stopPropagation(); askDestructive(d, "wipe", "Fabrika Sıfırla"); }}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 8, fontSize: 11, color: "#475569" }}>
          {filtered.length} / {devices.length} cihaz
        </div>
      </div>

      {/* Detay Paneli */}
      {selectedDevice && (
        <div style={{ width: 290, flexShrink: 0 }}>
          <div className="card" style={{ overflow: "hidden", position: "sticky", top: 22 }}>
            <div style={{ padding: "12px 14px", borderBottom: "1px solid #1a1f35", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#f1f5f9" }}>Cihaz Detayı</span>
              <button
                onClick={() => setSelectedDevice && setSelectedDevice(null)}
                style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: 16 }}
                title="Kapat"
              >
                ✕
              </button>
            </div>
            <div style={{ padding: 14, borderBottom: "1px solid #1a1f35", textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 6 }}>📱</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9", wordBreak: "break-word" }}>
                {selectedDevice.name || `${selectedDevice.manufacturer || ""} ${selectedDevice.model || ""}`.trim() || "İsimsiz"}
              </div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{selectedDevice.owner_name || "—"}</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, marginTop: 7 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: sColor(selectedDevice.status) }}></div>
                <span style={{ fontSize: 12, color: sColor(selectedDevice.status) }}>{sLabel(selectedDevice.status)}</span>
              </div>
            </div>
            <div style={{ padding: "0 14px" }}>
              {[
                ["Model",      selectedDevice.model || "—"],
                ["Üretici",    selectedDevice.manufacturer || "—"],
                ["Platform",   `${selectedDevice.platform || "Android"} ${selectedDevice.android_version || selectedDevice.os_version || ""}`.trim()],
                ["IMEI",       selectedDevice.imei || selectedDevice.serial_number || "—"],
                ["Batarya",    `%${selectedDevice.battery_level || 0}`],
                ["Depolama",   `${selectedDevice.storage_used_gb || 0}/${selectedDevice.storage_total_gb || 0} GB`],
                ["Politika",   selectedDevice.policy_name || "—"],
                ["Uyumluluk",  selectedDevice.is_compliant !== false ? "✓ Uyumlu" : "✗ Uyumsuz"],
                ["Son Görülme", selectedDevice.last_seen_at ? new Date(selectedDevice.last_seen_at).toLocaleString("tr-TR") : "—"],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #1a1f35", fontSize: 12, gap: 8 }}>
                  <span style={{ color: "#475569", flexShrink: 0 }}>{k}</span>
                  <span style={{ color: "#94a3b8", fontFamily: "monospace", fontSize: 11, textAlign: "right", wordBreak: "break-all" }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ padding: "12px 14px 14px" }}>
              <div style={{ fontSize: 11, color: "#475569", marginBottom: 8, textTransform: "uppercase", letterSpacing: ".05em" }}>Komutlar</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                {[
                  { c: "lock",        l: "🔒 Kilitle" },
                  { c: "unlock",      l: "🔓 Aç" },
                  { c: "reboot",      l: "🔁 Başlat",  destructive: true,  destLabel: "Yeniden Başlat" },
                  { c: "locate",      l: "📍 Konum" },
                  { c: "push_policy", l: "🛡️ Politika" },
                  { c: "wipe",        l: "🗑️ Sıfırla", danger: true, destructive: true, destLabel: "Fabrika Sıfırla" },
                ].map(({ c, l, danger, destructive, destLabel }) => (
                  <button
                    key={c}
                    className={`btn ${danger ? "dg" : ""}`}
                    style={{ fontSize: 11, padding: "6px 4px", textAlign: "center" }}
                    onClick={() => {
                      if (destructive) askDestructive(selectedDevice, c, destLabel || l);
                      else setCmdModal && setCmdModal({ device: selectedDevice, cmd: c });
                    }}
                  >
                    {l}
                  </button>
                ))}
              </div>
              {!isAdmin && (
                <div style={{ marginTop: 10, fontSize: 10, color: "#64748b", fontStyle: "italic", textAlign: "center" }}>
                  🗑️ ve 🔁 için yönetici yetkisi gerekir
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
