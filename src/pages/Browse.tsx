import { useMemo } from 'react';
import { Link, navigate } from '../lib/router';
import { ERA_BLURBS } from '../data/languages';
import { useCatalog } from '../state/CatalogContext';
import { usePlayer } from '../state/PlayerContext';
import { Artwork } from '../components/Artwork';
import { EmptyState, SectionHead } from '../components/MediaCard';
import { SongRow } from '../components/SongRow';
import { PlayIcon, ShuffleIcon } from '../components/Icons';

export function LanguagePage({ code }: { code: string }) {
  const { songs, albums, artists, playlists, languages, artistName } = useCatalog();
  const { playSongs } = usePlayer();

  const info = languages.find((item) => item.code === code);
  const languageSongs = useMemo(
    () => songs.filter((song) => song.language === code).sort((a, b) => b.plays - a.plays),
    [songs, code],
  );
  const languageAlbums = albums.filter((album) => album.language === code).sort((a, b) => b.year - a.year);
  const languageArtists = artists.filter((artist) => artist.language === code).sort((a, b) => b.followers - a.followers);
  const languagePlaylists = playlists.filter((playlist) => playlist.language === code);

  if (!info) {
    return (
      <EmptyState
        title="Language not found"
        text="That language is not in the demo catalogue."
        action={
          <button type="button" className="btn btn--outline" onClick={() => navigate('/explore')}>
            Back to Explore
          </button>
        }
      />
    );
  }

  return (
    <div>
      <button type="button" className="link-back" onClick={() => navigate('/explore')}>
        ← Explore
      </button>

      <section className="detail-head">
        <div className="detail-head__art detail-head__art--lang">
          <span className="lang-glyph">{info.native.slice(0, 2)}</span>
        </div>
        <div className="detail-head__meta">
          <span className="badge">{info.code.toUpperCase()}</span>
          <h1 className="page-title">
            {info.name} <span className="native-inline">{info.native}</span>
          </h1>
          <p className="page-sub">
            {languageSongs.length} demo songs · {languageAlbums.length} albums · {languageArtists.length} artists
          </p>
          <div className="detail-head__actions">
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => languageSongs.length && playSongs(languageSongs, 0, `${info.name} hits`)}
              disabled={!languageSongs.length}
            >
              <PlayIcon size={17} /> Play {info.name}
            </button>
            <button
              type="button"
              className="btn btn--outline"
              onClick={() =>
                languageSongs.length &&
                playSongs(languageSongs.slice().sort(() => Math.random() - 0.5), 0, `${info.name} shuffle`)
              }
              disabled={!languageSongs.length}
            >
              <ShuffleIcon size={16} /> Shuffle
            </button>
            {code === 'te' ? (
              <Link to="/telugu" className="btn btn--ghost">
                Telugu hub
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      <SectionHead title={`Popular ${info.name} songs`} sub="Sorted by demo plays" />
      {languageSongs.length ? (
        <div className="song-list">
          {languageSongs.slice(0, 20).map((song, index) => (
            <SongRow
              key={song.id}
              song={song}
              index={index}
              subtitle={`${song.movie ? `${song.movie} · ` : ''}${artistName(song.singerIds[0])} · ${song.year}`}
              onPlay={() => playSongs(languageSongs, index, `${info.name} hits`)}
            />
          ))}
        </div>
      ) : (
        <EmptyState title="No songs yet" text="This language has no demo tracks connected yet." />
      )}

      {languageAlbums.length ? (
        <section className="shelf">
          <SectionHead title={`${info.name} albums`} sub="Soundtracks, singles and indie releases" />
          <div className="grid-cards">
            {languageAlbums.slice(0, 12).map((album) => (
              <Link key={album.id} to={`/album/${album.id}`} className="media-card">
                <div className="media-card__art">
                  <Artwork seed={album.id} title={album.title} />
                </div>
                <div className="media-card__meta">
                  <div className="media-card__title">{album.title}</div>
                  <div className="media-card__sub">
                    {artistName(album.artistId)} · {album.year}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {languageArtists.length ? (
        <section className="shelf">
          <SectionHead title={`${info.name} artists`} sub="Singers, composers and lyricists" />
          <div className="artist-grid artist-grid--compact">
            {languageArtists.slice(0, 12).map((artist) => (
              <Link key={artist.id} to={`/artist/${artist.id}`} className="artist-card">
                <div className="artist-card__art">
                  <Artwork seed={artist.id} title={artist.name} round />
                </div>
                <div className="artist-card__name">{artist.name}</div>
                <div className="artist-card__meta">{artist.roles.join(' · ')}</div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {languagePlaylists.length ? (
        <section className="shelf">
          <SectionHead title={`${info.name} playlists`} sub="Curated sets in this language" />
          <div className="chip-row">
            {languagePlaylists.map((playlist) => (
              <Link key={playlist.id} to={`/playlist/${playlist.id}`} className="chip">
                {playlist.title} · {playlist.songIds.length}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <p className="page-sub">
        Demo catalogue only. {info.name} movie catalogue licensing would be connected through label agreements.
      </p>
    </div>
  );
}

export function GenrePage({ name }: { name: string }) {
  const { songs, playlists, artistName } = useCatalog();
  const { playSongs } = usePlayer();

  const genreSongs = songs.filter((song) => song.genre.toLowerCase() === name.toLowerCase()).sort((a, b) => b.plays - a.plays);
  const genrePlaylists = playlists.filter((playlist) => playlist.kind === 'genre' && playlist.title.toLowerCase().includes(name.toLowerCase()));

  return (
    <div>
      <button type="button" className="link-back" onClick={() => navigate('/explore')}>
        ← Explore
      </button>
      <section className="detail-head">
        <div className="detail-head__art detail-head__art--genre">
          <span className="lang-glyph">{name.slice(0, 2)}</span>
        </div>
        <div className="detail-head__meta">
          <span className="badge">Genre</span>
          <h1 className="page-title">{name}</h1>
          <p className="page-sub">{genreSongs.length} demo songs across Indian languages</p>
          <div className="detail-head__actions">
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => genreSongs.length && playSongs(genreSongs, 0, `${name} mix`)}
              disabled={!genreSongs.length}
            >
              <PlayIcon size={17} /> Play genre
            </button>
            <button
              type="button"
              className="btn btn--outline"
              onClick={() =>
                genreSongs.length && playSongs(genreSongs.slice().sort(() => Math.random() - 0.5), 0, `${name} shuffle`)
              }
              disabled={!genreSongs.length}
            >
              <ShuffleIcon size={16} /> Shuffle
            </button>
          </div>
        </div>
      </section>

      {genreSongs.length ? (
        <div className="song-list">
          {genreSongs.map((song, index) => (
            <SongRow
              key={song.id}
              song={song}
              index={index}
              subtitle={`${artistName(song.singerIds[0])} · ${song.language.toUpperCase()} · ${song.year}`}
              onPlay={() => playSongs(genreSongs, index, `${name} mix`)}
            />
          ))}
        </div>
      ) : (
        <EmptyState title="No songs in this genre yet" text="Try another genre from the Explore screen." />
      )}

      {genrePlaylists.length ? (
        <section className="shelf">
          <SectionHead title="Related playlists" sub="Curated by Mana Music" />
          <div className="chip-row">
            {genrePlaylists.map((playlist) => (
              <Link key={playlist.id} to={`/playlist/${playlist.id}`} className="chip">
                {playlist.title}
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

export function MoodPage({ name }: { name: string }) {
  const { songs, playlists, artistName } = useCatalog();
  const { playSongs } = usePlayer();

  const moodSongs = songs.filter((song) => song.mood.toLowerCase() === name.toLowerCase()).sort((a, b) => b.plays - a.plays);
  const moodPlaylists = playlists.filter((playlist) => playlist.kind === 'mood' && playlist.title.toLowerCase().includes(name.toLowerCase()));

  return (
    <div>
      <button type="button" className="link-back" onClick={() => navigate('/explore')}>
        ← Explore
      </button>
      <section className="detail-head">
        <div className="detail-head__art detail-head__art--mood">
          <span className="lang-glyph">{name.slice(0, 2)}</span>
        </div>
        <div className="detail-head__meta">
          <span className="badge">Mood</span>
          <h1 className="page-title">{name}</h1>
          <p className="page-sub">{moodSongs.length} tracks tagged {name.toLowerCase()} in the demo catalogue</p>
          <div className="detail-head__actions">
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => moodSongs.length && playSongs(moodSongs, 0, `${name} mood`)}
              disabled={!moodSongs.length}
            >
              <PlayIcon size={17} /> Play mood
            </button>
          </div>
        </div>
      </section>

      {moodSongs.length ? (
        <div className="song-list">
          {moodSongs.map((song, index) => (
            <SongRow
              key={song.id}
              song={song}
              index={index}
              subtitle={`${artistName(song.singerIds[0])} · ${song.genre} · ${song.year}`}
              onPlay={() => playSongs(moodSongs, index, `${name} mood`)}
            />
          ))}
        </div>
      ) : (
        <EmptyState title="No tracks for this mood yet" text="Pick another mood from Explore." />
      )}

      {moodPlaylists.length ? (
        <section className="shelf">
          <SectionHead title="Mood playlists" sub="Curated sets" />
          <div className="chip-row">
            {moodPlaylists.map((playlist) => (
              <Link key={playlist.id} to={`/playlist/${playlist.id}`} className="chip">
                {playlist.title}
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

export function EraPage({ era }: { era: string }) {
  const { songs, artistName, playlists } = useCatalog();
  const { playSongs } = usePlayer();

  const eraSongs = songs.filter((song) => song.era === era).sort((a, b) => b.plays - a.plays);
  const eraPlaylists = playlists.filter((playlist) => playlist.kind === 'era' && playlist.title.includes(era));

  return (
    <div>
      <button type="button" className="link-back" onClick={() => navigate('/telugu')}>
        ← Telugu hub
      </button>
      <section className="detail-head">
        <div className="detail-head__art detail-head__art--era">
          <span className="lang-glyph">{era.slice(0, 2)}</span>
        </div>
        <div className="detail-head__meta">
          <span className="badge">Era</span>
          <h1 className="page-title">{era}</h1>
          <p className="page-sub">{ERA_BLURBS[era] ?? 'Songs from this era of Indian film music.'}</p>
          <p className="page-sub">{eraSongs.length} demo tracks</p>
          <div className="detail-head__actions">
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => eraSongs.length && playSongs(eraSongs, 0, era)}
              disabled={!eraSongs.length}
            >
              <PlayIcon size={17} /> Play era
            </button>
          </div>
        </div>
      </section>

      {eraSongs.length ? (
        <div className="song-list">
          {eraSongs.map((song, index) => (
            <SongRow
              key={song.id}
              song={song}
              index={index}
              subtitle={`${song.movie ? `${song.movie} · ` : ''}${artistName(song.singerIds[0])} · ${song.year}`}
              onPlay={() => playSongs(eraSongs, index, era)}
            />
          ))}
        </div>
      ) : (
        <EmptyState title="No tracks in this era" text="Try another era from the Telugu hub." />
      )}

      {eraPlaylists.length ? (
        <section className="shelf">
          <SectionHead title="Era playlists" sub="Curated sets" />
          <div className="chip-row">
            {eraPlaylists.map((playlist) => (
              <Link key={playlist.id} to={`/playlist/${playlist.id}`} className="chip">
                {playlist.title}
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
