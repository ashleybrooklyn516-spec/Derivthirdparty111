import { useEffect, useRef, useCallback, useState } from "react";
import { getStoredSymbol, setStoredSymbol, subscribeSymbol } from "@/lib/symbolStore";

const WS_URL = "wss://ws.derivws.com/websockets/v3?app_id=97574";

export type ActiveSymbol = {
  symbol: string;
  display_name: string;
};

export type UseDerivWSReturn = {
  status: "connected" | "disconnected";
  activeSymbols: ActiveSymbol[];
  price: string;
  lastDigitDisplay: string;
  lastDigit: number | null;
  lastDigits: number[];
  counts: number[];
  evenOddTicks: number[];
  currentSymbol: string;
  setCurrentSymbol: (s: string) => void;
  reconnect: () => void;
};

export const PREFERRED_ORDER = [
  "1HZ10V","R_10","1HZ15V","1HZ25V","R_25","1HZ30V",
  "1HZ50V","R_50","1HZ75V","R_75","1HZ90V","1HZ100V",
  "R_100","RDBULL","RDBEAR",
  "JD10","JD25","JD50","JD75","JD100"
];

function getDecimalsForSymbol(symbol: string): number {
  if (!symbol) return 2;

  // 1s Volatility Indices
  // 10, 25, 50, 75, 100 all use 2 decimal places per API data
  if (["1HZ10V","1HZ25V","1HZ50V","1HZ75V","1HZ100V"].includes(symbol)) return 2;
  // 15, 30, 90 use 3 decimal places
  if (["1HZ15V","1HZ30V","1HZ90V"].includes(symbol)) return 3;

  // Standard Volatility Indices
  if (symbol === "R_10" || symbol === "R_25") return 3;
  if (symbol === "R_50" || symbol === "R_75") return 4;
  if (symbol === "R_100") return 2;

  if (["JD10","JD25","JD50","JD75","JD100"].includes(symbol)) return 2;

  if (symbol === "RDBULL" || symbol === "RDBEAR") return 4;

  return 2;
}

// Use toFixed for ALL markets so trailing zeros are preserved.
// e.g. 4821.130 → String(quote) drops the zero → wrong digit.
// Number(quote).toFixed(3) → "4821.130" → last char "0" → correct.
function getLastDigitFromQuote(quote: number, symbol: string): number | null {
  const decimals = getDecimalsForSymbol(symbol);
  const formatted = Number(quote).toFixed(decimals);
  const lastChar = formatted[formatted.length - 1];
  const d = Number(lastChar);
  return Number.isInteger(d) && d >= 0 && d <= 9 ? d : null;
}

export function useDerivWS(authenticated: boolean): UseDerivWSReturn {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number>(1000);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [status, setStatus] = useState<"connected" | "disconnected">("disconnected");
  const [activeSymbols, setActiveSymbols] = useState<ActiveSymbol[]>([]);
  const [currentSymbol, setCurrentSymbolState] = useState<string>("");
  const [price, setPrice] = useState<string>("--");
  const [lastDigitDisplay, setLastDigitDisplay] = useState<string>("-");
  const [lastDigit, setLastDigit] = useState<number | null>(null);

  const lastDigitsRef = useRef<number[]>([]);
  const countsRef = useRef<number[]>(Array(10).fill(0));
  const evenOddTicksRef = useRef<number[]>([]);

  const [lastDigits, setLastDigits] = useState<number[]>([]);
  const [counts, setCounts] = useState<number[]>(Array(10).fill(0));
  const [evenOddTicks, setEvenOddTicks] = useState<number[]>([]);

  const pushDigit = useCallback((digit: number) => {
    if (!Number.isInteger(digit) || digit < 0 || digit > 9) return;
    lastDigitsRef.current.push(digit);
    countsRef.current[digit]++;
    if (lastDigitsRef.current.length > 1000) {
      const removed = lastDigitsRef.current.shift()!;
      if (removed >= 0 && removed <= 9) countsRef.current[removed]--;
    }
    setLastDigits([...lastDigitsRef.current]);
    setCounts([...countsRef.current]);
  }, []);

  const subscribe = useCallback((symbol: string) => {
    if (!symbol || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(JSON.stringify({ forget_all: "ticks" }));
    lastDigitsRef.current = [];
    countsRef.current = Array(10).fill(0);
    evenOddTicksRef.current = [];
    setLastDigits([]);
    setCounts(Array(10).fill(0));
    setEvenOddTicks([]);
    setPrice("--");
    setLastDigitDisplay("-");
    setLastDigit(null);
    wsRef.current.send(JSON.stringify({ ticks_history: symbol, count: 1000, end: "latest", style: "ticks" }));
    wsRef.current.send(JSON.stringify({ ticks: symbol }));
  }, []);

  const setCurrentSymbol = useCallback((s: string) => {
    setCurrentSymbolState(s);
    setStoredSymbol(s);
    subscribe(s);
  }, [subscribe]);

  const connect = useCallback(() => {
    if (!authenticated) return;
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus("connected");
      reconnectTimeoutRef.current = 1000;
      ws.send(JSON.stringify({ active_symbols: "brief", product_type: "basic" }));
    };

    ws.onmessage = (msg) => {
      let data: Record<string, unknown>;
      try { data = JSON.parse(msg.data); } catch { return; }

      if (data.active_symbols) {
        const symbols = data.active_symbols as Array<{symbol: string; display_name: string}>;
        const ordered = PREFERRED_ORDER
          .map(sym => symbols.find(s => s.symbol === sym))
          .filter(Boolean) as ActiveSymbol[];
        setActiveSymbols(ordered);
        if (!currentSymbolRef.current && ordered.length) {
          const stored = getStoredSymbol();
          const initial = ordered.find(s => s.symbol === stored)?.symbol ?? ordered[0].symbol;
          setCurrentSymbolState(initial);
          currentSymbolRef.current = initial;
          setStoredSymbol(initial);
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ ticks_history: initial, count: 1000, end: "latest", style: "ticks" }));
            ws.send(JSON.stringify({ ticks: initial }));
          }
        }
      }

      if (data.history && (data.history as {prices: number[]}).prices) {
        const prices = (data.history as {prices: number[]}).prices;
        const sym = currentSymbolRef.current;
        const arr = prices
          .map(p => getLastDigitFromQuote(p, sym))
          .filter((d): d is number => d !== null);
        const sliced = arr.slice(-1000);
        lastDigitsRef.current = sliced;
        countsRef.current = Array(10).fill(0);
        sliced.forEach(n => { countsRef.current[n]++; });
        setLastDigits([...lastDigitsRef.current]);
        setCounts([...countsRef.current]);

        const eoTicks = prices
          .map(p => getLastDigitFromQuote(p, sym))
          .filter((d): d is number => d !== null);
        evenOddTicksRef.current = eoTicks;
        setEvenOddTicks([...eoTicks]);
      }

      if (data.tick) {
        const tick = data.tick as {quote: number};
        const quote = tick.quote;
        const sym = currentSymbolRef.current;
        const digit = getLastDigitFromQuote(quote, sym);
        if (digit !== null) {
          const decimals = getDecimalsForSymbol(sym);
          const formatted = quote.toFixed(decimals);
          setPrice(formatted.slice(0, -1));
          setLastDigitDisplay(formatted.slice(-1));
          setLastDigit(digit);
          pushDigit(digit);

          evenOddTicksRef.current.push(digit);
          if (evenOddTicksRef.current.length > 1000) evenOddTicksRef.current.shift();
          setEvenOddTicks([...evenOddTicksRef.current]);
        }
      }
    };

    ws.onclose = () => {
      setStatus("disconnected");
      if (authenticatedRef.current) {
        reconnectTimerRef.current = setTimeout(() => {
          connect();
          reconnectTimeoutRef.current = Math.min(reconnectTimeoutRef.current * 2, 30000);
        }, reconnectTimeoutRef.current);
      }
    };
  }, [authenticated, pushDigit]);

  const currentSymbolRef = useRef<string>("");
  const authenticatedRef = useRef<boolean>(authenticated);

  useEffect(() => { currentSymbolRef.current = currentSymbol; }, [currentSymbol]);
  useEffect(() => { authenticatedRef.current = authenticated; }, [authenticated]);

  const reconnect = useCallback(() => {
    if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
    if (wsRef.current) wsRef.current.close();
  }, []);

  useEffect(() => {
    if (authenticated) {
      connect();
    } else {
      if (wsRef.current) wsRef.current.close();
    }
    return () => {
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [authenticated, connect]);

  useEffect(() => {
    return subscribeSymbol((s) => {
      if (s && s !== currentSymbolRef.current) {
        setCurrentSymbolState(s);
        subscribe(s);
      }
    });
  }, [subscribe]);

  return {
    status,
    activeSymbols,
    price,
    lastDigitDisplay,
    lastDigit,
    lastDigits,
    counts,
    evenOddTicks,
    currentSymbol,
    setCurrentSymbol,
    reconnect,
  };
}
