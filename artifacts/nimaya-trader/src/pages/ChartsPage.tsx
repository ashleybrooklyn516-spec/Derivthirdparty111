import { Link } from "wouter";
import DerivChart from "@/components/DerivChart";

export default function ChartsPage() {
  return (
    <div className="app-bg">
      <div className="container">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 20,
            paddingBottom: 15,
            borderBottom: "2px solid rgba(102,126,234,0.2)",
            paddingTop: 15,
            gap: 20,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <h2 style={{ fontSize: 28, margin: 0, color: "#2d3748", fontWeight: 700 }}>
              Charts
            </h2>
            <Link
              href="/"
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
              ← Nimaya Trader
            </Link>
          </div>
        </div>

        <div
          style={{
            background: "rgba(255,255,255,0.95)",
            borderRadius: 15,
            padding: 16,
            border: "2px solid rgba(102,126,234,0.2)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
          }}
        >
          <DerivChart height="600px" />
        </div>
      </div>
    </div>
  );
}
