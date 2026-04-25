import { createContext, useContext, type ReactNode } from "react";
import { useDerivWS, type UseDerivWSReturn } from "@/hooks/useDerivWS";

const DerivContext = createContext<UseDerivWSReturn | null>(null);

export function DerivProvider({ children }: { children: ReactNode }) {
  const value = useDerivWS(true);
  return <DerivContext.Provider value={value}>{children}</DerivContext.Provider>;
}

export function useDeriv(): UseDerivWSReturn {
  const ctx = useContext(DerivContext);
  if (!ctx) {
    throw new Error("useDeriv must be used inside <DerivProvider>");
  }
  return ctx;
}
