import { useState } from 'react';
import { Link, navigate } from '../lib/router';
import type { Podcast, PodcastEpisode, Song } from '../data/types';
import { formatCount, formatTime } from '../lib/format';
import { useCatalog } from '../state/CatalogContext';
import { usePlayer } from '../state/PlayerContext';
import { useToast } from '../state/ToastContext';
import { Artwork } from '../components/Artwork';
import { EmptyState, Notice, SectionHead } from '../components/MediaCard';
import { DownloadIcon, MicIcon, PauseIcon, PlayIcon, PlusIcon } from '../components/Icons';

function episodeToSong(podcast: Podcast, episode: PodcastEpisode): Song {
  const year = Number(episode.publishedAt.slice(0, 4)) || 2026;
  return {
    id: episode.id,
    title: episode.title,
    albumId: podcast.id,
    language: podcast.language,
    year,
    movie: podcast.title,
    singerIds: [],
    composerId: '',
    genre: 'Podcast',
    mood: 'Talk',
    durationSec: episode.durationSec,
    audioId: episode.audioId,
    plays: 0,
    era: '2020s',
  };
}

export function PodcastsPage() {
  const { catalog, languages } = useCatalog();
  const { playSongs, current, isPlaying, toggle } = usePlayer();
  const { notify } = useToast();
  const [language, setLanguage] = useState('');

  const podcasts = catalog.podcasts.filter((podcast) => !language || podcast.language === language);

  const playPodcast = (podcast: Podcast, startIndex = 0) => {
    const songs = podcast.episodes.map((episode) => episodeToSong(podcast, episode));
    if (!songs.length) {
      notify('This podcast has no episodes yet', 'error');
      return;
    }
    playSongs(songs, startIndex, podcast.title);
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <h1 className="page-title">Podcasts</h1>
          <p className="page-sub">
            Telugu and Indian-language talk shows, film-music deep dives and artist interviews — demo episodes only.
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
      </div>

      {podcasts.length ? (
        <div className="podcast-grid">
          {podcasts.map((podcast) => {
            const episodes = podcast.episodes.map((episode) => episodeToSong(podcast, episode));
            const active = Boolean(current) && episodes.some((song) => song.id === current?.id);
            return (
              <article key={podcast.id} className="podcast-card">
                <div className="podcast-card__art">
                  <Artwork seed={podcast.id} title={podcast.title} />
                  <span className="podcast-card__tag">
                    <MicIcon size={12} /> Podcast
                  </span>
                </div>
                <div className="podcast-card__body">
                  <h3 className="podcast-card__title">{podcast.title}</h3>
                  <p className="page-sub">Hosted by {podcast.host}</p>
                  <p className="page-sub">{podcast.description}</p>
                  <p className="podcast-card__meta">
                    {podcast.episodes.length} episodes · {podcast.language.toUpperCase()}
                  </p>
                  <div className="podcast-card__actions">
                    <button
                      type="button"
                      className="btn btn--primary btn--sm"
                      onClick={() => (active ? toggle() : playPodcast(podcast))}
                    >
                      {active && isPlaying ? <PauseIcon size={15} /> : <PlayIcon size={15} />}{' '}
                      {active && isPlaying ? 'Pause' : 'Play latest'}
                    </button>
                    <Link to={`/podcast/${podcast.id}`} className="btn btn--ghost btn--sm">
                      Episodes
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState title="No podcasts in this language" text="Choose another language to see more shows." />
      )}

      <Notice>
        Podcast episodes use the same royalty-free instrumental demo audio as the music catalogue. Real spoken-word
        episodes need separately licensed podcast content.
      </Notice>
    </div>
  );
}

export function PodcastPage({ id }: { id: string }) {
  const { catalog } = useCatalog();
  const { playSongs, current, isPlaying, toggle } = usePlayer();
  const { downloadSongs, isDownloaded } = useLibrarySafe();
  const { notify } = useToast();

  const podcast = catalog.podcasts.find((item) => item.id === id);
  if (!podcast) {
    return (
      <EmptyState
        title="Podcast not found"
        text="This show is not part of the demo catalogue."
        action={
          <button type="button" className="btn btn--outline" onClick={() => navigate('/podcasts')}>
            Back to podcasts
          </button>
        }
      />
    );
  }

  const episodes = podcast.episodes.map((episode) => episodeToSong(podcast, episode));
  const totalMinutes = Math.round(episodes.reduce((sum, song) => sum + song.durationSec, 0) / 60);

  return (
    <div>
      <button type="button" className="link-back" onClick={() => navigate('/podcasts')}>
        ← Podcasts
      </button>

      <section className="detail-head">
        <div className="detail-head__art">
          <Artwork seed={podcast.id} title={podcast.title} />
        </div>
        <div className="detail-head__meta">
          <span className="badge">Podcast</span>
          <h1 className="page-title">{podcast.title}</h1>
          <p className="page-sub">Hosted by {podcast.host} · {podcast.language.toUpperCase()}</p>
          <p className="page-sub">{podcast.description}</p>
          <p className="page-sub">
            {podcast.episodes.length} episodes · {totalMinutes} min total
          </p>
          <div className="detail-head__actions">
            <button type="button" className="btn btn--primary" onClick={() => playSongs(episodes, 0, podcast.title)}>
              <PlayIcon size={16} /> Play all
            </button>
            <button
              type="button"
              className="btn btn--outline"
              onClick={async () => {
                const count = await downloadSongs(episodes);
                notify(count ? `${count} episodes saved offline` : 'Download failed', count ? 'success' : 'error');
              }}
            >
              <DownloadIcon size={16} /> Download show
            </button>
          </div>
        </div>
      </section>

      <SectionHead title="Episodes" sub="Newest first" />
      <div className="episode-list">
        {podcast.episodes.map((episode, index) => {
          const song = episodes[index];
          const active = current?.id === song.id;
          return (
            <article key={episode.id} className={`episode-row${active ? ' is-active' : ''}`}>
              <button
                type="button"
                className="episode-row__play"
                aria-label={active && isPlaying ? `Pause ${episode.title}` : `Play ${episode.title}`}
                onClick={() => (active ? toggle() : playSongs(episodes, index, podcast.title))}
              >
                {active && isPlaying ? <PauseIcon size={16} /> : <PlayIcon size={16} />}
              </button>
              <div className="episode-row__body">
                <h4 className="episode-row__title">{episode.title}</h4>
                <p className="page-sub">{episode.description}</p>
                <p className="episode-row__meta">
                  {formatTime(episode.durationSec)} · {new Date(episode.publishedAt).toLocaleDateString('en-IN')} ·{' '}
                  {isDownloaded(episode.id) ? 'Saved offline' : 'Streaming'}
                </p>
              </div>
              <button
                type="button"
                className="icon-btn"
                aria-label={`Download ${episode.title}`}
                onClick={async () => {
                  const count = await downloadSongs([song]);
                  notify(count ? 'Episode saved offline' : 'Could not download', count ? 'success' : 'error');
                }}
              >
                <PlusIcon size={16} />
              </button>
            </article>
          );
        })}
      </div>
    </div>
  );
}

// Local import indirection keeps the page readable while using the shared library hook.
function useLibrarySafe() {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return useLibraryFromContext();
}

import { useLibrary as useLibraryFromContext } from '../state/LibraryContext';
