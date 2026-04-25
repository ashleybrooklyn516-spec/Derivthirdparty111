import { useEffect, useRef } from "react";

interface DigitRingProps {
  counts: number[];
  lastDigits: number[];
  lastDigit: number | null;
}

function degToRad(d: number) { return d * Math.PI / 180; }

export default function DigitRing({ counts, lastDigits, lastDigit }: DigitRingProps) {
  const ringRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<HTMLDivElement[]>([]);

  const total = lastDigits.length;

  useEffect(() => {
    if (!ringRef.current) return;
    if (nodeRefs.current.length === 0) {
      const center = 130;
      const nodeRadius = 110;
      for (let i = 0; i < 10; i++) {
        const angle = degToRad((i / 10) * 360 - 90);
        const x = center + nodeRadius * Math.cos(angle);
        const y = center + nodeRadius * Math.sin(angle);
        const node = document.createElement("div");
        node.className = "digit-node";
        node.style.left = (x - 22) + "px";
        node.style.top = (y - 22) + "px";

        const digitSpan = document.createElement("div");
        digitSpan.textContent = String(i);
        digitSpan.style.fontWeight = "700";
        digitSpan.style.fontSize = "14px";

        const pctSpan = document.createElement("div");
        pctSpan.style.fontSize = "11px";
        pctSpan.textContent = "0.0%";

        node.appendChild(digitSpan);
        node.appendChild(pctSpan);
        ringRef.current.appendChild(node);
        nodeRefs.current.push(node);
      }
    }

    const maxCount = Math.max(...counts);
    const minCount = Math.min(...counts);
    const mostDigits = counts.map((c, i) => c === maxCount ? i : null).filter(v => v !== null) as number[];
    const countsExcludingMax = counts.filter(c => c < maxCount);
    const secondCount = countsExcludingMax.length ? Math.max(...countsExcludingMax) : null;
    const secondDigits = secondCount !== null
      ? counts.map((c, i) => c === secondCount ? i : null).filter(v => v !== null) as number[]
      : [];
    const leastDigits = counts.map((c, i) => c === minCount ? i : null).filter(v => v !== null) as number[];

    for (let i = 0; i < 10; i++) {
      const node = nodeRefs.current[i];
      if (!node) continue;
      const pctEl = node.querySelector("div:last-child") as HTMLElement;
      const pct = total > 0 ? (100 * counts[i] / total) : 0;
      if (pctEl) pctEl.textContent = pct.toFixed(1) + "%";

      node.classList.remove("active", "most", "second", "least");
      if (i === lastDigit) {
        node.classList.add("active");
      } else {
        if (mostDigits.includes(i)) node.classList.add("most");
        if (secondDigits.includes(i)) node.classList.add("second");
        if (leastDigits.includes(i)) node.classList.add("least");
      }
    }
  }, [counts, lastDigit, lastDigits, total]);

  return (
    <div style={{ background: "rgba(255,255,255,0.9)", borderRadius: 15, padding: 20, border: "2px solid rgba(102,126,234,0.2)", boxShadow: "0 8px 32px rgba(0,0,0,0.1)", backdropFilter: "blur(10px)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 15 }}>
        <span style={{ fontSize: 18, fontWeight: 700, color: "#2d3748" }}>Last Digit Stats (last 1000 ticks)</span>
        <span style={{ fontSize: 14, color: "#667eea", fontWeight: 600 }}>Total: {total}</span>
      </div>
      <div
        ref={ringRef}
        style={{ position: "relative", width: 260, height: 260, margin: "0 auto" }}
      >
        <svg style={{ position: "absolute", inset: 0 }} viewBox="0 0 260 260" width="260" height="260">
          <circle cx="130" cy="130" r="110" fill="none" stroke="#e5e7eb" strokeWidth="2" />
        </svg>
      </div>
      <div style={{ marginTop: 8, fontSize: 12, color: "#6b7280", textAlign: "center" }}>
        Active digit = <span style={{ color: "#2563eb" }}>blue</span>,{" "}
        Most frequent = <span style={{ color: "#16a34a" }}>green</span>,{" "}
        2nd most = <span style={{ color: "#eab308" }}>yellow</span>,{" "}
        Least frequent = <span style={{ color: "#ef4444" }}>red</span>
      </div>
    </div>
  );
}
