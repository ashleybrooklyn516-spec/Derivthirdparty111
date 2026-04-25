import { Switch, Route, useLocation } from "wouter";
import TradingApp from "@/pages/TradingApp";
import ChartsPage from "@/pages/ChartsPage";
import NotFound from "@/pages/not-found";
import { DerivProvider } from "@/context/DerivContext";

const KNOWN_PATHS = new Set(["/", "/charts"]);

export default function App() {
  const [location] = useLocation();
  const isKnown = KNOWN_PATHS.has(location);

  return (
    <DerivProvider>
      {isKnown ? (
        <>
          <div style={{ display: location === "/" ? "block" : "none" }}>
            <TradingApp />
          </div>
          <div style={{ display: location === "/charts" ? "block" : "none" }}>
            <ChartsPage />
          </div>
        </>
      ) : (
        <Switch>
          <Route component={NotFound} />
        </Switch>
      )}
    </DerivProvider>
  );
}
