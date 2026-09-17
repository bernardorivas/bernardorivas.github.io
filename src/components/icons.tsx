// Inline monochrome marks, drawn in currentColor so they inherit link colour
// and work in both themes. No external icon font or CDN: the site ships no
// third-party assets.

type IconProps = { className?: string };

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function MailIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...stroke}>
      <rect x="2.5" y="5" width="19" height="14" rx="1.5" />
      <path d="M3.2 6.3 12 12.8l8.8-6.5" />
    </svg>
  );
}

// Google Scholar's mark is a mortarboard: the cap plate over the crown.
export function ScholarIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...stroke}>
      <path d="M12 3.6 1.9 9.1 12 14.6l10.1-5.5L12 3.6Z" />
      <path d="M6.3 11.7v4.1c0 1.7 2.6 3.1 5.7 3.1s5.7-1.4 5.7-3.1v-4.1" />
    </svg>
  );
}

// The GitHub mark, as distributed with Jekyll's minima theme (16×16 grid).
export function GitHubIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true" fill="currentColor">
      <path d="M7.999.431a7.76 7.76 0 0 0-2.453 15.124c.388.071.53-.168.53-.374 0-.184-.007-.672-.01-1.32-2.159.469-2.614-1.04-2.614-1.04-.353-.896-.862-1.135-.862-1.135-.705-.481.053-.472.053-.472.779.055 1.189.8 1.189.8.692 1.186 1.816.843 2.258.645.071-.502.271-.843.493-1.037-1.723-.197-3.534-.862-3.534-3.836 0-.847.302-1.54.799-2.082-.08-.197-.347-.986.076-2.054 0 0 .652-.209 2.134.796A7.44 7.44 0 0 1 8 4.184c.659.003 1.323.089 1.943.261 1.482-1.005 2.132-.796 2.132-.796.423 1.068.157 1.857.077 2.054.497.542.798 1.235.798 2.082 0 2.981-1.814 3.637-3.543 3.829.279.24.527.713.527 1.437 0 1.037-.01 1.874-.01 2.129 0 .208.14.449.534.373A7.761 7.761 0 0 0 7.999.431Z" />
    </svg>
  );
}

export function LinkedInIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3.1 9.6h3.8v10.9H3.1V9.6Zm6.2 0H13v1.5h.05c.52-.95 1.8-1.95 3.71-1.95 3.97 0 4.7 2.48 4.7 5.7v5.65h-3.95v-5c0-1.2-.02-2.73-1.68-2.73-1.68 0-1.94 1.3-1.94 2.64v5.09H9.3V9.6Z" />
    </svg>
  );
}

export function MoonIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...stroke}>
      <path d="M20.2 14.6A8.6 8.6 0 1 1 9.4 3.8a6.9 6.9 0 0 0 10.8 10.8Z" />
    </svg>
  );
}

export function SunIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...stroke}>
      <circle cx="12" cy="12" r="4.1" />
      <path d="M12 2.6v2.3M12 19.1v2.3M4.4 4.4l1.6 1.6M18 18l1.6 1.6M2.6 12h2.3M19.1 12h2.3M4.4 19.6 6 18M18 6l1.6-1.6" />
    </svg>
  );
}

export const ICONS = {
  mail: MailIcon,
  scholar: ScholarIcon,
  github: GitHubIcon,
  linkedin: LinkedInIcon,
} as const;

export type IconName = keyof typeof ICONS;
