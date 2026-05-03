import { useState, useEffect } from "react";
import { theme } from "../config/theme";
import { Icons } from "./Icons";

export const DropBox = ({ file, onFile, label }) => {
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
