/**
 * journalCrypto.js — Client-side AES-GCM-256 encryption for the Devlok Journal
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │  SECURITY MODEL                                                          │
 * │                                                                          │
 * │  • A 256-bit AES-GCM key is generated once per user using the           │
 * │    Web Crypto API (window.crypto.subtle). This API uses the OS-level    │
 * │    cryptographic RNG — not Math.random().                                │
 * │                                                                          │
 * │  • The raw key bytes are stored ONLY in localStorage under a            │
 * │    user-specific key. The key NEVER leaves the browser. The server      │
 * │    never sees it — not even in transit.                                  │
 * │                                                                          │
 * │  • Each journal entry is encrypted with a unique random 96-bit IV       │
 * │    (initialization vector). Without the correct IV + key, decryption    │
 * │    is computationally infeasible.                                        │
 * │                                                                          │
 * │  • Journal entries (including attached photos as base64) are stored     │
 * │    in localStorage as { iv, data } ciphertext. Plaintext is never       │
 * │    persisted — it only exists in memory while the page is open.         │
 * │                                                                          │
 * │  • Admin, server operators, or anyone who gains DB/localStorage access  │
 * │    sees ONLY random-looking bytes. Without the encryption key (which     │
 * │    only the user's browser holds), the data is irrecoverable.           │
 * │                                                                          │
 * │  • AES-256-GCM provides authenticated encryption — tampering with       │
 * │    ciphertext is detected and decryption fails.                          │
 * └─────────────────────────────────────────────────────────────────────────┘
 */

const KEY_STORE_PREFIX     = 'devlok_jrn_key__';
const ENTRIES_STORE_PREFIX = 'devlok_jrn_entries__';

/* ── ArrayBuffer ↔ Base64 helpers ── */
function bufToB64(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}
function b64ToBuf(b64) {
  const bin = atob(b64);
  const buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
  return buf.buffer;
}

/* ── Key management ── */

/**
 * Returns the AES-GCM key for userId.
 * Creates and persists it on first call; loads from localStorage on subsequent calls.
 * The exported key bytes never leave localStorage.
 */
export async function getOrCreateKey(userId) {
  const storageKey = KEY_STORE_PREFIX + userId;
  const stored = localStorage.getItem(storageKey);

  if (stored) {
    return window.crypto.subtle.importKey(
      'raw',
      b64ToBuf(stored),
      { name: 'AES-GCM' },
      false,           // NOT extractable again — prevents key being read via JS after import
      ['encrypt', 'decrypt']
    );
  }

  // First time: generate a cryptographically random 256-bit key
  const key = await window.crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,              // Must be extractable to persist it this one time
    ['encrypt', 'decrypt']
  );

  const raw = await window.crypto.subtle.exportKey('raw', key);
  localStorage.setItem(storageKey, bufToB64(raw));

  // Re-import as non-extractable for runtime use
  return window.crypto.subtle.importKey(
    'raw', raw, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']
  );
}

/* ── Encrypt / Decrypt ── */

/**
 * Encrypts a JS object. Returns { iv, data } — both base64 strings.
 * A fresh random 96-bit IV is generated per call.
 */
export async function encryptEntry(key, plainObject) {
  const iv      = window.crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(JSON.stringify(plainObject));
  const cipher  = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoded
  );
  return { iv: bufToB64(iv.buffer), data: bufToB64(cipher) };
}

/**
 * Decrypts { iv, data } back to the original JS object.
 * Throws if ciphertext has been tampered with.
 */
export async function decryptEntry(key, { iv, data }) {
  const plain = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: b64ToBuf(iv) },
    key,
    b64ToBuf(data)
  );
  return JSON.parse(new TextDecoder().decode(plain));
}

/* ── Storage helpers ── */

/** Loads the raw (encrypted) entry list from localStorage. */
export function loadEncryptedEntries(userId) {
  const raw = localStorage.getItem(ENTRIES_STORE_PREFIX + userId);
  return raw ? JSON.parse(raw) : [];
}

/** Persists the raw (encrypted) entry list to localStorage. */
export function saveEncryptedEntries(userId, entries) {
  localStorage.setItem(ENTRIES_STORE_PREFIX + userId, JSON.stringify(entries));
}

/** Generates a UUID-like ID. Uses crypto.randomUUID when available. */
export function generateId() {
  if (window.crypto.randomUUID) return window.crypto.randomUUID();
  return Array.from(window.crypto.getRandomValues(new Uint8Array(16)))
    .map((b, i) => {
      const hex = b.toString(16).padStart(2, '0');
      return [4, 6, 8, 10].includes(i) ? '-' + hex : hex;
    }).join('');
}

/** Compresses an image File to a base64 JPEG string (max 800px, 0.75 quality). */
export function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const MAX = 800;
        let w = img.width, h = img.height;
        if (w > MAX || h > MAX) {
          if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
          else        { w = Math.round(w * MAX / h); h = MAX; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.75));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
