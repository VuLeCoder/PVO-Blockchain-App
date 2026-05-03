import { theme } from "../config/theme";

export const Button = ({ children, onClick, type = "primary", icon }) => {
  const isPrimary = type === "primary";
  return (
    <button onClick={onClick} className="action-button" style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        padding: "14px 24px", borderRadius: 14, cursor: "pointer", fontWeight: "700",
        border: isPrimary ? "none" : `1px solid ${theme.border}`,
        background: isPrimary ? theme.primary : "#ffffff",
        color: isPrimary ? "white" : theme.textMain,
        marginTop: 16, width: "100%", transition: "all 0.2s"
      }}>
      {icon} {children}
    </button>
  );
};
