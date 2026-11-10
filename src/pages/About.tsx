import { Link } from '../lib/router';
import { useCatalog } from '../state/CatalogContext';
import { useLibrary } from '../state/LibraryContext';
import { Notice, SectionHead } from '../components/MediaCard';

export function AboutPage() {
  const { songs, albums, artists, playlists, podcasts, licensing } = useCatalog();
  const { downloads } = useLibrary();

  const licensed = licensing.filter((record) => record.status === 'cleared').length;

  return (
    <div>
      <button type="button" className="link-back" onClick={() => window.history.back()}>
        ← Back
      </button>

      <div className="page-head">
        <div>
          <h1 className="page-title">About Mana Music</h1>
          <p className="page-sub">
            An original, Telugu-first Indian music streaming prototype. Every track, movie, artist and lyric in this build is
            fictional sample content paired with royalty-free demonstration audio.
          </p>
        </div>
      </div>

      <SectionHead title="What is inside this build" sub="Demo catalogue totals" />
      <div className="stat-grid">
        <div className="stat-card">
          <span className="stat-card__value">{songs.length}</span>
          <span className="stat-card__label">Demo songs</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__value">{albums.length}</span>
          <span className="stat-card__label">Albums & soundtracks</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__value">{artists.length}</span>
          <span className="stat-card__label">Artists</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__value">{playlists.length}</span>
          <span className="stat-card__label">Curated playlists</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__value">{podcasts.length}</span>
          <span className="stat-card__label">Podcast shows</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__value">{downloads.length}</span>
          <span className="stat-card__label">Your downloads</span>
        </div>
      </div>

      <SectionHead title="Working in this prototype" sub="Runs fully in the browser, no keys required" />
      <ul className="check-list">
        <li>Navigation across Home, Search, Explore, Library, Playlists, Albums, Artists, Radio, Podcasts, Downloads, Profile and Settings</li>
        <li>Working search with Telugu script and transliteration matching, filters and sorting</li>
        <li>Playback engine with queue, shuffle, repeat, seek, volume and a full-screen player with lyrics</li>
        <li>Playlist creation, renaming, deletion, track add/remove, reordering, sharing and following</li>
        <li>Likes, saved albums, followed artists, listening history and offline downloads saved in local storage</li>
        <li>Admin dashboard for songs, artists, albums, playlists, licensing records and user reports</li>
        <li>Installable PWA shell with a service worker and dark/light themes</li>
      </ul>

      <SectionHead title="Needs an external service or licence" sub="Deliberately not faked" />
      <ul className="check-list check-list--warn">
        <li>Real Telugu, Hindi and other language film catalogues: require label or distributor licensing</li>
        <li>Accounts, cross-device sync and cloud playlists: require an auth backend</li>
        <li>Payments and subscriptions: require a payment provider</li>
        <li>Streaming analytics and royalty accounting: require server-side reporting infrastructure</li>
        <li>Real podcast hosting and audio files: require licensed podcast feeds</li>
      </ul>

      <SectionHead title="Licensing register" sub="Sample records shown in the admin dashboard" />
      <Notice>
        {licensed} of {licensing.length} demo licensing records are marked cleared for prototype use. These are illustrative
        records, not real agreements. No copyrighted recordings are streamed, downloaded or scraped by this application.
      </Notice>

      <SectionHead title="Accessibility and performance" sub="Built for low-end Android phones" />
      <ul className="check-list">
        <li>Mobile-first layout with bottom navigation and a mini player that stays reachable one-handed</li>
        <li>Reduce-motion, larger-text and high-contrast options in Settings</li>
        <li>Local storage instead of network calls, so screens open instantly and work offline after first load</li>
        <li>Royalty-free loops kept small so playback starts quickly on slower connections</li>
      </ul>

      <div className="help-links">
        <Link to="/settings" className="btn btn--outline">
          Settings
        </Link>
        <Link to="/" className="btn btn--primary">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
