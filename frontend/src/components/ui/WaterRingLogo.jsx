import React from 'react';

export default function WaterRingLogo({ size = 32, animated = true, className = '' }) {
  return (
    <div
      className={`relative flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
      title="Visarjan Ghat Watch — The Living Atlas"
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-sm"
      >
        {/* Outer Ring */}
        <circle
          cx="50"
          cy="50"
          r="46"
          stroke="currentColor"
          strokeWidth="3"
          strokeOpacity="0.25"
          className={animated ? 'animate-[spin_40s_linear_infinite]' : ''}
        />
        {/* Middle Dashed Contour Ring */}
        <circle
          cx="50"
          cy="50"
          r="34"
          stroke="#FFB900"
          strokeWidth="3.5"
          strokeDasharray="6 4"
          className={animated ? 'animate-[spin_25s_linear_infinite_reverse]' : ''}
        />
        {/* Inner Solid Water Ring */}
        <circle
          cx="50"
          cy="50"
          r="22"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeOpacity="0.8"
        />
        {/* Core Monitoring Node */}
        <circle
          cx="50"
          cy="50"
          r="8"
          fill="#FFB900"
        />
        {/* Water Ripple Wavelets */}
        <path
          d="M32 50 C38 46, 44 54, 50 50 C56 46, 62 54, 68 50"
          stroke="#FFFFFF"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
