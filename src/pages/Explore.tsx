import { Link } from '../lib/router';
import { GENRES, MOODS } from '../data/languages';
import { ERAS } from '../data/types';
import { newestAlbums, playlistsByKind, popularArtists, topByPlays } from '../lib/collections';
import { useCatalog } from '../state/CatalogContext';
import { Artwork } from '../components/Artwork';
import { MediaCard, Notice, SectionHead, ShelfSection } from '../components/MediaCard';
import { GlobeIcon, MicIcon, RadioIcon, SparkIcon } from '../components/Icons';

export function ExplorePage() {
  const { languages, songs, albums, artists, playlists, songById } = useCatalog();
  const charts = playlistsByKind(playlists, 'chart');
  const moods = playlistsByKind(playlists, 'mood');
  const languagePlaylists = playlistsByKind(playlists, 'language');
  const topArtists = popularArtists(artists, 10);
  const newAlbums = newestAlbums(albums, 10);

  const countFor = (code: string) => songs.filter((song) => song.language === code).length;

  return (
    <div>
      <div className="page-head">
        <div>
          <h1 className="page-title">Explore / Browse</h1>
          <p className="page-sub">
            All 22 scheduled Indian languages, plus Bhojpuri and Tulu. Telugu is the home language of Mana Music.
          </p>
        </div>
      </div>

      <section className="shelf">
        <SectionHead title="Languages" sub="Tap a language to browse its demo catalogue" />
        <div className="language-grid">
          {languages.map((language) => (
            <Link key={language.code} to={`/language/${language.code}`} className="language-tile">
              <span className="language-tile__native">{language.native}</span>
              <span className="language-tile__name">{language.name}</span>
              <span className="language-tile__meta">
                {countFor(language.code)} songs
                {language.primary ? ' · primary' : ''}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="shelf">
        <SectionHead title="Genres" sub="From film soundtracks to independent music" />
        <div className="chip-row">
          {GENRES.map((genre) => (
            <Link key={genre} to={`/genre/${encodeURIComponent(genre)}`} className="chip">
              {genre}
            </Link>
          ))}
        </div>
      </section>

      <section className="shelf">
        <SectionHead title="Moods" sub="Playlists for the moment" />
        <div className="chip-row">
          {MOODS.map((mood) => (
            <Link key={mood} to={`/mood/${encodeURIComponent(mood)}`} className="chip chip--native">
              {mood}
            </Link>
          ))}
        </div>
      </section>

      <section className="shelf">
        <SectionHead title="Telugu by era" sub="Golden era to 2020s" linkTo="/telugu" linkLabel="Telugu hub" />
        <div className="chip-row">
          {ERAS.map((era) => (
            <Link key={era} to={`/telugu?era=${encodeURIComponent(era)}`} className="chip">
              {era}
            </Link>
          ))}
        </div>
      </section>

      <ShelfSection title="Charts" sub="Editorial demo charts">
        {charts.map((playlist) => (
          <MediaCard
            key={playlist.id}
            to={`/playlist/${playlist.id}`}
            seed={playlist.id}
            title={playlist.title}
            subtitle={`${playlist.songIds.length} tracks`}
            onPlay={() => {
              const list = playlist.songIds.map((id) => songById.get(id)).filter((song): song is NonNullable<typeof song> => Boolean(song));
              if (list.length) {
                /* playback is handled by the playlist page when needed */
              }
            }}
          />
        ))}
      </ShelfSection>

      <ShelfSection title="Mood playlists" sub="Curated sets">
        {moods.map((playlist) => (
          <MediaCard
            key={playlist.id}
            to={`/playlist/${playlist.id}`}
            seed={playlist.id}
            title={playlist.title}
            subtitle={playlist.description}
          />
        ))}
      </ShelfSection>

      <ShelfSection title="Language playlists" sub="One playlist per featured language" linkTo="/playlists">
        {languagePlaylists.map((playlist) => (
          <MediaCard
            key={playlist.id}
            to={`/playlist/${playlist.id}`}
            seed={playlist.id}
            title={playlist.title}
            subtitle={`${playlist.songIds.length} tracks`}
          />
        ))}
      </ShelfSection>

      <ShelfSection title="New releases" sub="Latest demo albums">
        {newAlbums.map((album) => (
          <MediaCard key={album.id} to={`/album/${album.id}`} seed={album.id} title={album.title} subtitle={`${album.year}`} />
        ))}
      </ShelfSection>

      <ShelfSection title="Artists to discover" sub="Singers, composers and lyricists">
        {topArtists.map((artist) => (
          <Link key={artist.id} to={`/artist/${artist.id}`} className="artist-tile">
            <Artwork seed={artist.id} title={artist.name} round />
            <div className="artist-tile__name">{artist.name}</div>
            <div className="artist-tile__role">{artist.roles.join(' · ')}</div>
          </Link>
        ))}
      </ShelfSection>

      <section className="shelf">
        <SectionHead title="More ways to listen" sub="Stations, podcasts and top charts" />
        <div className="quick-grid">
          <Link to="/radio" className="quick-tile">
            <span className="quick-tile__art">
              <RadioIcon size={22} />
            </span>
            <span className="quick-tile__label">Radio stations</span>
          </Link>
          <Link to="/podcasts" className="quick-tile">
            <span className="quick-tile__art">
              <MicIcon size={22} />
            </span>
            <span className="quick-tile__label">Podcasts</span>
          </Link>
          <Link to="/charts" className="quick-tile">
            <span className="quick-tile__art">
              <SparkIcon size={22} />
            </span>
            <span className="quick-tile__label">Top charts</span>
          </Link>
          <Link to="/telugu" className="quick-tile">
            <span className="quick-tile__art">
              <GlobeIcon size={22} />
            </span>
            <span className="quick-tile__label">Telugu hub</span>
          </Link>
        </div>
      </section>

      <Notice>
        The demo catalogue covers {songs.length} fictional tracks across {albums.length} albums and {artists.length}{' '}
        artists. Licensed Telugu, Hindi and other Indian catalogues are not connected yet.
      </Notice>

      <p className="footer-note">
        Top Telugu right now: {topByPlays(songs, 3, 'te').map((song) => song.title).join(' · ')}
      </p>
    </div>
  );
}
