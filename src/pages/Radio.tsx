import { useMemo, useState } from 'react';
import { navigate } from '../lib/router';
import type { Song } from '../data/types';
import { formatCount } from '../lib/format';
import { useCatalog } from '../state/CatalogContext';
import { usePlayer } from '../state/PlayerContext';
import { useToast } from '../state/ToastContext';
import { Artwork } from '../components/Artwork';
import { EmptyState, Notice, SectionHead } from '../components/MediaCard';
import { PlayIcon, RadioIcon, ShuffleIcon } from '../components/Icons';

export function RadioPage() {
  const { stations: allStations, languages, songById, artistName } = useCatalog();
  const { playSongs, current, isPlaying, toggle } = usePlayer();
  const { notify } = useToast();
  const [language, setLanguage] = useState('te');

  const stations = useMemo(
    () => allStations.filter((station) => !language || station.language === language),
    [allStations, language],
  );

  const songsOf = (songIds: string[]): Song[] =>
    songIds.map((songId) => songById.get(songId)).filter((song): song is Song => Boolean(song));

  return (
    <div>
      <div className="page-head">
        <div>
          <h1 className="page-title">Radio</h1>
          <p className="page-sub">
            Non-stop themed stations built from the demo catalogue. Stations shuffle tracks so the order feels live.
          </p>
        </div>
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => {
            const pool = stations.flatMap((station) => songsOf(station.songIds));
            if (!pool.length) {
              notify('No tracks in these stations', 'error');
              return;
            }
            playSongs(pool.sort(() => Math.random() - 0.5), 0, 'Mana Radio');
            notify('Mana Radio started', 'success');
          }}
        >
          <RadioIcon size={16} /> Start Mana Radio
        </button>
      </div>

      <div className="filter-bar">
        <label className="field field--inline">
          <span>Station language</span>
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

      {stations.length ? (
        <div className="station-grid">
          {stations.map((station) => {
            const songs = songsOf(station.songIds);
            const active = Boolean(current) && songs.some((song) => song.id === current?.id);
            return (
              <article key={station.id} className={`station-card${active ? ' is-active' : ''}`}>
                <div className="station-card__art">
                  <Artwork seed={station.id} title={station.title} />
                  <span className="station-card__badge">
                    <RadioIcon size={13} /> LIVE
                  </span>
                </div>
                <div className="station-card__body">
                  <h3 className="station-card__title">{station.title}</h3>
                  <p className="page-sub">{station.description}</p>
                  <p className="station-card__meta">
                    {station.language.toUpperCase()} · {songs.length} tracks ·{' '}
                    {formatCount(songs.reduce((sum, song) => sum + song.plays, 0))} plays
                  </p>
                  <div className="station-card__actions">
                    <button
                      type="button"
                      className="btn btn--primary btn--sm"
                      onClick={() => {
                        if (active) {
                          toggle();
                          return;
                        }
                        playSongs(songs, 0, station.title);
                      }}
                      disabled={!songs.length}
                    >
                      <PlayIcon size={15} /> {active && isPlaying ? 'Pause' : 'Tune in'}
                    </button>
                    <button
                      type="button"
                      className="btn btn--ghost btn--sm"
                      onClick={() => playSongs(songs.slice().sort(() => Math.random() - 0.5), 0, station.title)}
                      disabled={!songs.length}
                    >
                      <ShuffleIcon size={14} /> Shuffle
                    </button>
                  </div>
                  <p className="station-card__now">
                    {songs[0] ? `Up next: ${songs[0].title} · ${artistName(songs[0].singerIds[0])}` : 'No tracks'}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No stations for this language"
          text="Choose another language or view all stations."
          action={
            <button type="button" className="btn btn--outline" onClick={() => setLanguage('')}>
              Show all stations
            </button>
          }
        />
      )}

      <section className="shelf">
        <SectionHead title="How radio works here" sub="Prototype behaviour" />
        <Notice>
          These stations are curated demo playlists, not a licensed broadcast service. Real radio with continuous
          scheduling, DJ segments and royalty reporting requires licensed catalogue access and a streaming backend.
        </Notice>
      </section>

      <button type="button" className="btn btn--ghost" onClick={() => navigate('/explore')}>
        Browse more genres
      </button>
    </div>
  );
}
