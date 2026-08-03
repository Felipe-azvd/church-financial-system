import React from 'react'

interface LogoProps {
  className?: string
  fill?: string
}

export function Logo({ className = '', fill = 'currentColor' }: LogoProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill={fill}>
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
