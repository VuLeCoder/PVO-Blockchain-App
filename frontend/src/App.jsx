import { useState } from "react";
import axios from "axios";
import { API_BASE, IPFS_GATEWAY, theme } from "./config/theme";
import { Icons } from "./components/Icons";
import { Card } from "./components/Card";
import { Button } from "./components/Button";
import { DropBox } from "./components/DropBox";
import "./App.css";

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
  const [showWatermark, setShowWatermark] = useState(false);

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

  const selectTab = (t) => {
    setTab(t);
    setIsMenuOpen(false);
  };

  return (
    <>
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
            <div className="side-input">
              <Card>
                <h2 style={{ margin: "0 0 8px 0", fontWeight: 800, color: "#1e293b" }}>Nhúng thông tin</h2>
                <p style={{ color: theme.textMuted, fontSize: "14px", marginBottom: 24 }}>Tạo hai phiên bản ảnh chứa dữ liệu ẩn để bảo mật.</p>
                <DropBox file={image} onFile={setImage} label="Ảnh gốc cần nhúng" />
                <input className="input-field" placeholder="Nhập nội dung bí mật..." value={message} onChange={(e) => setMessage(e.target.value)} />
                <Button onClick={handleEmbed} icon={<Icons.Embed />}>Bắt đầu xử lý</Button>
              </Card>
            </div>

            {embedResult && (
              <div className="side-result">
                <Card style={{ border: '2px solid #3b82f6', boxShadow: '0 0 15px rgba(59, 130, 246, 0.15)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h3 style={{ margin: 0, fontWeight: 800, color: '#2563eb', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                      Kết quả xử lý
                    </h3>
                    <span style={{ fontSize: '12px', background: '#dbeafe', color: '#1e40af', padding: '4px 10px', borderRadius: '20px', fontWeight: 'bold' }}>
                      IPFS Ready
                    </span>
                  </div>

                  <div className="record-badge" style={{ 
                    background: '#eff6ff',
                    border: '1px solid #bfdbfe', 
                    boxShadow: '0 0 10px rgba(59, 130, 246, 0.1)',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px'
                  }}>
                    <code style={{ 
                      background: 'none',
                      color: '#1d4ed8',
                      fontWeight: 800, 
                      fontSize: '15px',
                      letterSpacing: '0.5px' 
                    }}>
                      ID: {embedResult.record_id}
                    </code>
                    <button 
                      onClick={() => { navigator.clipboard.writeText(embedResult.record_id); showNotify("Đã chép ID", "success"); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6', display: 'flex', alignItems: 'center' }}
                    >
                      <Icons.Copy />
                    </button>
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
            <div>
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
                  <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* Banner Trạng thái Toàn vẹn */}
                    <div style={{ 
                      padding: 20, borderRadius: 16, 
                      background: verifyResult.valid ? theme.successBg : theme.errorBg, 
                      textAlign: 'center', border: `1px solid ${verifyResult.valid ? '#86efac' : '#fca5a5'}` 
                    }}>
                      <div style={{ fontWeight: 800, color: verifyResult.valid ? theme.successText : theme.errorText, fontSize: '1.1rem' }}>
                        {verifyResult.valid ? "✅ DỮ LIỆU HỢP LỆ" : "❌ CẢNH BÁO GIẢ MẠO"}
                      </div>
                      <p style={{ margin: '4px 0 0', fontSize: '13px', opacity: 0.8, color: verifyResult.valid ? theme.successText : theme.errorText }}>
                        {verifyResult.valid ? "Ảnh khớp hoàn toàn với bản gốc trên hệ thống." : "Nội dung ảnh đã bị can thiệp trái phép."}
                      </p>
                    </div>

                    {/* Phần hiển thị Watermark trích xuất được */}
                    {verifyResult.valid && (
                      <div style={{ border: `1px solid ${theme.border}`, borderRadius: 16, overflow: 'hidden', background: '#fff' }}>
                        <button 
                          onClick={() => setShowWatermark(!showWatermark)}
                          style={{ 
                            width: '100%', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', 
                            alignItems: 'center', background: '#f8fafc', border: 'none', cursor: 'pointer',
                            fontWeight: 800, color: '#1e293b', transition: '0.2s'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Icons.Embed />
                            <span>Thông điệp ẩn trích xuất</span>
                          </div>
                          <span style={{ fontSize: '12px' }}>{showWatermark ? <Icons.EyeOff /> : <Icons.Eye />}</span>
                        </button>
                        
                        {showWatermark && (
                          <div style={{ padding: '20px', borderTop: `1px solid ${theme.border}`, animation: 'slideDown 0.3s ease-out' }}>
                            <div style={{ marginBottom: 12, fontSize: '12px', color: theme.textMuted, fontWeight: 600 }}>
                              Nội dung được giải mã từ Pixel Value Ordering:
                            </div>
                            <div style={{ 
                              background: '#f1f5f9', padding: '16px', borderRadius: '12px', 
                              fontFamily: 'monospace', color: '#2563eb', fontWeight: 700,
                              border: '1px dashed #cbd5e1', wordBreak: 'break-all'
                            }}>
                              {verifyResult.watermark || "Không tìm thấy nội dung watermark."}
                            </div>
                            
                            {verifyResult.hash && (
                              <div style={{ marginTop: 12, fontSize: '11px', color: '#94a3b8' }}>
                                Blockchain Hash: {verifyResult.hash}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
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
