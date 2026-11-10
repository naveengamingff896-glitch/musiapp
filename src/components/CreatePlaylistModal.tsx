import { useState } from 'react';
import { useLibrary } from '../state/LibraryContext';
import { useToast } from '../state/ToastContext';
import { Modal } from './Modal';

interface CreatePlaylistModalProps {
  onClose: () => void;
  onCreated?: (playlistId: string) => void;
}

export function CreatePlaylistModal({ onClose, onCreated }: CreatePlaylistModalProps) {
  const { createPlaylist } = useLibrary();
  const { notify } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const submit = () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    const id = createPlaylist(trimmed, description.trim());
    notify(`Created “${trimmed}”`, 'success');
    onCreated?.(id);
    onClose();
  };

  return (
    <Modal
      title="New playlist"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn--ghost btn--sm" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn btn--primary btn--sm" onClick={submit} disabled={!title.trim()}>
            Create
          </button>
        </>
      }
    >
      <div className="field">
        <label className="field__label" htmlFor="create-playlist-title">
          Playlist name
        </label>
        <input
          id="create-playlist-title"
          className="input"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Telugu melody evenings"
          autoFocus
        />
      </div>
      <div className="field">
        <label className="field__label" htmlFor="create-playlist-desc">
          Description (optional)
        </label>
        <textarea
          id="create-playlist-desc"
          className="textarea"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="What is this playlist for?"
        />
      </div>
    </Modal>
  );
}
