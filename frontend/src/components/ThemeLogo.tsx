'use client';

import { useState } from 'react';

type ThemeLogoProps = {
  href?: string;
  className?: string;
};

export default function ThemeLogo({
  href = '/innovatech-logo.png',
  className = '',
}: ThemeLogoProps) {
  const [lightSrc, setLightSrc] = useState('/innovatech-logo-light.png');
  const [darkSrc, setDarkSrc] = useState('/innovatech-logo-dark.png');

  return (
    <span className={`relative block ${className}`}>
      <img
        src={lightSrc}
        alt="Innovatech Solutions"
        className="theme-logo-light h-auto w-full object-contain"
        onError={() => setLightSrc(href)}
      />

      <img
        src={darkSrc}
        alt="Innovatech Solutions"
        className="theme-logo-dark h-auto w-full object-contain"
        onError={() => setDarkSrc(href)}
      />
    </span>
  );
}
