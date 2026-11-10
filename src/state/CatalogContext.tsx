import { createContext, useCallback, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';
import { catalog as baseCatalog } from '../data/catalog';
import { LICENSING_RECORDS, REPORT_SEEDS } from '../data/licensing';
import { eraForYear } from '../data/types';
import type {
  Album,
  Artist,
  Catalog,
  LanguageInfo,
  LicensingRecord,
  Playlist,
  Podcast,
  RadioStation,
  ReportRecord,
  Song,
} from '../data/types';
import type { MovieHit } from '../lib/search';
import { usePersistentState } from '../lib/storage';

interface Overrides {
  addedSongs: Song[];
  songEdits: Record<string, Partial<Song>>;
  deletedSongIds: string[];
  addedArtists: Artist[];
  artistEdits: Record<string, Partial<Artist>>;
  albumEdits: Record<string, Partial<Album>>;
  featuredPlaylists: string[];
  hiddenPlaylistIds: string[];
  licensing: LicensingRecord[];
  reports: ReportRecord[];
}

const defaultOverrides: Overrides = {
  addedSongs: [],
  songEdits: {},
  deletedSongIds: [],
  addedArtists: [],
  artistEdits: {},
  albumEdits: {},
  featuredPlaylists: baseCatalog.playlists.slice(0, 8).map((playlist) => playlist.id),
  hiddenPlaylistIds: [],
  licensing: LICENSING_RECORDS,
  reports: REPORT_SEEDS,
};

export type SongDraft = {
  title: string;
  nativeTitle?: string;
  albumId: string;
  language: string;
  year: number;
  movie?: string;
  singerIds: string[];
  composerId: string;
  genre: string;
  mood: string;
  durationSec: number;
  audioId: string;
};

export type ArtistDraft = {
  name: string;
  roles: Artist['roles'];
  language: string;
  bio: string;
};

interface CatalogContextValue {
  catalog: Catalog;
  languages: LanguageInfo[];
  stations: RadioStation[];
  podcasts: Podcast[];
  songs: Song[];
  albums: Album[];
  artists: Artist[];
  playlists: Playlist[];
  featuredPlaylists: Playlist[];
  movies: MovieHit[];
  songById: Map<string, Song>;
  albumById: Map<string, Album>;
  artistById: Map<string, Artist>;
  playlistById: Map<string, Playlist>;
  artistName: (id: string) => string;
  albumTitle: (id: string) => string;
  songsOfAlbum: (albumId: string) => Song[];
  songsOfArtist: (artistId: string) => Song[];
  albumsOfArtist: (artistId: string) => Album[];
  songsOfPlaylist: (playlist: Playlist) => Song[];
  licensing: LicensingRecord[];
  reports: ReportRecord[];
  addSong: (draft: SongDraft) => Song;
  updateSong: (id: string, patch: Partial<Song>) => void;
  deleteSong: (id: string) => void;
  addArtist: (draft: ArtistDraft) => Artist;
  updateArtist: (id: string, patch: Partial<Artist>) => void;
  updateAlbum: (id: string, patch: Partial<Album>) => void;
  toggleFeaturedPlaylist: (id: string) => void;
  hidePlaylist: (id: string) => void;
  restorePlaylist: (id: string) => void;
  updateLicensing: (id: string, patch: Partial<LicensingRecord>) => void;
  updateReport: (id: string, patch: Partial<ReportRecord>) => void;
  resetDemoData: () => void;
}

const CatalogContext = createContext<CatalogContextValue | null>(null);

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [overrides, setOverrides] = usePersistentState<Overrides>('mana.catalog.v1', defaultOverrides);

  const merged = useMemo(() => {
    const deleted = new Set(overrides.deletedSongIds);
    const editedBase = baseCatalog.songs
      .filter((song) => !deleted.has(song.id))
      .map((song) => (overrides.songEdits[song.id] ? { ...song, ...overrides.songEdits[song.id] } : song));
    const added = overrides.addedSongs.filter((song) => !deleted.has(song.id));
    const songs = [...added, ...editedBase];

    const artists = [
      ...baseCatalog.artists.map((artist) =>
        overrides.artistEdits[artist.id] ? { ...artist, ...overrides.artistEdits[artist.id] } : artist
      ),
      ...overrides.addedArtists,
    ];

    const albumMap = new Map<string, Album>();
    for (const album of baseCatalog.albums) {
      albumMap.set(album.id, overrides.albumEdits[album.id] ? { ...album, ...overrides.albumEdits[album.id] } : album);
    }
    for (const song of added) {
      const album = albumMap.get(song.albumId);
      if (album) {
        if (!album.songIds.includes(song.id)) albumMap.set(album.id, { ...album, songIds: [...album.songIds, song.id] });
      } else {
        albumMap.set(song.albumId, {
          id: song.albumId,
          title: 'Admin uploads',
          artistId: song.composerId,
          language: song.language,
          year: song.year,
          songIds: [song.id],
          kind: 'single',
          label: 'Mana Demo Records',
        });
      }
    }
    const albums = Array.from(albumMap.values());

    const hidden = new Set(overrides.hiddenPlaylistIds);
    const playlists = baseCatalog.playlists.filter((playlist) => !hidden.has(playlist.id));

    return {
      songs,
      albums,
      artists,
      playlists,
      stations: baseCatalog.stations,
      podcasts: baseCatalog.podcasts,
      languages: baseCatalog.languages,
    } as Catalog;
  }, [overrides]);

  const songById = useMemo(() => new Map(merged.songs.map((song) => [song.id, song])), [merged.songs]);
  const albumById = useMemo(() => new Map(merged.albums.map((album) => [album.id, album])), [merged.albums]);
  const artistById = useMemo(() => new Map(merged.artists.map((artist) => [artist.id, artist])), [merged.artists]);
  const playlistById = useMemo(() => new Map(merged.playlists.map((playlist) => [playlist.id, playlist])), [merged.playlists]);

  const movies = useMemo(() => {
    const map = new Map<string, MovieHit>();
    for (const song of merged.songs) {
      if (!song.movie) continue;
      const key = `${song.language}:${song.movie}`;
      const existing = map.get(key);
      if (existing) existing.songIds.push(song.id);
      else map.set(key, { title: song.movie, language: song.language, year: song.year, songIds: [song.id] });
    }
    return Array.from(map.values()).sort((a, b) => b.songIds.length - a.songIds.length);
  }, [merged.songs]);

  const songsOfAlbum = useCallback(
    (albumId: string) => {
      const album = albumById.get(albumId);
      if (!album) return [];
      return album.songIds.map((id) => songById.get(id)).filter((song): song is Song => Boolean(song));
    },
    [albumById, songById]
  );

  const songsOfArtist = useCallback(
    (artistId: string) =>
      merged.songs
        .filter((song) => song.composerId === artistId || song.singerIds.includes(artistId))
        .sort((a, b) => b.plays - a.plays),
    [merged.songs]
  );

  const albumsOfArtist = useCallback(
    (artistId: string) =>
      merged.albums
        .filter((album) => album.artistId === artistId)
        .sort((a, b) => b.year - a.year),
    [merged.albums]
  );

  const songsOfPlaylist = useCallback(
    (playlist: Playlist) =>
      playlist.songIds.map((id) => songById.get(id)).filter((song): song is Song => Boolean(song)),
    [songById]
  );

  const featuredPlaylists = useMemo(() => {
    const featured = overrides.featuredPlaylists
      .map((id) => playlistById.get(id))
      .filter((playlist): playlist is Playlist => Boolean(playlist));
    if (featured.length > 0) return featured;
    return merged.playlists.slice(0, 8);
  }, [merged.playlists, overrides.featuredPlaylists, playlistById]);

  const addSong = useCallback(
    (draft: SongDraft) => {
      const song: Song = {
        ...draft,
        id: `admin-song-${Date.now()}`,
        era: eraForYear(draft.year),
        plays: 0,
        lyricistId: draft.composerId,
      };
      setOverrides((previous) => ({ ...previous, addedSongs: [song, ...previous.addedSongs] }));
      return song;
    },
    [setOverrides]
  );

  const updateSong = useCallback(
    (id: string, patch: Partial<Song>) => {
      setOverrides((previous) => {
        const isAdded = previous.addedSongs.some((song) => song.id === id);
        if (isAdded) {
          return {
            ...previous,
            addedSongs: previous.addedSongs.map((song) =>
              song.id === id ? { ...song, ...patch, era: patch.year ? eraForYear(patch.year) : song.era } : song
            ),
          };
        }
        return {
          ...previous,
          songEdits: {
            ...previous.songEdits,
            [id]: { ...previous.songEdits[id], ...patch, ...(patch.year ? { era: eraForYear(patch.year) } : {}) },
          },
        };
      });
    },
    [setOverrides]
  );

  const deleteSong = useCallback(
    (id: string) => {
      setOverrides((previous) => ({
        ...previous,
        deletedSongIds: [...previous.deletedSongIds, id],
        addedSongs: previous.addedSongs.filter((song) => song.id !== id),
      }));
    },
    [setOverrides]
  );

  const addArtist = useCallback(
    (draft: ArtistDraft) => {
      const artist: Artist = {
        ...draft,
        id: `admin-artist-${Date.now()}`,
        era: '2020s',
        followers: 0,
        verified: false,
      };
      setOverrides((previous) => ({ ...previous, addedArtists: [artist, ...previous.addedArtists] }));
      return artist;
    },
    [setOverrides]
  );

  const updateArtist = useCallback(
    (id: string, patch: Partial<Artist>) => {
      setOverrides((previous) => ({
        ...previous,
        addedArtists: previous.addedArtists.map((artist) => (artist.id === id ? { ...artist, ...patch } : artist)),
        artistEdits: { ...previous.artistEdits, [id]: { ...previous.artistEdits[id], ...patch } },
      }));
    },
    [setOverrides]
  );

  const updateAlbum = useCallback(
    (id: string, patch: Partial<Album>) => {
      setOverrides((previous) => ({
        ...previous,
        albumEdits: { ...previous.albumEdits, [id]: { ...previous.albumEdits[id], ...patch } },
      }));
    },
    [setOverrides]
  );

  const toggleFeaturedPlaylist = useCallback(
    (id: string) => {
      setOverrides((previous) => ({
        ...previous,
        featuredPlaylists: previous.featuredPlaylists.includes(id)
          ? previous.featuredPlaylists.filter((item) => item !== id)
          : [...previous.featuredPlaylists, id],
      }));
    },
    [setOverrides]
  );

  const hidePlaylist = useCallback(
    (id: string) => {
      setOverrides((previous) => ({
        ...previous,
        hiddenPlaylistIds: [...previous.hiddenPlaylistIds, id],
        featuredPlaylists: previous.featuredPlaylists.filter((item) => item !== id),
      }));
    },
    [setOverrides]
  );

  const restorePlaylist = useCallback(
    (id: string) => {
      setOverrides((previous) => ({
        ...previous,
        hiddenPlaylistIds: previous.hiddenPlaylistIds.filter((item) => item !== id),
      }));
    },
    [setOverrides]
  );

  const updateLicensing = useCallback(
    (id: string, patch: Partial<LicensingRecord>) => {
      setOverrides((previous) => ({
        ...previous,
        licensing: previous.licensing.map((record) => (record.id === id ? { ...record, ...patch } : record)),
      }));
    },
    [setOverrides]
  );

  const updateReport = useCallback(
    (id: string, patch: Partial<ReportRecord>) => {
      setOverrides((previous) => ({
        ...previous,
        reports: previous.reports.map((record) => (record.id === id ? { ...record, ...patch } : record)),
      }));
    },
    [setOverrides]
  );

  const resetDemoData = useCallback(() => setOverrides(defaultOverrides), [setOverrides]);

  const value: CatalogContextValue = {
    catalog: merged,
    songs: merged.songs,
    albums: merged.albums,
    artists: merged.artists,
    languages: merged.languages,
    stations: merged.stations,
    podcasts: merged.podcasts,
    playlists: merged.playlists,
    featuredPlaylists,
    movies,
    songById,
    albumById,
    artistById,
    playlistById,
    artistName: (id) => artistById.get(id)?.name ?? 'Unknown artist',
    albumTitle: (id) => albumById.get(id)?.title ?? 'Unknown album',
    songsOfAlbum,
    songsOfArtist,
    albumsOfArtist,
    songsOfPlaylist,
    licensing: overrides.licensing,
    reports: overrides.reports,
    addSong,
    updateSong,
    deleteSong,
    addArtist,
    updateArtist,
    updateAlbum,
    toggleFeaturedPlaylist,
    hidePlaylist,
    restorePlaylist,
    updateLicensing,
    updateReport,
    resetDemoData,
  };

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog(): CatalogContextValue {
  const context = useContext(CatalogContext);
  if (!context) throw new Error('useCatalog must be used inside CatalogProvider');
  return context;
}
