import { Link } from '../lib/router';
import { formatTime } from '../lib/format';
import { usePlayer } from '../state/PlayerContext';
import { Artwork } from './Artwork';
import { ChevronUpIcon, PauseIcon, PlayIcon, SkipNextIcon } from './Icons';

/** Compact now-playing bar shown above the bottom navigation. */
export function PlayerBar() {
  const { current, isPlaying, toggle, next, position, duration, contextLabel } = usePlayer();
  if (!current) return null;

  const progress = duration > 0 ? Math.min(100, (position / duration) * 100) : 0;

  return (
    <div className="player-bar" role="region" aria-label="Now playing">
      <div className="player-bar__progress" aria-hidden="true">
        <span style={{ width: `${progress}%` }} />
      </div>
      <Link to="/player" className="player-bar__main" aria-label={`Open player for ${current.title}`}>
        <Artwork seed={current.albumId} title={current.title} tiny />
        <div className="player-bar__text">
          <div className="player-bar__title">{current.title}</div>
          <div className="player-bar__sub">
            {current.movieTitle ?? contextLabel} · {formatTime(position)} / {formatTime(duration)}
          </div>
        </div>
      </Link>
      <div className="player-bar__actions">
        <button type="button" className="icon-btn" onClick={toggle} aria-label={isPlaying ? 'Pause' : 'Play'}>
          {isPlaying ? <PauseIcon size={22} /> : <PlayIcon size={22} />}
        </button>
        <button type="button" className="icon-btn" onClick={() => next()} aria-label="Next track">
          <SkipNextIcon size={22} />
        </button>
        <Link to="/player" className="icon-btn" aria-label="Expand player">
          <ChevronUpIcon size={20} />
        </Link>
      </div>
    </div>
  );
}
