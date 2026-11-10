import { Link } from '../lib/router';
import { formatTime } from '../lib/format';
import { usePlayer } from '../state/PlayerContext';
import { Artwork } from './Artwork';
import { ArrowUpIcon, NextIcon, PauseIcon, PlayIcon } from './Icons';

/** Compact now-playing bar shown above the bottom navigation. */
export function PlayerBar() {
  const { current, isPlaying, toggle, next, position, duration, contextLabel } = usePlayer();
  if (!current) return null;

  const progress = duration > 0 ? Math.min(100, (position / duration) * 100) : 0;

  return (
    <div className="mini-player" role="region" aria-label="Now playing">
      <div className="mini-player__progress" aria-hidden="true">
        <span style={{ width: `${progress}%` }} />
      </div>
      <Link to="/player" className="mini-player__main" aria-label={`Open player for ${current.title}`}>
        <span className="mini-player__art">
          <Artwork seed={current.albumId} title={current.title} tiny />
        </span>
        <span className="mini-player__text">
          <span className="mini-player__title">{current.title}</span>
          <span className="mini-player__sub">
            {current.movie ?? contextLabel} · {formatTime(position)} / {formatTime(duration)}
          </span>
        </span>
      </Link>
      <div className="mini-player__actions">
        <button type="button" className="icon-btn" onClick={toggle} aria-label={isPlaying ? 'Pause' : 'Play'}>
          {isPlaying ? <PauseIcon size={22} /> : <PlayIcon size={22} />}
        </button>
        <button type="button" className="icon-btn" onClick={() => next()} aria-label="Next track">
          <NextIcon size={22} />
        </button>
        <Link to="/player" className="icon-btn" aria-label="Expand player">
          <ArrowUpIcon size={20} />
        </Link>
      </div>
    </div>
  );
}
