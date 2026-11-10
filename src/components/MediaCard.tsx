import type { ReactNode } from 'react';
import { Link } from '../lib/router';
import { Artwork } from './Artwork';
import { PlayIcon } from './Icons';

interface MediaCardProps {
  to: string;
  seed: string;
  title: string;
  subtitle?: string;
  onPlay?: () => void;
  round?: boolean;
  playLabel?: string;
}

export function MediaCard({ to, seed, title, subtitle, onPlay, round, playLabel }: MediaCardProps) {
  return (
    <div className="media-card">
      <Link to={to} aria-label={`Open ${title}`}>
        <div className="media-card__art">
          <Artwork seed={seed} title={title} round={round} />
        </div>
        <div className="media-card__meta">
          <div className="media-card__title">{title}</div>
          {subtitle ? <div className="media-card__sub">{subtitle}</div> : null}
        </div>
      </Link>
      {onPlay ? (
        <button
          type="button"
          className="play-fab play-fab--sm media-card__play"
          onClick={onPlay}
          aria-label={playLabel ?? `Play ${title}`}
        >
          <PlayIcon size={17} />
        </button>
      ) : null}
    </div>
  );
}

interface SectionHeadProps {
  title: ReactNode;
  sub?: string;
  linkTo?: string;
  linkLabel?: string;
}

export function SectionHead({ title, sub, linkTo, linkLabel }: SectionHeadProps) {
  return (
    <div className="section-head">
      <div>
        <div className="section-head__title">{title}</div>
        {sub ? <span className="section-head__sub">{sub}</span> : null}
      </div>
      {linkTo ? (
        <Link className="section-head__link" to={linkTo}>
          {linkLabel ?? 'See all'}
        </Link>
      ) : null}
    </div>
  );
}

export function Shelf({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <div className="shelf__track" role="list" aria-label={label}>
      {children}
    </div>
  );
}

export function ShelfSection({
  title,
  sub,
  linkTo,
  linkLabel,
  children,
}: SectionHeadProps & { children: ReactNode }) {
  return (
    <section className="shelf">
      <SectionHead title={title} sub={sub} linkTo={linkTo} linkLabel={linkLabel} />
      <Shelf label={typeof title === 'string' ? title : undefined}>{children}</Shelf>
    </section>
  );
}

interface EmptyStateProps {
  title: string;
  text?: string;
  action?: ReactNode;
}

export function EmptyState({ title, text, action }: EmptyStateProps) {
  return (
    <div className="empty">
      <div className="empty__title">{title}</div>
      {text ? <p className="empty__text">{text}</p> : null}
      {action}
    </div>
  );
}

export function Notice({ children, accent }: { children: ReactNode; accent?: boolean }) {
  return <div className={`notice ${accent ? 'notice--accent' : ''}`}>{children}</div>;
}
