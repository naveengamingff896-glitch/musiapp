import { useMemo, useState } from 'react';
import { Link, navigate } from '../lib/router';
import type { Playlist, Song } from '../data/types';
import { formatCount, timeAgo } from '../lib/format';
import { playlistsByKind } from '../lib/collections';
import { useCatalog } from '../state/CatalogContext';
import { useLibrary } from '../state/LibraryContext';
import { usePlayer } from '../state/PlayerContext';
import { useToast } from '../state/ToastContext';
import { Artwork } from '../components/Artwork';
import { EmptyState, Notice, SectionHead } from '../components/MediaCard';
import { SongRow } from '../components/SongRow';
import { CreatePlaylistModal } from '../components/CreatePlaylistModal';
import { Modal } from '../components/Modal';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CheckIcon,
  EditIcon,
  HeartIcon,
  PlayIcon,
  PlusIcon,
  ShareIcon,
  ShuffleIcon,
  TrashIcon,
} from '../components/Icons';

export function PlaylistsPage() {
  const { playlists, songById } = useCatalog();
  const { playlists: mine, followedPlaylists } = useLibrary();
  const { playSongs } = usePlayer();
  const [creating, setCreating] = useState(false);

  const editorial = playlists.filter((playlist) => playlist.kind === 'editorial' || playlist.kind === 'mix');
  const followed = playlists.filter((playlist) => followedPlaylists.includes(playlist.id));

  const play = (playlist: Playlist) => {
    const list = playlist.songIds.map((id) => songById.get(id)).filter((song): song is Song => Boolean(song));
    if (list.length) playSongs(list, 0, playlist.title);
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <h1 className="page-title">Playlists</h1>
          <p className="page-sub">Create your own sets, follow editorial playlists and manage every track order.</p>
        </div>
        <button type="button" className="btn btn--primary" onClick={() => setCreating(true)}>
          <PlusIcon size={16} /> New playlist
        </button>
      </div>

      <section className="shelf">
        <SectionHead title="Your playlists" sub={`${mine.length} created on this device`} />
        {mine.length ? (
          <div className="grid-cards">
            {mine.map((playlist) => (
              <Link key={playlist.id} to={`/playlist/${playlist.id}`} className="media-card">
                <div className="media-card__art">
                  <Artwork seed={playlist.id} title={playlist.title} />
                </div>
                <div className="media-card__meta">
                  <div className="media-card__title">{playlist.title}</div>
                  <div className="media-card__sub">
                    {playlist.songIds.length} tracks · {playlist.isPublic ? 'Public' : 'Private'} · {timeAgo(playlist.updatedAt)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No playlists yet"
            text="Create a playlist and add songs from any track menu. Everything is saved locally for this prototype."
            action={
              <button type="button" className="btn btn--primary" onClick={() => setCreating(true)}>
                Create your first playlist
              </button>
            }
          />
        )}
      </section>

      {followed.length ? (
        <section className="shelf">
          <SectionHead title="Followed playlists" sub="Editorial sets you follow" />
          <div className="grid-cards">
            {followed.map((playlist) => (
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
        </section>
      ) : null}

      <section className="shelf">
        <SectionHead title="Editorial playlists" sub="Mixes and hand-picked collections" />
        <div className="grid-cards">
          {editorial.map((playlist) => (
            <Link key={playlist.id} to={`/playlist/${playlist.id}`} className="media-card">
              <div className="media-card__art">
                <Artwork seed={playlist.id} title={playlist.title} />
              </div>
              <div className="media-card__meta">
                <div className="media-card__title">{playlist.title}</div>
                <div className="media-card__sub">
                  {playlist.songIds.length} tracks · {playlist.curator}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="shelf">
        <SectionHead title="Charts and moods" sub="More curated sets" linkTo="/charts" linkLabel="All charts" />
        <div className="chip-row">
          {[...playlistsByKind(playlists, 'chart'), ...playlistsByKind(playlists, 'mood')].slice(0, 18).map((playlist) => (
            <Link key={playlist.id} to={`/playlist/${playlist.id}`} className="chip">
              {playlist.title}
            </Link>
          ))}
        </div>
      </section>

      <section className="shelf">
        <SectionHead title="Quick play" sub="Start any editorial playlist" />
        <div className="quick-grid">
          {editorial.slice(0, 6).map((playlist) => (
            <button key={playlist.id} type="button" className="quick-tile" onClick={() => play(playlist)}>
              <span className="quick-tile__art">
                <Artwork seed={playlist.id} title={playlist.title} tiny />
              </span>
              <span className="quick-tile__label">{playlist.title}</span>
              <PlayIcon size={18} />
            </button>
          ))}
        </div>
      </section>

      {creating ? <CreatePlaylistModal onClose={() => setCreating(false)} onCreated={() => setCreating(false)} /> : null}
    </div>
  );
}

interface PlaylistPageProps {
  id: string;
}

export function PlaylistPage({ id }: PlaylistPageProps) {
  const { playlistById, songById, artistName } = useCatalog();
  const {
    playlists: mine,
    renamePlaylist,
    deletePlaylist,
    removeSongFromPlaylist,
    reorderPlaylist,
    setPlaylistVisibility,
    isPlaylistFollowed,
    toggleFollowPlaylist,
    addSongToPlaylist,
    trackPlaylistOpen,
    likedSongs,
  } = useLibrary();
  const { playSongs } = usePlayer();
  const { notify } = useToast();
  const [renaming, setRenaming] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [adding, setAdding] = useState(false);

  const userPlaylist = mine.find((playlist) => playlist.id === id);
  const catalogPlaylist = playlistById.get(id);

  const merged = useMemo(() => {
    if (userPlaylist) {
      return {
        id: userPlaylist.id,
        title: userPlaylist.title,
        description: userPlaylist.description,
        songIds: userPlaylist.songIds,
        curator: userPlaylist.curator,
        isPublic: userPlaylist.isPublic,
        mine: true,
      };
    }
    if (catalogPlaylist) {
      return {
        id: catalogPlaylist.id,
        title: catalogPlaylist.title,
        description: catalogPlaylist.description,
        songIds: catalogPlaylist.songIds,
        curator: catalogPlaylist.curator,
        isPublic: catalogPlaylist.isPublic,
        mine: false,
      };
    }
    return null;
  }, [userPlaylist, catalogPlaylist]);

  if (!merged) {
    return (
      <EmptyState
        title="Playlist not found"
        text="This playlist may have been deleted on this device."
        action={
          <button type="button" className="btn btn--outline" onClick={() => navigate('/playlists')}>
            Back to playlists
          </button>
        }
      />
    );
  }

  const songs = merged.songIds.map((songId) => songById.get(songId)).filter((song): song is Song => Boolean(song));
  const totalSeconds = songs.reduce((sum, song) => sum + song.durationSec, 0);
  const followed = isPlaylistFollowed(merged.id);
  const likedPool = likedSongs.map((songId) => songById.get(songId)).filter((song): song is Song => Boolean(song));
  const addable = likedPool.filter((song) => !merged.songIds.includes(song.id));

  const share = async () => {
    const url = `${window.location.origin}${window.location.pathname}#/playlist/${merged.id}`;
    const text = `${merged.title} · Mana Music (demo catalogue)`;
    try {
      if (navigator.share) {
        await navigator.share({ title: merged.title, text, url });
        notify('Shared playlist', 'success');
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(`${text} ${url}`);
        notify('Link copied to clipboard', 'success');
      } else {
        notify('Sharing is not supported in this browser', 'error');
      }
    } catch {
      notify('Share cancelled', 'default');
    }
  };

  const openRename = () => {
    setTitle(merged.title);
    setDescription(merged.description);
    setRenaming(true);
  };

  return (
    <div>
      <button type="button" className="link-back" onClick={() => navigate('/playlists')}>
        ← Playlists
      </button>

      <section className="detail-head">
        <div className="detail-head__art">
          <Artwork seed={merged.id} title={merged.title} />
        </div>
        <div className="detail-head__meta">
          <span className="badge">{merged.mine ? 'Your playlist' : 'Editorial playlist'}</span>
          <h1 className="page-title">{merged.title}</h1>
          <p className="page-sub">{merged.description || 'No description yet.'}</p>
          <p className="page-sub">
            {merged.curator} · {songs.length} tracks · {Math.round(totalSeconds / 60)} min ·{' '}
            {merged.isPublic ? 'Public' : 'Private'}
          </p>
          <div className="detail-head__actions">
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => songs.length && playSongs(songs, 0, merged.title)}
              disabled={!songs.length}
            >
              <PlayIcon size={17} /> Play
            </button>
            <button
              type="button"
              className="btn btn--outline"
              onClick={() => {
                if (!songs.length) return;
                const shuffled = songs.slice().sort(() => Math.random() - 0.5);
                playSongs(shuffled, 0, `${merged.title} (shuffled)`);
              }}
              disabled={!songs.length}
            >
              <ShuffleIcon size={16} /> Shuffle
            </button>
            <button type="button" className="btn btn--ghost" onClick={share}>
              <ShareIcon size={16} /> Share
            </button>
            {merged.mine ? (
              <>
                <button type="button" className="btn btn--ghost" onClick={openRename}>
                  <EditIcon size={16} /> Rename
                </button>
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={() => setPlaylistVisibility(merged.id, !merged.isPublic)}
                >
                  {merged.isPublic ? 'Make private' : 'Make public'}
                </button>
                <button
                  type="button"
                  className="btn btn--danger"
                  onClick={() => {
                    if (window.confirm(`Delete “${merged.title}”? This cannot be undone.`)) {
                      deletePlaylist(merged.id);
                      notify('Playlist deleted');
                      navigate('/playlists');
                    }
                  }}
                >
                  <TrashIcon size={16} /> Delete
                </button>
              </>
            ) : (
              <button
                type="button"
                className={`btn ${followed ? 'btn--outline' : 'btn--ghost'}`}
                onClick={() => {
                  const next = toggleFollowPlaylist(merged.id);
                  notify(next ? 'Following playlist' : 'Unfollowed playlist', next ? 'success' : 'default');
                }}
              >
                {followed ? <CheckIcon size={16} /> : <HeartIcon size={16} />} {followed ? 'Following' : 'Follow'}
              </button>
            )}
          </div>
        </div>
      </section>

      {merged.mine ? (
        <div className="detail-toolbar">
          <button type="button" className="btn btn--outline" onClick={() => setAdding(true)}>
            <PlusIcon size={16} /> Add from liked songs
          </button>
          <span className="page-sub">{addable.length} liked songs not in this playlist</span>
        </div>
      ) : null}

      {songs.length ? (
        <div className="song-list">
          {songs.map((song, index) => (
            <SongRow
              key={`${song.id}-${index}`}
              song={song}
              index={index}
              subtitle={`${song.movie ? `${song.movie} · ` : ''}${artistName(song.singerIds[0])} · ${song.year}`}
              onPlay={() => playSongs(songs, index, merged.title)}
              onRemove={merged.mine ? () => removeSongFromPlaylist(merged.id, song.id) : undefined}
              removeLabel={merged.mine ? 'Remove from playlist' : undefined}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="This playlist is empty"
          text={merged.mine ? 'Add songs from any track menu or from your liked songs.' : 'No tracks in this demo playlist.'}
        />
      )}

      {merged.mine ? (
        <section className="shelf">
          <SectionHead title="Reorder tracks" sub="Move songs up or down" />
          <div className="reorder-list">
            {songs.map((song, index) => (
              <div key={`order-${song.id}-${index}`} className="reorder-row">
                <span className="reorder-row__index">{index + 1}</span>
                <span className="reorder-row__title">{song.title}</span>
                <button
                  type="button"
                  className="icon-btn"
                  aria-label={`Move ${song.title} up`}
                  disabled={index === 0}
                  onClick={() => reorderPlaylist(merged.id, index, index - 1)}
                >
                  <ArrowUpIcon size={16} />
                </button>
                <button
                  type="button"
                  className="icon-btn"
                  aria-label={`Move ${song.title} down`}
                  disabled={index === songs.length - 1}
                  onClick={() => reorderPlaylist(merged.id, index, index + 1)}
                >
                  <ArrowDownIcon size={16} />
                </button>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {!merged.mine ? (
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => trackPlaylistOpen(merged.id)}
        >
          Mark as recently played
        </button>
      ) : null}

      <Notice>
        Playlists are stored in this browser only for the prototype. Follow counts, public sharing and collaborative
        playlists need a backend and licensing agreements.
      </Notice>

      {renaming ? (
        <Modal
          title="Rename playlist"
          onClose={() => setRenaming(false)}
          footer={
            <>
              <button type="button" className="btn btn--ghost" onClick={() => setRenaming(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => {
                  if (!title.trim()) {
                    notify('Playlist name cannot be empty', 'error');
                    return;
                  }
                  renamePlaylist(merged.id, title.trim(), description.trim());
                  setRenaming(false);
                  notify('Playlist updated', 'success');
                }}
              >
                Save
              </button>
            </>
          }
        >
          <label className="field">
            <span>Name</span>
            <input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={60} />
          </label>
          <label className="field">
            <span>Description</span>
            <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} maxLength={180} />
          </label>
        </Modal>
      ) : null}

      {adding ? (
        <Modal
          title="Add liked songs"
          onClose={() => setAdding(false)}
          footer={
            <button type="button" className="btn btn--ghost" onClick={() => setAdding(false)}>
              Done
            </button>
          }
        >
          {addable.length ? (
            <div className="song-list">
              {addable.map((song, index) => (
                <SongRow
                  key={song.id}
                  song={song}
                  index={index}
                  onPlay={() => playSongs([song], 0, merged.title)}
                  subtitle={`${artistName(song.singerIds[0])} · ${formatCount(song.plays)} plays`}
                />
              ))}
              <button
                type="button"
                className="btn btn--outline btn--block"
                onClick={() => {
                  let added = 0;
                  addable.forEach((song) => {
                    if (addSongToPlaylist(merged.id, song.id)) added += 1;
                  });
                  notify(`${added} songs added`, 'success');
                  setAdding(false);
                }}
              >
                Add all {addable.length} songs
              </button>
            </div>
          ) : (
            <EmptyState title="Nothing to add" text="Like more songs first, then they appear here." />
          )}
        </Modal>
      ) : null}
    </div>
  );
}
