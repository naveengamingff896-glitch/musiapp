import { useEffect } from 'react';
import { parseRoute, useRoute } from './lib/router';
import { CatalogProvider } from './state/CatalogContext';
import { LibraryProvider } from './state/LibraryContext';
import { PlayerProvider } from './state/PlayerContext';
import { ToastProvider } from './state/ToastContext';
import { Shell } from './components/Shell';
import { EmptyState } from './components/MediaCard';
import { HomePage } from './pages/Home';
import { SearchPage } from './pages/Search';
import { ExplorePage } from './pages/Explore';
import { TeluguPage } from './pages/Telugu';
import { LibraryPage } from './pages/Library';
import { LikedPage, ChartsPage } from './pages/Liked';
import { PlaylistsPage, PlaylistPage } from './pages/Playlists';
import { AlbumsPage, AlbumPage } from './pages/Albums';
import { ArtistsPage, ArtistPage } from './pages/Artists';
import { DownloadsPage } from './pages/Downloads';
import { RadioPage } from './pages/Radio';
import { PodcastsPage, PodcastPage } from './pages/Podcasts';
import { ProfilePage, NotificationsPage, HistoryPage } from './pages/Profile';
import { SettingsPage } from './pages/Settings';
import { AdminPage } from './pages/Admin';
import { AboutPage } from './pages/About';
import { LanguagePage, GenrePage, MoodPage, EraPage } from './pages/Browse';
import { PlayerPage } from './pages/Player';

function NotFound({ path }: { path: string }) {
  return (
    <EmptyState
      title="Page not found"
      text={`Nothing is mapped to ${path}. Use the navigation to get back to the music.`}
      action={
        <a className="btn btn--primary" href="#/">
          Go to Home
        </a>
      }
    />
  );
}

function Routes() {
  const path = useRoute();
  const route = parseRoute(path);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [path]);

  const section = route.section;
  const id = route.id ? decodeURIComponent(route.id) : '';

  // The full-screen player is an immersive overlay without the app chrome.
  if (section === 'player') {
    return <PlayerPage />;
  }

  let page = <NotFound path={path} />;

  switch (section) {
    case 'home':
    case '':
      page = <HomePage />;
      break;
    case 'search':
      page = <SearchPage />;
      break;
    case 'explore':
      page = <ExplorePage />;
      break;
    case 'telugu':
      page = <TeluguPage />;
      break;
    case 'library':
      page = <LibraryPage />;
      break;
    case 'liked':
      page = <LikedPage />;
      break;
    case 'charts':
      page = <ChartsPage />;
      break;
    case 'playlists':
      page = <PlaylistsPage />;
      break;
    case 'playlist':
      page = id ? <PlaylistPage id={id} /> : <PlaylistsPage />;
      break;
    case 'albums':
      page = <AlbumsPage />;
      break;
    case 'album':
      page = id ? <AlbumPage id={id} /> : <AlbumsPage />;
      break;
    case 'artists':
      page = <ArtistsPage />;
      break;
    case 'artist':
      page = id ? <ArtistPage id={id} /> : <ArtistsPage />;
      break;
    case 'downloads':
      page = <DownloadsPage />;
      break;
    case 'radio':
      page = <RadioPage />;
      break;
    case 'podcasts':
      page = <PodcastsPage />;
      break;
    case 'podcast':
      page = id ? <PodcastPage id={id} /> : <PodcastsPage />;
      break;
    case 'profile':
      page = <ProfilePage />;
      break;
    case 'notifications':
      page = <NotificationsPage />;
      break;
    case 'history':
      page = <HistoryPage />;
      break;
    case 'settings':
      page = <SettingsPage />;
      break;
    case 'admin':
      page = <AdminPage />;
      break;
    case 'about':
      page = <AboutPage />;
      break;
    case 'language':
      page = id ? <LanguagePage code={id} /> : <ExplorePage />;
      break;
    case 'genre':
      page = id ? <GenrePage name={id} /> : <ExplorePage />;
      break;
    case 'mood':
      page = id ? <MoodPage name={id} /> : <ExplorePage />;
      break;
    case 'era':
      page = id ? <EraPage era={id} /> : <TeluguPage />;
      break;
    default:
      page = <NotFound path={path} />;
  }

  return <Shell>{page}</Shell>;
}

export default function App() {
  return (
    <ToastProvider>
      <CatalogProvider>
        <LibraryProvider>
          <PlayerProvider>
            <Routes />
          </PlayerProvider>
        </LibraryProvider>
      </CatalogProvider>
    </ToastProvider>
  );
}
