'use client';

interface AdsterraSmartlinkProps {
  href: string;
  label?: string;
  className?: string;
}

export default function AdsterraSmartlink({
  href,
  label = 'Sponsored',
  className = '',
}: AdsterraSmartlinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer sponsored nofollow"
      className={`text-xs text-white/30 hover:text-white/50 transition-colors underline decoration-dotted underline-offset-2 ${className}`}
    >
      {label}
    </a>
  );
}
