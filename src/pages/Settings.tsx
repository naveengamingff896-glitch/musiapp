import { useState } from 'react';
import { Link } from '../lib/router';
import { AUDIO_QUALITIES } from '../data/languages';
import type { AudioQuality } from '../data/languages';
import { useCatalog } from '../state/CatalogContext';
import { useLibrary } from '../state/LibraryContext';
import { useToast } from '../state/ToastContext';
import { InfoIcon, MoonIcon, SunIcon, TrashIcon } from '../components/Icons';
import { Notice, SectionHead } from '../components/MediaCard';

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="setting-row">
      <span className="setting-row__text">
        <span className="setting-row__label">{label}</span>
        {hint ? <span className="setting-row__hint">{hint}</span> : null}
      </span>
      <span className={`switch ${checked ? 'switch--on' : ''}`}>
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          aria-label={label}
        />
        <span className="switch__knob" />
      </span>
    </label>
  );
}

export function SettingsPage() {
  const { settings, updateSettings, resetLibrary, clearDownloads, clearHistory, clearRecentSearches, profile } = useLibrary();
  const { languages } = useCatalog();
  const { notify } = useToast();
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div>
      <div className="page-head">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-sub">Appearance, playback, language, privacy and storage. Everything is saved on this device.</p>
        </div>
        <Link to="/profile" className="btn btn--ghost">
          Profile
        </Link>
      </div>

      <SectionHead title="Appearance" sub="Dark by default, built for OLED-friendly contrast" />
      <div className="card-panel">
        <div className="setting-row">
          <span className="setting-row__text">
            <span className="setting-row__label">Theme</span>
            <span className="setting-row__hint">Switch between the dark stage and a warm light palette</span>
          </span>
          <div className="seg">
            <button
              type="button"
              className={`seg__item ${settings.theme === 'dark' ? 'seg__item--active' : ''}`}
              onClick={() => updateSettings({ theme: 'dark' })}
            >
              <MoonIcon size={15} /> Dark
            </button>
            <button
              type="button"
              className={`seg__item ${settings.theme === 'light' ? 'seg__item--active' : ''}`}
              onClick={() => updateSettings({ theme: 'light' })}
            >
              <SunIcon size={15} /> Light
            </button>
          </div>
        </div>
        <Toggle
          label="Reduce motion"
          hint="Turns off slide and fade animations — helpful on low-end phones"
          checked={settings.reduceMotion}
          onChange={(value) => updateSettings({ reduceMotion: value })}
        />
        <Toggle
          label="Larger text"
          hint="Increases base font size for easier reading"
          checked={settings.largeText}
          onChange={(value) => updateSettings({ largeText: value })}
        />
        <Toggle
          label="High contrast"
          hint="Stronger borders and brighter secondary text"
          checked={settings.highContrast}
          onChange={(value) => updateSettings({ highContrast: value })}
        />
      </div>

      <SectionHead title="Playback" sub="Applies to the sample audio in this prototype" />
      <div className="card-panel">
        <div className="setting-row">
          <span className="setting-row__text">
            <span className="setting-row__label">Audio quality</span>
            <span className="setting-row__hint">Demo streams are royalty-free loops, so quality changes the label only</span>
          </span>
          <select
            className="select"
            value={settings.quality}
            onChange={(event) => updateSettings({ quality: event.target.value as AudioQuality })}
            aria-label="Audio quality"
          >
            {AUDIO_QUALITIES.map((quality) => (
              <option key={quality} value={quality}>
                {quality === 'auto' ? 'Auto' : quality.charAt(0).toUpperCase() + quality.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <Toggle
          label="Data saver"
          hint="Hints the player to avoid prefetching the next track"
          checked={settings.dataSaver}
          onChange={(value) => updateSettings({ dataSaver: value })}
        />
        <Toggle
          label="Autoplay"
          hint="Keep playing related tracks when the queue ends"
          checked={settings.autoplay}
          onChange={(value) => updateSettings({ autoplay: value })}
        />
        <Toggle
          label="Allow downloads on mobile data"
          hint="Otherwise downloads wait for Wi-Fi"
          checked={settings.downloadOverMobile}
          onChange={(value) => updateSettings({ downloadOverMobile: value })}
        />
        <Toggle
          label="Show explicit badges"
          hint="Marks tracks flagged as explicit in the catalogue"
          checked={settings.showExplicit}
          onChange={(value) => updateSettings({ showExplicit: value })}
        />
      </div>

      <SectionHead title="Language" sub="22 scheduled Indian languages plus Bhojpuri and Tulu" />
      <div className="card-panel">
        <div className="setting-row">
          <span className="setting-row__text">
            <span className="setting-row__label">Preferred language</span>
            <span className="setting-row__hint">Used for home shelves and search suggestions</span>
          </span>
          <select
            className="select"
            value={settings.language}
            onChange={(event) => updateSettings({ language: event.target.value })}
            aria-label="Preferred language"
          >
            {languages.map((language) => (
              <option key={language.code} value={language.code}>
                {language.name} · {language.native}
              </option>
            ))}
          </select>
        </div>
        <Link to="/explore" className="btn btn--ghost">
          Browse all languages
        </Link>
      </div>

      <SectionHead title="Privacy" sub="No account, no server uploads in this prototype" />
      <div className="card-panel">
        <Toggle
          label="Private session"
          hint="Stops new plays from being written to listening history"
          checked={settings.privateSession}
          onChange={(value) => updateSettings({ privateSession: value })}
        />
        <Toggle
          label="Notifications"
          hint="Show in-app announcements from the Mana Music team"
          checked={settings.notificationsEnabled}
          onChange={(value) => updateSettings({ notificationsEnabled: value })}
        />
        <Notice>
          Everything you do here stays in this browser's local storage: {profile.email}. Nothing is uploaded, because this
          prototype has no accounts or servers.
        </Notice>
      </div>

      <SectionHead title="Storage and data" sub="Clear local prototype data" />
      <div className="card-panel">
        <div className="setting-row">
          <span className="setting-row__text">
            <span className="setting-row__label">Clear listening history</span>
            <span className="setting-row__hint">Removes the plays used for Recently played</span>
          </span>
          <button
            type="button"
            className="btn btn--outline"
            onClick={() => {
              clearHistory();
              notify('Listening history cleared');
            }}
          >
            Clear
          </button>
        </div>
        <div className="setting-row">
          <span className="setting-row__text">
            <span className="setting-row__label">Clear search history</span>
            <span className="setting-row__hint">Removes recent search terms</span>
          </span>
          <button
            type="button"
            className="btn btn--outline"
            onClick={() => {
              clearRecentSearches();
              notify('Search history cleared');
            }}
          >
            Clear
          </button>
        </div>
        <div className="setting-row">
          <span className="setting-row__text">
            <span className="setting-row__label">Remove all downloads</span>
            <span className="setting-row__hint">Frees the cached audio held in this browser</span>
          </span>
          <button
            type="button"
            className="btn btn--outline"
            onClick={() => {
              clearDownloads();
              notify('Downloads removed');
            }}
          >
            Remove
          </button>
        </div>
        <div className="setting-row">
          <span className="setting-row__text">
            <span className="setting-row__label">Reset the whole library</span>
            <span className="setting-row__hint">Deletes likes, playlists, follows, downloads and settings</span>
          </span>
          {confirmReset ? (
            <span className="inline-actions">
              <button
                type="button"
                className="btn btn--danger"
                onClick={() => {
                  resetLibrary();
                  setConfirmReset(false);
                  notify('Library reset to demo defaults');
                }}
              >
                <TrashIcon size={15} /> Confirm reset
              </button>
              <button type="button" className="btn btn--ghost" onClick={() => setConfirmReset(false)}>
                Cancel
              </button>
            </span>
          ) : (
            <button type="button" className="btn btn--outline" onClick={() => setConfirmReset(true)}>
              Reset
            </button>
          )}
        </div>
      </div>

      <SectionHead title="Help and support" sub="How this prototype works" />
      <div className="card-panel">
        <details className="faq">
          <summary>Why do the songs sound like instrumentals?</summary>
          <p>
            The prototype ships royalty-free instrumental loops. Fictional song titles, movies, artists and lyric sheets
            stand in for a licensed catalogue, so nothing here infringes on real recordings.
          </p>
        </details>
        <details className="faq">
          <summary>Can I listen to real Telugu film songs?</summary>
          <p>
            Not yet. Full Telugu, Hindi and other language film catalogues require licensing agreements with labels or
            distributors. The catalogue layer in this app is ready for such a source to be connected.
          </p>
        </details>
        <details className="faq">
          <summary>Does it work offline?</summary>
          <p>
            The app is an installable PWA. Downloaded tracks are cached in this browser, and the interface shell loads from
            the service worker cache after the first visit.
          </p>
        </details>
        <details className="faq">
          <summary>Where is my data stored?</summary>
          <p>Only in this browser's local storage. Clearing site data removes it permanently.</p>
        </details>
        <div className="help-links">
          <Link to="/about" className="btn btn--ghost">
            <InfoIcon size={15} /> About and licensing
          </Link>
          <Link to="/admin" className="btn btn--ghost">
            Admin dashboard
          </Link>
        </div>
      </div>

      <p className="page-sub">Mana Music · prototype build · Telugu first, all Indian languages welcome.</p>
    </div>
  );
}
