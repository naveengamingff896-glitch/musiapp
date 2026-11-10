import { useMemo } from 'react';
import { Link, navigate } from '../lib/router';
import type { Song } from '../data/types';
import { formatCount, formatTime } from '../lib/format';
import { useCatalog } from '../state/CatalogContext';
import { useLibrary } from '../state/LibraryContext';
import { usePlayer } from '../state/PlayerContext';
import { useToast } from '../state/ToastContext';
import { Artwork } from '../components/Artwork';
import { EmptyState, Notice, SectionHead } from '../components/MediaCard';
import { SongRow } from '../components/SongRow';
import { DownloadIcon, PlayIcon, TrashIcon } from '../components/Icons';

export function DownloadsPage() {
  const { songById, artistName, songs } = useCatalog();
  const { downloads, downloadSongs, removeDownload, clearDownloads, isDownloaded } = useLibrary();
  const { playSongs } = usePlayer();
  const { notify } = useToast();

  const downloaded = useMemo(
    () => downloads.map((songId) => songById.get(songId)).filter((song): song is Song => Boolean(song)),
    [downloads, songById],
  );

  const totalSeconds = downloaded.reduce((sum, song) => sum + song.durationSec, 0);
  const approxMb = Math.max(1, Math.round((totalSeconds * 128) / 8 / 1024));

  const suggestions = songs
    .filter((song) => !isDownloaded(song.id))
    .sort((a, b) => b.plays - a.plays)
    .slice(0, 8);

  return (
    <div>
      <div className="page-head">
        <div>
          <h1 className="page-title">Downloads</h1>
          <p className="page-sub">
            Offline copies for low-connectivity listening. Demo tracks are royalty-free audio files cached in this browser.
          </p>
        </div>
        {downloaded.length ? (
          <button
            type="button"
            className="btn btn--danger"
            onClick={() => {
              if (window.confirm('Remove all downloaded tracks from this device?')) {
                clearDownloads();
                notify('All downloads removed');
              }
            }}
          >
            <TrashIcon size={16} /> Clear all
          </button>
        ) : null}
      </div>

      <div className="stat-strip">
        <div className="stat">
          <span className="stat__value">{downloaded.length}</span>
          <span className="stat__label">Tracks offline</span>
        </div>
        <div className="stat">
          <span className="stat__value">{formatTime(totalSeconds)}</span>
          <span className="stat__label">Total duration</span>
        </div>
        <div className="stat">
          <span className="stat__value">≈ {approxMb} MB</span>
          <span className="stat__label">Estimated storage</span>
        </div>
      </div>

      {downloaded.length ? (
        <>
          <div className="detail-toolbar">
            <button type="button" className="btn btn--primary" onClick={() => playSongs(downloaded, 0, 'Downloads')}>
              <PlayIcon size={16} /> Play all downloads
            </button>
            <span className="page-sub">Plays without a network request once cached</span>
          </div>
          <div className="song-list">
            {downloaded.map((song, index) => (
              <SongRow
                key={song.id}
                song={song}
                index={index}
                subtitle={`${artistName(song.singerIds[0])} · ${song.language.toUpperCase()} · ${song.year}`}
                onPlay={() => playSongs(downloaded, index, 'Downloads')}
                onRemove={() => {
                  void removeDownload(song.id);
                  notify('Removed from downloads');
                }}
                removeLabel="Remove download"
              />
            ))}
          </div>
        </>
      ) : (
        <EmptyState
          title="No downloads yet"
          text="Use the download button on any song or album to keep it available offline in this browser."
          action={
            <button type="button" className="btn btn--primary" onClick={() => navigate('/albums')}>
              Browse albums
            </button>
          }
        />
      )}

      <section className="shelf">
        <SectionHead title="Download more" sub="Popular tracks not yet saved offline" />
        {suggestions.length ? (
          <div className="song-list">
            {suggestions.map((song, index) => (
              <SongRow
                key={song.id}
                song={song}
                index={index}
                subtitle={`${artistName(song.singerIds[0])} · ${formatCount(song.plays)} plays`}
                onPlay={() => playSongs(suggestions, index, 'Popular now')}
              />
            ))}
            <button
              type="button"
              className="btn btn--outline btn--block"
              onClick={async () => {
                const count = await downloadSongs(suggestions);
                notify(count ? `${count} tracks saved offline` : 'Download failed', count ? 'success' : 'error');
              }}
            >
              <DownloadIcon size={16} /> Download these {suggestions.length} tracks
            </button>
          </div>
        ) : (
          <EmptyState title="Everything is downloaded" text="You have saved every track in the demo catalogue." />
        )}
      </section>

      <Notice>
        Browser storage limits vary on low-end Android devices. A production app would use the Storage Manager API,
        background download queues and licensed offline playback rules per territory.
      </Notice>

      <p className="page-sub">
        Looking for your liked songs? <Link to="/liked" className="inline-link">Open Liked Songs</Link>
      </p>
    </div>
  );
}
