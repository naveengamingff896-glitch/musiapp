import { useMemo, useState } from 'react';
import type { Album, Song } from '../data/types';
import { GENRES, MOODS } from '../data/languages';
import { formatCount } from '../lib/format';
import { useCatalog } from '../state/CatalogContext';
import { useLibrary } from '../state/LibraryContext';
import { useToast } from '../state/ToastContext';
import { Notice } from '../components/MediaCard';
import { CheckIcon, PlusIcon, TrashIcon } from '../components/Icons';

type Tab = 'songs' | 'artists' | 'albums' | 'playlists' | 'movies' | 'licensing' | 'reports';

const TABS: { id: Tab; label: string }[] = [
  { id: 'songs', label: 'Songs' },
  { id: 'artists', label: 'Artists' },
  { id: 'albums', label: 'Albums' },
  { id: 'playlists', label: 'Featured' },
  { id: 'movies', label: 'Movies' },
  { id: 'licensing', label: 'Licensing' },
  { id: 'reports', label: 'Reports' },
];

const AUDIO_OPTIONS = ['deepam', 'gaali', 'jaanapada', 'lullaby', 'mass', 'raatri', 'varsham', 'vennela'];

export function AdminPage() {
  const {
    songs,
    albums,
    artists,
    playlists,
    movies,
    licensing,
    reports,
    languages,
    addSong,
    updateSong,
    deleteSong,
    addArtist,
    updateAlbum,
    toggleFeaturedPlaylist,
    hidePlaylist,
    updateLicensing,
    updateReport,
    resetDemoData,
    featuredPlaylists,
  } = useCatalog();
  const { isArtistFollowed } = useLibrary();
  const { notify } = useToast();
  const [tab, setTab] = useState<Tab>('songs');
  const [showSongForm, setShowSongForm] = useState(false);
  const [showArtistForm, setShowArtistForm] = useState(false);
  const [query, setQuery] = useState('');

  const singers = useMemo(() => artists.filter((artist) => artist.roles.includes('singer')), [artists]);
  const composers = useMemo(() => artists.filter((artist) => artist.roles.includes('composer')), [artists]);
  const featuredIds = useMemo(() => new Set(featuredPlaylists.map((playlist) => playlist.id)), [featuredPlaylists]);

  const [draft, setDraft] = useState({
    title: '',
    nativeTitle: '',
    albumId: albums[0]?.id ?? '',
    language: 'te',
    year: 2024,
    movie: '',
    singerId: singers[0]?.id ?? '',
    composerId: composers[0]?.id ?? '',
    genre: 'Melody',
    mood: 'Romantic',
    durationSec: 210,
    audioId: 'gaali',
  });

  const [artistDraft, setArtistDraft] = useState({ name: '', roles: 'singer', language: 'te', bio: '' });

  const filteredSongs = songs
    .filter((song) => !query || song.title.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 60);

  return (
    <div>
      <div className="page-head">
        <div>
          <h1 className="page-title">Admin dashboard</h1>
          <p className="page-sub">
            Manage the demo catalogue: songs and metadata, artists, albums, featured content, movies, licensing records and
            user reports. Changes are saved in this browser.
          </p>
        </div>
        <button
          type="button"
          className="btn btn--outline"
          onClick={() => {
            resetDemoData();
            notify('Catalogue edits reset to the demo defaults');
          }}
        >
          Reset catalogue edits
        </button>
      </div>

      <Notice>
        This dashboard edits local demo data only. A production deployment would put these operations behind an authenticated
        admin API with audit logging.
      </Notice>

      <div className="tab-bar">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`tab-bar__item ${tab === item.id ? 'tab-bar__item--active' : ''}`}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'songs' ? (
        <section className="card-panel">
          <div className="admin-toolbar">
            <input
              className="input"
              placeholder="Filter songs by title"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <button type="button" className="btn btn--primary" onClick={() => setShowSongForm((value) => !value)}>
              <PlusIcon size={15} /> {showSongForm ? 'Close form' : 'Add song'}
            </button>
          </div>

          {showSongForm ? (
            <form
              className="admin-form"
              onSubmit={(event) => {
                event.preventDefault();
                if (!draft.title.trim() || !draft.albumId || !draft.singerId || !draft.composerId) {
                  notify('Title, album, singer and composer are required', 'error');
                  return;
                }
                addSong({
                  title: draft.title.trim(),
                  nativeTitle: draft.nativeTitle.trim() || undefined,
                  albumId: draft.albumId,
                  language: draft.language,
                  year: Number(draft.year),
                  movie: draft.movie.trim() || undefined,
                  singerIds: [draft.singerId],
                  composerId: draft.composerId,
                  genre: draft.genre,
                  mood: draft.mood,
                  durationSec: Number(draft.durationSec),
                  audioId: draft.audioId,
                });
                setDraft((prev) => ({ ...prev, title: '', nativeTitle: '', movie: '' }));
                notify('Song added to the demo catalogue', 'success');
              }}
            >
              <label className="field">
                <span>Title</span>
                <input
                  className="input"
                  value={draft.title}
                  onChange={(event) => setDraft({ ...draft, title: event.target.value })}
                  placeholder="Song title"
                />
              </label>
              <label className="field">
                <span>Telugu title</span>
                <input
                  className="input"
                  value={draft.nativeTitle}
                  onChange={(event) => setDraft({ ...draft, nativeTitle: event.target.value })}
                  placeholder="తెలుగు శీర్షిక"
                />
              </label>
              <label className="field">
                <span>Album</span>
                <select
                  className="select"
                  value={draft.albumId}
                  onChange={(event) => setDraft({ ...draft, albumId: event.target.value })}
                >
                  {albums.slice(0, 60).map((album) => (
                    <option key={album.id} value={album.id}>
                      {album.title} ({album.year})
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Language</span>
                <select
                  className="select"
                  value={draft.language}
                  onChange={(event) => setDraft({ ...draft, language: event.target.value })}
                >
                  {languages.map((language) => (
                    <option key={language.code} value={language.code}>
                      {language.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Year</span>
                <input
                  className="input"
                  type="number"
                  min={1930}
                  max={2030}
                  value={draft.year}
                  onChange={(event) => setDraft({ ...draft, year: Number(event.target.value) })}
                />
              </label>
              <label className="field">
                <span>Movie</span>
                <input
                  className="input"
                  value={draft.movie}
                  onChange={(event) => setDraft({ ...draft, movie: event.target.value })}
                  placeholder="Optional movie name"
                />
              </label>
              <label className="field">
                <span>Singer</span>
                <select
                  className="select"
                  value={draft.singerId}
                  onChange={(event) => setDraft({ ...draft, singerId: event.target.value })}
                >
                  {singers.map((artist) => (
                    <option key={artist.id} value={artist.id}>
                      {artist.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Composer</span>
                <select
                  className="select"
                  value={draft.composerId}
                  onChange={(event) => setDraft({ ...draft, composerId: event.target.value })}
                >
                  {composers.map((artist) => (
                    <option key={artist.id} value={artist.id}>
                      {artist.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Genre</span>
                <select
                  className="select"
                  value={draft.genre}
                  onChange={(event) => setDraft({ ...draft, genre: event.target.value })}
                >
                  {GENRES.map((genre) => (
                    <option key={genre} value={genre}>
                      {genre}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Mood</span>
                <select
                  className="select"
                  value={draft.mood}
                  onChange={(event) => setDraft({ ...draft, mood: event.target.value })}
                >
                  {MOODS.map((mood) => (
                    <option key={mood} value={mood}>
                      {mood}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Duration (seconds)</span>
                <input
                  className="input"
                  type="number"
                  min={30}
                  max={900}
                  value={draft.durationSec}
                  onChange={(event) => setDraft({ ...draft, durationSec: Number(event.target.value) })}
                />
              </label>
              <label className="field">
                <span>Demo audio</span>
                <select
                  className="select"
                  value={draft.audioId}
                  onChange={(event) => setDraft({ ...draft, audioId: event.target.value })}
                >
                  {AUDIO_OPTIONS.map((audio) => (
                    <option key={audio} value={audio}>
                      {audio}
                    </option>
                  ))}
                </select>
              </label>
              <button type="submit" className="btn btn--primary">
                <CheckIcon size={15} /> Save song
              </button>
            </form>
          ) : null}

          <div className="admin-table">
            {filteredSongs.map((song: Song) => (
              <div key={song.id} className="admin-row">
                <div className="admin-row__main">
                  <input
                    className="input input--tight"
                    defaultValue={song.title}
                    aria-label={`Title for ${song.title}`}
                    onBlur={(event) => {
                      const next = event.target.value.trim();
                      if (next && next !== song.title) {
                        updateSong(song.id, { title: next });
                        notify('Song title updated', 'success');
                      }
                    }}
                  />
                  <span className="admin-row__meta">
                    {song.language.toUpperCase()} · {song.year} · {song.genre} · {formatCount(song.plays)} plays
                  </span>
                </div>
                <button
                  type="button"
                  className="icon-btn"
                  aria-label={`Delete ${song.title}`}
                  onClick={() => {
                    deleteSong(song.id);
                    notify('Song removed from the catalogue');
                  }}
                >
                  <TrashIcon size={16} />
                </button>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {tab === 'artists' ? (
        <section className="card-panel">
          <div className="admin-toolbar">
            <span className="page-sub">{artists.length} artists in the catalogue</span>
            <button type="button" className="btn btn--primary" onClick={() => setShowArtistForm((value) => !value)}>
              <PlusIcon size={15} /> {showArtistForm ? 'Close form' : 'Add artist'}
            </button>
          </div>

          {showArtistForm ? (
            <form
              className="admin-form"
              onSubmit={(event) => {
                event.preventDefault();
                if (!artistDraft.name.trim()) {
                  notify('Artist name is required', 'error');
                  return;
                }
                addArtist({
                  name: artistDraft.name.trim(),
                  roles: [artistDraft.roles as 'singer' | 'composer' | 'lyricist'],
                  language: artistDraft.language,
                  bio: artistDraft.bio.trim() || 'Demo artist profile.',
                });
                setArtistDraft({ name: '', roles: 'singer', language: 'te', bio: '' });
                notify('Artist added', 'success');
              }}
            >
              <label className="field">
                <span>Name</span>
                <input
                  className="input"
                  value={artistDraft.name}
                  onChange={(event) => setArtistDraft({ ...artistDraft, name: event.target.value })}
                  placeholder="Artist name"
                />
              </label>
              <label className="field">
                <span>Role</span>
                <select
                  className="select"
                  value={artistDraft.roles}
                  onChange={(event) => setArtistDraft({ ...artistDraft, roles: event.target.value })}
                >
                  <option value="singer">Singer</option>
                  <option value="composer">Composer</option>
                  <option value="lyricist">Lyricist</option>
                </select>
              </label>
              <label className="field">
                <span>Language</span>
                <select
                  className="select"
                  value={artistDraft.language}
                  onChange={(event) => setArtistDraft({ ...artistDraft, language: event.target.value })}
                >
                  {languages.map((language) => (
                    <option key={language.code} value={language.code}>
                      {language.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field field--wide">
                <span>Bio</span>
                <input
                  className="input"
                  value={artistDraft.bio}
                  onChange={(event) => setArtistDraft({ ...artistDraft, bio: event.target.value })}
                  placeholder="Short profile description"
                />
              </label>
              <button type="submit" className="btn btn--primary">
                <CheckIcon size={15} /> Save artist
              </button>
            </form>
          ) : null}

          <div className="admin-table">
            {artists.slice(0, 40).map((artist) => (
              <div key={artist.id} className="admin-row">
                <div className="admin-row__main">
                  <span className="admin-row__title">{artist.name}</span>
                  <span className="admin-row__meta">
                    {artist.roles.join(' · ')} · {artist.language.toUpperCase()} · {formatCount(artist.followers)} followers
                    {isArtistFollowed(artist.id) ? ' · followed by you' : ''}
                  </span>
                </div>
                <span className={`badge ${artist.verified ? 'badge--ok' : ''}`}>{artist.verified ? 'Verified' : 'Demo'}</span>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {tab === 'albums' ? (
        <section className="card-panel">
          <p className="page-sub">Update release years and labels. Newest albums drive the New releases shelves.</p>
          <div className="admin-table">
            {albums.slice(0, 40).map((album: Album) => (
              <div key={album.id} className="admin-row">
                <div className="admin-row__main">
                  <span className="admin-row__title">{album.title}</span>
                  <span className="admin-row__meta">
                    {album.language.toUpperCase()} · {album.kind} · {album.songIds.length} tracks · {album.label}
                  </span>
                </div>
                <input
                  className="input input--tight input--year"
                  type="number"
                  min={1930}
                  max={2030}
                  defaultValue={album.year}
                  aria-label={`Year for ${album.title}`}
                  onBlur={(event) => {
                    const year = Number(event.target.value);
                    if (year && year !== album.year) {
                      updateAlbum(album.id, { year });
                      notify('Release year updated', 'success');
                    }
                  }}
                />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {tab === 'playlists' ? (
        <section className="card-panel">
          <p className="page-sub">Feature curated playlists on the home screen, or hide them from the catalogue.</p>
          <div className="admin-table">
            {playlists.slice(0, 40).map((playlist) => (
              <div key={playlist.id} className="admin-row">
                <div className="admin-row__main">
                  <span className="admin-row__title">{playlist.title}</span>
                  <span className="admin-row__meta">
                    {playlist.kind} · {playlist.songIds.length} tracks · {playlist.curator}
                  </span>
                </div>
                <span className="inline-actions">
                  <button
                    type="button"
                    className={`btn btn--small ${featuredIds.has(playlist.id) ? 'btn--primary' : 'btn--outline'}`}
                    onClick={() => {
                      toggleFeaturedPlaylist(playlist.id);
                      notify(featuredIds.has(playlist.id) ? 'Removed from featured' : 'Featured on home', 'success');
                    }}
                  >
                    {featuredIds.has(playlist.id) ? 'Featured' : 'Feature'}
                  </button>
                  <button
                    type="button"
                    className="btn btn--small btn--ghost"
                    onClick={() => {
                      hidePlaylist(playlist.id);
                      notify('Playlist hidden from the catalogue');
                    }}
                  >
                    Hide
                  </button>
                </span>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {tab === 'movies' ? (
        <section className="card-panel">
          <p className="page-sub">Movie metadata used for browsing by film name and year.</p>
          <div className="admin-table">
            {movies.slice(0, 50).map((movie) => (
              <div key={`${movie.language}-${movie.title}`} className="admin-row">
                <div className="admin-row__main">
                  <span className="admin-row__title">{movie.title}</span>
                  <span className="admin-row__meta">{movie.language.toUpperCase()}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {tab === 'licensing' ? (
        <section className="card-panel">
          <p className="page-sub">
            Copyright and licensing register. Mark records as active only when an agreement actually exists.
          </p>
          <div className="admin-table">
            {licensing.map((record) => (
              <div key={record.id} className="admin-row">
                <div className="admin-row__main">
                  <span className="admin-row__title">{record.title}</span>
                  <span className="admin-row__meta">
                    {record.owner} · {record.type} · {record.territory} · valid to {record.validUntil}
                  </span>
                </div>
                <select
                  className="select select--tight"
                  value={record.status}
                  aria-label={`Status for ${record.title}`}
                  onChange={(event) => {
                    updateLicensing(record.id, { status: event.target.value as typeof record.status });
                    notify('Licensing status updated', 'success');
                  }}
                >
                  <option value="active">active</option>
                  <option value="pending">pending</option>
                  <option value="expired">expired</option>
                </select>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {tab === 'reports' ? (
        <section className="card-panel">
          <p className="page-sub">User reports from the prototype support form.</p>
          <div className="admin-table">
            {reports.map((report) => (
              <div key={report.id} className="admin-row">
                <div className="admin-row__main">
                  <span className="admin-row__title">{report.subject}</span>
                  <span className="admin-row__meta">
                    {report.type} · {report.detail} · {report.createdAt}
                  </span>
                </div>
                <select
                  className="select select--tight"
                  value={report.status}
                  aria-label={`Status for ${report.subject}`}
                  onChange={(event) => {
                    updateReport(report.id, { status: event.target.value as typeof report.status });
                    notify('Report status updated', 'success');
                  }}
                >
                  <option value="open">open</option>
                  <option value="reviewing">reviewing</option>
                  <option value="resolved">resolved</option>
                </select>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
