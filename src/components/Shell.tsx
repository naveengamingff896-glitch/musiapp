import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { Link, useRoute } from '../lib/router';
import { useLibrary } from '../state/LibraryContext';
import { PlayerBar } from './PlayerBar';
import {
  AdminIcon,
  AlbumIcon,
  ArtistIcon,
  BellIcon,
  CompassIcon,
  DownloadIcon,
  HeartIcon,
  HomeIcon,
  LibraryIcon,
  MicIcon,
  MoonIcon,
  PlaylistIcon,
  RadioIcon,
  SearchIcon,
  SettingsIcon,
  SparkIcon,
  SunIcon,
  UserIcon,
} from './Icons';

interface NavItem {
  to: string;
  label: string;
  icon: (props: { size?: number }) => JSX.Element;
}

const BROWSE: NavItem[] = [
  { to: '/', label: 'Home', icon: HomeIcon },
  { to: '/search', label: 'Search', icon: SearchIcon },
  { to: '/explore', label: 'Explore / Browse', icon: CompassIcon },
  { to: '/telugu', label: 'Telugu Music', icon: SparkIcon },
];

const YOUR_MUSIC: NavItem[] = [
  { to: '/library', label: 'Your Library', icon: LibraryIcon },
  { to: '/liked', label: 'Liked Songs', icon: HeartIcon },
  { to: '/playlists', label: 'Playlists', icon: PlaylistIcon },
  { to: '/albums', label: 'Albums', icon: AlbumIcon },
  { to: '/artists', label: 'Artists', icon: ArtistIcon },
  { to: '/downloads', label: 'Downloads', icon: DownloadIcon },
];

const LISTEN: NavItem[] = [
  { to: '/radio', label: 'Radio', icon: RadioIcon },
  { to: '/podcasts', label: 'Podcasts', icon: MicIcon },
];

const ACCOUNT: NavItem[] = [
  { to: '/profile', label: 'Profile', icon: UserIcon },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
  { to: '/admin', label: 'Admin dashboard', icon: AdminIcon },
];

function isActive(path: string, to: string): boolean {
  if (to === '/') return path === '/';
  return path === to || path.startsWith(`${to}/`);
}

function NavLink({ item, path }: { item: NavItem; path: string }) {
  const Icon = item.icon;
  return (
    <Link to={item.to} className={`nav-item ${isActive(path, item.to) ? 'nav-item--active' : ''}`}>
      <Icon size={19} />
      <span>{item.label}</span>
    </Link>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  const path = useRoute();
  const { settings, updateSettings, notifications } = useLibrary();
  const unread = notifications.filter((item) => !item.read).length;

  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme;
  }, [settings.theme]);

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>

      <aside className="sidebar" aria-label="Main navigation">
        <Link to="/" className="brand" aria-label="Mana Music home">
          <img className="brand__logo" src="/icons/logo.svg" alt="" width={38} height={38} />
          <span>
            <span className="brand__name">Mana Music</span>
            <span className="brand__tag">Telugu first</span>
          </span>
        </Link>

        <div className="nav-group">
          <div className="nav-group__label">Browse</div>
          {BROWSE.map((item) => (
            <NavLink key={item.to} item={item} path={path} />
          ))}
        </div>
        <div className="nav-group">
          <div className="nav-group__label">Your music</div>
          {YOUR_MUSIC.map((item) => (
            <NavLink key={item.to} item={item} path={path} />
          ))}
        </div>
        <div className="nav-group">
          <div className="nav-group__label">Listen</div>
          {LISTEN.map((item) => (
            <NavLink key={item.to} item={item} path={path} />
          ))}
        </div>
        <div className="nav-group">
          <div className="nav-group__label">Account</div>
          {ACCOUNT.map((item) => (
            <NavLink key={item.to} item={item} path={path} />
          ))}
        </div>

        <div className="sidebar__footer">
          <span className="badge badge--demo">Demo catalogue</span>
          <p style={{ marginTop: 8 }}>
            All songs, movies and artists here are fictional and audio is original royalty-free demo material.
            Licensed catalogues can be connected later.
          </p>
        </div>
      </aside>

      <div className="app-main">
        <header className="topbar">
          <Link to="/" className="topbar__brand" aria-label="Mana Music home">
            <img src="/icons/logo.svg" alt="" width={28} height={28} />
            <span>Mana Music</span>
          </Link>
          <span className="topbar__title" aria-hidden="true" />
          <Link to="/search" className="icon-btn" aria-label="Search">
            <SearchIcon size={20} />
          </Link>
          <Link to="/notifications" className="icon-btn" aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}>
            <BellIcon size={20} />
            {unread > 0 ? <span className="icon-btn__dot" /> : null}
          </Link>
          <button
            type="button"
            className="icon-btn"
            onClick={() => updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })}
            aria-label={`Switch to ${settings.theme === 'dark' ? 'light' : 'dark'} theme`}
          >
            {settings.theme === 'dark' ? <SunIcon size={20} /> : <MoonIcon size={20} />}
          </button>
        </header>

        <main id="main-content" className="page">
          {children}
        </main>
      </div>

      <PlayerBar />

      <nav className="bottom-nav" aria-label="Primary navigation">
        <Link to="/" className={`bottom-nav__item ${isActive(path, '/') ? 'bottom-nav__item--active' : ''}`}>
          <HomeIcon size={22} />
          <span>Home</span>
        </Link>
        <Link
          to="/search"
          className={`bottom-nav__item ${isActive(path, '/search') ? 'bottom-nav__item--active' : ''}`}
        >
          <SearchIcon size={22} />
          <span>Search</span>
        </Link>
        <Link
          to="/explore"
          className={`bottom-nav__item ${isActive(path, '/explore') ? 'bottom-nav__item--active' : ''}`}
        >
          <CompassIcon size={22} />
          <span>Explore</span>
        </Link>
        <Link
          to="/library"
          className={`bottom-nav__item ${isActive(path, '/library') ? 'bottom-nav__item--active' : ''}`}
        >
          <LibraryIcon size={22} />
          <span>Library</span>
        </Link>
        <Link
          to="/profile"
          className={`bottom-nav__item ${isActive(path, '/profile') ? 'bottom-nav__item--active' : ''}`}
        >
          <UserIcon size={22} />
          <span>Profile</span>
        </Link>
      </nav>
    </div>
  );
}
