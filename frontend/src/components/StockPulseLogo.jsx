import React from 'react';

export function StockPulseIcon({ size = 40, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="cyanGlow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00f2ff" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>
        <linearGradient id="boxTop" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0e7490" />
          <stop offset="100%" stopColor="#083344" />
        </linearGradient>
        <linearGradient id="boxSide" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>
        <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Hexagon Frame */}
      <polygon
        points="50,6 88,27.5 88,72.5 50,94 12,72.5 12,27.5"
        fill="#090d16"
        stroke="url(#cyanGlow)"
        strokeWidth="3.5"
        strokeLinejoin="round"
        filter="url(#neonGlow)"
      />
      <polygon
        points="50,11 84,30 84,70 50,89 16,70 16,30"
        fill="none"
        stroke="#00f2ff"
        strokeWidth="1"
        opacity="0.4"
      />

      {/* Isometric 3D Box / Crate */}
      {/* Top Face */}
      <polygon points="50,26 74,38 50,50 26,38" fill="url(#boxTop)" stroke="#00f2ff" strokeWidth="1" />
      {/* Top Tape Stripe */}
      <polygon points="44,29 56,35 50,38 38,32" fill="#00f2ff" opacity="0.9" />

      {/* Left Face */}
      <polygon points="26,38 50,50 50,74 26,62" fill="#091e3a" stroke="#00f2ff" strokeWidth="1" />
      {/* Barcode details on left face */}
      <line x1="31" y1="46" x2="31" y2="56" stroke="#00f2ff" strokeWidth="1.2" opacity="0.8" />
      <line x1="34" y1="47.5" x2="34" y2="57.5" stroke="#00f2ff" strokeWidth="1.8" opacity="0.8" />
      <line x1="37" y1="49" x2="37" y2="59" stroke="#00f2ff" strokeWidth="1" opacity="0.8" />
      <line x1="40" y1="50.5" x2="40" y2="60.5" stroke="#00f2ff" strokeWidth="1.5" opacity="0.8" />
      <line x1="43" y1="52" x2="43" y2="62" stroke="#00f2ff" strokeWidth="1.2" opacity="0.8" />

      {/* Right Face */}
      <polygon points="50,50 74,38 74,62 50,74" fill="#061a2e" stroke="#00f2ff" strokeWidth="1" />
      {/* Upward Arrows (↑↑) on right face */}
      <path d="M59,58 L59,50 M56,53 L59,50 L62,53" stroke="#00f2ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M66,54.5 L66,46.5 M63,49.5 L66,46.5 L69,49.5" stroke="#00f2ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Pulse Line Graph overlay */}
      <path
        d="M52,78 Q68,76 75,65 Q82,54 88,48"
        fill="none"
        stroke="#00f2ff"
        strokeWidth="2.5"
        strokeLinecap="round"
        filter="url(#neonGlow)"
      />
      <circle cx="58" cy="77" r="2.5" fill="#00f2ff" />
      <circle cx="68" cy="71" r="2.5" fill="#00f2ff" />
      <circle cx="78" cy="58" r="3" fill="#00f2ff" filter="url(#neonGlow)" />
      <circle cx="88" cy="48" r="3.5" fill="#ffffff" filter="url(#neonGlow)" />
    </svg>
  );
}

export default function StockPulseLogo({ showSubtitle = true, iconSize = 44 }) {
  return (
    <div className="stockpulse-brand-container">
      <StockPulseIcon size={iconSize} />
      <div className="stockpulse-brand-text">
        <div className="stockpulse-title">
          <span className="text-white">STOCK</span>
          <span className="text-cyan">PULSE</span>
        </div>
        {showSubtitle && (
          <>
            <div className="stockpulse-sub-line">
              <span className="line" />
              <span className="sub-tag">ERP</span>
              <span className="line" />
            </div>
            <div className="stockpulse-motto">
              <span>TRACK</span>
              <span className="dot">•</span>
              <span>MANAGE</span>
              <span className="dot">•</span>
              <span>GROW</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
