import { useMemo, useState } from 'react';
import { Link } from '../lib/router';
import { ERAS } from '../data/types';
import type { Song } from '../data/types';
import { formatCount } from '../lib/format';
import { newestAlbums, playlistsByKind, popularArtists, topByPlays } from '../lib/collections';
import { useCatalog } from '../state/CatalogContext';
import { usePlayer } from '../state/PlayerContext';
import { Artwork } from '../components/Artwork';
import { MediaCard, Notice, SectionHead, ShelfSection, EmptyState } from '../components/MediaCard';
import { SongRow } from '../components/SongRow';
import { PlayIcon, SparkIcon } from '../components/Icons';

function hashParam(name: string): string {
  const raw = window.location.hash.split('?')[1] ?? '';
  return new URLSearchParams(raw).get(name) ?? '';
}

const TELUGU_GENRES = ['Melody', 'Mass', 'Romantic', 'Devotional', 'Folk', 'Independent'];

export function TeluguPage() {
  const { songs, albums, artists, playlists, movies, songById, artistName } = useCatalog();
  const { playSongs } = usePlayer();
  const [era, setEra] = useState(() => hashParam('era'));
  const [movie, setMovie] = useState(() => hashParam('movie'));

  const teluguSongs = useMemo(() => songs.filter((song) => song.language === 'te'), [songs]);
  const teluguAlbums = useMemo(() => albums.filter((album) => album.language === 'te'), [albums]);
  const teluguArtists = useMemo(() => artists.filter((artist) => artist.language === 'te'), [artists]);

  const filtered = useMemo(() => {
    let list = teluguSongs;
    if (era) list = list.filter((song) => song.era === era);
    if (movie) list = list.filter((song) => song.movie === movie);
    return list;
  }, [teluguSongs, era, movie]);

  const eraCounts = useMemo(() => {
    const map = new Map<string, number>();
    teluguSongs.forEach((song) => map.set(song.era, (map.get(song.era) ?? 0) + 1));
    return map;
  }, [teluguSongs]);

  const play = (list: Song[], label: string) => {
    if (!list.length) return;
    playSongs(list, 0, label);
  };

  const latest = newestAlbums(albums, 12, 'te');
  const top = topByPlays(songs, 10, 'te');
  const singers = teluguArtists.filter((artist) => artist.roles.includes('singer'));
  const composers = teluguArtists.filter((artist) => artist.roles.includes('composer'));
  const lyricists = teluguArtists.filter((artist) => artist.roles.includes('lyricist'));
  const eraPlaylists = playlistsByKind(playlists, 'era').filter((playlist) => !playlist.language || playlist.language === 'te');
  const teluguMovies = movies.filter((entry) => entry.language === 'te');
  const years = Array.from(new Set(teluguSongs.map((song) => song.year))).sort((a, b) => b - a);
  const teluguMixes = playlists.filter(
    (playlist) => playlist.language === 'te' && (playlist.kind === 'mood' || playlist.kind === 'genre' || playlist.kind === 'mix')
  );

  return (
    <div>
      <section className="hero hero--telugu">
        <div className="hero__glow" aria-hidden="true" />
        <div className="hero__inner">
          <span className="hero__eyebrow">
            <SparkIcon size={14} /> Telugu music · highest priority
          </span>
          <h1 className="hero__title">తెలుగు సంగీతం — అన్ని యుగాల నుంచి</h1>
          <div className="hero__native">గోల్డెన్ ఎరా నుంచి ఈరోజు వరకు</div>
          <p className="hero__text">
            {teluguSongs.length} fictional Telugu demo tracks across {teluguAlbums.length} albums, organised by era,
            movie, singer, composer, lyricist, music director and album.
          </p>
          <div className="hero__actions">
            <button type="button" className="btn btn--primary" onClick={() => play(top, 'Popular Telugu')}>
              <PlayIcon size={17} /> Play Telugu top 10
            </button>
            <button type="button" className="btn btn--outline" onClick={() => play(teluguSongs.slice(0, 40), 'Telugu mix')}>
              Shuffle Telugu mix
            </button>
          </div>
        </div>
      </section>

      <section className="shelf">
        <SectionHead title="Browse by era" sub="Old classics to latest releases" />
        <div className="chip-row">
          <button
            type="button"
            className={`chip ${!era ? 'chip--active' : ''}`}
            onClick={() => setEra('')}
          >
            All eras
          </button>
          {ERAS.map((item) => (
            <button
              key={item}
              type="button"
              className={`chip ${era === item ? 'chip--active' : ''}`}
              onClick={() => setEra(item === era ? '' : item)}
            >
              {item} · {eraCounts.get(item) ?? 0}
            </button>
          ))}
        </div>
        <div className="chip-row">
          {years.slice(0, 14).map((year) => (
            <Link key={year} to={`/search?q=${year}`} className="chip chip--ghost">
              {year}
            </Link>
          ))}
        </div>
      </section>

      {era || movie ? (
        <section className="shelf">
          <SectionHead
            title={movie ? `Movie: ${movie}` : `${era} Telugu songs`}
            sub={`${filtered.length} tracks`}
            linkTo="/telugu"
            linkLabel="Reset"
          />
          {filtered.length ? (
            <div className="song-list">
              {filtered.map((song, index) => (
                <SongRow
                  key={song.id}
                  song={song}
                  index={index}
                  subtitle={`${song.movie ? `${song.movie} · ` : ''}${artistName(song.singerIds[0])} · ${song.year}`}
                  onPlay={() => play(filtered, movie ? movie : `${era} Telugu`)}
                />
              ))}
            </div>
          ) : (
            <EmptyState title="No tracks in this selection" text="Pick another era or movie to keep browsing." />
          )}
        </section>
      ) : null}

      <ShelfSection title="Latest Telugu releases" sub="Newest demo albums">
        {latest.map((album) => (
          <MediaCard key={album.id} to={`/album/${album.id}`} seed={album.id} title={album.title} subtitle={`${album.year} · ${album.kind}`} />
        ))}
      </ShelfSection>

      <ShelfSection title="Popular Telugu songs" sub="Most played in the demo catalogue">
        {top.map((song) => (
          <MediaCard
            key={song.id}
            to={`/album/${song.albumId}`}
            seed={song.albumId}
            title={song.title}
            subtitle={song.movie ?? `${song.year}`}
            onPlay={() => play(top, 'Popular Telugu')}
          />
        ))}
      </ShelfSection>

      <section className="shelf">
        <SectionHead title="Telugu genres" sub="Melody, mass, romantic, devotional, folk and independent" />
        <div className="chip-row">
          {TELUGU_GENRES.map((genre) => (
            <Link key={genre} to={`/genre/${encodeURIComponent(genre)}?language=te`} className="chip chip--native">
              {genre}
            </Link>
          ))}
        </div>
      </section>

      <ShelfSection title="Telugu playlists" sub="Mood, genre and era sets">
        {teluguMixes.map((playlist) => (
          <MediaCard
            key={playlist.id}
            to={`/playlist/${playlist.id}`}
            seed={playlist.id}
            title={playlist.title}
            subtitle={`${playlist.songIds.length} tracks`}
            onPlay={() => play(playlist.songIds.map((id) => songById.get(id)).filter((song): song is Song => Boolean(song)), playlist.title)}
          />
        ))}
      </ShelfSection>

      {eraPlaylists.length ? (
        <ShelfSection title="Era playlists" sub="Decade by decade">
          {eraPlaylists.map((playlist) => (
            <MediaCard key={playlist.id} to={`/playlist/${playlist.id}`} seed={playlist.id} title={playlist.title} subtitle={playlist.description} />
          ))}
        </ShelfSection>
      ) : null}

      <section className="shelf">
        <SectionHead title="Browse by movie" sub={`${teluguMovies.length} demo soundtracks`} />
        <div className="grid-cards">
          {teluguMovies.slice(0, 18).map((entry) => (
            <button
              key={`${entry.title}-${entry.year}`}
              type="button"
              className="media-card"
              onClick={() => {
                setEra('');
                setMovie(entry.title === movie ? '' : entry.title);
              }}
            >
              <div className="media-card__art">
                <Artwork seed={`${entry.title}-${entry.year}`} title={entry.title} />
              </div>
              <div className="media-card__meta">
                <div className="media-card__title">{entry.title}</div>
                <div className="media-card__sub">
                  {entry.year} · {entry.songIds.length} songs
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="shelf">
        <SectionHead title="Browse by singer" sub="Telugu playback singers" linkTo="/artists?language=te" linkLabel="All artists" />
        <div className="grid-cards grid-cards--artists">
          {singers.slice(0, 12).map((artist) => (
            <Link key={artist.id} to={`/artist/${artist.id}`} className="artist-tile">
              <Artwork seed={artist.id} title={artist.name} round />
              <div className="artist-tile__name">{artist.name}</div>
              <div className="artist-tile__role">{formatCount(artist.followers)} followers</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="shelf">
        <SectionHead title="Composers & music directors" sub="Telugu film composers" />
        <div className="chip-row">
          {composers.map((artist) => (
            <Link key={artist.id} to={`/artist/${artist.id}`} className="chip">
              {artist.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="shelf">
        <SectionHead title="Lyricists" sub="Writers behind the demo songs" />
        <div className="chip-row">
          {lyricists.map((artist) => (
            <Link key={artist.id} to={`/artist/${artist.id}`} className="chip">
              {artist.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="shelf">
        <SectionHead title="Telugu artists" sub="Singers, composers and writers" linkTo="/artists?language=te" />
        <div className="grid-cards grid-cards--artists">
          {popularArtists(teluguArtists, 12).map((artist) => (
            <Link key={artist.id} to={`/artist/${artist.id}`} className="artist-tile">
              <Artwork seed={artist.id} title={artist.name} round />
              <div className="artist-tile__name">{artist.name}</div>
              <div className="artist-tile__role">{artist.roles.join(' · ')}</div>
            </Link>
          ))}
        </div>
      </section>

      <Notice accent>
        Telugu is the flagship language here, but the demo catalogue is fictional. Real Telugu film and independent
        catalogues require licensing agreements and are not connected yet.
      </Notice>
    </div>
  );
}
