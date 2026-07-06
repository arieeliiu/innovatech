'use client';

import { useState } from 'react';
import Image from 'next/image';

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
      <Image
        src={lightSrc}
        alt="Innovatech Solutions"
        width={190}
        height={60}
        className="theme-logo-light h-auto w-full object-contain"
        onError={() => setLightSrc(href)}
      />

      <Image
        src={darkSrc}
        alt="Innovatech Solutions"
        width={190}
        height={60}
        className="theme-logo-dark h-auto w-full object-contain"
        onError={() => setDarkSrc(href)}
      />
    </span>
  );
}
