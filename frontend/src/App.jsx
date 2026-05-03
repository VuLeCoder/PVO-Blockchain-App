import { useState, useEffect } from "react";
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
  primaryHover: "linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)",
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
  Download: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
};

// =========================
// LOADING OVERLAY COMPONENT
// =========================
const LoadingOverlay = ({ message }) => (
  <div className="loading-overlay">
    <div className="spinner"></div>
    <div className="loading-text">{message}</div>
  </div>
);

// =========================
// UI COMPONENTS
// =========================
const Card = ({ children }) => (
  <div className="card-container" style={{
    background: theme.cardBg,
    borderRadius: 24,
    padding: "32px",
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)",
    border: `1px solid ${theme.border}`,
    color: theme.textMain,
  }}>
    {children}
  </div>
);

const Button = ({ children, onClick, type = "primary", icon }) => {
  const isPrimary = type === "primary";
  return (
    <button
      onClick={onClick}
      className="action-button"
      style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        padding: "14px 24px",
        borderRadius: 14,
        border: isPrimary ? "none" : `1px solid ${theme.border}`,
        cursor: "pointer",
        fontWeight: "700",
        fontSize: "15px",
        background: isPrimary ? theme.primary : "#ffffff",
        color: isPrimary ? "white" : theme.textMain,
        marginTop: 16,
        boxShadow: isPrimary ? "0 4px 12px rgba(37, 99, 235, 0.2)" : "none",
        width: "100%",
        transition: "transform 0.2s, opacity 0.2s"
      }}
    >
      {icon} {children}
    </button>
  );
};

const DropBox = ({ file, onFile, label }) => {
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const handleDrop = (e) => {
    e.preventDefault();
    onFile(e.dataTransfer.files[0]);
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      style={{
        border: `2px dashed ${theme.dropZoneBorder}`,
        borderRadius: 20,
        padding: preview ? "12px" : "32px 20px",
        textAlign: "center",
        marginTop: 16,
        background: theme.dropZoneBg,
        cursor: "pointer",
        position: "relative",
        minHeight: preview ? "200px" : "auto",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"
      }}
    >
      {preview ? (
        <div style={{ position: "relative", width: "100%" }}>
          <img src={preview} alt="preview" style={{ maxWidth: "100%", maxHeight: "250px", borderRadius: 12, display: "block", margin: "auto" }} />
          <div style={{ marginTop: 8, fontSize: "14px", color: theme.textMain, fontWeight: "700" }}>{file.name}</div>
        </div>
      ) : (
        <>
          <Icons.Upload />
          <div style={{ color: theme.textMain, fontWeight: "700", marginTop: 12 }}>{label}</div>
          <div style={{ color: theme.textMuted, fontSize: "13px", fontWeight: "500" }}>Nhấp hoặc kéo thả ảnh vào đây</div>
        </>
      )}
      <input type="file" style={{ display: "none" }} id={`input-${label}`} onChange={(e) => onFile(e.target.files[0])} />
      <label htmlFor={`input-${label}`} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, cursor: "pointer" }} />
    </div>
  );
};

// =========================
// MAIN APP
// =========================
export default function App() {
  const [tab, setTab] = useState("embed");
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");
  const [recordId, setRecordId] = useState("");
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("");
  const [result, setResult] = useState(null);

  const handleEmbed = async () => {
    if (!image || !message) return alert("Vui lòng chọn ảnh và nhập nội dung");
    const form = new FormData();
    form.append("image", image);
    form.append("message", message);
    setLoading(true); setMode("embed"); setResult(null);
    try {
      const res = await axios.post(`${API_BASE}/embed`, form);
      setResult(res.data);
    } catch (err) { setResult({ success: false, error: err.message }); }
    setLoading(false);
  };

  const handleVerify = async () => {
    if (!recordId || !image1 || !image2) return alert("Thiếu thông tin xác thực");
    const form = new FormData();
    form.append("record_id", recordId);
    form.append("image1", image1);
    form.append("image2", image2);
    setLoading(true); setMode("verify"); setResult(null);
    try {
      const res = await axios.post(`${API_BASE}/verify-image`, form);
      setResult(res.data);
    } catch (err) { setResult({ success: false, error: err.message }); }
    setLoading(false);
  };

  const download = (cid, name) => {
    const a = document.createElement("a");
    a.href = IPFS_GATEWAY + cid;
    a.download = name;
    a.target = "_blank";
    a.click();
  };

  return (
    <>
      <style>{`
        /* Reset ID Root */
        #root { border: none !important; outline: none !important; }
        
        body { margin: 0; background: ${theme.bg}; color: ${theme.textMain}; font-family: 'Inter', sans-serif; -webkit-font-smoothing: antialiased; }
        
        .app-container { transition: filter 0.3s ease; }
        .app-container.is-blur { filter: blur(10px); pointer-events: none; }

        .header { display: flex; justify-content: space-between; align-items: center; padding: 16px 40px; background: #ffffff; border-bottom: 1px solid ${theme.border}; position: sticky; top: 0; z-index: 10; }
        .nav-buttons { display: flex; gap: 8px; background: ${theme.secondaryBg}; padding: 6px; border-radius: 14px; }
        .nav-btn { border: none; padding: 10px 24px; border-radius: 10px; font-weight: 700; cursor: pointer; transition: 0.2s; font-size: 14px; display: flex; align-items: center; gap: 6px; }
        .nav-btn.active { background: #ffffff; color: #2563eb; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
        .nav-btn.inactive { background: transparent; color: ${theme.textMuted}; }
        
        .main-content { padding: 48px 24px; max-width: 700px; margin: auto; }
        .input-field { width: 100%; padding: 16px; margin-top: 16px; border-radius: 12px; border: 1px solid ${theme.border}; outline: none; box-sizing: border-box; font-size: 15px; font-weight: 500; color: ${theme.bg}; }
        .input-field::placeholder { color: #94a3b8; }
        .input-field:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }

        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        @media (max-width: 640px) { .grid-2 { grid-template-columns: 1fr; } }

        /* Loading Animation */
        .loading-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(255, 255, 255, 0.7); display: flex; flex-direction: column; align-items: center; justifyContent: center; z-index: 100; backdrop-filter: blur(4px); }
        .spinner { width: 50px; height: 50px; border: 5px solid ${theme.secondaryBg}; border-top: 5px solid #2563eb; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 20px; }
        .loading-text { font-size: 18px; font-weight: 800; color: #2563eb; letter-spacing: 0.5px; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

        .action-button:active { transform: scale(0.98); opacity: 0.9; }
      `}</style>

      {loading && <LoadingOverlay message={mode === "embed" ? "Đang nhúng dữ liệu..." : "Đang xác thực dữ liệu..."} />}

      <div className={`app-container ${loading ? 'is-blur' : ''}`}>
        <div className="header">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Icons.Logo />
            <div style={{ fontWeight: "900", fontSize: "1.3rem", color: "#1e293b" }}>PVO Guard</div>
          </div>
          <div className="nav-buttons">
            <button className={`nav-btn ${tab === "embed" ? "active" : "inactive"}`} onClick={() => setTab("embed")}><Icons.Embed /> Nhúng</button>
            <button className={`nav-btn ${tab === "verify" ? "active" : "inactive"}`} onClick={() => setTab("verify")}><Icons.Verify /> Xác thực</button>
          </div>
        </div>

        <div className="main-content">
          {tab === "embed" && (
            <Card>
              <h2 style={{ margin: "0 0 8px 0", fontWeight: "800", color: "#1e293b" }}>Nhúng hình chìm</h2>
              <p style={{ margin: "0 0 24px 0", color: theme.textMuted, fontSize: "15px", fontWeight: "500" }}>Ẩn tin nhắn bí mật của bạn vào bên trong hình ảnh một cách an toàn.</p>
              
              <DropBox file={image} onFile={setImage} label="Tải lên ảnh gốc" />
              
              <input className="input-field" placeholder="Nhập tin nhắn bí mật..." value={message} onChange={(e) => setMessage(e.target.value)} />
              
              <Button onClick={handleEmbed} icon={<Icons.Embed />}>Bắt đầu nhúng</Button>

              {result && mode === "embed" && (
                <div style={{ marginTop: 32, paddingTop: 24, borderTop: `2px solid ${theme.border}` }}>
                  {result.success === false ? (
                    <div style={{ background: theme.errorBg, color: theme.errorText, padding: 16, borderRadius: 12, fontWeight: "700" }}>{result.error}</div>
                  ) : (
                    <div className="grid-2">
                      {[result.data.cid1, result.data.cid2].map((cid, i) => (
                        <div key={i} style={{ textAlign: "center", background: theme.secondaryBg, padding: 16, borderRadius: 20 }}>
                          <img src={IPFS_GATEWAY + cid} style={{ width: "100%", borderRadius: 12, marginBottom: 12 }} alt="result" />
                          <Button type="secondary" onClick={() => download(cid, `img${i}.png`)} icon={<Icons.Download />}>Lưu ảnh {i+1}</Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </Card>
          )}

          {tab === "verify" && (
            <Card>
              <h2 style={{ margin: "0 0 8px 0", fontWeight: "800", color: "#1e293b" }}>Xác thực tính toàn vẹn</h2>
              <p style={{ margin: "0 0 24px 0", color: theme.textMuted, fontSize: "15px", fontWeight: "500" }}>So khớp hình ảnh để phát hiện thay đổi hoặc giả mạo.</p>
              <input className="input-field" placeholder="Dán mã Record ID..." value={recordId} onChange={(e) => setRecordId(e.target.value)} />
              <div className="grid-2">
                <DropBox file={image1} onFile={setImage1} label="Ảnh thứ nhất" />
                <DropBox file={image2} onFile={setImage2} label="Ảnh thứ hai" />
              </div>
              <Button onClick={handleVerify} icon={<Icons.Verify />}>Xác thực ngay</Button>
              {result && mode === "verify" && (
                <div style={{ marginTop: 24, padding: 24, borderRadius: 20, background: result.data?.valid ? theme.successBg : theme.errorBg, border: `1px solid ${result.data?.valid ? theme.successText : theme.errorText}44` }}>
                  <div style={{ fontWeight: "800", fontSize: "18px", color: result.data?.valid ? theme.successText : theme.errorText, textAlign: "center" }}>
                    {result.data?.valid ? "✅ XÁC THỰC THÀNH CÔNG" : "❌ PHÁT HIỆN GIẢ MẠO"}
                  </div>
                  <p style={{ textAlign: "center", margin: "8px 0 0 0", color: result.data?.valid ? theme.successText : theme.errorText, opacity: 0.8, fontSize: "14px", fontWeight: "600" }}>
                    {result.data?.valid ? "Dữ liệu hình ảnh khớp hoàn toàn với bản gốc trên hệ thống." : "Nội dung hình ảnh đã bị thay đổi so với bản gốc."}
                  </p>
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
