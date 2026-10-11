import React, { createContext, useContext, useState, useMemo } from 'react';
import { getGoldenSummary, getGhatsAnalysis } from '../data/dataService';

const FestivalContext = createContext(null);

export function FestivalProvider({ children }) {
  // Durga is the default upcoming festival
  const [festival, setFestival] = useState('Durga');
  const [selectedYear, setSelectedYear] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const summary = useMemo(() => getGoldenSummary(), []);

  const ghatsAnalysis = useMemo(() => {
    return getGhatsAnalysis(festival);
  }, [festival]);

  const value = {
    festival,
    setFestival,
    selectedYear,
    setSelectedYear,
    searchQuery,
    setSearchQuery,
    summary,
    ghatsAnalysis,
  };

  return (
    <FestivalContext.Provider value={value}>
      {children}
    </FestivalContext.Provider>
  );
}

export function useFestival() {
  const context = useContext(FestivalContext);
  if (!context) {
    throw new Error('useFestival must be used within a FestivalProvider');
  }
  return context;
}
