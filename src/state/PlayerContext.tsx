import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { audioFileFor } from '../data/catalog';
import type { Song } from '../data/types';
import { usePersistentState } from '../lib/storage';
import { useCatalog } from './CatalogContext';
import { useLibrary } from './LibraryContext';

export type RepeatMode = 'off' | 'all' | 'one';

interface PlayerPrefs {
  volume: number;
  muted: boolean;
  shuffle: boolean;
  repeat: RepeatMode;
}

interface PlayerContextValue {
  queue: Song[];
  index: number;
  current: Song | undefined;
  isPlaying: boolean;
  position: number;
  duration: number;
  volume: number;
  muted: boolean;
  shuffle: boolean;
  repeat: RepeatMode;
  contextLabel: string;
  playSongs: (songs: Song[], startIndex?: number, contextLabel?: string) => void;
  playSong: (song: Song, contextLabel?: string) => void;
  toggle: () => void;
  next: (auto?: boolean) => void;
  previous: () => void;
  seek: (seconds: number) => void;
  setVolume: (value: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  enqueue: (song: Song) => void;
  playNext: (song: Song) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  jumpTo: (index: number) => void;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const { artistName, albumTitle } = useCatalog();
  const { addHistory } = useLibrary();
  const [queue, setQueue] = useState<Song[]>([]);
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [contextLabel, setContextLabel] = useState('');
  const [prefs, setPrefs] = usePersistentState<PlayerPrefs>('mana.player.v1', {
    volume: 0.85,
    muted: false,
    shuffle: false,
    repeat: 'off',
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const queueRef = useRef(queue);
  const indexRef = useRef(index);
  const prefsRef = useRef(prefs);
  queueRef.current = queue;
  indexRef.current = index;
  prefsRef.current = prefs;

  const current = queue[index];

  const getAudio = useCallback(() => {
    if (!audioRef.current) {
      const audio = new Audio();
      audio.preload = 'metadata';
      audio.volume = 0.85;
      audioRef.current = audio;
    }
    return audioRef.current;
  }, []);

  /* Wire native audio events once. */
  useEffect(() => {
    const audio = getAudio();
    const onTime = () => setPosition(audio.currentTime);
    const onDuration = () => setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      const list = queueRef.current;
      const p = prefsRef.current;
      if (!list.length) return;
      if (p.repeat === 'one') {
        audio.currentTime = 0;
        void audio.play().catch(() => setIsPlaying(false));
        return;
      }
      let nextIndex = indexRef.current + 1;
      if (p.shuffle && list.length > 1) {
        do {
          nextIndex = Math.floor(Math.random() * list.length);
        } while (nextIndex === indexRef.current);
      }
      if (nextIndex >= list.length) {
        if (p.repeat === 'all') nextIndex = 0;
        else {
          setIsPlaying(false);
          setPosition(0);
          return;
        }
      }
      setIndex(nextIndex);
      setIsPlaying(true);
    };

    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('loadedmetadata', onDuration);
    audio.addEventListener('durationchange', onDuration);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);
    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('loadedmetadata', onDuration);
      audio.removeEventListener('durationchange', onDuration);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
    };
  }, [getAudio]);

  /* Load the current track. */
  useEffect(() => {
    const audio = getAudio();
    if (!current) {
      audio.pause();
      audio.removeAttribute('src');
      setDuration(0);
      setPosition(0);
      return;
    }
    const src = audioFileFor(current.audioId);
    const absolute = new URL(src, window.location.href).href;
    if (audio.src !== absolute) {
      audio.src = src;
      audio.load();
    }
    setPosition(0);
    setDuration(current.durationSec);
    addHistory(current.id);
  }, [current, addHistory, getAudio]);

  /* Play / pause intent. */
  useEffect(() => {
    const audio = getAudio();
    if (!current) return;
    if (isPlaying) {
      const promise = audio.play();
      if (promise) promise.catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }
  }, [isPlaying, current, getAudio]);

  /* Volume. */
  useEffect(() => {
    const audio = getAudio();
    audio.volume = prefs.muted ? 0 : Math.min(1, Math.max(0, prefs.volume));
    audio.muted = prefs.muted;
  }, [prefs.volume, prefs.muted, getAudio]);

  /* Lock-screen / notification controls where supported. */
  useEffect(() => {
    if (!current || !('mediaSession' in navigator)) return;
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: current.nativeTitle ?? current.title,
        artist: artistName(current.singerIds[0] ?? ''),
        album: albumTitle(current.albumId),
        artwork: [{ src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' }],
      });
      navigator.mediaSession.setActionHandler('play', () => setIsPlaying(true));
      navigator.mediaSession.setActionHandler('pause', () => setIsPlaying(false));
      navigator.mediaSession.setActionHandler('previoustrack', () => {
        const audio = getAudio();
        if (audio.currentTime > 3) audio.currentTime = 0;
        else setIndex((value) => (value > 0 ? value - 1 : Math.max(0, queueRef.current.length - 1)));
      });
      navigator.mediaSession.setActionHandler('nexttrack', () => {
        setIndex((value) => Math.min(queueRef.current.length - 1, value + 1));
      });
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (typeof details.seekTime === 'number') getAudio().currentTime = details.seekTime;
      });
    } catch {
      /* unsupported action handlers are fine */
    }
  }, [current, artistName, albumTitle, getAudio]);

  const playSongs = useCallback((songs: Song[], startIndex = 0, label = '') => {
    if (!songs.length) return;
    setQueue(songs);
    setIndex(Math.min(Math.max(0, startIndex), songs.length - 1));
    setContextLabel(label);
    setIsPlaying(true);
  }, []);

  const playSong = useCallback(
    (song: Song, label = '') => {
      playSongs([song], 0, label);
    },
    [playSongs]
  );

  const toggle = useCallback(() => {
    if (!queueRef.current.length) return;
    setIsPlaying((value) => !value);
  }, []);

  const next = useCallback((auto = false) => {
    const list = queueRef.current;
    if (!list.length) return;
    const p = prefsRef.current;
    if (auto && p.repeat === 'one') {
      const audio = getAudio();
      audio.currentTime = 0;
      void audio.play().catch(() => setIsPlaying(false));
      return;
    }
    let nextIndex = indexRef.current + 1;
    if (p.shuffle && list.length > 1) {
      do {
        nextIndex = Math.floor(Math.random() * list.length);
      } while (nextIndex === indexRef.current);
    }
    if (nextIndex >= list.length) {
      if (p.repeat === 'all' || !auto) nextIndex = 0;
      else {
        setIsPlaying(false);
        return;
      }
    }
    setIndex(nextIndex);
    setIsPlaying(true);
  }, [getAudio]);

  const previous = useCallback(() => {
    const audio = getAudio();
    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    setIndex((value) => (value > 0 ? value - 1 : Math.max(0, queueRef.current.length - 1)));
    setIsPlaying(true);
  }, [getAudio]);

  const seek = useCallback(
    (seconds: number) => {
      const audio = getAudio();
      audio.currentTime = Math.max(0, seconds);
      setPosition(Math.max(0, seconds));
    },
    [getAudio]
  );

  const setVolume = useCallback(
    (value: number) => {
      const clamped = Math.min(1, Math.max(0, value));
      setPrefs((previous) => ({ ...previous, volume: clamped, muted: clamped === 0 ? previous.muted : false }));
    },
    [setPrefs]
  );

  const toggleMute = useCallback(() => {
    setPrefs((previous) => ({ ...previous, muted: !previous.muted }));
  }, [setPrefs]);

  const toggleShuffle = useCallback(() => {
    setPrefs((previous) => ({ ...previous, shuffle: !previous.shuffle }));
  }, [setPrefs]);

  const cycleRepeat = useCallback(() => {
    setPrefs((previous) => ({
      ...previous,
      repeat: previous.repeat === 'off' ? 'all' : previous.repeat === 'all' ? 'one' : 'off',
    }));
  }, [setPrefs]);

  const enqueue = useCallback((song: Song) => {
    setQueue((previous) => (previous.some((item) => item.id === song.id) ? previous : [...previous, song]));
  }, []);

  const playNext = useCallback((song: Song) => {
    setQueue((previous) => {
      if (previous.some((item) => item.id === song.id)) return previous;
      const copy = previous.slice();
      copy.splice(indexRef.current + 1, 0, song);
      return copy;
    });
  }, []);

  const removeFromQueue = useCallback((removeIndex: number) => {
    setQueue((previous) => {
      if (removeIndex < 0 || removeIndex >= previous.length) return previous;
      const copy = previous.filter((_, position) => position !== removeIndex);
      setIndex((currentIndex) => {
        if (removeIndex < currentIndex) return Math.max(0, currentIndex - 1);
        return Math.min(currentIndex, Math.max(0, copy.length - 1));
      });
      return copy;
    });
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
    setIsPlaying(false);
  }, []);

  const jumpTo = useCallback((target: number) => {
    if (target < 0 || target >= queueRef.current.length) return;
    setIndex(target);
    setIsPlaying(true);
  }, []);

  const value = useMemo<PlayerContextValue>(
    () => ({
      queue,
      index,
      current,
      isPlaying,
      position,
      duration,
      volume: prefs.volume,
      muted: prefs.muted,
      shuffle: prefs.shuffle,
      repeat: prefs.repeat,
      contextLabel,
      playSongs,
      playSong,
      toggle,
      next,
      previous,
      seek,
      setVolume,
      toggleMute,
      toggleShuffle,
      cycleRepeat,
      enqueue,
      playNext,
      removeFromQueue,
      clearQueue,
      jumpTo,
    }),
    [
      queue,
      index,
      current,
      isPlaying,
      position,
      duration,
      prefs,
      contextLabel,
      playSongs,
      playSong,
      toggle,
      next,
      previous,
      seek,
      setVolume,
      toggleMute,
      toggleShuffle,
      cycleRepeat,
      enqueue,
      playNext,
      removeFromQueue,
      clearQueue,
      jumpTo,
    ]
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer(): PlayerContextValue {
  const context = useContext(PlayerContext);
  if (!context) throw new Error('usePlayer must be used inside PlayerProvider');
  return context;
}
