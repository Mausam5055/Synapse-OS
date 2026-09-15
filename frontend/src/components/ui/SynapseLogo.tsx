'use client';

import React from 'react';
import Link from 'next/link';

interface SynapseLogoProps {
  size?: number; // size of icon in px, default: 36
  variant?: 'icon-only' | 'horizontal' | 'dark-text' | 'light-text';
  colorScheme?: 'white-on-black' | 'emerald-on-black' | 'monochrome-black' | 'monochrome-white';
  href?: string;
  className?: string;
}

export default function SynapseLogo({
  size = 36,
  variant = 'horizontal',
  colorScheme = 'white-on-black',
  href = '/',
  className = ''
}: SynapseLogoProps) {
  const isLightText = variant === 'light-text';

  const iconContent = (
    <div 
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      <svg 
        viewBox="0 0 100 100" 
        width="100%" 
        height="100%" 
        className="w-full h-full"
      >
        {/* Sleek Matte Squircle Container */}
        {colorScheme !== 'monochrome-black' && colorScheme !== 'monochrome-white' && (
          <rect 
            x="4" 
            y="4" 
            width="92" 
            height="92" 
            rx="26" 
            fill="#09090b" 
          />
        )}

        {/* The Tri-Synapse Hex Cluster Mark */}
        <g fill={
          colorScheme === 'emerald-on-black' 
            ? '#10b981' 
            : colorScheme === 'monochrome-black' 
              ? '#09090b' 
              : '#ffffff'
        }>
          {/* Central Tri-Lobe Organic Core */}
          <path 
            d="
              M 34.5 33.5
              A 11.5 11.5 0 0 0 23.5 44
              A 11.5 11.5 0 0 0 34.5 54.5
              C 42 54.5, 47 59, 49 66
              C 49 71.5, 48.5 75, 48.5 75.5
              A 11.5 11.5 0 0 0 60 87
              A 11.5 11.5 0 0 0 71.5 75.5
              C 71.5 75, 71 71.5, 71 66
              C 73 59, 78 54.5, 85.5 54.5
              A 11.5 11.5 0 0 0 96.5 44
              A 11.5 11.5 0 0 0 85.5 33.5
              C 77 33.5, 68 40, 60 50
              C 52 40, 43 33.5, 34.5 33.5
              Z
            " 
          />
          {/* 3 Interstitial Satellite Synapse Nodes */}
          <circle cx="60" cy="24" r="9" />
          <circle cx="36" cy="74" r="9" />
          <circle cx="84" cy="74" r="9" />
        </g>
      </svg>
    </div>
  );

  if (variant === 'icon-only') {
    return href ? (
      <Link href={href} className="inline-block transition-opacity hover:opacity-85">
        {iconContent}
      </Link>
    ) : iconContent;
  }

  const fullContent = (
    <div className={`inline-flex items-center gap-2.5 transition-opacity hover:opacity-85 select-none ${className}`}>
      {iconContent}
      <span 
        className={`font-sans tracking-tight font-bold text-[1.125rem] leading-none ${
          isLightText ? 'text-white' : 'text-slate-900'
        }`}
      >
        Sanjeevni-OS
      </span>
    </div>
  );

  return href ? (
    <Link href={href} className="no-underline">
      {fullContent}
    </Link>
  ) : fullContent;
}
