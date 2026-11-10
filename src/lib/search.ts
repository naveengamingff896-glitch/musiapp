import { GENRES, LANGUAGES } from '../data/languages';
import type { Album, Artist, Catalog, Playlist, Song } from '../data/types';

/** Latin/Indic aware normalisation used by the search engine. */
export function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\u0900-\u0dff\u0b80-\u0bff\u0c00-\u0c7f\u0c80-\u0cff\u0d00-\u0d7f\u0980-\u09ff\u0a00-\u0a7f\u0a80-\u0aff\u0b00-\u0b7f\u0e80-\u0eff\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Rough phonetic key so that "Ramuloo Ramulaa" style spelling variants still
 * match: doubled vowels, th/t, v/w and similar transliteration differences.
 */
export function phoneticKey(value: string): string {
  return normalize(value)
    .replace(/aa/g, 'a')
    .replace(/ee/g, 'i')
    .replace(/oo/g, 'u')
    .replace(/th/g, 't')
    .replace(/dh/g, 'd')
    .replace(/sh/g, 's')
    .replace(/ch/g, 'c')
    .replace(/kh/g, 'k')
    .replace(/gh/g, 'g')
    .replace(/bh/g, 'b')
    .replace(/ph/g, 'f')
    .replace(/v/g, 'w')
    .replace(/([a-z])\1+/g, '$1')
    .replace(/\s+/g, '');
}

export interface SearchHit {
  score: number;
}

function scoreMatch(query: string, fields: string[]): number {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return 0;
  const queryKey = phoneticKey(query);
  const tokens = normalizedQuery.split(' ').filter(Boolean);
  let best = 0;

  for (const field of fields) {
    if (!field) continue;
    const normalizedField = normalize(field);
    const fieldKey = phoneticKey(field);

    if (normalizedField === normalizedQuery) best = Math.max(best, 100);
    else if (normalizedField.startsWith(normalizedQuery)) best = Math.max(best, 80);
    else if (normalizedField.includes(normalizedQuery)) best = Math.max(best, 60);
    else if (queryKey.length > 2 && fieldKey.includes(queryKey)) best = Math.max(best, 46);
    else if (tokens.length > 1 && tokens.every((token) => normalizedField.includes(token))) {
      best = Math.max(best, 40);
    }
  }
  return best;
}

export interface MovieHit {
  title: string;
  language: string;
  year: number;
  songIds: string[];
}

export interface SearchResults {
  songs: Song[];
  albums: Album[];
  artists: Artist[];
  playlists: Playlist[];
  movies: MovieHit[];
  genres: string[];
  languages: { code: string; name: string; native: string }[];
  total: number;
}

export interface SearchOptions {
  limit?: number;
  language?: string;
  genre?: string;
  artistId?: string;
  era?: string;
}

export function searchCatalog(
  query: string,
  catalog: Catalog,
  artistsById: Map<string, Artist>,
  albumsById: Map<string, Album>,
  movies: MovieHit[],
  options: SearchOptions = {}
): SearchResults {
  const limit = options.limit ?? 40;
  const trimmed = query.trim();

  const songMatches = (song: Song): number => {
    const album = albumsById.get(song.albumId);
    const artistNames = song.singerIds.map((id) => artistsById.get(id)?.name ?? '');
    const composer = artistsById.get(song.composerId)?.name ?? '';
    return scoreMatch(trimmed, [
      song.title,
      song.nativeTitle ?? '',
      song.movie ?? '',
      album?.title ?? '',
      song.genre,
      song.mood,
      ...artistNames,
      composer,
    ]);
  };

  let songs: Song[];
  if (!trimmed) {
    songs = catalog.songs.slice().sort((a, b) => b.plays - a.plays);
  } else {
    songs = catalog.songs
      .map((song) => ({ song, score: songMatches(song) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score || b.song.plays - a.song.plays)
      .map((entry) => entry.song);
  }

  if (options.language) songs = songs.filter((song) => song.language === options.language);
  if (options.genre) songs = songs.filter((song) => song.genre === options.genre);
  if (options.era) songs = songs.filter((song) => song.era === options.era);
  if (options.artistId) {
    songs = songs.filter(
      (song) => song.composerId === options.artistId || song.singerIds.includes(options.artistId ?? '')
    );
  }

  const albumMatches = (album: Album): number =>
    scoreMatch(trimmed, [
      album.title,
      album.movie ?? '',
      artistsById.get(album.artistId)?.name ?? '',
      album.kind,
    ]);

  let albums = catalog.albums
    .map((album) => ({ album, score: trimmed ? albumMatches(album) : album.year >= 2020 ? 40 : 20 }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || b.album.year - a.album.year)
    .map((entry) => entry.album);

  const artistMatches = (artist: Artist): number =>
    scoreMatch(trimmed, [artist.name, artist.language, artist.roles.join(' ')]);

  let artists = catalog.artists
    .map((artist) => ({ artist, score: trimmed ? artistMatches(artist) : artist.followers / 100000 }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.artist);

  let playlists = catalog.playlists
    .map((playlist) => ({
      playlist,
      score: trimmed ? scoreMatch(trimmed, [playlist.title, playlist.description, playlist.kind]) : 30,
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.playlist);

  if (options.language) {
    albums = albums.filter((album) => album.language === options.language);
    artists = artists.filter((artist) => artist.language === options.language);
    playlists = playlists.filter((playlist) => !playlist.language || playlist.language === options.language);
  }
  if (options.artistId) {
    artists = artists.filter((artist) => artist.id === options.artistId);
  }

  const movieHits = trimmed
    ? movies
        .map((movie) => ({ movie, score: scoreMatch(trimmed, [movie.title]) }))
        .filter((entry) => entry.score > 0)
        .sort((a, b) => b.score - a.score)
        .map((entry) => entry.movie)
    : [];

  const genreHits = trimmed
    ? GENRES.filter((genre) => normalize(genre).includes(normalize(trimmed)) || normalize(trimmed).includes(normalize(genre)))
    : GENRES;

  const languageHits = trimmed
    ? LANGUAGES.filter(
        (language) =>
          normalize(language.name).includes(normalize(trimmed)) ||
          normalize(language.native).includes(normalize(trimmed))
      ).map((language) => ({ code: language.code, name: language.name, native: language.native }))
    : [];

  return {
    songs: songs.slice(0, limit),
    albums: albums.slice(0, Math.min(limit, 12)),
    artists: artists.slice(0, Math.min(limit, 12)),
    playlists: playlists.slice(0, Math.min(limit, 12)),
    movies: movieHits.slice(0, 8),
    genres: genreHits.slice(0, 8),
    languages: languageHits.slice(0, 6),
    total: songs.length + albums.length + artists.length + playlists.length + movieHits.length,
  };
}
