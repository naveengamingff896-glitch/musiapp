import { useMemo, useState } from 'react';
import { Link, navigate } from '../lib/router';
import { formatTime } from '../lib/format';
import { lyricsForSong } from '../data/lyrics';
import { useCatalog } from '../state/CatalogContext';
import { useLibrary } from '../state/LibraryContext';
import { usePlayer } from '../state/PlayerContext';
import { useToast } from '../state/ToastContext';
import { AddToPlaylist } from '../components/AddToPlaylist';
import { Artwork } from '../components/Artwork';
import { EmptyState } from '../components/MediaCard';
import {
  ChevronDownIcon,
  DownloadIcon,
  HeartIcon,
  NextIcon,
  PauseIcon,
  PlayIcon,
  PlusIcon,
  PrevIcon,
  QueueIcon,
  RepeatIcon,
  ShuffleIcon,
  TrashIcon,
  VolumeIcon,
} from '../components/Icons';

export function PlayerPage() {
  const {
    current,
    queue,
    index,
    isPlaying,
    position,
    duration,
    volume,
    muted,
    shuffle,
    repeat,
    contextLabel,
    toggle,
    next,
    previous,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    cycleRepeat,
    jumpTo,
    removeFromQueue,
    clearQueue,
  } = usePlayer();
  const { artistName, albumTitle } = useCatalog();
  const { isLiked, toggleLike, isDownloaded, downloadSong, removeDownload } = useLibrary();
  const { notify } = useToast();
  const [tab, setTab] = useState<'lyrics' | 'queue'>('lyrics');
  const [playlistOpen, setPlaylistOpen] = useState(false);

  const lyrics = useMemo(() => (current ? lyricsForSong(current) : []), [current]);

  if (!current) {
    return (
      <div className="page">
        <EmptyState
          title="Nothing playing yet"
          text="Pick a song from Home or Search and it will show up here with lyrics, queue and full controls."
          action={
            <Link className="btn btn--primary" to="/" style={{ marginTop: 14 }}>
              Browse music
            </Link>
          }
        />
      </div>
    );
  }

  const liked = isLiked(current.id);
  const downloaded = isDownloaded(current.id);
  const activeLyric = lyrics.reduce((acc, line, i) => (line.time <= position ? i : acc), -1);

  const handleDownload = async () => {
    if (downloaded) {
      await removeDownload(current.id);
      notify('Removed download');
      return;
    }
    const ok = await downloadSong(current);
    notify(ok ? 'Downloaded for offline listening' : 'Download unavailable offline', ok ? 'success' : 'error');
  };

  const handleShare = async () => {
    const url = `${window.location.origin}${window.location.pathname}#/album/${current.albumId}`;
    try {
      if (navigator.share) await navigator.share({ title: current.title, url });
      else {
        await navigator.clipboard.writeText(url);
        notify('Track link copied', 'success');
      }
    } catch {
      /* dismissed */
    }
  };

  return (
    <div className="player-sheet">
      <div className="player-sheet__glow" aria-hidden="true" />
      <div className="player-sheet__scroll">
        <div className="player-sheet__top" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button type="button" className="icon-btn" onClick={() => navigate('/')} aria-label="Close player">
            <ChevronDownIcon size={22} />
          </button>
          <div className="player-sheet__label" style={{ flex: 1, textAlign: 'center' }}>
            {contextLabel}
          </div>
          <button type="button" className="icon-btn" onClick={handleShare} aria-label="Share track">
            <QueueIcon size={20} />
          </button>
        </div>

        <div className="player-sheet__art">
          <Artwork seed={current.albumId} title={current.title} />
        </div>

        <div className="player-sheet__info">
          <h1 className="player-sheet__title">{current.title}</h1>
          {current.nativeTitle ? <div className="player-sheet__native">{current.nativeTitle}</div> : null}
          <div className="player-sheet__artist">
            <Link to={`/artist/${current.singerIds[0] ?? ''}`}>{artistName(current.singerIds[0] ?? '')}</Link>
            {' · '}
            <Link to={`/album/${current.albumId}`}>{albumTitle(current.albumId)}</Link>
          </div>
        </div>

        <div className="seek">
          <input
            type="range"
            min={0}
            max={Math.max(1, Math.floor(duration))}
            value={Math.min(position, duration || 0)}
            onChange={(event) => seek(Number(event.target.value))}
            aria-label="Seek"
          />
          <div className="seek__row">
            <span>{formatTime(position)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="player-sheet__controls">
          <button
            type="button"
            className={`icon-btn ${shuffle ? 'icon-btn--active' : ''}`}
            onClick={toggleShuffle}
            aria-label="Toggle shuffle"
            aria-pressed={shuffle}
          >
            <ShuffleIcon size={20} />
          </button>
          <button type="button" className="icon-btn" onClick={previous} aria-label="Previous track">
            <PrevIcon size={28} />
          </button>
          <button
            type="button"
            className="play-fab player-sheet__play"
            onClick={toggle}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <PauseIcon size={30} /> : <PlayIcon size={30} />}
          </button>
          <button type="button" className="icon-btn" onClick={() => next()} aria-label="Next track">
            <NextIcon size={28} />
          </button>
          <button
            type="button"
            className={`icon-btn ${repeat !== 'off' ? 'icon-btn--active' : ''}`}
            onClick={cycleRepeat}
            aria-label={`Repeat ${repeat}`}
          >
            <RepeatIcon mode={repeat} size={20} />
          </button>
        </div>

        <div className="player-sheet__utility">
          <button
            type="button"
            className={`icon-btn ${liked ? 'icon-btn--active' : ''}`}
            onClick={() => {
              const nowLiked = toggleLike(current.id);
              notify(nowLiked ? 'Added to Liked Songs' : 'Removed from Liked Songs', nowLiked ? 'success' : 'default');
            }}
            aria-label="Like song"
            aria-pressed={liked}
          >
            <HeartIcon filled={liked} size={22} />
          </button>
          <button type="button" className="icon-btn" onClick={() => setPlaylistOpen(true)} aria-label="Add to playlist">
            <PlusIcon size={22} />
          </button>
          <button
            type="button"
            className={`icon-btn ${downloaded ? 'icon-btn--active' : ''}`}
            onClick={handleDownload}
            aria-label="Download track"
          >
            <DownloadIcon filled={downloaded} size={22} />
          </button>
          <button
            type="button"
            className="icon-btn"
            onClick={() => setTab('queue')}
            aria-label="Show queue"
          >
            <QueueIcon size={22} />
          </button>
        </div>

        <div className="volume-row">
          <button type="button" className="icon-btn" onClick={toggleMute} aria-label={muted ? 'Unmute' : 'Mute'}>
            <VolumeIcon muted={muted} size={20} />
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={muted ? 0 : volume}
            onChange={(event) => setVolume(Number(event.target.value))}
            aria-label="Volume"
          />
        </div>

        <div className="panel-tabs" role="tablist" aria-label="Player panels">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'lyrics'}
            className={tab === 'lyrics' ? 'is-active' : ''}
            onClick={() => setTab('lyrics')}
          >
            Lyrics
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'queue'}
            className={tab === 'queue' ? 'is-active' : ''}
            onClick={() => setTab('queue')}
          >
            Queue ({queue.length})
          </button>
        </div>

        {tab === 'lyrics' ? (
          <div className="lyrics">
            {lyrics.length === 0 ? (
              <p className="page-sub">Lyrics are not available for this demo track.</p>
            ) : (
              lyrics.map((line, i) => (
                <div
                  key={`${line.time}-${i}`}
                  className={`lyrics__line ${i === activeLyric ? 'lyrics__line--active' : ''}`}
                >
                  {line.native ? <div className="lyrics__native">{line.native}</div> : null}
                  <div className="lyrics__latin">{line.latin}</div>
                </div>
              ))
            )}
            <p className="footer-note">
              Lyrics shown here are original text written for this prototype, not transcriptions of existing songs.
            </p>
          </div>
        ) : (
          <div className="queue-list">
            <div className="detail-actions" style={{ marginBottom: 8 }}>
              <button type="button" className="btn btn--ghost btn--sm" onClick={clearQueue}>
                <TrashIcon size={15} /> Clear queue
              </button>
            </div>
            {queue.map((song, i) => (
              <div key={`${song.id}-${i}`} className={`queue-item ${i === index ? 'queue-item--active' : ''}`}>
                <button type="button" className="queue-item__num" onClick={() => jumpTo(i)} aria-label={`Play ${song.title}`}>
                  {i === index && isPlaying ? <span className="equaliser" /> : i + 1}
                </button>
                <button type="button" className="song-row__main" onClick={() => jumpTo(i)}>
                  <span>
                    <span className="song-row__title">{song.title}</span>
                    <span className="song-row__sub">{artistName(song.singerIds[0] ?? '')}</span>
                  </span>
                </button>
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => removeFromQueue(i)}
                  aria-label={`Remove ${song.title} from queue`}
                >
                  <TrashIcon size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {playlistOpen ? <AddToPlaylist song={current} onClose={() => setPlaylistOpen(false)} /> : null}
    </div>
  );
}
