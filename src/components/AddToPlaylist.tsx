import { useMemo, useState } from 'react';
import { Link } from '../lib/router';
import type { Song } from '../data/types';
import { useLibrary } from '../state/LibraryContext';
import { useToast } from '../state/ToastContext';
import { CheckIcon, PlusIcon } from './Icons';
import { Modal } from './Modal';

interface AddToPlaylistProps {
  song: Song;
  onClose: () => void;
}

export function AddToPlaylist({ song, onClose }: AddToPlaylistProps) {
  const { playlists, addSongToPlaylist, createPlaylist } = useLibrary();
  const { notify } = useToast();
  const [newTitle, setNewTitle] = useState('');
  const [creating, setCreating] = useState(false);

  const containing = useMemo(
    () => new Set(playlists.filter((playlist) => playlist.songIds.includes(song.id)).map((playlist) => playlist.id)),
    [playlists, song.id]
  );

  const handleAdd = (playlistId: string) => {
    const added = addSongToPlaylist(playlistId, song.id);
    notify(added ? 'Added to playlist' : 'Already in that playlist', added ? 'success' : 'default');
    if (added) onClose();
  };

  const handleCreate = () => {
    const title = newTitle.trim();
    if (!title) return;
    const id = createPlaylist(title, '', [song.id]);
    notify(`Created “${title}”`, 'success');
    setNewTitle('');
    setCreating(false);
    onClose();
    void id;
  };

  return (
    <Modal title="Add to playlist" onClose={onClose}>
      <p className="page-sub" style={{ marginTop: -6, marginBottom: 12 }}>
        {song.title}
      </p>

      {playlists.length === 0 ? (
        <p className="empty__text" style={{ marginBottom: 12 }}>
          You have no playlists yet. Create one below.
        </p>
      ) : (
        <div className="option-list">
          {playlists.map((playlist) => {
            const already = containing.has(playlist.id);
            return (
              <button key={playlist.id} type="button" onClick={() => handleAdd(playlist.id)} disabled={already}>
                <span>{playlist.title}</span>
                <span className="page-sub" style={{ marginLeft: 'auto', fontSize: 11 }}>
                  {playlist.songIds.length} tracks
                </span>
                {already ? <CheckIcon size={16} className="option-list__check" /> : <PlusIcon size={16} />}
              </button>
            );
          })}
        </div>
      )}

      {creating ? (
        <div style={{ marginTop: 12 }}>
          <div className="field">
            <label className="field__label" htmlFor="new-playlist-name">
              Playlist name
            </label>
            <input
              id="new-playlist-name"
              className="input"
              value={newTitle}
              onChange={(event) => setNewTitle(event.target.value)}
              placeholder="Telugu road trip"
              autoFocus
            />
          </div>
          <div className="modal__actions">
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => setCreating(false)}>
              Cancel
            </button>
            <button type="button" className="btn btn--primary btn--sm" onClick={handleCreate}>
              Create & add
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="btn btn--outline btn--block"
          style={{ marginTop: 14 }}
          onClick={() => setCreating(true)}
        >
          <PlusIcon size={16} /> New playlist
        </button>
      )}

      <p className="page-sub" style={{ marginTop: 14, fontSize: 11 }}>
        Manage all playlists in <Link to="/playlists" onClick={onClose}>your playlists</Link>.
      </p>
    </Modal>
  );
}
