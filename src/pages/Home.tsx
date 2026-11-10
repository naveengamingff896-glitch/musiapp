import { Link } from '../lib/router';
import { greeting } from '../lib/format';
import { newestAlbums, playlistsByKind, popularArtists, topByPlays } from '../lib/collections';
import { useCatalog } from '../state/CatalogContext';
import { useLibrary } from '../state/LibraryContext';
import { usePlayer } from '../state/PlayerContext';
import { Artwork } from '../components/Artwork';
import { MediaCard, Notice, ShelfSection } from '../components/MediaCard';
import { SongRow } from '../components/SongRow';
import { PlayIcon, SparkIcon } from '../components/Icons';
import type { Song } from '../data/types';

export function HomePage() {
  const { songs, albums, artists, playlists, songById, movies } = useCatalog();
  const { history, recentPlaylists, profile, settings } = useLibrary();
  const { playSongs } = usePlayer();

  const recentSongs = history
    .map((entry) => songById.get(entry.songId))
    .filter((song): song is Song => Boolean(song))
    .slice(0, 8);

  const teluguTop = topByPlays(songs, 12, 'te');
  const teluguNew = newestAlbums(albums, 12, 'te');
  const hindiTrending = topByPlays(songs, 10, 'hi');
  const mixes = playlistsByKind(playlists, 'mix');
  const charts = playlistsByKind(playlists, 'chart');
  const moods = playlistsByKind(playlists, 'mood');
  const genres = playlistsByKind(playlists, 'genre');
  const eras = playlistsByKind(playlists, 'era');
  const top50 = playlists.find((playlist) => playlist.title.includes('Top 50'));
  const recommended = albums.slice().sort((a, b) => b.songIds.length - a.songIds.length).slice(0, 12);
  const topArtists = popularArtists(artists, 12);
  const teluguArtists = popularArtists(artists, 10, 'te');
  const continueSong = recentSongs[0];
  const teluguClassics = songs.filter((song) => song.language === 'te' && (song.era === 'Golden era' || song.era === '1970s' || song.era === '1980s')).slice(0, 10);
  const recentlyOpened = recentPlaylists
    .map((id) => playlists.find((playlist) => playlist.id === id))
    .filter((playlist): playlist is NonNullable<typeof playlist> => Boolean(playlist))
    .slice(0, 6);

  const playList = (list: Song[], label: string) => {
    if (!list.length) return;
    playSongs(list, 0, label);
  };

  return (
    <div>
      <section className="hero">
        <div className="hero__glow" aria-hidden="true" />
        <div className="hero__inner">
          <span className="hero__eyebrow">
            <SparkIcon size={14} /> {greeting()}, {profile.name.split(' ')[0]}
          </span>
          <h1 className="hero__title">Telugu music, from golden classics to today</h1>
          <div className="hero__native">మన సంగీతం · మన భాష · మన మనసు</div>
          <p className="hero__text">
            Mana Music is a Telugu-first streaming prototype with fictional demo songs, original royalty-free audio and
            every major Indian language ready to explore.
          </p>
          <div className="hero__actions">
            <button type="button" className="btn btn--primary" onClick={() => playList(teluguTop, 'Popular Telugu')}>
              <PlayIcon size={17} /> Play popular Telugu
            </button>
            <Link className="btn btn--outline" to="/telugu">
              Open Telugu hub
            </Link>
            <Link className="btn btn--ghost" to={`/language/${settings.language}`}>
              {settings.language === 'te' ? 'Your language: Telugu' : 'Change language'}
            </Link>
          </div>
        </div>
      </section>

      {continueSong ? (
        <section className="shelf">
          <div className="section-head">
            <div>
              <div className="section-head__title">Continue listening</div>
              <span className="section-head__sub">Pick up where you stopped</span>
            </div>
          </div>
          <div className="mini-card-row">
            <button type="button" className="quick-tile" onClick={() => playList(recentSongs, 'Recently played')}>
              <span className="quick-tile__art">
                <Artwork seed={continueSong.albumId} title={continueSong.title} tiny />
              </span>
              <span className="quick-tile__label">
                Resume · {continueSong.title}
                <span className="page-sub" style={{ display: 'block', fontSize: 11 }}>
                  {continueSong.movie ?? 'Demo track'} · {continueSong.year}
                </span>
              </span>
              <PlayIcon size={18} />
            </button>
            {recentSongs.slice(1, 5).map((song) => (
              <button
                key={song.id}
                type="button"
                className="quick-tile"
                onClick={() => playList([song], 'Recently played')}
              >
                <span className="quick-tile__art">
                  <Artwork seed={song.albumId} title={song.title} tiny />
                </span>
                <span className="quick-tile__label">{song.title}</span>
                <PlayIcon size={18} />
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {recentlyOpened.length ? (
        <ShelfSection title="Recently played playlists" sub="Jump back into a set" linkTo="/playlists">
          {recentlyOpened.map((playlist) => (
            <MediaCard
              key={playlist.id}
              to={`/playlist/${playlist.id}`}
              seed={playlist.id}
              title={playlist.title}
              subtitle={`${playlist.songIds.length} tracks`}
              onPlay={() => playList(playlist.songIds.map((id) => songById.get(id)).filter((s): s is Song => Boolean(s)), playlist.title)}
            />
          ))}
        </ShelfSection>
      ) : null}

      <ShelfSection title="Made for you" sub="Daily mixes and hand-picked sets" linkTo="/playlists">
        {mixes.slice(0, 8).map((playlist) => (
          <MediaCard
            key={playlist.id}
            to={`/playlist/${playlist.id}`}
            seed={playlist.id}
            title={playlist.title}
            subtitle={`${playlist.songIds.length} tracks`}
            onPlay={() => playList(playlist.songIds.map((id) => songById.get(id)).filter((s): s is Song => Boolean(s)), playlist.title)}
          />
        ))}
      </ShelfSection>

      <ShelfSection title="Popular Telugu songs" sub="Most played in the demo catalogue" linkTo="/telugu">
        {teluguTop.slice(0, 10).map((song) => (
          <MediaCard
            key={song.id}
            to={`/album/${song.albumId}`}
            seed={song.albumId}
            title={song.title}
            subtitle={song.movie ?? `${song.year}`}
            onPlay={() => playList(teluguTop, 'Popular Telugu')}
          />
        ))}
      </ShelfSection>

      <ShelfSection title="Telugu new releases" sub="Latest albums in the demo catalogue" linkTo="/albums">
        {teluguNew.map((album) => (
          <MediaCard
            key={album.id}
            to={`/album/${album.id}`}
            seed={album.id}
            title={album.title}
            subtitle={`${album.year} · ${album.kind}`}
          />
        ))}
      </ShelfSection>

      <section className="shelf">
        <div className="section-head">
          <div>
            <div className="section-head__title">Old Telugu classics</div>
            <span className="section-head__sub">Golden era to 1980s</span>
          </div>
          <Link className="section-head__link" to="/telugu">
            Telugu hub
          </Link>
        </div>
        <div className="song-list">
          {teluguClassics.slice(0, 6).map((song, index) => (
            <SongRow
              key={song.id}
              song={song}
              index={index}
              onPlay={() => playList(teluguClassics, 'Old Telugu classics')}
              subtitle={`${song.era} · ${song.movie ?? 'Album track'}`}
            />
          ))}
        </div>
      </section>

      <ShelfSection title="Trending Hindi songs" sub="Demo Hindi catalogue" linkTo="/language/hi">
        {hindiTrending.map((song) => (
          <MediaCard
            key={song.id}
            to={`/album/${song.albumId}`}
            seed={song.albumId}
            title={song.title}
            subtitle={song.movie ?? `${song.year}`}
            onPlay={() => playList(hindiTrending, 'Trending Hindi')}
          />
        ))}
      </ShelfSection>

      <ShelfSection title="Indian music charts" sub="Editorial charts across languages" linkTo="/charts">
        {charts.map((playlist) => (
          <MediaCard
            key={playlist.id}
            to={`/playlist/${playlist.id}`}
            seed={playlist.id}
            title={playlist.title}
            subtitle={`${playlist.songIds.length} tracks · chart`}
            onPlay={() => playList(playlist.songIds.map((id) => songById.get(id)).filter((s): s is Song => Boolean(s)), playlist.title)}
          />
        ))}
      </ShelfSection>

      {top50 ? (
        <ShelfSection title="Top 50" sub="The biggest demo tracks right now">
          <MediaCard
            to={`/playlist/${top50.id}`}
            seed={top50.id}
            title={top50.title}
            subtitle={`${top50.songIds.length} tracks`}
            onPlay={() => playList(top50.songIds.map((id) => songById.get(id)).filter((s): s is Song => Boolean(s)), top50.title)}
          />
        </ShelfSection>
      ) : null}

      <ShelfSection title="Recommended albums" sub="Full soundtracks and records" linkTo="/albums">
        {recommended.map((album) => (
          <MediaCard
            key={album.id}
            to={`/album/${album.id}`}
            seed={album.id}
            title={album.title}
            subtitle={`${album.year} · ${album.songIds.length} tracks`}
          />
        ))}
      </ShelfSection>

      <ShelfSection title="Popular artists" sub="Singers, composers and lyricists" linkTo="/artists">
        {topArtists.map((artist) => (
          <Link key={artist.id} to={`/artist/${artist.id}`} className="artist-tile">
            <Artwork seed={artist.id} title={artist.name} round />
            <div className="artist-tile__name">{artist.name}</div>
            <div className="artist-tile__role">{artist.roles.join(' · ')}</div>
          </Link>
        ))}
      </ShelfSection>

      <ShelfSection title="Telugu voices" sub="Featured Telugu artists" linkTo="/artists?language=te">
        {teluguArtists.map((artist) => (
          <Link key={artist.id} to={`/artist/${artist.id}`} className="artist-tile">
            <Artwork seed={artist.id} title={artist.name} round />
            <div className="artist-tile__name">{artist.name}</div>
            <div className="artist-tile__role">{artist.roles.join(' · ')}</div>
          </Link>
        ))}
      </ShelfSection>

      <ShelfSection title="Mood-based playlists" sub="Match the moment" linkTo="/explore">
        {moods.map((playlist) => (
          <MediaCard
            key={playlist.id}
            to={`/playlist/${playlist.id}`}
            seed={playlist.id}
            title={playlist.title}
            subtitle={playlist.description}
            onPlay={() => playList(playlist.songIds.map((id) => songById.get(id)).filter((s): s is Song => Boolean(s)), playlist.title)}
          />
        ))}
      </ShelfSection>

      <ShelfSection title="Genre-based playlists" sub="Every style in the catalogue" linkTo="/explore">
        {genres.map((playlist) => (
          <MediaCard
            key={playlist.id}
            to={`/playlist/${playlist.id}`}
            seed={playlist.id}
            title={playlist.title}
            subtitle={playlist.description}
            onPlay={() => playList(playlist.songIds.map((id) => songById.get(id)).filter((s): s is Song => Boolean(s)), playlist.title)}
          />
        ))}
      </ShelfSection>

      <ShelfSection title="Era playlists" sub="Golden era to the 2020s" linkTo="/telugu">
        {eras.map((playlist) => (
          <MediaCard
            key={playlist.id}
            to={`/playlist/${playlist.id}`}
            seed={playlist.id}
            title={playlist.title}
            subtitle={`${playlist.songIds.length} tracks`}
            onPlay={() => playList(playlist.songIds.map((id) => songById.get(id)).filter((s): s is Song => Boolean(s)), playlist.title)}
          />
        ))}
      </ShelfSection>

      {movies.length ? (
        <ShelfSection title="Browse Telugu movies" sub="Soundtracks by film" linkTo="/telugu">
          {movies.slice(0, 12).map((movie) => (
            <Link key={`${movie.language}-${movie.title}`} to={`/telugu?movie=${encodeURIComponent(movie.title)}`} className="media-card">
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
        </ShelfSection>
      ) : null}

      <Notice>
        <strong>Demo catalogue:</strong> every song, movie, artist and lyric in Mana Music is fictional, and playback uses
        original royalty-free instrumentals. No copyrighted music is streamed or downloaded. A licensed catalogue can be
        connected later through label or distribution agreements.
      </Notice>
    </div>
  );
}
