export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 96 96"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="1.25" y="1.25" width="93.5" height="93.5" rx="18" stroke="#C9A25E" strokeWidth="2.5" />
      <path
        d="M20 33.5 30.5 43 38 27.5 48 41 58 27.5 65.5 43 76 33.5 71.5 55.5h-47L20 33.5Z"
        fill="#C9A25E"
      />
      <circle cx="48" cy="30.5" r="2.6" fill="#0B0A09" />
      <text
        x="48"
        y="78"
        textAnchor="middle"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="27"
        fontWeight="700"
        letterSpacing="1"
        fill="#F2EBDD"
      >
        MH
      </text>
    </svg>
  );
}

export function BrandLockup({ compact = false }: { compact?: boolean }) {
  return (
    <span className="brand-lockup">
      <BrandMark className="brand-lockup__mark" />
      <span className="brand-lockup__text">
        <span className="brand-lockup__name">MOBILE HOUSE</span>
        {!compact && <span className="brand-lockup__tag">YOUR MOBILE PARTNER</span>}
      </span>
    </span>
  );
}
