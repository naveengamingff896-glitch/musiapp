import { useState } from 'react';
import { Link } from '../lib/router';
import type { Song } from '../data/types';
import { formatCount } from '../lib/format';
import { useCatalog } from '../state/CatalogContext';
import { useLibrary } from '../state/LibraryContext';
import { usePlayer } from '../state/PlayerContext';
import { Artwork } from '../components/Artwork';
import { EmptyState, SectionHead } from '../components/MediaCard';
import { SongRow } from '../components/SongRow';
import { CreatePlaylistModal } from '../components/CreatePlaylistModal';
import { PlusIcon } from '../components/Icons';

type Tab = 'overview' | 'playlists' | 'albums' | 'artists' | 'history';

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'playlists', label: 'Playlists' },
  { id: 'albums', label: 'Albums' },
  { id: 'artists', label: 'Artists' },
  { id: 'history', label: 'History' },
];

export function LibraryPage() {
  const { songs, albums, artists, playlists, songById, albumById, artistById } = useCatalog();
  const {
    likedSongs,
    savedAlbums,
    followedArtists,
    followedPlaylists,
    playlists: myPlaylists,
    downloads,
    history,
    profile,
  } = useLibrary();
  const { playSongs } = usePlayer();
  const [tab, setTab] = useState<Tab>('overview');
  const [creating, setCreating] = useState(false);

  const liked = likedSongs.map((id) => songById.get(id)).filter((song): song is Song => Boolean(song));
  const saved = savedAlbums.map((id) => albumById.get(id)).filter((album): album is NonNullable<typeof album> => Boolean(album));
  const followed = followedArtists.map((id) => artistById.get(id)).filter((artist): artist is NonNullable<typeof artist> => Boolean(artist));
  const followedSets = followedPlaylists.map((id) => playlists.find((playlist) => playlist.id === id)).filter((playlist): playlist is NonNullable<typeof playlist> => Boolean(playlist));
  const recent = history.map((entry) => songById.get(entry.songId)).filter((song): song is Song => Boolean(song)).slice(0, 12);
  const downloaded = downloads.map((id) => songById.get(id)).filter((song): song is Song => Boolean(song));

  const play = (list: Song[], label: string) => {
    if (list.length) playSongs(list, 0, label);
  };

  return (
    <div>
      <section className="library-head">
        <div className="avatar avatar--lg">{profile.name.slice(0, 1).toUpperCase()}</div>
        <div>
          <h1 className="page-title">{profile.name}</h1>
          <p className="page-sub">
            {myPlaylists.length} playlists · {likedSongs.length} liked songs · {savedAlbums.length} saved albums ·{' '}
            {followedArtists.length} artists · {downloads.length} downloads
          </p>
        </div>
        <button type="button" className="btn btn--primary" onClick={() => setCreating(true)}>
          <PlusIcon size={16} /> New playlist
        </button>
      </section>

      <div className="chip-row" role="tablist" aria-label="Library sections">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            className={`chip ${tab === item.id ? 'chip--active' : ''}`}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'overview' ? (
        <div>
          <section className="shelf">
            <SectionHead title="Jump back in" sub="Your most recent listening" />
            {recent.length ? (
              <div className="quick-grid">
                {recent.slice(0, 6).map((song) => (
                  <button key={song.id} type="button" className="quick-tile" onClick={() => play(recent, 'Recently played')}>
                    <span className="quick-tile__art">
                      <Artwork seed={song.albumId} title={song.title} tiny />
                    </span>
                    <span className="quick-tile__label">{song.title}</span>
                  </button>
                ))}
              </div>
            ) : (
              <EmptyState title="Nothing played yet" text="Start with the Telugu top 10 and your history will build here." />
            )}
          </section>

          <section className="shelf">
            <SectionHead title="Your shortcuts" sub="Everything saved on this device" />
            <div className="quick-grid">
              <Link to="/liked" className="quick-tile">
                <span className="quick-tile__art">
                  <Artwork seed="liked-songs" title="Liked Songs" tiny />
                </span>
                <span className="quick-tile__label">Liked songs · {likedSongs.length}</span>
              </Link>
              <Link to="/downloads" className="quick-tile">
                <span className="quick-tile__art">
                  <Artwork seed="downloads" title="Downloads" tiny />
                </span>
                <span className="quick-tile__label">Downloads · {downloads.length}</span>
              </Link>
              <Link to="/albums" className="quick-tile">
                <span className="quick-tile__art">
                  <Artwork seed="saved-albums" title="Saved albums" tiny />
                </span>
                <span className="quick-tile__label">Saved albums · {savedAlbums.length}</span>
              </Link>
              <Link to="/artists" className="quick-tile">
                <span className="quick-tile__art">
                  <Artwork seed="followed-artists" title="Followed artists" tiny />
                </span>
                <span className="quick-tile__label">Followed artists · {followedArtists.length}</span>
              </Link>
            </div>
          </section>

          <section className="shelf">
            <SectionHead title="Your playlists" sub="Created on this device" linkTo="/playlists" linkLabel="Manage" />
            {myPlaylists.length ? (
              <div className="grid-cards">
                {myPlaylists.map((playlist) => (
                  <Link key={playlist.id} to={`/playlist/${playlist.id}`} className="media-card">
                    <div className="media-card__art">
                      <Artwork seed={playlist.id} title={playlist.title} />
                    </div>
                    <div className="media-card__meta">
                      <div className="media-card__title">{playlist.title}</div>
                      <div className="media-card__sub">{playlist.songIds.length} tracks</div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No playlists yet"
                text="Create a playlist, then add songs from any track menu."
                action={
                  <button type="button" className="btn btn--primary" onClick={() => setCreating(true)}>
                    Create playlist
                  </button>
                }
              />
            )}
          </section>

          <section className="shelf">
            <SectionHead title="Liked songs" sub={`${likedSongs.length} saved`} linkTo="/liked" linkLabel="Open" />
            {liked.length ? (
              <div className="song-list">
                {liked.slice(0, 5).map((song, index) => (
                  <SongRow key={song.id} song={song} index={index} onPlay={() => play(liked, 'Liked songs')} />
                ))}
              </div>
            ) : (
              <p className="page-sub">Tap the heart on any song to build your liked list.</p>
            )}
          </section>
        </div>
      ) : null}

      {tab === 'playlists' ? (
        <section className="shelf">
          <SectionHead title="Your playlists" sub="Create, rename, reorder and share" />
          <div className="grid-cards">
            {myPlaylists.map((playlist) => (
              <Link key={playlist.id} to={`/playlist/${playlist.id}`} className="media-card">
                <div className="media-card__art">
                  <Artwork seed={playlist.id} title={playlist.title} />
                </div>
                <div className="media-card__meta">
                  <div className="media-card__title">{playlist.title}</div>
                  <div className="media-card__sub">
                    {playlist.songIds.length} tracks · {playlist.isPublic ? 'Public' : 'Private'}
                  </div>
                </div>
              </Link>
            ))}
          </div>
          {followedSets.length ? (
            <div style={{ marginTop: 22 }}>
              <SectionHead title="Followed playlists" sub={`${followedSets.length} followed`} />
              <div className="grid-cards">
                {followedSets.map((playlist) => (
                  <Link key={playlist.id} to={`/playlist/${playlist.id}`} className="media-card">
                    <div className="media-card__art">
                      <Artwork seed={playlist.id} title={playlist.title} />
                    </div>
                    <div className="media-card__meta">
                      <div className="media-card__title">{playlist.title}</div>
                      <div className="media-card__sub">{playlist.songIds.length} tracks</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </section>
      ) : null}

      {tab === 'albums' ? (
        <section className="shelf">
          <SectionHead title="Saved albums" sub={`${saved.length} of ${albums.length}`} />
          {saved.length ? (
            <div className="grid-cards">
              {saved.map((album) => (
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
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState title="No saved albums" text="Open any album and tap Save to keep it here." />
          )}
        </section>
      ) : null}

      {tab === 'artists' ? (
        <section className="shelf">
          <SectionHead title="Followed artists" sub={`${followed.length} followed`} />
          {followed.length ? (
            <div className="grid-cards grid-cards--artists">
              {followed.map((artist) => (
                <Link key={artist.id} to={`/artist/${artist.id}`} className="artist-tile">
                  <Artwork seed={artist.id} title={artist.name} round />
                  <div className="artist-tile__name">{artist.name}</div>
                  <div className="artist-tile__role">{formatCount(artist.followers)} followers</div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState title="No followed artists" text="Open an artist page and tap Follow." />
          )}
        </section>
      ) : null}

      {tab === 'history' ? (
        <section className="shelf">
          <SectionHead title="Listening history" sub={`${history.length} plays · stored locally`} linkTo="/profile" linkLabel="Statistics" />
          {recent.length ? (
            <div className="song-list">
              {history.slice(0, 40).map((entry, index) => {
                const song = songById.get(entry.songId);
                if (!song) return null;
                return (
                  <SongRow
                    key={`${entry.songId}-${entry.at}-${index}`}
                    song={song}
                    index={index}
                    subtitle={new Date(entry.at).toLocaleString()}
                    onPlay={() => play(recent, 'Listening history')}
                  />
                );
              })}
            </div>
          ) : (
            <EmptyState title="History is empty" text="Play something and it will appear here." />
          )}
          {downloaded.length ? <p className="footer-note">{downloaded.length} downloaded tracks available offline.</p> : null}
          {songs.length ? <p className="footer-note">{songs.length} tracks in the demo catalogue.</p> : null}
        </section>
      ) : null}

      {creating ? (
        <CreatePlaylistModal
          onClose={() => setCreating(false)}
          onCreated={() => setCreating(false)}
        />
      ) : null}
    </div>
  );
}
