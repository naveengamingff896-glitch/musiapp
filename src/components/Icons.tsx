import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function base({ size = 22, ...props }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    focusable: false,
    ...props,
  };
}

export const HomeIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M3.5 10.2 12 3.5l8.5 6.7V20a1 1 0 0 1-1 1h-4.6v-6.2H9.1V21H4.5a1 1 0 0 1-1-1z" />
  </svg>
);

export const SearchIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4.5 4.5" />
  </svg>
);

export const CompassIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="12" cy="12" r="9" />
    <path d="m15.5 8.5-2 5-5 2 2-5z" />
  </svg>
);

export const LibraryIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M4 4v16M8.5 4v16" />
    <rect x="12.5" y="4" width="7.5" height="16" rx="1.6" />
  </svg>
);

export const HeartIcon = ({ filled, ...props }: IconProps & { filled?: boolean }) => (
  <svg {...base(props)} fill={filled ? 'currentColor' : 'none'}>
    <path d="M12 20s-7.5-4.6-7.5-9.5A4.5 4.5 0 0 1 12 7.4a4.5 4.5 0 0 1 7.5 3.1C19.5 15.4 12 20 12 20Z" />
  </svg>
);

export const PlayIcon = (props: IconProps) => (
  <svg {...base(props)} fill="currentColor" stroke="none">
    <path d="M8 5.2c0-.9 1-1.4 1.7-.9l9 6.1c.7.5.7 1.5 0 2l-9 6.1c-.7.5-1.7 0-1.7-.9z" />
  </svg>
);

export const PauseIcon = (props: IconProps) => (
  <svg {...base(props)} fill="currentColor" stroke="none">
    <rect x="7" y="5" width="3.6" height="14" rx="1.1" />
    <rect x="13.4" y="5" width="3.6" height="14" rx="1.1" />
  </svg>
);

export const NextIcon = (props: IconProps) => (
  <svg {...base(props)} fill="currentColor" stroke="none">
    <path d="M6 5.6c0-.8.9-1.3 1.6-.8l7.2 5c.6.5.6 1.5 0 2l-7.2 5c-.7.5-1.6 0-1.6-.8z" />
    <rect x="16.4" y="4.5" width="2.4" height="15" rx="1.1" />
  </svg>
);

export const PrevIcon = (props: IconProps) => (
  <svg {...base(props)} fill="currentColor" stroke="none">
    <path d="M18 5.6c0-.8-.9-1.3-1.6-.8l-7.2 5c-.6.5-.6 1.5 0 2l7.2 5c.7.5 1.6 0 1.6-.8z" />
    <rect x="5.2" y="4.5" width="2.4" height="15" rx="1.1" />
  </svg>
);

export const ShuffleIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M3 7h3.2c1.4 0 2.4.7 3.3 1.8l4.9 6.4c.9 1.1 1.9 1.8 3.3 1.8H21" />
    <path d="M3 17h3.2c1.4 0 2.4-.7 3.3-1.8l1.3-1.7M14.4 8.9l1.3-1.9c.9-1.1 1.9-1.8 3.3-1.8H21" />
    <path d="m18 3.4 3 1.8-3 1.8M18 14.9l3 1.9-3 1.8" />
  </svg>
);

export const RepeatIcon = ({ mode = 'off', ...props }: IconProps & { mode?: 'off' | 'all' | 'one' }) => (
  <svg {...base(props)}>
    <path d="M17 3.5 20 6l-3 2.5" />
    <path d="M20 6H7.5A3.5 3.5 0 0 0 4 9.5V11" />
    <path d="M7 20.5 4 18l3-2.5" />
    <path d="M4 18h12.5a3.5 3.5 0 0 0 3.5-3.5V13" />
    {mode === 'one' && <text x="12" y="15" fontSize="7" textAnchor="middle" fill="currentColor" stroke="none">1</text>}
  </svg>
);

export const QueueIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M4 7h11M4 12h11M4 17h7" />
    <path d="M18 10v8.5a2 2 0 1 1-2-2h2" />
  </svg>
);

export const LyricsIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M4 6h16M4 11h10M4 16h13M4 21h7" />
  </svg>
);

export const VolumeIcon = ({ muted, ...props }: IconProps & { muted?: boolean }) => (
  <svg {...base(props)}>
    <path d="M4 9.5h3l4-3.2v11.4l-4-3.2H4z" />
    {muted ? <path d="m16 9.5 4.5 5M20.5 9.5 16 14.5" /> : <path d="M15 8.6a5 5 0 0 1 0 6.8M17.7 6a8.5 8.5 0 0 1 0 12" />}
  </svg>
);

export const DownloadIcon = ({ filled, ...props }: IconProps & { filled?: boolean }) => (
  <svg {...base(props)}>
    {filled ? (
      <path d="M12 3.5v11m0 0 3.8-3.8M12 14.5 8.2 10.7M4.5 18.5h15" />
    ) : (
      <>
        <path d="M12 3.5v11m0 0 3.8-3.8M12 14.5 8.2 10.7" />
        <path d="M4.5 17.5v1.2a1.8 1.8 0 0 0 1.8 1.8h11.4a1.8 1.8 0 0 0 1.8-1.8v-1.2" />
      </>
    )}
  </svg>
);

export const PlusIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const MoreIcon = (props: IconProps) => (
  <svg {...base(props)} fill="currentColor" stroke="none">
    <circle cx="12" cy="5.5" r="1.7" />
    <circle cx="12" cy="12" r="1.7" />
    <circle cx="12" cy="18.5" r="1.7" />
  </svg>
);

export const CloseIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="m6 6 12 12M18 6 6 18" />
  </svg>
);

export const ChevronDownIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="m6 9.5 6 6 6-6" />
  </svg>
);

export const ChevronLeftIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="m14.5 5.5-6 6.5 6 6.5" />
  </svg>
);

export const ChevronRightIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="m9.5 5.5 6 6.5-6 6.5" />
  </svg>
);

export const SettingsIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="12" cy="12" r="3.1" />
    <path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.2a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.2a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.2a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.2a1.6 1.6 0 0 0-1.4 1Z" />
  </svg>
);

export const UserIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="12" cy="8.2" r="3.8" />
    <path d="M4.5 20c.9-3.6 3.9-5.6 7.5-5.6s6.6 2 7.5 5.6" />
  </svg>
);

export const RadioIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="12" cy="12" r="2.4" />
    <path d="M7.8 7.8a6 6 0 0 0 0 8.4M16.2 16.2a6 6 0 0 0 0-8.4M5 5a10 10 0 0 0 0 14M19 19a10 10 0 0 0 0-14" />
  </svg>
);

export const MicIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <rect x="9" y="3" width="6" height="10.5" rx="3" />
    <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3" />
  </svg>
);

export const AlbumIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="2.6" />
  </svg>
);

export const ArtistIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="12" cy="9" r="3.4" />
    <path d="M5.5 20c.8-3.2 3.4-5 6.5-5s5.7 1.8 6.5 5" />
  </svg>
);

export const PlaylistIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M4 6.5h10M4 11.5h10M4 16.5h6" />
    <path d="M17.5 8v9.5a2.2 2.2 0 1 1-2.2-2.2h2.2" />
  </svg>
);

export const HistoryIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M4 12a8 8 0 1 0 2.4-5.7" />
    <path d="M4 4v4.2h4.2" />
    <path d="M12 8v4.4l3 1.8" />
  </svg>
);

export const ChartIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M5 20V10M12 20V4M19 20v-7" />
  </svg>
);

export const SparkIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M12 3.5 13.9 9l5.6 2-5.6 2-1.9 5.5L10.1 13l-5.6-2 5.6-2z" />
  </svg>
);

export const GlobeIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3.5 9.5h17M3.5 14.5h17M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
  </svg>
);

export const BellIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M18 15.5V10a6 6 0 1 0-12 0v5.5L4.5 18h15z" />
    <path d="M9.5 21h5" />
  </svg>
);

export const ShareIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="17.5" cy="5.5" r="2.5" />
    <circle cx="6.5" cy="12" r="2.5" />
    <circle cx="17.5" cy="18.5" r="2.5" />
    <path d="m8.8 10.8 6.4-3.6M8.8 13.2l6.4 3.6" />
  </svg>
);

export const TrashIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13" />
    <path d="M10.5 11v5M13.5 11v5" />
  </svg>
);

export const EditIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M4.5 19.5h4l10-10a2.1 2.1 0 0 0-3-3l-10 10z" />
    <path d="m14 7 3 3" />
  </svg>
);

export const CheckIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="m5 12.5 4.5 4.5L19 7" />
  </svg>
);

export const ArrowUpIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M12 20V5M6 11l6-6 6 6" />
  </svg>
);

export const ArrowDownIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M12 4v15M6 13l6 6 6-6" />
  </svg>
);

export const MenuIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);

export const InfoIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5.5M12 7.8v.4" />
  </svg>
);

export const AdminIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M12 3.2 20 6.6v5.2c0 4.4-3.2 7.7-8 9-4.8-1.3-8-4.6-8-9V6.6z" />
    <path d="m8.8 12 2.2 2.2 4.2-4.4" />
  </svg>
);

export const SunIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M18.7 5.3l-1.4 1.4M6.7 17.3l-1.4 1.4" />
  </svg>
);

export const MoonIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" />
  </svg>
);

export const FilterIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M4 6h16M7 12h10M10 18h4" />
  </svg>
);
