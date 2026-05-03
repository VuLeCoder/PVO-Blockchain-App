import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = "http://localhost:8000";
const IPFS_GATEWAY = "https://ipfs.io/ipfs/";

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
  Close: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Copy: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
};

// =========================
// UI COMPONENTS
// =========================
const Card = ({ children, style }) => (
  <div style={{
    background: theme.cardBg, borderRadius: 24, padding: "32px",
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)",
    border: `1px solid ${theme.border}`, color: theme.textMain,
    width: "100%", boxSizing: "border-box", ...style
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
      style={{ border: `2px dashed ${theme.dropZoneBorder}`, borderRadius: 20, padding: preview ? "12px" : "32px 20px", textAlign: "center", marginTop: 16, background: theme.dropZoneBg, cursor: "pointer", position: "relative", minHeight: preview ? "180px" : "auto", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      {preview ? (
        <div style={{ width: "100%" }}>
          <img src={preview} alt="preview" style={{ maxWidth: "100%", maxHeight: "200px", borderRadius: 12, display: "block", margin: "auto" }} />
          <div style={{ marginTop: 8, fontSize: "12px", color: theme.textMain, fontWeight: "700", overflow: "hidden", textOverflow: "ellipsis" }}>{file.name}</div>
        </div>
      ) : (
        <>
          <Icons.Upload />
          <div style={{ color: theme.textMain, fontWeight: "700", marginTop: 12 }}>{label}</div>
          <div style={{ color: theme.textMuted, fontSize: "13px" }}>Kéo thả ảnh vào đây</div>
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
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  
  // States for Embed
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");
  const [embedResult, setEmbedResult] = useState(null);

  // States for Verify
  const [recordId, setRecordId] = useState("");
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [verifyResult, setVerifyResult] = useState(null);

  const showNotify = (msg, type = "error") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleEmbed = async () => {
    if (!image || !message) return showNotify("Vui lòng chọn ảnh và nhập thông điệp");
    setLoading(true); setEmbedResult(null);
    const form = new FormData();
    form.append("image", image); form.append("message", message);
    try {
      const res = await axios.post(`${API_BASE}/embed`, form);
      if(res.data.success) {
        setEmbedResult(res.data.data);
        showNotify("Nhúng dữ liệu thành công!", "success");
      } else {
        showNotify(res.data.error || "Có lỗi xảy ra");
      }
    } catch (err) { showNotify("Không thể kết nối đến server"); }
    setLoading(false);
  };

  const handleVerify = async () => {
    if (!recordId || !image1 || !image2) return showNotify("Vui lòng điền đủ thông tin xác thực");
    setLoading(true); setVerifyResult(null);
    const form = new FormData();
    form.append("record_id", recordId); form.append("image1", image1); form.append("image2", image2);
    try {
      const res = await axios.post(`${API_BASE}/verify-image`, form);
      setVerifyResult(res.data.data);
      if(res.data.data.valid) showNotify("Xác thực hoàn tất: Dữ liệu hợp lệ", "success");
      else showNotify("Cảnh báo: Dữ liệu đã bị thay đổi", "error");
    } catch (err) { showNotify("Lỗi hệ thống khi xác thực"); }
    setLoading(false);
  };

  const selectTab = (t) => { setTab(t); setIsMenuOpen(false); setEmbedResult(null); setVerifyResult(null); };

  return (
    <>
      <style>{`
        #root { width: 100%; border: none !important; outline: none !important; }
        body { margin: 0; background: ${theme.bg}; color: ${theme.textMain}; font-family: 'Inter', sans-serif; }
        .header { display: flex; justify-content: space-between; align-items: center; padding: 16px 40px; background: #fff; border-bottom: 1px solid ${theme.border}; position: sticky; top: 0; z-index: 100; }
        .nav-desktop { display: flex; gap: 8px; background: ${theme.secondaryBg}; padding: 6px; border-radius: 14px; }
        .nav-btn { border: none; padding: 10px 20px; border-radius: 10px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px; font-size: 14px; transition: 0.2s; }
        .nav-btn.active { background: #fff; color: #2563eb; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
        .nav-btn.inactive { background: transparent; color: ${theme.textMuted}; }
        
        .menu-toggle { display: none; background: none; border: none; cursor: pointer; padding: 8px; }
        .mobile-menu { position: fixed; top: 70px; left: 0; right: 0; background: #fff; border-bottom: 1px solid ${theme.border}; display: none; flex-direction: column; padding: 16px; gap: 12px; z-index: 90; box-shadow: 0 10px 15px rgba(0,0,0,0.05); }
        .mobile-menu.open { display: flex; }

        .container-wrapper { padding: 40px 20px; max-width: 1200px; margin: auto; }
        .responsive-layout { display: flex; flex-direction: column; gap: 32px; align-items: center; }
        
        /* Bố cục bên cạnh card gốc khi màn hình đủ to (Embed)[cite: 6] */
        @media (min-width: 1024px) {
            .responsive-layout.has-result { flex-direction: row; align-items: flex-start; justify-content: center; }
            .side-input { flex: 0 0 450px; }
            .side-result { flex: 1; max-width: 650px; position: sticky; top: 100px; }
        }

        .input-field { width: 100%; padding: 16px; margin-top: 16px; border-radius: 12px; border: 1px solid ${theme.border}; outline: none; box-sizing: border-box; font-size: 15px; font-weight: 600; color: ${theme.bg}; }
        .input-field:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }

        /* Notification Styling[cite: 6] */
        .notification { position: fixed; top: 85px; right: 20px; padding: 16px 24px; border-radius: 12px; color: white; font-weight: 700; z-index: 2000; box-shadow: 0 10px 20px rgba(0,0,0,0.1); animation: slideIn 0.3s ease-out; }
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

        .record-badge { background: ${theme.secondaryBg}; padding: 12px 16px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border: 1px solid ${theme.border}; }

        @media (max-width: 640px) {
          .nav-desktop { display: none; }
          .menu-toggle { display: block; }
          .header { padding: 12px 20px; }
          .grid-2 { display: grid; grid-template-columns: 1fr; gap: 16px; }
        }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

        .loading-overlay { position: fixed; inset: 0; background: rgba(255,255,255,0.7); backdrop-filter: blur(4px); display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 1000; }
        .spinner { width: 40px; height: 40px; border: 4px solid #e2e8f0; border-top-color: #2563eb; border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* Notification Banner[cite: 6] */}
      {notification && (
        <div className="notification" style={{ background: notification.type === "success" ? "#10b981" : "#ef4444" }}>
          {notification.type === "success" ? "✅ " : "⚠️ "} {notification.msg}
        </div>
      )}

      {loading && <div className="loading-overlay"><div className="spinner"></div></div>}

      <div className="header">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Icons.Logo />
          <div style={{ fontWeight: "900", fontSize: "1.2rem", letterSpacing: "-0.5px" }}>PVO Guard</div>
        </div>
        
        <div className="nav-desktop">
          <button className={`nav-btn ${tab === "embed" ? "active" : "inactive"}`} onClick={() => selectTab("embed")}><Icons.Embed /> Nhúng dữ liệu</button>
          <button className={`nav-btn ${tab === "verify" ? "active" : "inactive"}`} onClick={() => selectTab("verify")}><Icons.Verify /> Xác thực</button>
        </div>

        <button className="menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <Icons.Close /> : <Icons.Menu />}
        </button>
      </div>

      <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}>
        <button className={`nav-btn ${tab === "embed" ? "active" : "inactive"}`} onClick={() => selectTab("embed")}><Icons.Embed /> Nhúng dữ liệu</button>
        <button className={`nav-btn ${tab === "verify" ? "active" : "inactive"}`} onClick={() => selectTab("verify")}><Icons.Verify /> Xác thực dữ liệu</button>
      </div>

      <div className="container-wrapper">
        {tab === "embed" ? (
          <div className={`responsive-layout ${embedResult ? 'has-result' : ''}`}>
            {/* Cột trái: Card gốc[cite: 6] */}
            <div className="side-input">
              <Card>
                <h2 style={{ margin: "0 0 8px 0", fontWeight: 800, color: "#1e293b" }}>Nhúng thông tin</h2>
                <p style={{ color: theme.textMuted, fontSize: "14px", marginBottom: 24 }}>Tạo hai phiên bản ảnh chứa dữ liệu ẩn để bảo mật.</p>
                <DropBox file={image} onFile={setImage} label="Ảnh gốc cần nhúng" />
                <input className="input-field" placeholder="Nhập nội dung bí mật..." value={message} onChange={(e) => setMessage(e.target.value)} />
                <Button onClick={handleEmbed} icon={<Icons.Embed />}>Bắt đầu xử lý</Button>
              </Card>
            </div>

            {/* Cột phải: Hiện record_id và ảnh kết quả khi màn hình đủ to[cite: 6] */}
            {embedResult && (
              <div className="side-result">
                <Card style={{ border: '2px solid #3b82f6' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h3 style={{ margin: 0, fontWeight: 800, color: '#2563eb' }}>Kết quả trích xuất</h3>
                    <span style={{ fontSize: '12px', background: '#dbeafe', color: '#1e40af', padding: '4px 10px', borderRadius: '20px', fontWeight: 'bold' }}>IPFS Ready</span>
                  </div>

                  <div className="record-badge">
                    <code style={{ color: theme.textMain, fontWeight: 700 }}>ID: {embedResult.record_id}</code>
                    <button 
                      onClick={() => { navigator.clipboard.writeText(embedResult.record_id); showNotify("Đã chép ID", "success"); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6' }}
                    ><Icons.Copy /></button>
                  </div>

                  <div className="grid-2">
                    {[embedResult.cid1, embedResult.cid2].map((cid, i) => (
                      <div key={i} style={{ textAlign: "center" }}>
                        <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: `1px solid ${theme.border}` }}>
                           <img src={IPFS_GATEWAY + cid} style={{ width: "100%", display: 'block' }} alt="output" />
                        </div>
                        <Button type="secondary" onClick={() => window.open(IPFS_GATEWAY + cid)} icon={<Icons.Download />}>Ảnh {i+1}</Button>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}
          </div>
        ) : (
          <div className="responsive-layout">
            <div style={{ maxWidth: 600, width: '100%' }}>
              <Card>
                <h2 style={{ margin: "0 0 8px 0", fontWeight: 800, color: "#1e293b" }}>Xác thực dữ liệu</h2>
                <p style={{ color: theme.textMuted, fontSize: "14px", marginBottom: 24 }}>Cung cấp ID và 2 ảnh để kiểm tra tính toàn vẹn.</p>
                <input className="input-field" placeholder="Nhập mã Record ID..." value={recordId} onChange={(e) => setRecordId(e.target.value)} />
                <div className="grid-2">
                  <DropBox file={image1} onFile={setImage1} label="Ảnh thứ nhất" />
                  <DropBox file={image2} onFile={setImage2} label="Ảnh thứ hai" />
                </div>
                <Button onClick={handleVerify} icon={<Icons.Verify />}>Kiểm tra ngay</Button>
                
                {verifyResult && (
                  <div style={{ marginTop: 24, padding: 20, borderRadius: 16, background: verifyResult.valid ? theme.successBg : theme.errorBg, textAlign: 'center', border: `1px solid ${verifyResult.valid ? '#86efac' : '#fca5a5'}` }}>
                    <div style={{ fontWeight: 800, color: verifyResult.valid ? theme.successText : theme.errorText, fontSize: '1.1rem' }}>
                      {verifyResult.valid ? "✅ DỮ LIỆU HỢP LỆ" : "❌ CẢNH BÁO GIẢ MẠO"}
                    </div>
                    <div style={{ fontSize: '13px', marginTop: 4, color: verifyResult.valid ? theme.successText : theme.errorText, opacity: 0.8 }}>
                      {verifyResult.valid ? "Ảnh khớp hoàn toàn với bản gốc trên hệ thống." : "Nội dung ảnh đã bị can thiệp trái phép."}
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>
        )}
      </div>
    </>
  );
}