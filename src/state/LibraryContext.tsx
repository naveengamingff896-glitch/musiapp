import { createContext, useCallback, useContext } from 'react';
import type { ReactNode } from 'react';
import { audioFileFor } from '../data/catalog';
import type { AudioQuality } from '../data/languages';
import type { Song } from '../data/types';
import { usePersistentState } from '../lib/storage';

export interface UserPlaylist {
  id: string;
  title: string;
  description: string;
  songIds: string[];
  curator: string;
  isPublic: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface HistoryEntry {
  songId: string;
  at: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  at: number;
  read: boolean;
}

export interface Settings {
  theme: 'dark' | 'light';
  language: string;
  quality: AudioQuality;
  dataSaver: boolean;
  reduceMotion: boolean;
  largeText: boolean;
  highContrast: boolean;
  autoplay: boolean;
  privateSession: boolean;
  showExplicit: boolean;
  notificationsEnabled: boolean;
  downloadOverMobile: boolean;
}

export interface Profile {
  name: string;
  email: string;
  language: string;
  joinedAt: string;
}

interface LibraryState {
  likedSongs: string[];
  savedAlbums: string[];
  followedArtists: string[];
  followedPlaylists: string[];
  playlists: UserPlaylist[];
  downloads: string[];
  history: HistoryEntry[];
  recentSearches: string[];
  recentPlaylists: string[];
  notifications: NotificationItem[];
  settings: Settings;
  profile: Profile;
}

const initialState: LibraryState = {
  likedSongs: [],
  savedAlbums: [],
  followedArtists: [],
  followedPlaylists: [],
  playlists: [],
  downloads: [],
  history: [],
  recentSearches: [],
  recentPlaylists: [],
  notifications: [
    {
      id: 'n1',
      title: 'Welcome to Mana Music',
      body: 'Telugu-first listening with 24 Indian languages. Start with the Telugu Melody station.',
      at: Date.now() - 1000 * 60 * 60 * 3,
      read: false,
    },
    {
      id: 'n2',
      title: 'Demo catalogue notice',
      body: 'All artists, films and songs in this prototype are fictional and the audio is original royalty-free demo material.',
      at: Date.now() - 1000 * 60 * 60 * 26,
      read: false,
    },
    {
      id: 'n3',
      title: 'Offline listening is on',
      body: 'Open any song menu and choose Download to store the demo audio on this device.',
      at: Date.now() - 1000 * 60 * 60 * 50,
      read: true,
    },
  ],
  settings: {
    theme: 'dark',
    language: 'te',
    quality: 'high',
    dataSaver: false,
    reduceMotion: false,
    largeText: false,
    highContrast: false,
    autoplay: true,
    privateSession: false,
    showExplicit: true,
    notificationsEnabled: true,
    downloadOverMobile: false,
  },
  profile: {
    name: 'Mana Listener',
    email: 'listener@manamusic.demo',
    language: 'te',
    joinedAt: new Date().toISOString(),
  },
};

interface LibraryContextValue extends LibraryState {
  settings: Settings;
  isLiked: (songId: string) => boolean;
  toggleLike: (songId: string) => boolean;
  isAlbumSaved: (albumId: string) => boolean;
  toggleSaveAlbum: (albumId: string) => boolean;
  isArtistFollowed: (artistId: string) => boolean;
  toggleFollowArtist: (artistId: string) => boolean;
  isPlaylistFollowed: (playlistId: string) => boolean;
  toggleFollowPlaylist: (playlistId: string) => boolean;
  createPlaylist: (title: string, description?: string, songIds?: string[]) => string;
  renamePlaylist: (playlistId: string, title: string, description?: string) => void;
  deletePlaylist: (playlistId: string) => void;
  addSongToPlaylist: (playlistId: string, songId: string) => boolean;
  removeSongFromPlaylist: (playlistId: string, songId: string) => void;
  reorderPlaylist: (playlistId: string, from: number, to: number) => void;
  setPlaylistVisibility: (playlistId: string, isPublic: boolean) => void;
  downloadSong: (song: Song) => Promise<boolean>;
  downloadSongs: (songs: Song[]) => Promise<number>;
  removeDownload: (songId: string) => Promise<void>;
  clearDownloads: () => void;
  isDownloaded: (songId: string) => boolean;
  addHistory: (songId: string) => void;
  clearHistory: () => void;
  addRecentSearch: (term: string) => void;
  clearRecentSearches: () => void;
  trackPlaylistOpen: (playlistId: string) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  updateProfile: (patch: Partial<Profile>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;
  resetLibrary: () => void;
}

const LibraryContext = createContext<LibraryContextValue | null>(null);

const AUDIO_CACHE = 'mana-audio-v1';

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [state, setState] = usePersistentState<LibraryState>('mana.library.v1', initialState);

  const toggleLike = useCallback(
    (songId: string) => {
      let liked = false;
      setState((previous) => {
        liked = !previous.likedSongs.includes(songId);
        return {
          ...previous,
          likedSongs: liked
            ? [songId, ...previous.likedSongs]
            : previous.likedSongs.filter((id) => id !== songId),
        };
      });
      return liked;
    },
    [setState]
  );

  const toggleSaveAlbum = useCallback(
    (albumId: string) => {
      let saved = false;
      setState((previous) => {
        saved = !previous.savedAlbums.includes(albumId);
        return {
          ...previous,
          savedAlbums: saved
            ? [albumId, ...previous.savedAlbums]
            : previous.savedAlbums.filter((id) => id !== albumId),
        };
      });
      return saved;
    },
    [setState]
  );

  const toggleFollowArtist = useCallback(
    (artistId: string) => {
      let followed = false;
      setState((previous) => {
        followed = !previous.followedArtists.includes(artistId);
        return {
          ...previous,
          followedArtists: followed
            ? [artistId, ...previous.followedArtists]
            : previous.followedArtists.filter((id) => id !== artistId),
        };
      });
      return followed;
    },
    [setState]
  );

  const toggleFollowPlaylist = useCallback(
    (playlistId: string) => {
      let followed = false;
      setState((previous) => {
        followed = !previous.followedPlaylists.includes(playlistId);
        return {
          ...previous,
          followedPlaylists: followed
            ? [playlistId, ...previous.followedPlaylists]
            : previous.followedPlaylists.filter((id) => id !== playlistId),
        };
      });
      return followed;
    },
    [setState]
  );

  const createPlaylist = useCallback(
    (title: string, description = '', songIds: string[] = []) => {
      const id = `pl-user-${Date.now()}`;
      setState((previous) => ({
        ...previous,
        playlists: [
          {
            id,
            title: title.trim() || 'My playlist',
            description,
            songIds,
            curator: previous.profile.name,
            isPublic: false,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
          ...previous.playlists,
        ],
      }));
      return id;
    },
    [setState]
  );

  const renamePlaylist = useCallback(
    (playlistId: string, title: string, description?: string) => {
      setState((previous) => ({
        ...previous,
        playlists: previous.playlists.map((playlist) =>
          playlist.id === playlistId
            ? {
                ...playlist,
                title: title.trim() || playlist.title,
                description: description ?? playlist.description,
                updatedAt: Date.now(),
              }
            : playlist
        ),
      }));
    },
    [setState]
  );

  const deletePlaylist = useCallback(
    (playlistId: string) => {
      setState((previous) => ({
        ...previous,
        playlists: previous.playlists.filter((playlist) => playlist.id !== playlistId),
        recentPlaylists: previous.recentPlaylists.filter((id) => id !== playlistId),
      }));
    },
    [setState]
  );

  const addSongToPlaylist = useCallback(
    (playlistId: string, songId: string) => {
      let added = false;
      setState((previous) => ({
        ...previous,
        playlists: previous.playlists.map((playlist) => {
          if (playlist.id !== playlistId) return playlist;
          if (playlist.songIds.includes(songId)) return playlist;
          added = true;
          return { ...playlist, songIds: [...playlist.songIds, songId], updatedAt: Date.now() };
        }),
      }));
      return added;
    },
    [setState]
  );

  const removeSongFromPlaylist = useCallback(
    (playlistId: string, songId: string) => {
      setState((previous) => ({
        ...previous,
        playlists: previous.playlists.map((playlist) =>
          playlist.id === playlistId
            ? {
                ...playlist,
                songIds: playlist.songIds.filter((id) => id !== songId),
                updatedAt: Date.now(),
              }
            : playlist
        ),
      }));
    },
    [setState]
  );

  const reorderPlaylist = useCallback(
    (playlistId: string, from: number, to: number) => {
      setState((previous) => ({
        ...previous,
        playlists: previous.playlists.map((playlist) => {
          if (playlist.id !== playlistId) return playlist;
          const songIds = playlist.songIds.slice();
          if (from < 0 || from >= songIds.length || to < 0 || to >= songIds.length) return playlist;
          const [moved] = songIds.splice(from, 1);
          songIds.splice(to, 0, moved);
          return { ...playlist, songIds, updatedAt: Date.now() };
        }),
      }));
    },
    [setState]
  );

  const setPlaylistVisibility = useCallback(
    (playlistId: string, isPublic: boolean) => {
      setState((previous) => ({
        ...previous,
        playlists: previous.playlists.map((playlist) =>
          playlist.id === playlistId ? { ...playlist, isPublic, updatedAt: Date.now() } : playlist
        ),
      }));
    },
    [setState]
  );

  const downloadSong = useCallback(
    async (song: Song) => {
      const url = audioFileFor(song.audioId);
      try {
        if (typeof caches !== 'undefined') {
          const cache = await caches.open(AUDIO_CACHE);
          if (!(await cache.match(url))) await cache.add(url);
        }
        setState((previous) =>
          previous.downloads.includes(song.id)
            ? previous
            : { ...previous, downloads: [song.id, ...previous.downloads] }
        );
        return true;
      } catch {
        return false;
      }
    },
    [setState]
  );

  const downloadSongs = useCallback(
    async (songs: Song[]) => {
      let saved = 0;
      for (const song of songs) {
        if (await downloadSong(song)) saved += 1;
      }
      return saved;
    },
    [downloadSong]
  );

  const removeDownload = useCallback(
    async (songId: string) => {
      setState((previous) => ({ ...previous, downloads: previous.downloads.filter((id) => id !== songId) }));
    },
    [setState]
  );

  const clearDownloads = useCallback(() => {
    setState((previous) => ({ ...previous, downloads: [] }));
    if (typeof caches !== 'undefined') {
      void caches.delete(AUDIO_CACHE);
    }
  }, [setState]);

  const addHistory = useCallback(
    (songId: string) => {
      setState((previous) => {
        const filtered = previous.history.filter((entry) => entry.songId !== songId);
        return {
          ...previous,
          history: [{ songId, at: Date.now() }, ...filtered].slice(0, 120),
        };
      });
    },
    [setState]
  );

  const clearHistory = useCallback(() => {
    setState((previous) => ({ ...previous, history: [] }));
  }, [setState]);

  const addRecentSearch = useCallback(
    (term: string) => {
      const trimmed = term.trim();
      if (trimmed.length < 2) return;
      setState((previous) => ({
        ...previous,
        recentSearches: [trimmed, ...previous.recentSearches.filter((item) => item !== trimmed)].slice(0, 10),
      }));
    },
    [setState]
  );

  const clearRecentSearches = useCallback(() => {
    setState((previous) => ({ ...previous, recentSearches: [] }));
  }, [setState]);

  const trackPlaylistOpen = useCallback(
    (playlistId: string) => {
      setState((previous) => ({
        ...previous,
        recentPlaylists: [playlistId, ...previous.recentPlaylists.filter((id) => id !== playlistId)].slice(0, 8),
      }));
    },
    [setState]
  );

  const updateSettings = useCallback(
    (patch: Partial<Settings>) => {
      setState((previous) => ({ ...previous, settings: { ...previous.settings, ...patch } }));
    },
    [setState]
  );

  const updateProfile = useCallback(
    (patch: Partial<Profile>) => {
      setState((previous) => ({ ...previous, profile: { ...previous.profile, ...patch } }));
    },
    [setState]
  );

  const markNotificationRead = useCallback(
    (id: string) => {
      setState((previous) => ({
        ...previous,
        notifications: previous.notifications.map((item) => (item.id === id ? { ...item, read: true } : item)),
      }));
    },
    [setState]
  );

  const markAllNotificationsRead = useCallback(() => {
    setState((previous) => ({
      ...previous,
      notifications: previous.notifications.map((item) => ({ ...item, read: true })),
    }));
  }, [setState]);

  const clearNotifications = useCallback(() => {
    setState((previous) => ({ ...previous, notifications: [] }));
  }, [setState]);

  const resetLibrary = useCallback(() => {
    setState(initialState);
  }, [setState]);

  const value: LibraryContextValue = {
    ...state,
    settings: { ...initialState.settings, ...state.settings },
    isLiked: (songId) => state.likedSongs.includes(songId),
    toggleLike,
    isAlbumSaved: (albumId) => state.savedAlbums.includes(albumId),
    toggleSaveAlbum,
    isArtistFollowed: (artistId) => state.followedArtists.includes(artistId),
    toggleFollowArtist,
    isPlaylistFollowed: (playlistId) => state.followedPlaylists.includes(playlistId),
    toggleFollowPlaylist,
    createPlaylist,
    renamePlaylist,
    deletePlaylist,
    addSongToPlaylist,
    removeSongFromPlaylist,
    reorderPlaylist,
    setPlaylistVisibility,
    downloadSong,
    downloadSongs,
    removeDownload,
    clearDownloads,
    isDownloaded: (songId) => state.downloads.includes(songId),
    addHistory,
    clearHistory,
    addRecentSearch,
    clearRecentSearches,
    trackPlaylistOpen,
    updateSettings,
    updateProfile,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotifications,
    resetLibrary,
  };

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export function useLibrary(): LibraryContextValue {
  const context = useContext(LibraryContext);
  if (!context) throw new Error('useLibrary must be used inside LibraryProvider');
  return context;
}
