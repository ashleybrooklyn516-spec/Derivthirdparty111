import CompactDigits from "./CompactDigits";

interface StrategyViewProps {
  strategyName: string;
  strategyDescription: string;
  counts: number[];
  lastDigits: number[];
  lastDigit: number | null;
}

export default function StrategyView({ strategyName, strategyDescription, counts, lastDigits, lastDigit }: StrategyViewProps) {
  return (
    <div style={{ background: "#f8fafc", borderRadius: 12, border: "1px solid #e2e8f0", padding: 16 }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 12, textAlign: "center" }}>
        Strategy: {strategyName}
      </div>
      <CompactDigits counts={counts} lastDigits={lastDigits} lastDigit={lastDigit} />
      <div style={{ marginTop: 16, padding: 16, background: "#fff", borderRadius: 8, border: "1px solid #e5e7eb", minHeight: 100, display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280", fontStyle: "italic" }}>
        {strategyDescription}
      </div>
    </div>
  );
}
