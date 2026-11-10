import { useMemo, useState } from 'react';
import { Link, navigate } from '../lib/router';
import { formatCount } from '../lib/format';
import { useCatalog } from '../state/CatalogContext';
import { useLibrary } from '../state/LibraryContext';
import { usePlayer } from '../state/PlayerContext';
import { useToast } from '../state/ToastContext';
import { Artwork } from '../components/Artwork';
import { EmptyState, SectionHead } from '../components/MediaCard';
import { SongRow } from '../components/SongRow';
import { CheckIcon, HeartIcon, PlayIcon, ShuffleIcon } from '../components/Icons';

const ROLES = [
  { id: '', label: 'All artists' },
  { id: 'singer', label: 'Singers' },
  { id: 'composer', label: 'Music directors' },
  { id: 'lyricist', label: 'Lyricists' },
];

export function ArtistsPage() {
  const { artists, languages, songsOfArtist } = useCatalog();
  const { followedArtists } = useLibrary();
  const [role, setRole] = useState('');
  const [language, setLanguage] = useState('');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return artists
      .filter((artist) => !role || artist.roles.includes(role as never))
      .filter((artist) => !language || artist.language === language)
      .filter((artist) => !term || artist.name.toLowerCase().includes(term))
      .slice()
      .sort((a, b) => b.followers - a.followers);
  }, [artists, role, language, query]);

  return (
    <div>
      <div className="page-head">
        <div>
          <h1 className="page-title">Artists</h1>
          <p className="page-sub">
            {artists.length} demo profiles covering singers, music directors and lyricists. Followed artists appear in your
            library.
          </p>
        </div>
      </div>

      <div className="filter-bar">
        <label className="field field--inline">
          <span>Role</span>
          <select value={role} onChange={(event) => setRole(event.target.value)}>
            {ROLES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label className="field field--inline">
          <span>Language</span>
          <select value={language} onChange={(event) => setLanguage(event.target.value)}>
            <option value="">All languages</option>
            {languages.map((item) => (
              <option key={item.code} value={item.code}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field field--inline">
          <span>Search</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Artist name" />
        </label>
      </div>

      {filtered.length ? (
        <div className="artist-grid">
          {filtered.map((artist) => {
            const count = songsOfArtist(artist.id).length;
            return (
              <Link key={artist.id} to={`/artist/${artist.id}`} className="artist-card">
                <div className="artist-card__art">
                  <Artwork seed={artist.id} title={artist.name} round />
                </div>
                <div className="artist-card__name">
                  {artist.name} {artist.verified ? <span title="Verified profile">✔</span> : null}
                </div>
                <div className="artist-card__meta">
                  {artist.roles.join(' · ')} · {count} songs
                </div>
                <div className="artist-card__meta">{formatCount(artist.followers)} followers</div>
                {followedArtists.includes(artist.id) ? <span className="badge badge--soft">Following</span> : null}
              </Link>
            );
          })}
        </div>
      ) : (
        <EmptyState title="No artists found" text="Try a different role, language or spelling." />
      )}
    </div>
  );
}

export function ArtistPage({ id }: { id: string }) {
  const { artistById, songsOfArtist, albumsOfArtist, artists, artistName, languages } = useCatalog();
  const { isArtistFollowed, toggleFollowArtist, isAlbumSaved, toggleSaveAlbum } = useLibrary();
  const { playSongs } = usePlayer();
  const { notify } = useToast();

  const artist = artistById.get(id);
  if (!artist) {
    return (
      <EmptyState
        title="Artist not found"
        text="This profile is not part of the demo catalogue."
        action={
          <button type="button" className="btn btn--outline" onClick={() => navigate('/artists')}>
            Back to artists
          </button>
        }
      />
    );
  }

  const songs = songsOfArtist(artist.id).slice().sort((a, b) => b.plays - a.plays);
  const albums = albumsOfArtist(artist.id).slice().sort((a, b) => b.year - a.year);
  const followed = isArtistFollowed(artist.id);
  const similar = artists
    .filter((item) => item.id !== artist.id && item.language === artist.language)
    .sort((a, b) => b.followers - a.followers)
    .slice(0, 6);
  const language = languages.find((item) => item.code === artist.language);

  return (
    <div>
      <button type="button" className="link-back" onClick={() => navigate('/artists')}>
        ← Artists
      </button>

      <section className="detail-head detail-head--artist">
        <div className="detail-head__art detail-head__art--round">
          <Artwork seed={artist.id} title={artist.name} round />
        </div>
        <div className="detail-head__meta">
          <span className="badge">{artist.roles.join(' · ')}</span>
          <h1 className="page-title">
            {artist.name} {artist.verified ? <span className="verified">✔</span> : null}
          </h1>
          <p className="page-sub">
            {language ? `${language.name} (${language.native})` : artist.language.toUpperCase()} · {artist.era} ·{' '}
            {formatCount(artist.followers)} followers
          </p>
          <p className="page-sub">{artist.bio}</p>
          <div className="detail-head__actions">
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => songs.length && playSongs(songs, 0, artist.name)}
              disabled={!songs.length}
            >
              <PlayIcon size={17} /> Play top songs
            </button>
            <button
              type="button"
              className="btn btn--outline"
              onClick={() => {
                if (!songs.length) return;
                playSongs(songs.slice().sort(() => Math.random() - 0.5), 0, `${artist.name} mix`);
              }}
              disabled={!songs.length}
            >
              <ShuffleIcon size={16} /> Shuffle
            </button>
            <button
              type="button"
              className={`btn ${followed ? 'btn--outline' : 'btn--ghost'}`}
              onClick={() => {
                const next = toggleFollowArtist(artist.id);
                notify(next ? `Following ${artist.name}` : `Unfollowed ${artist.name}`, next ? 'success' : 'default');
              }}
            >
              {followed ? <CheckIcon size={16} /> : <HeartIcon size={16} />} {followed ? 'Following' : 'Follow'}
            </button>
          </div>
        </div>
      </section>

      <section className="shelf">
        <SectionHead title="Popular songs" sub={`${songs.length} tracks in the demo catalogue`} />
        {songs.length ? (
          <div className="song-list">
            {songs.slice(0, 12).map((song, index) => (
              <SongRow
                key={song.id}
                song={song}
                index={index}
                subtitle={`${song.movie ? `${song.movie} · ` : ''}${song.year} · ${song.genre}`}
                onPlay={() => playSongs(songs, index, artist.name)}
              />
            ))}
          </div>
        ) : (
          <EmptyState title="No songs yet" text="This profile has no tracks in the demo catalogue." />
        )}
      </section>

      {albums.length ? (
        <section className="shelf">
          <SectionHead title="Albums and soundtracks" sub="Credited releases" />
          <div className="grid-cards">
            {albums.map((album) => (
              <Link key={album.id} to={`/album/${album.id}`} className="media-card">
                <div className="media-card__art">
                  <Artwork seed={album.id} title={album.title} />
                </div>
                <div className="media-card__meta">
                  <div className="media-card__title">{album.title}</div>
                  <div className="media-card__sub">
                    {album.year} · {album.songIds.length} tracks
                  </div>
                </div>
                <button
                  type="button"
                  className="icon-btn icon-btn--float"
                  aria-label={isAlbumSaved(album.id) ? 'Remove saved album' : 'Save album'}
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    const next = toggleSaveAlbum(album.id);
                    notify(next ? 'Album saved' : 'Album removed', next ? 'success' : 'default');
                  }}
                >
                  {isAlbumSaved(album.id) ? <CheckIcon size={16} /> : <HeartIcon size={16} />}
                </button>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {similar.length ? (
        <section className="shelf">
          <SectionHead title="Similar artists" sub="Same language, similar era" />
          <div className="artist-grid artist-grid--compact">
            {similar.map((item) => (
              <Link key={item.id} to={`/artist/${item.id}`} className="artist-card">
                <div className="artist-card__art">
                  <Artwork seed={item.id} title={item.name} round />
                </div>
                <div className="artist-card__name">{item.name}</div>
                <div className="artist-card__meta">{artistName(item.id) ? item.roles.join(' · ') : ''}</div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
