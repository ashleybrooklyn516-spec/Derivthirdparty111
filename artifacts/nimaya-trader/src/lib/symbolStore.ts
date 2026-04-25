const KEY = "nimaya:currentSymbol";
const EVENT = "nimaya:symbol-change";

export function getStoredSymbol(): string {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(KEY) ?? "";
  } catch {
    return "";
  }
}

export function setStoredSymbol(symbol: string): void {
  if (typeof window === "undefined" || !symbol) return;
  try {
    const prev = window.localStorage.getItem(KEY);
    if (prev === symbol) return;
    window.localStorage.setItem(KEY, symbol);
    window.dispatchEvent(new CustomEvent(EVENT, { detail: symbol }));
  } catch {
    // ignore
  }
}

export function subscribeSymbol(cb: (symbol: string) => void): () => void {
  if (typeof window === "undefined") return () => {};
  const onCustom = (e: Event) => {
    const detail = (e as CustomEvent<string>).detail;
    if (detail) cb(detail);
  };
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY && e.newValue) cb(e.newValue);
  };
  window.addEventListener(EVENT, onCustom);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(EVENT, onCustom);
    window.removeEventListener("storage", onStorage);
  };
}
