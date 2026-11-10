import type { Album, Artist, Playlist, Song } from '../data/types';

export function topByPlays(songs: Song[], limit: number, language?: string): Song[] {
  return songs
    .filter((song) => !language || song.language === language)
    .slice()
    .sort((a, b) => b.plays - a.plays)
    .slice(0, limit);
}

export function newestAlbums(albums: Album[], limit: number, language?: string): Album[] {
  return albums
    .filter((album) => !language || album.language === language)
    .slice()
    .sort((a, b) => b.year - a.year || b.songIds.length - a.songIds.length)
    .slice(0, limit);
}

export function playlistsByKind(playlists: Playlist[], kind: Playlist['kind'], limit?: number): Playlist[] {
  const list = playlists.filter((playlist) => playlist.kind === kind);
  return typeof limit === 'number' ? list.slice(0, limit) : list;
}

export function popularArtists(artists: Artist[], limit: number, language?: string): Artist[] {
  return artists
    .filter((artist) => !language || artist.language === language)
    .slice()
    .sort((a, b) => b.followers - a.followers)
    .slice(0, limit);
}

export function pickSongs(songs: Song[], limit: number, predicate: (song: Song) => boolean): Song[] {
  return songs.filter(predicate).slice(0, limit);
}

export function albumsByYear(albums: Album[], from: number, to: number, language?: string): Album[] {
  return albums.filter((album) => album.year >= from && album.year <= to && (!language || album.language === language));
}

export function uniqueValues<T>(items: T[], key: (item: T) => string): string[] {
  return Array.from(new Set(items.map(key))).sort();
}
