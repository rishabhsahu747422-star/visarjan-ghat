/**
 * One fetch of the live API per festival, shared by every screen.
 *
 * Durga is the default: it is the coming festival. Switching festival refetches; Durga and
 * Ganesh data are never mixed in one view (D-04). Nothing is computed here.
 */
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { fetchGoldenSummary, fetchGhatsAnalysis } from '../data/dataService';

const FestivalContext = createContext(null);

const API_DOWN =
  'Cannot reach the API. Start the backend (see README) or check VITE_API_BASE_URL.';

export function FestivalProvider({ children }) {
  const [festival, setFestival] = useState('Durga');
  const [selectedYear, setSelectedYear] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const [summary, setSummary] = useState(null);
  const [ranked, setRanked] = useState([]);
  const [noDataGhats, setNoDataGhats] = useState([]);
  const [formulaVersion, setFormulaVersion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => setReloadToken((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    fetchGoldenSummary()
      .then((s) => !cancelled && setSummary(s))
      .catch(() => !cancelled && setSummary(null));
    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    // Clear first: a Ganesh screen must never show Durga numbers while the next fetch runs.
    setRanked([]);
    setNoDataGhats([]);

    fetchGhatsAnalysis(festival)
      .then((r) => {
        if (cancelled) return;
        setRanked(r.ranked);
        setNoDataGhats(r.noData);
        setFormulaVersion(r.formulaVersion);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError(API_DOWN);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [festival, reloadToken]);

  const value = {
    festival,
    setFestival,
    selectedYear,
    setSelectedYear,
    searchQuery,
    setSearchQuery,
    summary,
    // Ranked ghats only. Untested sites are kept apart so a gap can never read as a rank.
    ghatsAnalysis: ranked,
    noDataGhats,
    formulaVersion,
    loading,
    error,
    reload,
  };

  return <FestivalContext.Provider value={value}>{children}</FestivalContext.Provider>;
}

export function useFestival() {
  const context = useContext(FestivalContext);
  if (!context) {
    throw new Error('useFestival must be used within a FestivalProvider');
  }
  return context;
}
