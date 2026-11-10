import { useState } from 'react';
import type { ReactNode } from 'react';
import type { Song } from '../data/types';
import { formatTime } from '../lib/format';
import { Link } from '../lib/router';
import { useCatalog } from '../state/CatalogContext';
import { useLibrary } from '../state/LibraryContext';
import { usePlayer } from '../state/PlayerContext';
import { useToast } from '../state/ToastContext';
import { AddToPlaylist } from './AddToPlaylist';
import { Artwork } from './Artwork';
import {
  AlbumIcon,
  ArtistIcon,
  CheckIcon,
  DownloadIcon,
  HeartIcon,
  MoreIcon,
  PauseIcon,
  PlayIcon,
  PlusIcon,
  QueueIcon,
  ShareIcon,
  TrashIcon,
} from './Icons';
import { Modal } from './Modal';

interface SongRowProps {
  song: Song;
  onPlay: () => void;
  index?: number;
  showArtwork?: boolean;
  subtitle?: string;
  showTime?: boolean;
  onRemove?: () => void;
  removeLabel?: string;
}

export function SongRow({
  song,
  onPlay,
  index,
  showArtwork = true,
  subtitle,
  showTime = true,
  onRemove,
  removeLabel = 'Remove',
}: SongRowProps) {
  const { artistName } = useCatalog();
  const { isLiked, toggleLike, isDownloaded, downloadSong, removeDownload } = useLibrary();
  const { current, isPlaying, enqueue, playNext } = usePlayer();
  const { notify } = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
  const [playlistOpen, setPlaylistOpen] = useState(false);

  const isCurrent = current?.id === song.id;
  const liked = isLiked(song.id);
  const downloaded = isDownloaded(song.id);

  const handleLike = () => {
    const nowLiked = toggleLike(song.id);
    notify(nowLiked ? 'Added to Liked Songs' : 'Removed from Liked Songs', nowLiked ? 'success' : 'default');
  };

  const handleDownload = async () => {
    if (downloaded) {
      await removeDownload(song.id);
      notify('Removed download');
      return;
    }
    const ok = await downloadSong(song);
    notify(ok ? 'Downloaded for offline listening' : 'Download unavailable offline', ok ? 'success' : 'error');
  };

  const handleShare = async () => {
    const url = `${window.location.origin}${window.location.pathname}#/album/${song.albumId}`;
    const text = `${song.title} — ${artistName(song.singerIds[0] ?? '')} · Mana Music (demo)`;
    try {
      if (navigator.share) {
        await navigator.share({ title: song.title, text, url });
      } else {
        await navigator.clipboard.writeText(`${text} ${url}`);
        notify('Track link copied', 'success');
      }
    } catch {
      /* user dismissed the share sheet */
    }
  };

  const sub = subtitle ?? `${song.movie ? `${song.movie} · ` : ''}${artistName(song.singerIds[0] ?? '')}`;

  return (
    <div className={`song-row ${isCurrent ? 'song-row--playing' : ''}`}>
      {typeof index === 'number' ? (
        <span className="song-row__index">{isCurrent && isPlaying ? <span className="equaliser" aria-label="Playing" /> : index + 1}</span>
      ) : null}

      <button type="button" className="song-row__main" onClick={onPlay} aria-label={`Play ${song.title}`}>
        {showArtwork ? <Artwork seed={song.albumId} title={song.title} tiny /> : null}
        <span>
          <span className={`song-row__title ${isCurrent ? 'song-row__title--active' : ''}`}>{song.title}</span>
          <span className="song-row__sub">{sub}</span>
        </span>
      </button>

      {showTime ? <span className="song-row__time">{formatTime(song.durationSec)}</span> : null}

      <button
        type="button"
        className={`icon-btn song-row__like ${liked ? 'icon-btn--active' : ''}`}
        onClick={handleLike}
        aria-label={liked ? `Remove ${song.title} from Liked Songs` : `Like ${song.title}`}
        aria-pressed={liked}
      >
        <HeartIcon filled={liked} size={18} />
      </button>

      <button
        type="button"
        className="icon-btn song-row__side"
        onClick={() => setMenuOpen(true)}
        aria-label={`More options for ${song.title}`}
      >
        <MoreIcon size={18} />
      </button>

      {menuOpen ? (
        <Modal title={song.title} onClose={() => setMenuOpen(false)}>
          <p className="page-sub" style={{ marginTop: -8 }}>
            {sub}
          </p>
          <div className="option-list">
            <button
              type="button"
              onClick={() => {
                playNext(song);
                notify('Playing next', 'success');
                setMenuOpen(false);
              }}
            >
              <PlayIcon size={17} /> Play next
            </button>
            <button
              type="button"
              onClick={() => {
                enqueue(song);
                notify('Added to queue', 'success');
                setMenuOpen(false);
              }}
            >
              <QueueIcon size={17} /> Add to queue
            </button>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                setPlaylistOpen(true);
              }}
            >
              <PlusIcon size={17} /> Add to playlist
            </button>
            <button type="button" onClick={handleLike}>
              <HeartIcon size={17} filled={liked} /> {liked ? 'Remove from Liked Songs' : 'Add to Liked Songs'}
            </button>
            <button type="button" onClick={handleDownload}>
              {downloaded ? <CheckIcon size={17} /> : <DownloadIcon size={17} />}
              {downloaded ? 'Remove download' : 'Download'}
            </button>
            <button type="button" onClick={handleShare}>
              <ShareIcon size={17} /> Share
            </button>
            <Link to={`/album/${song.albumId}`} onClick={() => setMenuOpen(false)}>
              <AlbumIcon size={17} /> Go to album
            </Link>
            {song.singerIds[0] ? (
              <Link to={`/artist/${song.singerIds[0]}`} onClick={() => setMenuOpen(false)}>
                <ArtistIcon size={17} /> Go to artist
              </Link>
            ) : null}
            {onRemove ? (
              <button
                type="button"
                onClick={() => {
                  onRemove();
                  setMenuOpen(false);
                }}
              >
                <TrashIcon size={17} /> {removeLabel}
              </button>
            ) : null}
          </div>
        </Modal>
      ) : null}

      {playlistOpen ? <AddToPlaylist song={song} onClose={() => setPlaylistOpen(false)} /> : null}
    </div>
  );
}

export function SongList({ children }: { children: ReactNode }) {
  return <div className="song-list">{children}</div>;
}
