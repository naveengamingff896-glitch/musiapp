import { useMemo } from 'react';
import { Link } from '../lib/router';
import type { Song } from '../data/types';
import { formatCount } from '../lib/format';
import { useCatalog } from '../state/CatalogContext';
import { useLibrary } from '../state/LibraryContext';
import { usePlayer } from '../state/PlayerContext';
import { useToast } from '../state/ToastContext';
import { Artwork } from '../components/Artwork';
import { EmptyState, Notice, SectionHead } from '../components/MediaCard';
import { SongRow } from '../components/SongRow';
import { HeartIcon, PlayIcon, ShuffleIcon } from '../components/Icons';

export function LikedPage() {
  const { likedSongs, toggleLike, createPlaylist } = useLibrary();
  const { songById, artistName } = useCatalog();
  const { playSongs } = usePlayer();
  const { notify } = useToast();

  const songs = useMemo(
    () => likedSongs.map((id) => songById.get(id)).filter((song): song is Song => Boolean(song)),
    [likedSongs, songById],
  );

  const totalMinutes = Math.round(songs.reduce((sum, song) => sum + song.durationSec, 0) / 60);

  return (
    <div>
      <section className="detail-head">
        <div className="detail-head__art detail-head__art--liked">
          <HeartIcon size={54} />
        </div>
        <div className="detail-head__meta">
          <span className="badge">Auto playlist</span>
          <h1 className="page-title">Liked Songs</h1>
          <p className="page-sub">
            {songs.length} songs · {totalMinutes} min · Saved on this device
          </p>
          <div className="detail-head__actions">
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => songs.length && playSongs(songs, 0, 'Liked Songs')}
              disabled={!songs.length}
            >
              <PlayIcon size={17} /> Play
            </button>
            <button
              type="button"
              className="btn btn--outline"
              onClick={() => songs.length && playSongs(songs.slice().sort(() => Math.random() - 0.5), 0, 'Liked Songs')}
              disabled={!songs.length}
            >
              <ShuffleIcon size={16} /> Shuffle
            </button>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => {
                if (!songs.length) {
                  notify('Like a few songs first', 'error');
                  return;
                }
                const id = createPlaylist('My liked mix', 'Created from Liked Songs', songs.map((song) => song.id));
                notify('Playlist created from liked songs', 'success');
                window.location.hash = `#/playlist/${id}`;
              }}
              disabled={!songs.length}
            >
              Save as playlist
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
              subtitle={`${song.movie ? `${song.movie} · ` : ''}${artistName(song.singerIds[0])} · ${formatCount(song.plays)} plays`}
              onPlay={() => playSongs(songs, index, 'Liked Songs')}
              onRemove={() => {
                toggleLike(song.id);
                notify('Removed from Liked Songs');
              }}
              removeLabel="Remove from liked"
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No liked songs yet"
          text="Tap the heart on any track and it will appear here. Likes are stored in this browser."
          action={
            <Link to="/" className="btn btn--primary">
              Browse music
            </Link>
          }
        />
      )}

      <SectionHead title="About this playlist" sub="Local, automatic" />
      <Notice>
        Liked Songs is generated from local likes for this prototype. Syncing likes across devices needs an account
        backend.
      </Notice>
    </div>
  );
}

export function ChartsPage() {
  const { playlists, songs, songById, artistName } = useCatalog();
  const { playSongs } = usePlayer();

  const charts = playlists.filter((playlist) => playlist.kind === 'chart');
  const topSongs = songs.slice().sort((a, b) => b.plays - a.plays).slice(0, 50);

  const chartSongs = (songIds: string[]): Song[] =>
    songIds.map((id) => songById.get(id)).filter((song): song is Song => Boolean(song));

  return (
    <div>
      <div className="page-head">
        <div>
          <h1 className="page-title">Indian music charts</h1>
          <p className="page-sub">
            Weekly-style charts across languages. Rankings in this prototype come from demo play counts, not real streams.
          </p>
        </div>
      </div>

      <SectionHead title="Featured charts" sub={`${charts.length} curated charts`} />
      <div className="grid-cards">
        {charts.map((chart) => (
          <Link key={chart.id} to={`/playlist/${chart.id}`} className="media-card">
            <div className="media-card__art">
              <Artwork seed={chart.id} title={chart.title} />
            </div>
            <div className="media-card__meta">
              <div className="media-card__title">{chart.title}</div>
              <div className="media-card__sub">
                {chart.songIds.length} tracks · {chart.curator}
              </div>
            </div>
            <button
              type="button"
              className="icon-btn icon-btn--float"
              aria-label={`Play ${chart.title}`}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                const list = chartSongs(chart.songIds);
                if (list.length) playSongs(list, 0, chart.title);
              }}
            >
              <PlayIcon size={16} />
            </button>
          </Link>
        ))}
      </div>

      <SectionHead title="Top 50 songs" sub="By demo play count" />
      <div className="song-list">
        {topSongs.map((song, index) => (
          <SongRow
            key={song.id}
            song={song}
            index={index}
            subtitle={`${artistName(song.singerIds[0])} · ${song.language.toUpperCase()} · ${formatCount(song.plays)} plays`}
            onPlay={() => playSongs(topSongs, index, 'Top 50 songs')}
          />
        ))}
      </div>
    </div>
  );
}
