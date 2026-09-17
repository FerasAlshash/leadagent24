import React from 'react';

/**
 * LeadAgent24 Official Brand Logo & Icon Component
 * Vector SVG designed for extreme crispness at any scale (from 16px favicon to 128px hero).
 * Combines an autonomous AI targeting ring, stylized 'L' and 'A' vector paths, and an outbound trajectory arrow.
 */
export default function LeadAgentLogo({ className = "w-10 h-10", size = null }) {
  const style = size ? { width: `${size}px`, height: `${size}px` } : {};
  return (
    <div 
      style={style}
      className={`relative inline-flex items-center justify-center shrink-0 aspect-square ${className}`}
    >
      <svg 
        viewBox="0 0 48 48" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-xs"
      >
        <defs>
          {/* Background Gradient */}
          <linearGradient id="la24Bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#064E3B" />
            <stop offset="50%" stopColor="#047857" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>

          {/* Accent Core Glow */}
          <linearGradient id="la24Glow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>

          {/* Core Arrow Gradient */}
          <linearGradient id="la24Arrow" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#A7F3D0" />
            <stop offset="100%" stopColor="#FFFFFF" />
          </linearGradient>
        </defs>

        {/* Outer Rounded Container with subtle border */}
        <rect 
          x="1.5" 
          y="1.5" 
          width="45" 
          height="45" 
          rx="12" 
          fill="url(#la24Bg)" 
          stroke="#10B981" 
          strokeWidth="1.2" 
          strokeOpacity="0.4" 
        />

        {/* Outer Targeting / Radar Arc (Autonomous Discovery) */}
        <path 
          d="M 13 22 A 9 9 0 0 1 22 13" 
          stroke="url(#la24Glow)" 
          strokeWidth="2.2" 
          strokeLinecap="round" 
          opacity="0.8"
        />

        {/* Stylized 'L' segment */}
        <path 
          d="M 14.5 16.5 V 31.5 H 22.5" 
          stroke="#FFFFFF" 
          strokeWidth="3" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />

        {/* Dynamic Outbound Arrow / Stylized 'A' diagonal trajectory */}
        <path 
          d="M 21 31.5 L 31.5 15.5 M 31.5 15.5 H 24.5 M 31.5 15.5 V 22.5" 
          stroke="url(#la24Arrow)" 
          strokeWidth="3" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />

        {/* 'A' Crossbar (Neural Link / Spark) */}
        <path 
          d="M 24.5 25 H 28.8" 
          stroke="url(#la24Glow)" 
          strokeWidth="2.4" 
          strokeLinecap="round" 
        />

        {/* Pulse Target Dot (The 24/7 Agent Core) */}
        <circle 
          cx="33.5" 
          cy="31.5" 
          r="2.2" 
          fill="#34D399" 
        />
        <circle 
          cx="33.5" 
          cy="31.5" 
          r="4.2" 
          stroke="#34D399" 
          strokeWidth="0.9" 
          opacity="0.5" 
        />
      </svg>
    </div>
  );
}
