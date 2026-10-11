import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Legend
} from 'recharts';
import { CPCB_LIMITS } from '../../data/ghatMeta';

export default function WaterQualityTrend({ rawReadings = [], className = '' }) {
  const [selectedParam, setSelectedParam] = useState('Dissolved oxygen');

  const parameters = ['Dissolved oxygen', 'BOD', 'pH', 'Turbidity', 'COD'];

  // Prepare chronological data points for selected parameter
  // Sorted chronologically: 2023 pre/during/after -> 2024 pre/during/after -> 2025 pre/during/after
  const phaseOrder = { pre: 1, during: 2, after: 3 };
  const paramReadings = rawReadings
    .filter((r) => r.parameter === selectedParam)
    .sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return (phaseOrder[a.phase] || 0) - (phaseOrder[b.phase] || 0);
    });

  const chartData = paramReadings.map((r) => ({
    label: `${r.year} ${r.phase.toUpperCase()}`,
    year: r.year,
    phase: r.phase,
    value: r.status === 'measured' ? r.value : null,
    status: r.status,
    flag: r.flag,
    unit: r.unit_assumed || (selectedParam === 'pH' ? '' : 'mg/l'),
    sourcePage: r.source_page,
  }));

  const limitInfo = CPCB_LIMITS[selectedParam];

  return (
    <div className={`bg-white rounded-2xl border border-forest/15 shadow-card p-6 ${className}`}>
      {/* Parameter Selection Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-forest/10">
        <div>
          <h3 className="font-bold text-base text-charcoal font-sans flex items-center gap-2">
            Historical Parameter Observations
            <span className="w-1.5 h-1.5 rounded-full bg-bright-yellow"></span>
          </h3>
          <p className="text-xs text-muted-grey mt-0.5">
            Chronological readings across Pre, During, and Post phases benchmarked against CPCB Class B bathing limits.
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {parameters.map((param) => (
            <button
              key={param}
              onClick={() => setSelectedParam(param)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedParam === param
                  ? 'bg-forest text-white shadow-sm'
                  : 'bg-light-grey text-charcoal hover:bg-pale-green'
              }`}
            >
              {param === 'Dissolved oxygen' ? 'DO (Oxygen)' : param}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="mt-6 w-full h-[320px]">
        {chartData.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-muted-grey text-sm">
            No historical observations recorded for {selectedParam} at this ghat.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#285032" strokeOpacity={0.08} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: '#777777', fontFamily: 'monospace' }}
                stroke="#285032"
                strokeOpacity={0.2}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#777777', fontFamily: 'monospace' }}
                stroke="#285032"
                strokeOpacity={0.2}
                unit={selectedParam === 'pH' ? '' : ' mg/l'}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-3 rounded-xl border border-forest/20 shadow-elevated text-xs font-sans space-y-1">
                        <div className="font-bold text-charcoal font-mono border-b border-forest/10 pb-1">
                          {data.year} · {data.phase.toUpperCase()} PHASE
                        </div>
                        <div className="flex items-center justify-between gap-4 pt-1">
                          <span className="text-muted-grey">{selectedParam}:</span>
                          <span className="font-bold font-mono text-forest">
                            {data.status === 'measured' ? `${data.value} ${data.unit}` : data.flag || data.status}
                          </span>
                        </div>
                        {data.sourcePage && (
                          <div className="text-[10px] text-muted-grey font-mono pt-1">
                            Report PDF Page {data.sourcePage}
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />

              {/* CPCB Class B Reference Lines */}
              {limitInfo?.min && (
                <ReferenceLine
                  y={limitInfo.min}
                  stroke="#D9534F"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{
                    value: `CPCB Min ${limitInfo.min} mg/l`,
                    fill: '#D9534F',
                    fontSize: 10,
                    position: 'insideTopRight',
                  }}
                />
              )}
              {limitInfo?.max && (
                <ReferenceLine
                  y={limitInfo.max}
                  stroke="#D9534F"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{
                    value: `CPCB Max ${limitInfo.max} mg/l`,
                    fill: '#D9534F',
                    fontSize: 10,
                    position: 'insideTopRight',
                  }}
                />
              )}

              <Line
                type="monotone"
                dataKey="value"
                name={selectedParam}
                stroke="#285032"
                strokeWidth={2.5}
                dot={{ fill: '#FFB900', stroke: '#285032', strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7, fill: '#FFB900', stroke: '#222222', strokeWidth: 2 }}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Legend & Standard Notes */}
      <div className="mt-4 pt-3 border-t border-forest/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-muted-grey">
        <div>
          {limitInfo ? (
            <span className="text-charcoal font-medium">
              Standard: {limitInfo.standard} ({limitInfo.desc})
            </span>
          ) : (
            <span>Contextual parameter: no outdoor bathing limit specified under CPCB Class B.</span>
          )}
        </div>
        <div className="font-mono text-[11px] text-forest flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-bright-yellow"></span>
          <span>Verified against MPPCB test tables</span>
        </div>
      </div>
    </div>
  );
}
