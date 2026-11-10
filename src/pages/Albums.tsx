import { useMemo, useState } from 'react';
import { Link, navigate } from '../lib/router';
import type { Album, Song } from '../data/types';
import { formatCount } from '../lib/format';
import { newestAlbums } from '../lib/collections';
import { useCatalog } from '../state/CatalogContext';
import { useLibrary } from '../state/LibraryContext';
import { usePlayer } from '../state/PlayerContext';
import { useToast } from '../state/ToastContext';
import { Artwork } from '../components/Artwork';
import { EmptyState, SectionHead } from '../components/MediaCard';
import { SongRow } from '../components/SongRow';
import { CheckIcon, DownloadIcon, HeartIcon, PlayIcon, ShuffleIcon } from '../components/Icons';

const KINDS = ['soundtrack', 'album', 'single', 'devotional', 'folk', 'indie', 'classical'];

export function AlbumsPage() {
  const { albums, languages, artistName } = useCatalog();
  const [language, setLanguage] = useState('');
  const [kind, setKind] = useState('');
  const [sort, setSort] = useState<'newest' | 'oldest' | 'tracks'>('newest');

  const filtered = useMemo(() => {
    let list = albums.slice();
    if (language) list = list.filter((album) => album.language === language);
    if (kind) list = list.filter((album) => album.kind === kind);
    if (sort === 'newest') list.sort((a, b) => b.year - a.year);
    if (sort === 'oldest') list.sort((a, b) => a.year - b.year);
    if (sort === 'tracks') list.sort((a, b) => b.songIds.length - a.songIds.length);
    return list;
  }, [albums, language, kind, sort]);

  return (
    <div>
      <div className="page-head">
        <div>
          <h1 className="page-title">Albums</h1>
          <p className="page-sub">
            {albums.length} demo albums, from golden-era soundtracks to 2020s releases. {newestAlbums(albums, 1)[0]?.title} is
            the newest addition.
          </p>
        </div>
      </div>

      <div className="filter-bar">
        <label className="field field--inline">
          <span>Language</span>
          <select value={language} onChange={(event) => setLanguage(event.target.value)}>
            <option value="">All languages</option>
            {languages.map((item) => (
              <option key={item.code} value={item.code}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field field--inline">
          <span>Type</span>
          <select value={kind} onChange={(event) => setKind(event.target.value)}>
            <option value="">All types</option>
            {KINDS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="field field--inline">
          <span>Sort</span>
          <select value={sort} onChange={(event) => setSort(event.target.value as typeof sort)}>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="tracks">Most tracks</option>
          </select>
        </label>
      </div>

      {filtered.length ? (
        <div className="grid-cards">
          {filtered.map((album) => (
            <Link key={album.id} to={`/album/${album.id}`} className="media-card">
              <div className="media-card__art">
                <Artwork seed={album.id} title={album.title} />
              </div>
              <div className="media-card__meta">
                <div className="media-card__title">{album.title}</div>
                <div className="media-card__sub">
                  {artistName(album.artistId)} · {album.year}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState title="No albums match" text="Clear the filters to see the full demo catalogue." />
      )}
    </div>
  );
}

export function AlbumPage({ id }: { id: string }) {
  const { albumById, songsOfAlbum, artistName, artistById } = useCatalog();
  const { isAlbumSaved, toggleSaveAlbum, downloadSongs, isDownloaded } = useLibrary();
  const { playSongs } = usePlayer();
  const { notify } = useToast();
  const [busy, setBusy] = useState(false);

  const album = albumById.get(id);
  if (!album) {
    return (
      <EmptyState
        title="Album not found"
        text="This album may have been removed from the demo catalogue."
        action={
          <button type="button" className="btn btn--outline" onClick={() => navigate('/albums')}>
            Back to albums
          </button>
        }
      />
    );
  }

  const songs = songsOfAlbum(album.id);
  const artist = artistById.get(album.artistId);
  const saved = isAlbumSaved(album.id);
  const totalMinutes = Math.round(songs.reduce((sum, song) => sum + song.durationSec, 0) / 60);
  const allDownloaded = songs.length > 0 && songs.every((song) => isDownloaded(song.id));

  const download = async () => {
    setBusy(true);
    const count = await downloadSongs(songs);
    setBusy(false);
    notify(count ? `${count} tracks available offline` : 'Could not download demo audio', count ? 'success' : 'error');
  };

  return (
    <div>
      <button type="button" className="link-back" onClick={() => navigate('/albums')}>
        ← Albums
      </button>

      <section className="detail-head">
        <div className="detail-head__art">
          <Artwork seed={album.id} title={album.title} />
        </div>
        <div className="detail-head__meta">
          <span className="badge">{album.kind}</span>
          <h1 className="page-title">{album.title}</h1>
          <p className="page-sub">
            {album.movie ? `${album.movie} · ` : ''}
            {album.year} · {songs.length} tracks · {totalMinutes} min · {album.label}
          </p>
          <p className="page-sub">
            Music director{' '}
            <Link to={`/artist/${album.artistId}`} className="inline-link">
              {artistName(album.artistId)}
            </Link>
            {artist ? ` · ${formatCount(artist.followers)} followers` : ''}
          </p>
          <div className="detail-head__actions">
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => songs.length && playSongs(songs, 0, album.title)}
              disabled={!songs.length}
            >
              <PlayIcon size={17} /> Play album
            </button>
            <button
              type="button"
              className="btn btn--outline"
              onClick={() => {
                if (!songs.length) return;
                playSongs(songs.slice().sort(() => Math.random() - 0.5), 0, `${album.title} (shuffled)`);
              }}
              disabled={!songs.length}
            >
              <ShuffleIcon size={16} /> Shuffle
            </button>
            <button
              type="button"
              className={`btn ${saved ? 'btn--outline' : 'btn--ghost'}`}
              onClick={() => {
                const next = toggleSaveAlbum(album.id);
                notify(next ? 'Album saved to your library' : 'Album removed', next ? 'success' : 'default');
              }}
            >
              {saved ? <CheckIcon size={16} /> : <HeartIcon size={16} />} {saved ? 'Saved' : 'Save'}
            </button>
            <button type="button" className="btn btn--ghost" onClick={download} disabled={busy || allDownloaded}>
              <DownloadIcon size={16} /> {allDownloaded ? 'Downloaded' : busy ? 'Downloading…' : 'Download'}
            </button>
          </div>
        </div>
      </section>

      {songs.length ? (
        <div className="song-list">
          {songs.map((song, index) => (
            <SongRow
              key={song.id}
              song={song}
              index={index}
              subtitle={`${artistName(song.singerIds[0])} · ${song.genre}`}
              onPlay={() => playSongs(songs, index, album.title)}
            />
          ))}
        </div>
      ) : (
        <EmptyState title="No tracks in this album" text="The demo album has no songs attached yet." />
      )}

      <section className="shelf">
        <SectionHead title="Album credits" sub="Demo metadata" />
        <div className="credit-grid">
          <div className="credit">
            <span className="credit__label">Music director</span>
            <span className="credit__value">{artistName(album.artistId)}</span>
          </div>
          <div className="credit">
            <span className="credit__label">Singers</span>
            <span className="credit__value">
              {Array.from(new Set(songs.flatMap((song) => song.singerIds)))
                .slice(0, 4)
                .map((singerId) => artistName(singerId))
                .join(', ') || '—'}
            </span>
          </div>
          <div className="credit">
            <span className="credit__label">Lyricists</span>
            <span className="credit__value">
              {Array.from(new Set(songs.map((song) => song.lyricistId).filter((value): value is string => Boolean(value))))
                .slice(0, 3)
                .map((lyricistId) => artistName(lyricistId))
                .join(', ') || '—'}
            </span>
          </div>
          <div className="credit">
            <span className="credit__label">Label</span>
            <span className="credit__value">{album.label}</span>
          </div>
          <div className="credit">
            <span className="credit__label">Language</span>
            <span className="credit__value">{album.language.toUpperCase()}</span>
          </div>
          <div className="credit">
            <span className="credit__label">Year</span>
            <span className="credit__value">{album.year}</span>
          </div>
        </div>
      </section>
    </div>
  );
}
