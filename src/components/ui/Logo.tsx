import React from 'react'

interface LogoProps {
  className?: string
  fill?: string
}

export function Logo({ className = '', fill = 'currentColor' }: LogoProps) {
  const glowColor = fill === 'currentColor' ? '#00E5FF' : fill

  return (
    <svg 
      viewBox="0 0 100 100" 
      className={className} 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id="logoGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow 
            dx="0" 
            dy="0" 
            stdDeviation="4" 
            floodColor={glowColor} 
            floodOpacity="0.6" 
          />
        </filter>
      </defs>
      
      <g filter="url(#logoGlow)" fill={glowColor}>
        {/* Top block */}
        <rect x="44" y="10" width="12" height="28" rx="2" />
        
        {/* Bottom block */}
        <rect x="44" y="62" width="12" height="28" rx="2" />
        
        {/* Left block */}
        <rect x="10" y="44" width="28" height="12" rx="2" />
        
        {/* Right block */}
        <rect x="62" y="44" width="28" height="12" rx="2" />
      </g>
    </svg>
  )
}
