/** Core domain types for the Mana Music demo catalogue. */

export type ArtistRole = 'singer' | 'composer' | 'lyricist';

export type AlbumKind = 'soundtrack' | 'album' | 'single' | 'devotional' | 'folk' | 'indie' | 'classical';

export type Era = 'Golden era' | '1970s' | '1980s' | '1990s' | '2000s' | '2010s' | '2020s';

export const ERAS: Era[] = ['Golden era', '1970s', '1980s', '1990s', '2000s', '2010s', '2020s'];

export interface LanguageInfo {
  code: string;
  name: string;
  native: string;
  /** Telugu is the flagship language of Mana Music. */
  primary?: boolean;
  /** Bhojpuri and Tulu are additional regional languages outside the 22 scheduled ones. */
  regional?: boolean;
  speakers: string;
}

export interface Artist {
  id: string;
  name: string;
  roles: ArtistRole[];
  language: string;
  bio: string;
  era: string;
  followers: number;
  verified: boolean;
}

export interface Album {
  id: string;
  title: string;
  artistId: string;
  language: string;
  year: number;
  movie?: string;
  songIds: string[];
  kind: AlbumKind;
  label: string;
}

export interface Song {
  id: string;
  title: string;
  nativeTitle?: string;
  albumId: string;
  language: string;
  year: number;
  movie?: string;
  singerIds: string[];
  composerId: string;
  lyricistId?: string;
  genre: string;
  mood: string;
  durationSec: number;
  audioId: string;
  plays: number;
  era: Era;
}

export interface Playlist {
  id: string;
  title: string;
  description: string;
  songIds: string[];
  curator: string;
  isPublic: boolean;
  language?: string;
  kind: 'editorial' | 'mood' | 'genre' | 'era' | 'chart' | 'mix' | 'language';
}

export interface RadioStation {
  id: string;
  title: string;
  description: string;
  language: string;
  songIds: string[];
}

export interface PodcastEpisode {
  id: string;
  title: string;
  description: string;
  durationSec: number;
  audioId: string;
  publishedAt: string;
}

export interface Podcast {
  id: string;
  title: string;
  host: string;
  description: string;
  language: string;
  episodes: PodcastEpisode[];
}

export interface Catalog {
  languages: LanguageInfo[];
  artists: Artist[];
  albums: Album[];
  songs: Song[];
  playlists: Playlist[];
  stations: RadioStation[];
  podcasts: Podcast[];
}

export interface LicensingRecord {
  id: string;
  title: string;
  owner: string;
  type: 'demo-original' | 'pending-licence' | 'licensed';
  territory: string;
  validUntil: string;
  status: 'active' | 'pending' | 'expired';
}

export interface ReportRecord {
  id: string;
  subject: string;
  type: string;
  detail: string;
  status: 'open' | 'reviewing' | 'resolved';
  createdAt: string;
}

export function eraForYear(year: number): Era {
  if (year < 1970) return 'Golden era';
  if (year < 1980) return '1970s';
  if (year < 1990) return '1980s';
  if (year < 2000) return '1990s';
  if (year < 2010) return '2000s';
  if (year < 2020) return '2010s';
  return '2020s';
}
