import { useMemo, useState } from 'react';
import { Link, navigate } from '../lib/router';
import { formatCount } from '../lib/format';
import { searchCatalog } from '../lib/search';
import { GENRES } from '../data/languages';
import { useCatalog } from '../state/CatalogContext';
import { useLibrary } from '../state/LibraryContext';
import { usePlayer } from '../state/PlayerContext';
import { Artwork } from '../components/Artwork';
import { EmptyState, SectionHead } from '../components/MediaCard';
import { SongRow } from '../components/SongRow';
import { SearchIcon, CloseIcon, FilterIcon } from '../components/Icons';
import type { Song } from '../data/types';

type TypeFilter = 'all' | 'songs' | 'albums' | 'artists' | 'playlists' | 'movies';
type SortMode = 'relevance' | 'popular' | 'newest';

const TYPE_TABS: { id: TypeFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'songs', label: 'Songs' },
  { id: 'albums', label: 'Albums' },
  { id: 'artists', label: 'Artists' },
  { id: 'playlists', label: 'Playlists' },
  { id: 'movies', label: 'Movies' },
];

function initialQuery(): string {
  const raw = window.location.hash.split('?')[1] ?? '';
  return new URLSearchParams(raw).get('q') ?? '';
}

export function SearchPage() {
  const { catalog, songs, artistById, albumById, movies, languages, artistName } = useCatalog() as ReturnType<typeof useCatalog> & {
    languages?: { code: string; name: string; native: string }[];
  };
  const { recentSearches, addRecentSearch, clearRecentSearches, settings } = useLibrary();
  const { playSongs } = usePlayer();
  const [query, setQuery] = useState(initialQuery);
  const [type, setType] = useState<TypeFilter>('all');
  const [language, setLanguage] = useState('');
  const [genre, setGenre] = useState('');
  const [sort, setSort] = useState<SortMode>('relevance');

  const languageList = languages ?? catalog.languages;
  const trimmed = query.trim();

  const results = useMemo(() => {
    if (!trimmed) return null;
    return searchCatalog(trimmed, catalog, artistById, albumById, movies, {
      limit: 60,
      language: language || undefined,
      genre: genre || undefined,
    });
  }, [trimmed, catalog, artistById, albumById, movies, language, genre]);

  const sorted = useMemo(() => {
    if (!results) return null;
    const songList = results.songs.slice();
    if (sort === 'popular') songList.sort((a, b) => b.plays - a.plays);
    if (sort === 'newest') songList.sort((a, b) => b.year - a.year);
    const albumList = results.albums.slice();
    if (sort === 'popular') albumList.sort((a, b) => b.songIds.length - a.songIds.length);
    if (sort === 'newest') albumList.sort((a, b) => b.year - a.year);
    const artistList = results.artists.slice();
    if (sort === 'popular') artistList.sort((a, b) => b.followers - a.followers);
    return { ...results, songs: songList, albums: albumList, artists: artistList };
  }, [results, sort]);

  const submit = (term: string) => {
    const value = term.trim();
    if (!value) return;
    setQuery(value);
    addRecentSearch(value);
  };

  const playResult = (list: Song[], label: string) => {
    if (!list.length) return;
    playSongs(list, 0, label);
  };

  const trending = songs.slice().sort((a, b) => b.plays - a.plays).slice(0, 6);
  const suggestions = useMemo(() => {
    if (!trimmed) return [];
    const pool = new Set<string>();
    results?.songs.slice(0, 3).forEach((song) => pool.add(song.title));
    results?.artists.slice(0, 2).forEach((artist) => pool.add(artist.name));
    results?.movies.slice(0, 2).forEach((movie) => pool.add(movie.title));
    return Array.from(pool).slice(0, 6);
  }, [results, trimmed]);

  const total = sorted?.total ?? 0;

  return (
    <div>
      <div className="page-head">
        <div>
          <h1 className="page-title">Search</h1>
          <p className="page-sub">
            Songs, movies, albums, singers, composers, lyricists, playlists and genres — in Telugu script or English
            transliteration.
          </p>
        </div>
      </div>

      <form
        className="search-box"
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          submit(query);
        }}
      >
        <SearchIcon size={20} />
        <input
          className="search-box__input"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Try “Ramuloo Ramulaa”, “Vennela”, or a movie name"
          aria-label="Search Mana Music"
          autoComplete="off"
        />
        {query ? (
          <button type="button" className="icon-btn" onClick={() => setQuery('')} aria-label="Clear search">
            <CloseIcon size={18} />
          </button>
        ) : null}
      </form>

      {suggestions.length > 0 ? (
        <div className="chip-row" aria-label="Suggestions">
          {suggestions.map((suggestion) => (
            <button key={suggestion} type="button" className="chip" onClick={() => submit(suggestion)}>
              {suggestion}
            </button>
          ))}
        </div>
      ) : null}

      {!trimmed ? (
        <div>
          {recentSearches.length > 0 ? (
            <section className="shelf">
              <SectionHead title="Search history" sub="Stored on this device" />
              <div className="chip-row">
                {recentSearches.map((term) => (
                  <button key={term} type="button" className="chip" onClick={() => submit(term)}>
                    {term}
                  </button>
                ))}
                <button type="button" className="chip chip--ghost" onClick={clearRecentSearches}>
                  Clear history
                </button>
              </div>
            </section>
          ) : null}

          <section className="shelf">
            <SectionHead title="Trending searches" sub="Popular demo tracks" />
            <div className="song-list">
              {trending.map((song, index) => (
                <SongRow
                  key={song.id}
                  song={song}
                  index={index}
                  subtitle={`${artistName(song.singerIds[0])} · ${song.language.toUpperCase()}`}
                  onPlay={() => playResult(trending, 'Trending now')}
                />
              ))}
            </div>
          </section>

          <section className="shelf">
            <SectionHead title="Browse by language" sub="24 Indian languages" linkTo="/explore" linkLabel="All languages" />
            <div className="chip-row">
              {languageList.map((item) => (
                <Link key={item.code} to={`/language/${item.code}`} className="chip chip--native">
                  {item.native} · {item.name}
                </Link>
              ))}
            </div>
          </section>

          <section className="shelf">
            <SectionHead title="Browse by genre" sub="Every style in the demo catalogue" />
            <div className="chip-row">
              {GENRES.map((item) => (
                <Link key={item} to={`/genre/${encodeURIComponent(item)}`} className="chip">
                  {item}
                </Link>
              ))}
            </div>
          </section>
        </div>
      ) : null}

      {trimmed && sorted ? (
        <div>
          <div className="chip-row" role="tablist" aria-label="Result types">
            {TYPE_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={type === tab.id}
                className={`chip ${type === tab.id ? 'chip--active' : ''}`}
                onClick={() => setType(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="filter-bar">
            <span className="filter-bar__label">
              <FilterIcon size={15} /> Filters
            </span>
            <label className="field field--inline">
              <span>Language</span>
              <select value={language} onChange={(event) => setLanguage(event.target.value)}>
                <option value="">All languages</option>
                {languageList.map((item) => (
                  <option key={item.code} value={item.code}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="field field--inline">
              <span>Genre</span>
              <select value={genre} onChange={(event) => setGenre(event.target.value)}>
                <option value="">All genres</option>
                {GENRES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label className="field field--inline">
              <span>Sort</span>
              <select value={sort} onChange={(event) => setSort(event.target.value as SortMode)}>
                <option value="relevance">Relevance</option>
                <option value="popular">Most played</option>
                <option value="newest">Newest</option>
              </select>
            </label>
          </div>

          <p className="page-sub" aria-live="polite">
            {total} result{total === 1 ? '' : 's'} for “{trimmed}”
            {settings.language === 'te' ? ' · తెలుగు లిపిలో వెతకవచ్చు' : ''}
          </p>

          {(type === 'all' || type === 'songs') && sorted.songs.length > 0 ? (
            <section className="shelf">
              <SectionHead title="Songs" sub={`${sorted.songs.length} matches`} />
              <div className="song-list">
                {sorted.songs.slice(0, type === 'songs' ? 40 : 6).map((song, index) => (
                  <SongRow
                    key={song.id}
                    song={song}
                    index={index}
                    subtitle={`${song.movie ? `${song.movie} · ` : ''}${artistName(song.singerIds[0])} · ${song.year}`}
                    onPlay={() => playResult(sorted.songs, `Search: ${trimmed}`)}
                  />
                ))}
              </div>
            </section>
          ) : null}

          {(type === 'all' || type === 'albums') && sorted.albums.length > 0 ? (
            <section className="shelf">
              <SectionHead title="Albums" sub={`${sorted.albums.length} matches`} />
              <div className="grid-cards">
                {sorted.albums.slice(0, type === 'albums' ? 30 : 6).map((album) => (
                  <Link key={album.id} to={`/album/${album.id}`} className="media-card">
                    <div className="media-card__art">
                      <Artwork seed={album.id} title={album.title} />
                    </div>
                    <div className="media-card__meta">
                      <div className="media-card__title">{album.title}</div>
                      <div className="media-card__sub">
                        {album.year} · {album.kind}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          {(type === 'all' || type === 'artists') && sorted.artists.length > 0 ? (
            <section className="shelf">
              <SectionHead title="Artists" sub={`${sorted.artists.length} matches`} />
              <div className="grid-cards grid-cards--artists">
                {sorted.artists.slice(0, type === 'artists' ? 30 : 6).map((artist) => (
                  <Link key={artist.id} to={`/artist/${artist.id}`} className="artist-tile">
                    <Artwork seed={artist.id} title={artist.name} round />
                    <div className="artist-tile__name">{artist.name}</div>
                    <div className="artist-tile__role">
                      {artist.roles.join(' · ')} · {formatCount(artist.followers)} followers
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          {(type === 'all' || type === 'playlists') && sorted.playlists.length > 0 ? (
            <section className="shelf">
              <SectionHead title="Playlists" sub={`${sorted.playlists.length} matches`} />
              <div className="grid-cards">
                {sorted.playlists.slice(0, type === 'playlists' ? 30 : 6).map((playlist) => (
                  <Link key={playlist.id} to={`/playlist/${playlist.id}`} className="media-card">
                    <div className="media-card__art">
                      <Artwork seed={playlist.id} title={playlist.title} />
                    </div>
                    <div className="media-card__meta">
                      <div className="media-card__title">{playlist.title}</div>
                      <div className="media-card__sub">{playlist.songIds.length} tracks</div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          {(type === 'all' || type === 'movies') && sorted.movies.length > 0 ? (
            <section className="shelf">
              <SectionHead title="Movies" sub={`${sorted.movies.length} matches`} />
              <div className="grid-cards">
                {sorted.movies.slice(0, type === 'movies' ? 30 : 6).map((movie) => (
                  <Link
                    key={`${movie.title}-${movie.year}`}
                    to={`/language/${movie.language}?movie=${encodeURIComponent(movie.title)}`}
                    className="media-card"
                  >
                    <div className="media-card__art">
                      <Artwork seed={`${movie.title}-${movie.year}`} title={movie.title} />
                    </div>
                    <div className="media-card__meta">
                      <div className="media-card__title">{movie.title}</div>
                      <div className="media-card__sub">
                        {movie.year} · {movie.songIds.length} songs
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          {type === 'all' && sorted.genres.length > 0 ? (
            <section className="shelf">
              <SectionHead title="Genres" sub="Matching styles" />
              <div className="chip-row">
                {sorted.genres.map((item) => (
                  <Link key={item} to={`/genre/${encodeURIComponent(item)}`} className="chip">
                    {item}
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          {total === 0 ? (
            <EmptyState
              title="No matches yet"
              text="Try a shorter word, a movie name, a singer, or switch the language and genre filters. Telugu script and transliteration both work."
              action={
                <button type="button" className="btn btn--outline" onClick={() => navigate('/telugu')}>
                  Browse Telugu music
                </button>
              }
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
