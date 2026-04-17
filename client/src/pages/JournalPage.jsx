import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  getOrCreateKey,
  encryptEntry,
  decryptEntry,
  loadEncryptedEntries,
  saveEncryptedEntries,
  generateId,
  compressImage,
} from '../utils/journalCrypto.js';

/* ── Date formatting (old-style) ── */
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];
const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

function formatDateOld(isoString) {
  const d = new Date(isoString);
  return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}
function formatTime(isoString) {
  const d = new Date(isoString);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}
function toRomanYear(y) {
  const vals = [1000,900,500,400,100,90,50,40,10,9,5,4,1];
  const syms = ['M','CM','D','CD','C','XC','L','XL','X','IX','V','IV','I'];
  let res = '';
  vals.forEach((v,i) => { while (y >= v) { res += syms[i]; y -= v; } });
  return res;
}
function formatDateFull(isoString) {
  const d = new Date(isoString);
  return `${DAYS[d.getDay()]}, the ${d.getDate()}th of ${MONTHS[d.getMonth()]}, Anno Domini ${toRomanYear(d.getFullYear())}`;
}

/* ── Security notice banner ── */
function SecurityBadge() {
  const [open, setOpen] = useState(false);
  return (
    <div className="journal-security-wrap">
      <button
        className="journal-security-badge"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        id="journal-security-badge"
      >
        <span className="journal-security-icon">🔒</span>
        <span>End-to-End Encrypted · Only you can read this</span>
        <span className="journal-security-arrow">{open ? '▴' : '▾'}</span>
      </button>
      {open && (
        <div className="journal-security-panel" role="note">
          <p><strong>How your privacy is protected:</strong></p>
          <ul>
            <li>A 256-bit AES-GCM cryptographic key is generated in your browser and stored <em>only</em> on this device.</li>
            <li>Every entry — including any attached photo — is encrypted <em>before</em> it is saved. The server and the admin never receive plaintext.</li>
            <li>Even if someone accessed the stored data, they would see only random-looking bytes without your key.</li>
            <li>AES-256-GCM is the same encryption standard used by banks and governments.</li>
          </ul>
          <p className="journal-security-note">
            ⚠ Your journal exists only on this device. Clearing browser data will erase it.
            Use the Export button to keep a backup.
          </p>
        </div>
      )}
    </div>
  );
}

/* ── Entry card in the sidebar list ── */
function EntryCard({ entry, active, onClick }) {
  const preview = entry.decrypted?.body?.slice(0, 60) || '…';
  return (
    <button
      className={`journal-entry-card ${active ? 'journal-entry-card--active' : ''}`}
      onClick={onClick}
      id={`journal-card-${entry.id}`}
    >
      <span className="journal-card-date">{formatDateOld(entry.createdAt)}</span>
      <span className="journal-card-title">{entry.decrypted?.title || 'Untitled'}</span>
      <span className="journal-card-preview">{preview}{entry.decrypted?.body?.length > 60 ? '…' : ''}</span>
      {entry.decrypted?.photo && <span className="journal-card-photo-dot" title="Has photo" />}
    </button>
  );
}

/* ── Quill decoration SVG ── */
function QuillSVG() {
  return (
    <svg className="journal-quill-svg" viewBox="0 0 80 80" aria-hidden="true">
      <path d="M70 5 C 50 15, 20 35, 10 70 L 15 72 C 25 42, 52 22, 72 10 Z"
        fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4"/>
      <path d="M15 72 C 18 60, 22 55, 28 52"
        fill="none" stroke="currentColor" strokeWidth="1" opacity="0.35"/>
      <path d="M10 70 L 13 75" stroke="currentColor" strokeWidth="1.5" opacity="0.4"/>
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════════════════ */
export default function JournalPage() {
  const { user, loading: authLoading, reloadUser } = useAuth();
  const navigate = useNavigate();

  const [cryptoKey,    setCryptoKey]    = useState(null);
  const [entries,      setEntries]      = useState([]);   // [{id, createdAt, encrypted:{iv,data}, decrypted:{title,body,photo}}]
  const [activeId,     setActiveId]     = useState(null);
  const [editorTitle,  setEditorTitle]  = useState('');
  const [editorBody,   setEditorBody]   = useState('');
  const [editorPhoto,  setEditorPhoto]  = useState(null); // base64 or null
  const [mode,         setMode]         = useState('view'); // 'view' | 'edit' | 'new'
  const [saving,       setSaving]       = useState(false);
  const [deleteConfirm,setDeleteConfirm]= useState(null); // id to confirm delete
  const [cryptoReady,  setCryptoReady]  = useState(false);
  const [cryptoError,  setCryptoError]  = useState('');
  const [search,       setSearch]       = useState('');

  const fileInputRef = useRef(null);
  const bodyRef      = useRef(null);



  /* ── Initialise crypto key and load entries ── */
  useEffect(() => {
    if (!user) return;

    (async () => {
      try {
        const key = await getOrCreateKey(user.id);
        setCryptoKey(key);

        const stored = loadEncryptedEntries(user.id);
        // Decrypt all entries at load time
        const decrypted = await Promise.all(
          stored.map(async (entry) => {
            try {
              const plain = await decryptEntry(key, entry.encrypted);
              return { ...entry, decrypted: plain };
            } catch {
              return { ...entry, decrypted: { title: '[Corrupt]', body: '', photo: null } };
            }
          })
        );
        // Sort newest first
        decrypted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setEntries(decrypted);
        setCryptoReady(true);
      } catch (err) {
        console.error('Journal crypto init failed:', err);
        setCryptoError('Could not initialise encryption. Your browser may not support Web Crypto API.');
      }
    })();
  }, [user]);

  /* ── Open an entry ── */
  const openEntry = (id) => {
    const entry = entries.find(e => e.id === id);
    if (!entry) return;
    setActiveId(id);
    setEditorTitle(entry.decrypted.title);
    setEditorBody(entry.decrypted.body);
    setEditorPhoto(entry.decrypted.photo || null);
    setMode('view');
  };

  /* ── New entry ── */
  const startNew = () => {
    setActiveId(null);
    setEditorTitle('');
    setEditorBody('');
    setEditorPhoto(null);
    setMode('new');
    setTimeout(() => bodyRef.current?.focus(), 100);
  };

  /* ── Save (create or update) ── */
  const save = useCallback(async () => {
    if (!cryptoKey || !editorBody.trim()) return;
    setSaving(true);
    try {
      const payload = {
        title: editorTitle.trim() || formatDateOld(new Date().toISOString()),
        body:  editorBody,
        photo: editorPhoto || null,
      };
      const encrypted = await encryptEntry(cryptoKey, payload);

      let updated;
      if (mode === 'new' || !activeId) {
        const newEntry = {
          id:        generateId(),
          createdAt: new Date().toISOString(),
          encrypted,
          decrypted: payload,
        };
        updated = [newEntry, ...entries];
        setActiveId(newEntry.id);
      } else {
        updated = entries.map(e =>
          e.id === activeId ? { ...e, encrypted, decrypted: payload } : e
        );
      }

      setEntries(updated);
      // Persist only the encrypted envelopes
      saveEncryptedEntries(
        user.id,
        updated.map(({ id, createdAt, encrypted: enc }) => ({ id, createdAt, encrypted: enc }))
      );
      setMode('view');
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  }, [cryptoKey, editorTitle, editorBody, editorPhoto, mode, activeId, entries, user]);

  /* ── Delete ── */
  const deleteEntry = (id) => {
    const updated = entries.filter(e => e.id !== id);
    setEntries(updated);
    saveEncryptedEntries(
      user.id,
      updated.map(({ id: eid, createdAt, encrypted: enc }) => ({ id: eid, createdAt, encrypted: enc }))
    );
    if (activeId === id) { setActiveId(null); setMode('view'); }
    setDeleteConfirm(null);
  };

  /* ── Photo attach ── */
  const handlePhotoAttach = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file);
      setEditorPhoto(compressed);
    } catch { /* ignore */ }
    e.target.value = '';
  };

  /* ── Export (download encrypted JSON) ── */
  const exportJournal = () => {
    const data = loadEncryptedEntries(user.id);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `devlok-journal-encrypted-${Date.now()}.json`;
    a.click();
  };

  /* ── Filtered entries ── */
  const filtered = search.trim()
    ? entries.filter(e =>
        e.decrypted.title.toLowerCase().includes(search.toLowerCase()) ||
        e.decrypted.body.toLowerCase().includes(search.toLowerCase())
      )
    : entries;

  const activeEntry = entries.find(e => e.id === activeId);
  const isEditing = mode === 'edit' || mode === 'new';

  /* ── Loading skeleton ── */
  /* While auth is still resolving, show the decrypting screen (same minimal UI) */
  if (authLoading || !user) return null;
  if (cryptoError) {
    return (
      <div className="journal-page">
        <div className="journal-error">
          <p>⚠️ {cryptoError}</p>
          <Link to="/" className="concept-back-link">← Return</Link>
        </div>
      </div>
    );
  }
  if (!cryptoReady) {
    return (
      <div className="journal-page">
        <div className="journal-loading">
          <div className="journal-loading-quill"><QuillSVG /></div>
          <p className="journal-loading-text">Opening your journal…</p>
          <p className="journal-loading-sub">Decrypting your memories</p>
        </div>
      </div>
    );
  }

  /* ══════════ RENDER ══════════ */
  return (
    <div className="journal-page" id="journal-page-root">
      {/* Parchment texture overlay */}
      <div className="journal-parchment-overlay" aria-hidden="true" />

      {/* ── Header ── */}
      <header className="journal-header">
        <Link to="/" className="concept-back-link">← Devlok</Link>
        <div className="journal-header-center">
          <QuillSVG />
          <span className="journal-header-title">Manas Patrika</span>
          <span className="journal-header-subtitle">Personal Journal</span>
        </div>
        <div className="journal-header-actions">
          <button className="journal-export-btn" onClick={exportJournal} title="Export encrypted backup" id="journal-export-btn">
            ↓ Export
          </button>
        </div>
      </header>

      {/* Security badge */}
      <SecurityBadge />

      {/* ── Main layout ── */}
      <div className="journal-layout">
        {/* ── Left sidebar: entry list ── */}
        <aside className="journal-sidebar">
          <div className="journal-sidebar-top">
            <button className="journal-new-btn" onClick={startNew} id="journal-new-btn">
              + New Entry
            </button>
            <input
              className="journal-search"
              type="text"
              placeholder="Search entries…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              aria-label="Search journal entries"
            />
          </div>

          <div className="journal-entry-list" role="list">
            {filtered.length === 0 && (
              <div className="journal-empty-list">
                {search ? 'No entries match your search.' : 'Your journal is empty.\nWrite your first entry.'}
              </div>
            )}
            {filtered.map(entry => (
              <EntryCard
                key={entry.id}
                entry={entry}
                active={entry.id === activeId}
                onClick={() => openEntry(entry.id)}
              />
            ))}
          </div>

          <div className="journal-sidebar-footer">
            <span className="journal-count">{entries.length} {entries.length === 1 ? 'entry' : 'entries'}</span>
          </div>
        </aside>

        {/* ── Right: viewer / editor ── */}
        <main className="journal-main">
          {/* Nothing selected yet */}
          {!activeId && mode === 'view' && (
            <div className="journal-welcome" id="journal-welcome">
              <div className="journal-welcome-quill"><QuillSVG /></div>
              <h2 className="journal-welcome-title">Manas Patrika</h2>
              <p className="journal-welcome-text">
                A sacred space for your thoughts, unburdened and unchained.<br />
                What does your mind wish to speak today?
              </p>
              <div className="journal-welcome-ornament">❧ ✦ ❧</div>
              <button className="journal-new-btn journal-new-btn--large" onClick={startNew}>
                Begin Writing
              </button>
            </div>
          )}

          {/* ── Editor ── */}
          {isEditing && (
            <div className="journal-editor" id="journal-editor">
              {/* Date stamp */}
              <p className="journal-editor-date">
                {formatDateFull(new Date().toISOString())}
              </p>

              {/* Title */}
              <input
                className="journal-editor-title"
                type="text"
                placeholder="Give this entry a title…"
                value={editorTitle}
                onChange={e => setEditorTitle(e.target.value)}
                maxLength={120}
                id="journal-title-input"
              />

              <div className="journal-editor-rule" />

              {/* Body */}
              <textarea
                ref={bodyRef}
                className="journal-editor-body"
                placeholder="Let the ink flow freely…"
                value={editorBody}
                onChange={e => setEditorBody(e.target.value)}
                id="journal-body-input"
              />

              {/* Photo preview */}
              {editorPhoto && (
                <div className="journal-photo-wrap">
                  <img src={editorPhoto} alt="Attached memory" className="journal-photo-preview" />
                  <button className="journal-photo-remove" onClick={() => setEditorPhoto(null)} title="Remove photo">✕</button>
                </div>
              )}

              {/* Toolbar */}
              <div className="journal-editor-toolbar">
                <button
                  className="journal-tool-btn"
                  onClick={() => fileInputRef.current?.click()}
                  title="Attach a photo"
                  id="journal-attach-btn"
                >
                  📎 Attach Photo
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handlePhotoAttach}
                />
                <div className="journal-toolbar-spacer" />
                <button
                  className="journal-tool-btn journal-tool-btn--cancel"
                  onClick={() => { if (activeId) { openEntry(activeId); } else { setMode('view'); setActiveId(null); } }}
                >
                  Discard
                </button>
                <button
                  className="journal-tool-btn journal-tool-btn--save"
                  onClick={save}
                  disabled={saving || !editorBody.trim()}
                  id="journal-save-btn"
                >
                  {saving ? 'Sealing…' : '🔒 Seal Entry'}
                </button>
              </div>
            </div>
          )}

          {/* ── Viewer ── */}
          {mode === 'view' && activeEntry && (
            <div className="journal-viewer" id="journal-viewer">
              {/* Date stamp */}
              <p className="journal-viewer-date">
                {formatDateFull(activeEntry.createdAt)}
                <span className="journal-viewer-time"> · {formatTime(activeEntry.createdAt)}</span>
              </p>

              {/* Title */}
              <h2 className="journal-viewer-title">{activeEntry.decrypted.title}</h2>
              <div className="journal-viewer-rule" />

              {/* Body */}
              <article className="journal-viewer-body">
                {activeEntry.decrypted.body.split('\n').map((line, i) => (
                  line.trim()
                    ? <p key={i}>{line}</p>
                    : <div key={i} className="journal-viewer-blank-line" />
                ))}
              </article>

              {/* Photo */}
              {activeEntry.decrypted.photo && (
                <div className="journal-photo-wrap">
                  <img
                    src={activeEntry.decrypted.photo}
                    alt="Memory"
                    className="journal-photo-preview journal-photo-preview--view"
                  />
                </div>
              )}

              {/* Actions */}
              <div className="journal-viewer-actions">
                <button
                  className="journal-tool-btn"
                  onClick={() => setMode('edit')}
                  id="journal-edit-btn"
                >
                  ✏ Edit
                </button>
                {deleteConfirm === activeEntry.id ? (
                  <>
                    <span className="journal-delete-confirm-text">Delete forever?</span>
                    <button className="journal-tool-btn journal-tool-btn--danger" onClick={() => deleteEntry(activeEntry.id)}>
                      Yes, delete
                    </button>
                    <button className="journal-tool-btn" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                  </>
                ) : (
                  <button
                    className="journal-tool-btn journal-tool-btn--danger"
                    onClick={() => setDeleteConfirm(activeEntry.id)}
                    id="journal-delete-btn"
                  >
                    ✕ Delete
                  </button>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
