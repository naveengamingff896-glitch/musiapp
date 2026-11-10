import { useMemo, useState } from 'react';
import { Link } from '../lib/router';
import { formatCount, formatTime, timeAgo } from '../lib/format';
import { useCatalog } from '../state/CatalogContext';
import { useLibrary } from '../state/LibraryContext';
import { usePlayer } from '../state/PlayerContext';
import { useToast } from '../state/ToastContext';
import { Artwork } from '../components/Artwork';
import { EmptyState, Notice, SectionHead } from '../components/MediaCard';
import { SongRow } from '../components/SongRow';
import {
  BellIcon,
  CheckIcon,
  DownloadIcon,
  HeartIcon,
  HistoryIcon,
  PlayIcon,
  SettingsIcon,
  SparkIcon,
  UserIcon,
} from '../components/Icons';

export function ProfilePage() {
  const { songById, artistName, artists, languages } = useCatalog();
  const {
    profile,
    updateProfile,
    settings,
    likedSongs,
    playlists,
    downloads,
    history,
    followedArtists,
    savedAlbums,
    notifications,
  } = useLibrary();
  const { playSongs } = usePlayer();
  const { notify } = useToast();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);

  const unread = notifications.filter((item) => !item.read).length;

  const historySongs = useMemo(
    () => history.map((entry) => songById.get(entry.songId)).filter((song): song is NonNullable<typeof song> => Boolean(song)),
    [history, songById],
  );

  const topArtists = useMemo(() => {
    const counts = new Map<string, number>();
    historySongs.forEach((song) => {
      song.singerIds.forEach((id) => counts.set(id, (counts.get(id) ?? 0) + 1));
      if (song.composerId) counts.set(song.composerId, (counts.get(song.composerId) ?? 0) + 1);
    });
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id, count]) => ({ id, count, artist: artists.find((item) => item.id === id) }))
      .filter((entry) => Boolean(entry.artist));
  }, [historySongs, artists]);

  const totalMinutes = Math.round(historySongs.reduce((sum, song) => sum + song.durationSec, 0) / 60);
  const language = languages.find((item) => item.code === profile.language);

  return (
    <div>
      <section className="profile-head">
        <div className="profile-head__avatar">
          <UserIcon size={34} />
        </div>
        <div className="profile-head__meta">
          <h1 className="page-title">{profile.name || 'Listener'}</h1>
          <p className="page-sub">
            {profile.email || 'No email saved'} · Member since{' '}
            {new Date(profile.joinedAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
          </p>
          <p className="page-sub">
            Preferred language: {language ? `${language.name} (${language.native})` : 'Telugu'} · Theme: {settings.theme}
          </p>
          <div className="detail-head__actions">
            <button type="button" className="btn btn--outline" onClick={() => setEditing(true)}>
              Edit profile
            </button>
            <Link to="/notifications" className="btn btn--ghost">
              <BellIcon size={16} /> Notifications {unread ? `(${unread})` : ''}
            </Link>
            <Link to="/settings" className="btn btn--ghost">
              <SettingsIcon size={16} /> Settings
            </Link>
          </div>
        </div>
      </section>

      <div className="stat-strip">
        <Link to="/liked" className="stat stat--link">
          <span className="stat__value">{likedSongs.length}</span>
          <span className="stat__label">Liked songs</span>
        </Link>
        <Link to="/playlists" className="stat stat--link">
          <span className="stat__value">{playlists.length}</span>
          <span className="stat__label">Playlists</span>
        </Link>
        <Link to="/downloads" className="stat stat--link">
          <span className="stat__value">{downloads.length}</span>
          <span className="stat__label">Downloads</span>
        </Link>
        <div className="stat">
          <span className="stat__value">{followedArtists.length}</span>
          <span className="stat__label">Artists followed</span>
        </div>
        <div className="stat">
          <span className="stat__value">{savedAlbums.length}</span>
          <span className="stat__label">Albums saved</span>
        </div>
        <div className="stat">
          <span className="stat__value">{totalMinutes} min</span>
          <span className="stat__label">Listening tracked</span>
        </div>
      </div>

      <section className="shelf">
        <SectionHead title="Listening statistics" sub={`${history.length} plays recorded on this device`} />
        {topArtists.length ? (
          <div className="top-artist-list">
            {topArtists.map((entry, index) => (
              <Link key={entry.id} to={`/artist/${entry.id}`} className="top-artist-row">
                <span className="top-artist-row__rank">{index + 1}</span>
                <span className="top-artist-row__art">
                  <Artwork seed={entry.id} title={entry.artist?.name ?? ''} round tiny />
                </span>
                <span className="top-artist-row__name">{entry.artist?.name}</span>
                <span className="top-artist-row__count">{entry.count} plays</span>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState title="No listening history yet" text="Play a few songs and your top artists appear here." />
        )}
      </section>

      {historySongs.length ? (
        <section className="shelf">
          <SectionHead title="Recently played" sub="Tap any track to continue" linkTo="/library" linkLabel="Full history" />
          <div className="song-list">
            {historySongs.slice(0, 6).map((song, index) => (
              <SongRow
                key={`${song.id}-${index}`}
                song={song}
                index={index}
                subtitle={`${artistName(song.singerIds[0])} · played ${timeAgo(history[index]?.at ?? Date.now())}`}
                onPlay={() => playSongs(historySongs, index, 'Recently played')}
              />
            ))}
          </div>
        </section>
      ) : null}

      <section className="shelf">
        <SectionHead title="Account and privacy" sub="Prototype account controls" />
        <div className="link-list">
          <Link to="/settings" className="link-row">
            <SettingsIcon size={16} /> Playback, theme and accessibility
          </Link>
          <Link to="/settings#privacy" className="link-row">
            <CheckIcon size={16} /> Privacy settings
          </Link>
          <Link to="/admin" className="link-row">
            <SparkIcon size={16} /> Admin dashboard (demo)
          </Link>
          <Link to="/history" className="link-row">
            <HistoryIcon size={16} /> Listening history
          </Link>
          <Link to="/downloads" className="link-row">
            <DownloadIcon size={16} /> Offline downloads
          </Link>
          <Link to="/liked" className="link-row">
            <HeartIcon size={16} /> Liked songs
          </Link>
        </div>
      </section>

      <Notice>
        This is a local demo profile. Sign-in, account recovery and synced listening data require a backend with
        authentication and licensed catalogue access.
      </Notice>

      {editing ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true" onClick={() => setEditing(false)}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <h2 className="modal__title">Edit profile</h2>
            <label className="field">
              <span>Display name</span>
              <input value={name} onChange={(event) => setName(event.target.value)} maxLength={40} />
            </label>
            <label className="field">
              <span>Email</span>
              <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" maxLength={80} />
            </label>
            <label className="field">
              <span>Preferred language</span>
              <select
                value={profile.language}
                onChange={(event) => updateProfile({ language: event.target.value })}
              >
                {languages.map((item) => (
                  <option key={item.code} value={item.code}>
                    {item.name} — {item.native}
                  </option>
                ))}
              </select>
            </label>
            <div className="modal__footer">
              <button type="button" className="btn btn--ghost" onClick={() => setEditing(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => {
                  updateProfile({ name: name.trim(), email: email.trim() });
                  setEditing(false);
                  notify('Profile updated', 'success');
                }}
              >
                Save changes
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function NotificationsPage() {
  const { notifications, markNotificationRead, markAllNotificationsRead, clearNotifications } = useLibrary();
  const { notify } = useToast();

  return (
    <div>
      <div className="page-head">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-sub">
            {notifications.length} messages · {notifications.filter((item) => !item.read).length} unread
          </p>
        </div>
        <div className="detail-head__actions">
          <button type="button" className="btn btn--outline" onClick={() => markAllNotificationsRead()}>
            Mark all read
          </button>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => {
              clearNotifications();
              notify('Notifications cleared');
            }}
          >
            Clear
          </button>
        </div>
      </div>

      {notifications.length ? (
        <div className="notice-list">
          {notifications.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`notice-card${item.read ? '' : ' is-unread'}`}
              onClick={() => markNotificationRead(item.id)}
            >
              <span className="notice-card__dot" aria-hidden="true" />
              <span className="notice-card__body">
                <span className="notice-card__title">{item.title}</span>
                <span className="notice-card__text">{item.body}</span>
                <span className="notice-card__time">{timeAgo(item.at)}</span>
              </span>
            </button>
          ))}
        </div>
      ) : (
        <EmptyState title="No notifications" text="New release alerts and playlist updates will appear here." />
      )}

      <Notice>
        Push notifications need a backend and the Notification API permission flow. In this prototype notifications are
        generated locally as you use the app.
      </Notice>
    </div>
  );
}

export function HistoryPage() {
  const { songById, artistName } = useCatalog();
  const { history, clearHistory, isLiked, toggleLike } = useLibrary();
  const { playSongs } = usePlayer();
  const { notify } = useToast();

  const songs = history
    .map((entry) => songById.get(entry.songId))
    .filter((song): song is NonNullable<typeof song> => Boolean(song));

  return (
    <div>
      <div className="page-head">
        <div>
          <h1 className="page-title">Listening history</h1>
          <p className="page-sub">{history.length} plays · {Math.round(songs.reduce((sum, song) => sum + song.durationSec, 0) / 60)} min</p>
        </div>
        {history.length ? (
          <button
            type="button"
            className="btn btn--danger"
            onClick={() => {
              if (window.confirm('Clear your listening history on this device?')) {
                clearHistory();
                notify('History cleared');
              }
            }}
          >
            Clear history
          </button>
        ) : null}
      </div>

      {songs.length ? (
        <div className="song-list">
          {songs.map((song, index) => (
            <SongRow
              key={`${song.id}-${index}`}
              song={song}
              index={index}
              subtitle={`${artistName(song.singerIds[0])} · ${formatTime(song.durationSec)} · ${formatCount(song.plays)} plays`}
              onPlay={() => playSongs(songs, index, 'Listening history')}
              onRemove={() => {
                toggleLike(song.id);
                notify(isLiked(song.id) ? 'Added to Liked Songs' : 'Removed from Liked Songs');
              }}
              removeLabel="Toggle like"
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Nothing played yet"
          text="Your plays are stored locally so you can pick up where you left off."
          action={
            <Link to="/" className="btn btn--primary">
              <PlayIcon size={16} /> Start listening
            </Link>
          }
        />
      )}
    </div>
  );
}
