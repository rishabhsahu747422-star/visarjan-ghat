/**
 * Shell: festival toggle, four tabs, and the shared ranking fetch.
 * No router library — the tab and the selected ghat are plain state, mirrored into
 * the URL hash so a deep link survives a refresh and the demo can jump straight to a ghat.
 *
 * Durga is the default view and Durga and Ganesh are never mixed in one score (D-04).
 */
import { useCallback, useEffect, useState } from "react";
import { Festival, RankingResponse, Summary, api } from "./api";
import Ranking from "./pages/Ranking";
import Detail from "./pages/Detail";
import Gaps from "./pages/Gaps";
import Brief from "./pages/Brief";

const TABS = [
  { id: "ranking", label: "Ranking" },
  { id: "detail", label: "Ghat detail" },
  { id: "brief", label: "Brief" },
  { id: "gaps", label: "Data and limits" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function readHash(): { tab: TabId; site: string | null; festival: Festival | null } {
  const raw = window.location.hash.replace(/^#\/?/, "");
  const [tabPart, sitePart] = raw.split("/");
  const params = new URLSearchParams(window.location.hash.split("?")[1] ?? "");
  const festival = params.get("festival");
  return {
    tab: (TABS.find((t) => t.id === tabPart)?.id ?? "ranking") as TabId,
    site: sitePart ? decodeURIComponent(sitePart.split("?")[0]) : null,
    festival: festival === "Ganesh" || festival === "Durga" ? festival : null,
  };
}

export default function App() {
  const initial = readHash();
  // Durga first: it is the upcoming festival (20 Oct 2026).
  const [festival, setFestival] = useState<Festival>(initial.festival ?? "Durga");
  const [tab, setTab] = useState<TabId>(initial.tab);
  const [site, setSite] = useState<string | null>(initial.site);

  const [summary, setSummary] = useState<Summary | null>(null);
  const [ranking, setRanking] = useState<RankingResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .summary()
      .then(setSummary)
      .catch(() => {
        /* the ranking error below is the one the officer needs to see */
      });
  }, []);

  useEffect(() => {
    let cancelled = false;
    setRanking(null);
    setError(null);
    api
      .ranking(festival)
      .then((r) => {
        if (!cancelled) setRanking(r);
      })
      .catch(() => {
        if (!cancelled)
          setError(
            "Cannot reach the API. Start the backend (see README) or check VITE_API_BASE_URL."
          );
      });
    return () => {
      cancelled = true;
    };
  }, [festival]);

  // Keep the hash in step with the view.
  useEffect(() => {
    const path = tab === "detail" && site ? `${tab}/${encodeURIComponent(site)}` : tab;
    const next = `#/${path}?festival=${festival}`;
    if (window.location.hash !== next) window.history.replaceState(null, "", next);
  }, [tab, site, festival]);

  const openGhat = useCallback((s: string) => {
    setSite(s);
    setTab("detail");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const ranked = ranking?.ranking.find((g) => g.site === site);

  return (
    <div className="page">
      <header className="app-head">
        <div className="brand">
          <h1>Visarjan Ghat Watch</h1>
          <p className="tagline">
            Bhopal immersion ghats ranked on MPPCB readings against CPCB Class B limits
          </p>
        </div>
        <div className="toggle" role="group" aria-label="Festival">
          {(["Durga", "Ganesh"] as Festival[]).map((f) => (
            <button key={f} aria-pressed={festival === f} onClick={() => setFestival(f)}>
              {f}
            </button>
          ))}
        </div>
      </header>

      <nav className="tabs" role="tablist" aria-label="Sections">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls="tabpanel"
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main id="tabpanel" role="tabpanel" aria-labelledby={`tab-${tab}`} tabIndex={-1}>
        {tab === "ranking" && (
          <Ranking ranking={ranking} summary={summary} error={error} onSelect={openGhat} />
        )}
        {tab === "detail" && (
          <Detail
            site={site}
            festival={festival}
            ranked={ranked}
            onBack={() => setTab("ranking")}
          />
        )}
        {tab === "brief" && <Brief festival={festival} />}
        {tab === "gaps" && <Gaps summary={summary} ranking={ranking} />}
      </main>

      <footer className="app-foot">
        <p>
          Past readings only, not a forecast for 20 Oct 2026. Readings are compared with published
          limits; this is not a health assessment. Source pages are on every reading.
        </p>
      </footer>
    </div>
  );
}
