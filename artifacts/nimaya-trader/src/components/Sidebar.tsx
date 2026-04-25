interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentStrategy: string | null;
  onSelectStrategy: (name: string, description: string) => void;
  currentLayout: "horizontal" | "vertical";
  onToggleLayout: () => void;
}

const strategies = [
  { id: "evenOdd", icon: "⚖️", name: "Even / Odd", description: "Analyze patterns between even digits (0,2,4,6,8) and odd digits (1,3,5,7,9). Perfect for binary outcome strategies." },
  { id: "overUnder", icon: "📊", name: "Over / Under", description: "Compare digits 0-4 (Under) vs 5-9 (Over). Ideal for high/low prediction strategies." },
  { id: "matchesDiffers", icon: "🎯", name: "Matches / Differs", description: "Track digit patterns and sequences. Useful for same/different outcome predictions." },
  { id: "riseFall", icon: "📈", name: "Rise / Fall", description: "Monitor price movement trends based on last digit changes. Great for directional trading." },
  { id: "higherLower", icon: "💲", name: "Higher / Lower", description: "Compare higher digits (5-9) vs lower digits (0-4). Perfect for price level prediction strategies." },
  { id: "onlyUpDown", icon: "📍", name: "Only Up / Only Down", description: "Track consecutive upward vs downward movements in price. Ideal for directional momentum strategies." },
  { id: "accumulators", icon: "💰", name: "Accumulators", description: "Advanced digit frequency analysis for accumulator-style trading strategies." },
];

export default function Sidebar({ isOpen, onClose, currentStrategy, onSelectStrategy, currentLayout, onToggleLayout }: SidebarProps) {
  const sidebarBtnStyle: React.CSSProperties = {
    width: "100%",
    padding: "14px 16px",
    marginBottom: 8,
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 10,
    background: "rgba(255,255,255,0.1)",
    color: "#fff",
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
    textAlign: "left",
    display: "flex",
    alignItems: "center",
    gap: 10,
    transition: "all 0.3s ease",
  };

  return (
    <>
      <div
        className={`sidebar-overlay ${isOpen ? "active" : ""}`}
        onClick={onClose}
      />
      <div className={`sidebar ${isOpen ? "active" : ""}`}>
        <div style={{ padding: "24px 20px", borderBottom: "1px solid rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.1)" }}>
          <h3 style={{ color: "#fff", fontSize: 18, fontWeight: 600, margin: 0 }}>Trading Dashboard</h3>
          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 14, margin: "4px 0 0" }}>Market Analysis &amp; Tools</p>
        </div>
        <div style={{ padding: 20 }}>
          <div style={{ marginBottom: 32 }}>
            <div style={{ color: "#fff", fontSize: 14, fontWeight: 600, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.5px", opacity: 0.9 }}>
              Trading Strategies
            </div>
            {strategies.map(s => (
              <button
                key={s.id}
                style={{
                  ...sidebarBtnStyle,
                  background: currentStrategy === s.name ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.1)",
                }}
                onClick={() => onSelectStrategy(s.name, s.description)}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.2)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = currentStrategy === s.name ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.1)"; }}
              >
                <span style={{ fontSize: 16 }}>{s.icon}</span>
                {s.name}
              </button>
            ))}
          </div>
          <div>
            <div style={{ color: "#fff", fontSize: 14, fontWeight: 600, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.5px", opacity: 0.9 }}>
              Settings
            </div>
            <button
              style={{ ...sidebarBtnStyle, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)" }}
              onClick={() => { onToggleLayout(); onClose(); }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.25)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.15)"; }}
            >
              <span style={{ fontSize: 16 }}>🔄</span>
              {currentLayout === "horizontal" ? "Switch to Vertical" : "Switch to Horizontal"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
