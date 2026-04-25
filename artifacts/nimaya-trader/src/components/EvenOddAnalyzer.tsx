import { useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  LineElement,
  LineController,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import CompactDigits from "./CompactDigits";

ChartJS.register(
  CategoryScale, LinearScale,
  BarElement, BarController,
  LineElement, LineController,
  PointElement,
  Title, Tooltip, Legend, Filler, ChartDataLabels
);

interface EvenOddAnalyzerProps {
  counts: number[];
  lastDigits: number[];
  lastDigit: number | null;
  evenOddTicks: number[];
}

const MAX_HISTORY_POINTS = 200;

function getConfidenceColor(pct: number): string {
  if (pct >= 70) return "#10b981";
  if (pct >= 50) return "#f59e0b";
  return "#ef4444";
}

export default function EvenOddAnalyzer({ counts, lastDigits, lastDigit, evenOddTicks }: EvenOddAnalyzerProps) {
  const strengthChartRef = useRef<HTMLCanvasElement>(null);
  const historyChartRef = useRef<HTMLCanvasElement>(null);
  const heatmapRef = useRef<HTMLCanvasElement>(null);
  const strengthChartInstance = useRef<ChartJS | null>(null);
  const historyChartInstance = useRef<ChartJS | null>(null);
  const heatmapInstance = useRef<ChartJS | null>(null);
  const historyEvenData = useRef<number[]>([]);
  const historyOddData = useRef<number[]>([]);
  const historyLabels = useRef<number[]>([]);
  const tickCounterRef = useRef<number>(0);

  useEffect(() => {
    if (!strengthChartRef.current || !historyChartRef.current || !heatmapRef.current) return;

    if (!strengthChartInstance.current) {
      strengthChartInstance.current = new ChartJS(strengthChartRef.current.getContext("2d")!, {
        type: "bar",
        data: {
          labels: ["Even", "Odd"],
          datasets: [{
            label: "Strength %",
            data: [0, 0],
            backgroundColor: ["#00ff88", "#ff3366"],
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: { beginAtZero: true, max: 100, ticks: { color: "#e7eef7" } },
            x: { ticks: { color: "#e7eef7" } },
          },
          plugins: {
            legend: { labels: { color: "#e7eef7" } },
            datalabels: { display: false },
          },
        },
      });
    }

    if (!historyChartInstance.current) {
      historyChartInstance.current = new ChartJS(historyChartRef.current.getContext("2d")!, {
        type: "line",
        data: {
          labels: [],
          datasets: [
            { label: "Even %", borderColor: "#00ff88", backgroundColor: "#00ff8844", data: [], fill: true, tension: 0.3 },
            { label: "Odd %", borderColor: "#ff3366", backgroundColor: "#ff336644", data: [], fill: true, tension: 0.3 },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: { beginAtZero: true, max: 100, ticks: { color: "#e7eef7" } },
            x: { ticks: { color: "#e7eef7" } },
          },
          plugins: {
            legend: { labels: { color: "#e7eef7" } },
            datalabels: { display: false },
          },
        },
      });
    }

    if (!heatmapInstance.current) {
      heatmapInstance.current = new ChartJS(heatmapRef.current.getContext("2d")!, {
        type: "bar",
        data: {
          labels: ["0","1","2","3","4","5","6","7","8","9"],
          datasets: [{
            label: "Digit Frequency",
            data: Array(10).fill(0),
            backgroundColor: ["#00ff88","#ff3366","#00ff88","#ff3366","#00ff88","#ff3366","#00ff88","#ff3366","#00ff88","#ff3366"],
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: { beginAtZero: true, ticks: { color: "#e7eef7" } },
            x: { ticks: { color: "#e7eef7" } },
          },
          plugins: {
            legend: { labels: { color: "#e7eef7" } },
            datalabels: {
              color: "#fff",
              anchor: "end",
              align: "top",
              formatter: (value: number) => {
                const total = lastDigits.length || 1;
                const pct = ((value / total) * 100).toFixed(1);
                return Number(pct) > 0 ? pct + "%" : "";
              },
            },
          },
        },
        plugins: [ChartDataLabels],
      });
    }

    return () => {
      if (strengthChartInstance.current) { strengthChartInstance.current.destroy(); strengthChartInstance.current = null; }
      if (historyChartInstance.current) { historyChartInstance.current.destroy(); historyChartInstance.current = null; }
      if (heatmapInstance.current) { heatmapInstance.current.destroy(); heatmapInstance.current = null; }
    };
  }, []);

  useEffect(() => {
    if (!strengthChartInstance.current || !historyChartInstance.current || !heatmapInstance.current) return;

    const evenStrength = counts[0] + counts[2] + counts[4] + counts[6] + counts[8];
    const oddStrength = counts[1] + counts[3] + counts[5] + counts[7] + counts[9];
    const total = evenStrength + oddStrength;
    const evenPercent = total > 0 ? parseFloat(((evenStrength / total) * 100).toFixed(1)) : 0;
    const oddPercent = total > 0 ? parseFloat(((oddStrength / total) * 100).toFixed(1)) : 0;

    strengthChartInstance.current.data.datasets[0].data = [evenPercent, oddPercent];
    strengthChartInstance.current.update();

    tickCounterRef.current++;
    historyLabels.current.push(tickCounterRef.current);
    historyEvenData.current.push(evenPercent);
    historyOddData.current.push(oddPercent);
    if (historyLabels.current.length > MAX_HISTORY_POINTS) {
      historyLabels.current.shift();
      historyEvenData.current.shift();
      historyOddData.current.shift();
    }

    historyChartInstance.current.data.labels = historyLabels.current;
    historyChartInstance.current.data.datasets[0].data = historyEvenData.current;
    historyChartInstance.current.data.datasets[1].data = historyOddData.current;
    historyChartInstance.current.update();

    heatmapInstance.current.data.datasets[0].data = counts;
    heatmapInstance.current.update();
  }, [counts, lastDigits]);

  const evenStrength = counts[0] + counts[2] + counts[4] + counts[6] + counts[8];
  const oddStrength = counts[1] + counts[3] + counts[5] + counts[7] + counts[9];
  const total = evenStrength + oddStrength;
  const evenPercent = total > 0 ? parseFloat(((evenStrength / total) * 100).toFixed(1)) : 0;
  const oddPercent = total > 0 ? parseFloat(((oddStrength / total) * 100).toFixed(1)) : 0;
  const strongSide = evenStrength > oddStrength ? "EVEN is Stronger" : oddStrength > evenStrength ? "ODD is Stronger" : "Balanced";

  let streak = 0;
  let currentSide: "even" | "odd" | null = null;
  if (evenOddTicks.length > 0) {
    streak = 1;
    for (let i = 1; i < evenOddTicks.length; i++) {
      if ((evenOddTicks[i] % 2) === (evenOddTicks[i-1] % 2)) streak++;
      else streak = 1;
    }
    currentSide = evenOddTicks[evenOddTicks.length - 1] % 2 === 0 ? "even" : "odd";
  }

  const getGlowClass = (streak: number, isEven: boolean) => {
    if (streak >= 7) return isEven ? "glow-strong-even" : "glow-strong-odd";
    if (streak >= 4) return "glow-weak";
    return "";
  };

  const resetZoom = () => {
    if (historyChartInstance.current && (historyChartInstance.current as ChartJS & { resetZoom?: () => void }).resetZoom) {
      (historyChartInstance.current as ChartJS & { resetZoom?: () => void }).resetZoom!();
    }
  };

  return (
    <div className="even-odd-analyzer">
      <CompactDigits counts={counts} lastDigits={lastDigits} lastDigit={lastDigit} />
      <h3 style={{ margin: "20px 0", color: "#f1f5f9", fontSize: 24, fontWeight: 700, textAlign: "center" }}>
        Even / Odd Tick Analyzer
      </h3>
      <div style={{ fontSize: 42, fontWeight: 800, color: "#10b981", textShadow: "0 0 20px rgba(16,185,129,0.5)", textAlign: "center", letterSpacing: 2, margin: "20px 0" }}>
        {lastDigit !== null ? lastDigit : "--"}
      </div>
      <div style={{ display: "flex", gap: 25, justifyContent: "center", margin: "25px 0", flexWrap: "wrap" }}>
        <div style={{ background: "linear-gradient(145deg,#1e293b,#0f172a)", padding: 20, borderRadius: 12, boxShadow: "0 8px 25px rgba(0,0,0,0.4)", textAlign: "center", flex: 1, minWidth: 150, border: "1px solid rgba(148,163,184,0.2)" }}>
          <h4 style={{ margin: "0 0 12px", color: "#f1f5f9", fontSize: 18 }}>Even</h4>
          <div style={{ width: 80, height: 80, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "white", background: getConfidenceColor(evenPercent), margin: "0 auto", border: "2px solid rgba(255,255,255,0.2)" }}>
            {evenPercent}%
          </div>
          <div style={{ marginTop: 8, color: "#f1f5f9" }} className={currentSide === "even" ? getGlowClass(streak, true) : ""}>
            Streak: {currentSide === "even" ? streak : 0}
          </div>
        </div>
        <div style={{ background: "linear-gradient(145deg,#1e293b,#0f172a)", padding: 20, borderRadius: 12, boxShadow: "0 8px 25px rgba(0,0,0,0.4)", textAlign: "center", flex: 1, minWidth: 150, border: "1px solid rgba(148,163,184,0.2)" }}>
          <h4 style={{ margin: "0 0 12px", color: "#f1f5f9", fontSize: 18 }}>Odd</h4>
          <div style={{ width: 80, height: 80, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "white", background: getConfidenceColor(oddPercent), margin: "0 auto", border: "2px solid rgba(255,255,255,0.2)" }}>
            {oddPercent}%
          </div>
          <div style={{ marginTop: 8, color: "#f1f5f9" }} className={currentSide === "odd" ? getGlowClass(streak, false) : ""}>
            Streak: {currentSide === "odd" ? streak : 0}
          </div>
        </div>
      </div>
      <div style={{ margin: "20px 0", fontSize: 16, background: "rgba(15,23,42,0.4)", padding: 20, borderRadius: 12, border: "1px solid rgba(148,163,184,0.2)" }}>
        <p style={{ margin: "8px 0" }}>Even Strength: <strong>{evenPercent}%</strong></p>
        <p style={{ margin: "8px 0" }}>Odd Strength: <strong>{oddPercent}%</strong></p>
        <p style={{ margin: "8px 0", fontWeight: 700, color: "#06d6a0" }}>{strongSide}</p>
      </div>
      <div style={{ display: "flex", gap: 15, margin: "20px 0", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 200, background: "linear-gradient(145deg,#1e2936,#0f1419)", borderRadius: 12, padding: 15, border: "1px solid rgba(102,126,234,0.2)" }}>
          <canvas ref={strengthChartRef} style={{ width: "100%", height: 200 }} />
        </div>
        <div style={{ flex: 1, minWidth: 200, background: "linear-gradient(145deg,#1e2936,#0f1419)", borderRadius: 12, padding: 15, border: "1px solid rgba(102,126,234,0.2)" }}>
          <canvas ref={historyChartRef} style={{ width: "100%", height: 200 }} />
        </div>
      </div>
      <button
        onClick={resetZoom}
        style={{ margin: "15px auto", padding: "10px 20px", borderRadius: 8, background: "linear-gradient(145deg,#10b981,#059669)", color: "#fff", fontWeight: 600, border: "none", cursor: "pointer", display: "block", fontSize: 14 }}
      >
        Reset Zoom
      </button>
      <div style={{ background: "linear-gradient(145deg,#1e2936,#0f1419)", borderRadius: 12, padding: 20, marginTop: 20, border: "1px solid rgba(102,126,234,0.2)" }}>
        <canvas ref={heatmapRef} style={{ width: "100%", height: 180 }} />
      </div>
    </div>
  );
}
