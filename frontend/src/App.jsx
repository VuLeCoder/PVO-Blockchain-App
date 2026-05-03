import React, { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = "http://localhost:8000";
const IPFS_GATEWAY = "https://ipfs.io/ipfs/";

// =========================
// THEME COLORS
// =========================
const theme = {
  bg: "#f8fafc",
  cardBg: "#ffffff",
  textMain: "#0f172a", 
  textMuted: "#334155", 
  border: "#e2e8f0",
  primary: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
  secondaryBg: "#f1f5f9",
  dropZoneBg: "#ffffff",
  dropZoneBorder: "#cbd5e1",
  successBg: "#dcfce7",
  successText: "#14532d", 
  errorBg: "#fee2e2",
  errorText: "#7f1d1d",
};

const Icons = {
  Logo: () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Upload: () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  Embed: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  Verify: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  Download: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  Menu: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  Close: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
};

// =========================
// UI COMPONENTS
// =========================
const Card = ({ children }) => (
  <div className="card-container" style={{
    background: theme.cardBg, borderRadius: 24, padding: "32px",
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)",
    border: `1px solid ${theme.border}`, color: theme.textMain,
  }}>{children}</div>
);

const Button = ({ children, onClick, type = "primary", icon }) => {
  const isPrimary = type === "primary";
  return (
    <button onClick={onClick} className="action-button" style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        padding: "14px 24px", borderRadius: 14, cursor: "pointer", fontWeight: "700",
        border: isPrimary ? "none" : `1px solid ${theme.border}`,
        background: isPrimary ? theme.primary : "#ffffff",
        color: isPrimary ? "white" : theme.textMain,
        marginTop: 16, width: "100%", transition: "all 0.2s"
      }}>{icon} {children}</button>
  );
};

const DropBox = ({ file, onFile, label }) => {
  const [preview, setPreview] = useState(null);
  useEffect(() => {
    if (!file) return setPreview(null);
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <div onDrop={(e) => { e.preventDefault(); onFile(e.dataTransfer.files[0]); }} onDragOver={(e) => e.preventDefault()}
      style={{ border: `2px dashed ${theme.dropZoneBorder}`, borderRadius: 20, padding: preview ? "12px" : "32px 20px", textAlign: "center", marginTop: 16, background: theme.dropZoneBg, cursor: "pointer", position: "relative", minHeight: preview ? "200px" : "auto", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      {preview ? (
        <div style={{ width: "100%" }}>
          <img src={preview} alt="preview" style={{ maxWidth: "100%", maxHeight: "250px", borderRadius: 12, display: "block", margin: "auto" }} />
          <div style={{ marginTop: 8, fontSize: "14px", color: theme.textMain, fontWeight: "700" }}>{file.name}</div>
        </div>
      ) : (
        <>
          <Icons.Upload />
          <div style={{ color: theme.textMain, fontWeight: "700", marginTop: 12 }}>{label}</div>
          <div style={{ color: theme.textMuted, fontSize: "13px" }}>Kéo thả hoặc nhấp để tải ảnh</div>
        </>
      )}
      <input type="file" style={{ display: "none" }} id={`input-${label}`} onChange={(e) => onFile(e.target.files[0])} />
      <label htmlFor={`input-${label}`} style={{ position: "absolute", inset: 0, cursor: "pointer" }} />
    </div>
  );
};

// =========================
// MAIN APP
// =========================
export default function App() {
  const [tab, setTab] = useState("embed");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");
  const [recordId, setRecordId] = useState("");
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("");
  const [result, setResult] = useState(null);

  const handleEmbed = async () => {
    if (!image || !message) return alert("Vui lòng nhập đủ thông tin");
    setLoading(true); setMode("embed"); setResult(null);
    const form = new FormData();
    form.append("image", image); form.append("message", message);
    try {
      const res = await axios.post(`${API_BASE}/embed`, form);
      setResult(res.data);
    } catch (err) { setResult({ success: false, error: err.message }); }
    setLoading(false);
  };

  const handleVerify = async () => {
    if (!recordId || !image1 || !image2) return alert("Thiếu dữ liệu xác thực");
    setLoading(true); setMode("verify"); setResult(null);
    const form = new FormData();
    form.append("record_id", recordId); form.append("image1", image1); form.append("image2", image2);
    try {
      const res = await axios.post(`${API_BASE}/verify-image`, form);
      setResult(res.data);
    } catch (err) { setResult({ success: false, error: err.message }); }
    setLoading(false);
  };

  const selectTab = (t) => { setTab(t); setIsMenuOpen(false); };

  return (
    <>
      <style>{`
        #root { border: none !important; outline: none !important; }
        body { margin: 0; background: ${theme.bg}; color: ${theme.textMain}; font-family: 'Inter', sans-serif; }
        
        .header { display: flex; justify-content: space-between; align-items: center; padding: 16px 40px; background: #fff; border-bottom: 1px solid ${theme.border}; position: sticky; top: 0; z-index: 100; }
        .nav-desktop { display: flex; gap: 8px; background: ${theme.secondaryBg}; padding: 6px; border-radius: 14px; }
        .nav-btn { border: none; padding: 10px 20px; border-radius: 10px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px; font-size: 14px; }
        .nav-btn.active { background: #fff; color: #2563eb; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
        .nav-btn.inactive { background: transparent; color: ${theme.textMuted}; }
        
        .menu-toggle { display: none; background: none; border: none; cursor: pointer; padding: 8px; }
        .mobile-menu { position: fixed; top: 70px; left: 0; right: 0; background: #fff; border-bottom: 1px solid ${theme.border}; display: none; flex-direction: column; padding: 16px; gap: 12px; z-index: 90; box-shadow: 0 10px 15px rgba(0,0,0,0.05); }
        .mobile-menu.open { display: flex; }

        .main-content { padding: 48px 24px; max-width: 700px; margin: auto; transition: filter 0.3s; }
        .is-blur { filter: blur(10px); pointer-events: none; }

        .input-field { width: 100%; padding: 16px; margin-top: 16px; border-radius: 12px; border: 1px solid ${theme.border}; outline: none; box-sizing: border-box; font-size: 15px; font-weight: 600; color: ${theme.bg}; }
        .input-field:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }

        .loading-overlay { position: fixed; inset: 0; background: rgba(255,255,255,0.7); backdrop-filter: blur(4px); display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 1000; }
        .spinner { width: 45px; height: 45px; border: 4px solid ${theme.secondaryBg}; border-top-color: #2563eb; border-radius: 50%; animation: spin 0.8s linear infinite; margin-bottom: 16px; }
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 640px) {
          .nav-desktop { display: none; }
          .menu-toggle { display: block; }
          .header { padding: 12px 20px; }
          .grid-2 { display: grid; grid-template-columns: 1fr; gap: 16px; }
        }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
      `}</style>

      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <div style={{ fontWeight: 800, color: "#2563eb" }}>{mode === "embed" ? "Đang nhúng..." : "Đang xác thực..."}</div>
        </div>
      )}

      <div className="header">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Icons.Logo />
          <div style={{ fontWeight: "900", fontSize: "1.2rem" }}>PVO Guard</div>
        </div>
        
        <div className="nav-desktop">
          <button className={`nav-btn ${tab === "embed" ? "active" : "inactive"}`} onClick={() => selectTab("embed")}><Icons.Embed /> Nhúng</button>
          <button className={`nav-btn ${tab === "verify" ? "active" : "inactive"}`} onClick={() => selectTab("verify")}><Icons.Verify /> Xác thực</button>
        </div>

        <button className="menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <Icons.Close /> : <Icons.Menu />}
        </button>
      </div>

      <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}>
        <button className={`nav-btn ${tab === "embed" ? "active" : "inactive"}`} style={{ width: '100%', justifyContent: 'center' }} onClick={() => selectTab("embed")}><Icons.Embed /> Nhúng dữ liệu</button>
        <button className={`nav-btn ${tab === "verify" ? "active" : "inactive"}`} style={{ width: '100%', justifyContent: 'center' }} onClick={() => selectTab("verify")}><Icons.Verify /> Xác thực dữ liệu</button>
      </div>

      <div className={`main-content ${loading ? 'is-blur' : ''}`}>
        {tab === "embed" ? (
          <Card>
            <h2 style={{ margin: "0 0 8px 0", fontWeight: 800, color: "#1e293b" }}>Nhúng hình chìm</h2>
            <p style={{ color: theme.textMuted, fontSize: "15px", marginBottom: 24 }}>Bảo vệ thông điệp bí mật bên trong hình ảnh.</p>
            <DropBox file={image} onFile={setImage} label="Ảnh gốc" />
            <input className="input-field" placeholder="Nội dung bí mật..." value={message} onChange={(e) => setMessage(e.target.value)} />
            <Button onClick={handleEmbed} icon={<Icons.Embed />}>Xử lý & Nhúng</Button>
            {result && mode === "embed" && (
              <div style={{ marginTop: 32, paddingTop: 24, borderTop: `2px solid ${theme.border}` }}>
                <div className="grid-2">
                  {[result.data?.cid1, result.data?.cid2].map((cid, i) => cid && (
                    <div key={i} style={{ textAlign: "center", background: theme.secondaryBg, padding: 12, borderRadius: 20 }}>
                      <img src={IPFS_GATEWAY + cid} style={{ width: "100%", borderRadius: 12 }} alt="result" />
                      <Button type="secondary" onClick={() => window.open(IPFS_GATEWAY + cid)} icon={<Icons.Download />}>Tải về</Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        ) : (
          <Card>
            <h2 style={{ margin: "0 0 8px 0", fontWeight: 800, color: "#1e293b" }}>Xác thực dữ liệu</h2>
            <p style={{ color: theme.textMuted, fontSize: "15px", marginBottom: 24 }}>Kiểm tra tính nguyên bản của tệp tin.</p>
            <input className="input-field" placeholder="Mã Record ID..." value={recordId} onChange={(e) => setRecordId(e.target.value)} />
            <div className="grid-2">
              <DropBox file={image1} onFile={setImage1} label="Ảnh 1" />
              <DropBox file={image2} onFile={setImage2} label="Ảnh 2" />
            </div>
            <Button onClick={handleVerify} icon={<Icons.Verify />}>Kiểm tra ngay</Button>
            {result && mode === "verify" && (
              <div style={{ marginTop: 24, padding: 20, borderRadius: 16, background: result.data?.valid ? theme.successBg : theme.errorBg, textAlign: 'center' }}>
                <div style={{ fontWeight: 800, color: result.data?.valid ? theme.successText : theme.errorText }}>
                  {result.data?.valid ? "✅ HỢP LỆ: Dữ liệu chưa bị thay đổi" : "❌ CẢNH BÁO: Phát hiện giả mạo"}
                </div>
              </div>
            )}
          </Card>
        )}
      </div>
    </>
  );
}
