import { useState } from 'react';

interface KluTribeLogoProps {
  variant?: 'compact' | 'card' | 'full' | 'story';
  surface?: 'light' | 'dark';
  className?: string;
}

export function KluTribeLogo({
  variant = 'compact',
  surface = 'dark',
  className = '',
}: KluTribeLogoProps) {
  const [imgError, setImgError] = useState(false);

  const imgHeightClass =
    variant === 'story'
      ? 'h-24'
      : variant === 'full'
        ? 'h-12 sm:h-14'
        : variant === 'card'
          ? 'h-10 sm:h-11'
          : 'h-9 sm:h-10';

  if (imgError) {
    return (
      <span
        className={`font-display text-sm font-bold tracking-[0.14em] whitespace-nowrap shrink-0 ${
          surface === 'dark' ? 'text-[#F5F5F5]' : 'text-zinc-950'
        }`}
      >
        KLU TRIBE
      </span>
    );
  }

  const logoSrc =
    surface === 'dark'
      ? '/assets/klu-tribe-logo.png?v=3'
      : '/assets/klu-tribe-logo-light.png?v=3';

  return (
    <img
      src={logoSrc}
      alt="KLU TRIBE — The Student Community of KL University"
      referrerPolicy="no-referrer"
      onError={() => setImgError(true)}
      className={`w-auto object-contain shrink-0 select-none ${imgHeightClass} ${className}`}
    />
  );
}
