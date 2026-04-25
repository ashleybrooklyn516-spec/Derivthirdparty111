interface CompactDigitsProps {
  counts: number[];
  lastDigits: number[];
  lastDigit: number | null;
}

export default function CompactDigits({ counts, lastDigits, lastDigit }: CompactDigitsProps) {
  const total = lastDigits.length;

  const maxCount = Math.max(...counts);
  const minCount = Math.min(...counts);
  const mostDigits = counts.map((c, i) => c === maxCount ? i : null).filter(v => v !== null) as number[];
  const countsExcludingMax = counts.filter(c => c < maxCount);
  const secondCount = countsExcludingMax.length ? Math.max(...countsExcludingMax) : null;
  const secondDigits = secondCount !== null
    ? counts.map((c, i) => c === secondCount ? i : null).filter(v => v !== null) as number[]
    : [];
  const leastDigits = counts.map((c, i) => c === minCount ? i : null).filter(v => v !== null) as number[];

  const getClassName = (i: number) => {
    let cls = "compact-digit";
    if (i === lastDigit) cls += " active";
    else if (mostDigits.includes(i)) cls += " most";
    else if (secondDigits.includes(i)) cls += " second";
    else if (leastDigits.includes(i)) cls += " least";
    return cls;
  };

  const renderDigit = (i: number) => {
    const pct = total > 0 ? (100 * counts[i] / total) : 0;
    return (
      <div key={i} className={getClassName(i)} style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: "#1f2937" }}>{i}</div>
        <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 500 }}>{pct.toFixed(1)}%</div>
      </div>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", gap: 4 }}>
        {[0, 1, 2, 3, 4].map(renderDigit)}
      </div>
      <div style={{ display: "flex", gap: 4 }}>
        {[5, 6, 7, 8, 9].map(renderDigit)}
      </div>
    </div>
  );
}
