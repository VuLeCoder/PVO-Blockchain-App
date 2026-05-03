import { theme } from "../config/theme";

export const Card = ({ children, style }) => (
  <div style={{
    background: theme.cardBg, borderRadius: 24, padding: "32px",
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)",
    border: `1px solid ${theme.border}`, color: theme.textMain,
    width: "100%", boxSizing: "border-box", ...style
  }}>
    {children}
  </div>
);
