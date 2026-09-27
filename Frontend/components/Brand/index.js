import React from "react";

// One petal of a cherry blossom (notched tip), rotated 5x around the centre.
const PETAL = "M12 12 C8.4 9.6 8.2 4.6 10.5 2.4 L12 3.7 L13.5 2.4 C15.8 4.6 15.6 9.6 12 12 Z";

export const CherryBlossom = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={{ flexShrink: 0 }}>
    {[0, 72, 144, 216, 288].map((angle) => (
      <path
        key={angle}
        d={PETAL}
        fill="#f9b4cd"
        stroke="#ec7fa6"
        strokeWidth="0.5"
        strokeLinejoin="round"
        transform={`rotate(${angle} 12 12)`}
      />
    ))}
    <circle cx="12" cy="12" r="1.6" fill="#d94f80" />
  </svg>
);

// Site brand: blossom icon + "MoCeramic". `light` is for use on dark backgrounds.
const Brand = ({ size = 24, light = false, className = "", textClassName = "brand-text", style }) => (
  <span
    className={`d-inline-flex align-items-center ${className}`}
    style={{ gap: 8, fontWeight: 700, letterSpacing: "0.02em", ...style }}
  >
    <CherryBlossom size={size} />
    <span className={textClassName} style={{ color: light ? "#fff" : "inherit" }}>
      MoCeramic
    </span>
  </span>
);

export default Brand;
