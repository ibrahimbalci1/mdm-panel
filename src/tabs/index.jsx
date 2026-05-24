import { useState } from "react";
import MapView from "../components/MapView";
import { API, authHeaders, toast, sColor, sLabel, rColor, rLabel } from "../utils";

// ─── Uygulamalar ──────────────────────────────────────────────────────────
export function Apps({
  apps = [],
  devices = [],
  setAppModal,
  setEditApp,
  setAppForm,
  deployApp,
  deleteApp,
  setConfirmModal,
  sendAll,
  currentUser,
}) {
  const [filter, setFilter] = useState("all"); // all | required | optional
  const isAdmin = currentUser?.role === "admin";

  const CAT_ICONS = {
    "Kurumsal": "🏢", "İletişim": "💬", "E-posta": "📧", "Tarayıcı": "🌐",
    "Depolama": "💾", "Toplantı": "🎥", "Güvenlik": "🔒", "Araç": "🔧", "Diğer": "📦",
  };
  const EMPTY_FORM = { name: "", package_name: "", version: "", is_required: false, category: "Diğer", size_mb: "", apk_url: "", description: "" };

  const filtered = apps.filter(a =>
    filter === "all" ? true :
    filter === "required" ? a.is_required :
    !a.is_required
  );

  const openNew = () => {
    if (!isAdmin) { toast("❌ Yönetici yetkisi gerekir", "error"); return; }
    setEditApp && setEditApp(null);
    setAppForm && setAppForm(EMPTY_FORM);
    setAppModal && setAppModal(true);
  };

  const openEdit = (app) => {
    if (!isAdmin) { toast("❌ Yönetici yetkisi gerekir", "error"); return; }
    setEditApp && setEditApp(app);
    setAppForm && setAppForm({
      name: app.name, package_name: app.package_name, version: app.version || "",
      is_required: !!app.is_required, category: app.category || "Diğer",
      size_mb: app.size_mb || "", apk_url: app.apk_url || "", description: app.description || "",
    });
    setAppModal && setAppModal(true);
  };

  const askDelete = (app) => {
    if (!isAdmin) { toast("❌ Yönetici yetkisi gerekir", "error"); return; }
    setConfirmModal && setConfirmModal({
      title: "Uygulamayı Sil",
      msg: `"${app.name}" silinecek. Cihazlardan da kaldırılabilir.`,
      confirmText: "Sil",
      danger: true,
      onConfirm: () => deleteApp && deleteApp(app),
    });
  };

  const counts = { all: apps.length, required: apps.filter(a => a.is_required).length, optional: apps.filter(a => !a.is_required).length };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9" }}>Uygulama Yönetimi</div>
          <div style={{ fontSize: 12, color: "#475569", marginTop: 2 }}>
            {apps.length} uygulama · {counts.required} zorunlu · {counts.optional} isteğe bağlı
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn" disabled={!devices.length} onClick={() => sendAll && sendAll("push_policy", "Uygulama Politikası")}>📤 Tüm Cihazlara Politika</button>
          <button className="btn pr" disabled={!isAdmin} onClick={openNew}>+ Uygulama Ekle</button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        {[["all", "Tümü"], ["required", "Zorunlu"], ["optional", "İsteğe Bağlı"]].map(([id, label]) => (
          <span
            key={id}
            className="tag"
            onClick={() => setFilter(id)}
