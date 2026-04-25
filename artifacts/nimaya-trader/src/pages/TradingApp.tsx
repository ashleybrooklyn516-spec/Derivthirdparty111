import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { useDeriv } from "@/context/DerivContext";
import DigitRing from "../components/DigitRing";
import Sidebar from "../components/Sidebar";
import EvenOddAnalyzer from "../components/EvenOddAnalyzer";
import StrategyView from "../components/StrategyView";

const STRATEGIES: Record<string, string> = {
  "Even / Odd": "Analyze patterns between even digits (0,2,4,6,8) and odd digits (1,3,5,7,9). Perfect for binary outcome strategies.",
  "Over / Under": "Compare digits 0-4 (Under) vs 5-9 (Over). Ideal for high/low prediction strategies.",
  "Matches / Differs": "Track digit patterns and sequences. Useful for same/different outcome predictions.",
  "Rise / Fall": "Monitor price movement trends based on last digit changes. Great for directional trading.",
  "Higher / Lower": "Compare higher digits (5-9) vs lower digits (0-4). Perfect for price level prediction strategies.",
  "Only Up / Only Down": "Track consecutive upward vs downward movements in price. Ideal for directional momentum strategies.",
  "Accumulators": "Advanced digit frequency analysis for accumulator-style trading strategies.",
};

export default function TradingApp() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentStrategy, setCurrentStrategy] = useState<string | null>(null);
  const [currentLayout, setCurrentLayout] = useState<"horizontal" | "vertical">("horizontal");

  const {
    status, activeSymbols, price, lastDigitDisplay, lastDigit,
    lastDigits, counts, evenOddTicks, currentSymbol, setCurrentSymbol, reconnect
  } = useDeriv();

  const priceKey = useRef(0);
  const lastDisplayedDigit = useRef<string>("-");

  if (lastDigitDisplay !== lastDisplayedDigit.current) {
    lastDisplayedDigit.current = lastDigitDisplay;
    priceKey.current++;
  }

  const handleSelectStrategy = (name: string) => {
    setCurrentStrategy(name);
    setSidebarOpen(false);
  };

  const handleBackToMain = () => {
    setCurrentStrategy(null);
  };

  const isEvenOdd = currentStrategy === "Even / Odd";
  const isOtherStrategy = currentStrategy && !isEvenOdd;

  return (
    <div className="app-bg">
      <div className="container">
        <div
          className={`hamburger ${sidebarOpen ? "active" : ""}`}
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <span /><span /><span />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, paddingBottom: 15, borderBottom: "2px solid rgba(102,126,234,0.2)", paddingTop: 15, gap: 20, flexWrap: "wrap" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <h2 style={{ fontSize: 28, margin: 0, color: "#2d3748", fontWeight: 700 }}>
                Nimaya Trader
              </h2>
              <Link
                href="/charts"
                style={{
                  fontSize: 16,
                  color: "#667eea",
                  fontWeight: 600,
                  textDecoration: "none",
                  padding: "6px 12px",
                  borderRadius: 8,
                  border: "2px solid rgba(102,126,234,0.3)",
                  background: "rgba(255,255,255,0.9)",
                }}
              >
                Charts
              </Link>
            </div>
            <span style={{
              display: "inline-block",
              padding: "4px 10px",
              borderRadius: 12,
              fontSize: 12,
              fontWeight: 600,
              alignSelf: "flex-start",
              background: status === "connected" ? "#d1fae5" : "#fee2e2",
              color: status === "connected" ? "#065f46" : "#991b1b",
            }}>
              {status === "connected" ? "Connected" : "Disconnected"}
            </span>
          </div>
          <div style={{ display: "flex", gap: 15, alignItems: "center", flexWrap: "wrap" }}>
            {currentStrategy && (
              <button
                onClick={handleBackToMain}
                style={{ padding: "12px 16px", borderRadius: 10, border: "2px solid rgba(102,126,234,0.3)", fontSize: 14, background: "rgba(255,255,255,0.9)", color: "#2d3748", cursor: "pointer" }}
              >
                ← Back to Main View
              </button>
            )}
            <select
              value={currentSymbol}
              onChange={e => setCurrentSymbol(e.target.value)}
              style={{ padding: "12px 16px", borderRadius: 10, border: "2px solid rgba(102,126,234,0.3)", fontSize: 14, background: "rgba(255,255,255,0.9)", color: "#2d3748", cursor: "pointer" }}
            >
              {activeSymbols.map(s => (
                <option key={s.symbol} value={s.symbol}>{s.display_name}</option>
              ))}
            </select>
            <button
              onClick={reconnect}
              style={{ padding: "12px 16px", borderRadius: 10, border: "2px solid rgba(102,126,234,0.3)", fontSize: 14, background: "rgba(255,255,255,0.9)", color: "#2d3748", cursor: "pointer" }}
            >
              Reconnect
            </button>
          </div>
        </div>

        {!currentStrategy && (
          <div
            className="main-content-grid"
            style={{
              display: "grid",
              gridTemplateColumns: currentLayout === "horizontal" ? "1fr 2fr" : "1fr",
              gap: 25,
              marginBottom: 25,
            }}
          >
            <div style={{ background: "rgba(255,255,255,0.9)", borderRadius: 15, padding: 25, textAlign: "center", border: "2px solid rgba(102,126,234,0.2)", backdropFilter: "blur(10px)", boxShadow: "0 8px 32px rgba(0,0,0,0.1)" }}>
              <div style={{ marginBottom: 15, fontSize: 18, color: "#667eea", fontWeight: 600 }}>Latest Price</div>
              <div style={{ fontSize: 36, fontWeight: 800, color: "#2d3748", marginBottom: 15 }}>
                {price}
                <span key={priceKey.current} className="digit-slide" style={{ color: "#16a34a" }}>
                  {lastDigitDisplay}
                </span>
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, color: "#667eea", marginTop: 10 }}>
                Last Digit:{" "}
                <span key={priceKey.current + "_ld"} className="digit-slide" style={{ fontSize: 24 }}>
                  {lastDigitDisplay}
                </span>
              </div>
            </div>
            <DigitRing counts={counts} lastDigits={lastDigits} lastDigit={lastDigit} />
          </div>
        )}

        {isEvenOdd && (
          <EvenOddAnalyzer
            counts={counts}
            lastDigits={lastDigits}
            lastDigit={lastDigit}
            evenOddTicks={evenOddTicks}
          />
        )}

        {isOtherStrategy && currentStrategy && (
          <StrategyView
            strategyName={currentStrategy}
            strategyDescription={STRATEGIES[currentStrategy] ?? ""}
            counts={counts}
            lastDigits={lastDigits}
            lastDigit={lastDigit}
          />
        )}

        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          currentStrategy={currentStrategy}
          onSelectStrategy={handleSelectStrategy}
          currentLayout={currentLayout}
          onToggleLayout={() => setCurrentLayout(l => l === "horizontal" ? "vertical" : "horizontal")}
        />
      </div>
    </div>
  );
}
