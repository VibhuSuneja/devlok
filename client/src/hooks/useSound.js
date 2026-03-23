/**
 * useSound — Devlok Audio Engine
 *
 * Synthesises all UI sounds via Tone.js (no MP3 downloads needed).
 * Auto-unlocks AudioContext on the first user gesture.
 *
 * Usage:
 *   const { playSound } = useSound();
 *   playSound('bookmark');
 *
 * Available keys:
 *   'shankh'          – conch blast on app enter
 *   'node_click'      – soft bell when a node is selected
 *   'bookmark'        – rising chime on bookmark add
 *   'unbookmark'      – falling soft tone on bookmark remove
 *   'shraddha'        – two-note reward chime
 *   'constellation'   – deep om pulse when constellation opens
 */

import { useCallback, useRef, useEffect } from 'react';
import * as Tone from 'tone';

// ── Asset paths relative to /public ──────────────────────────────────────────
const ASSETS = {
  shankh: '/sounds/shankh_ritual.mp3',
  temple_bell: '/sounds/temple_bell.mp3',
  om: '/sounds/om_chant.mp3',
};

// ── Global Players Map (Singletons to prevent memory leaks) ──────────────────
const players = new Tone.Players({
  shankh: ASSETS.shankh,
  temple_bell: ASSETS.temple_bell,
  om: ASSETS.om,
}).toDestination();

// Volume tweaks for real recordings
players.player('shankh').volume.value = -4;
players.player('temple_bell').volume.value = -10;
players.player('om').volume.value = -8;

// Reusable UI Synthesizers (Harmonious Pentatonic/Fifth-based)
const uiSynth = new Tone.PolySynth(Tone.Synth, {
  oscillator: { type: 'triangle' },
  envelope: { attack: 0.01, decay: 0.3, sustain: 0.1, release: 0.8 },
}).toDestination();
uiSynth.volume.value = -16;

const reverseSynth = new Tone.PolySynth(Tone.Synth, {
  oscillator: { type: 'sine' },
  envelope: { attack: 0.02, decay: 0.4, sustain: 0, release: 0.4 },
}).toDestination();
reverseSynth.volume.value = -18;

// ── Hook ─────────────────────────────────────────────────────────────────────
export function useSound() {
  const isLoaded = useRef(false);

  useEffect(() => {
    // Warm up the engine
    Tone.loaded().then(() => {
      isLoaded.current = true;
    });
  }, []);

  const unlock = useCallback(async () => {
    if (Tone.context.state !== 'running') {
      await Tone.start();
    }
  }, []);

  const playSound = useCallback(async (key) => {
    try {
      await unlock();

      // Case 1: Real samples via Player
      if (players.has(key)) {
        const p = players.player(key);
        if (p.state === 'started') p.stop();
        p.start();
        return;
      }

      // Case 2: Redefined harmonious UI sounds
      const now = Tone.now();
      switch (key) {
        case 'node_click':
          // Replaced synth with the REAL temple bell recording
          players.player('temple_bell').start();
          break;

        case 'bookmark':
          // Harmonious G5-D6 (Perfect Fifth)
          uiSynth.triggerAttackRelease('G5', '16n', now);
          uiSynth.triggerAttackRelease('D6', '16n', now + 0.15);
          break;

        case 'unbookmark':
          // Descending soft D5-G4
          reverseSynth.triggerAttackRelease('D5', '16n', now);
          reverseSynth.triggerAttackRelease('G4', '16n', now + 0.12);
          break;

        case 'shraddha':
          // Ascending C5-G5-C6 triad (Divine triumph)
          uiSynth.triggerAttackRelease('C5', '16n', now);
          uiSynth.triggerAttackRelease('G5', '16n', now + 0.12);
          uiSynth.triggerAttackRelease('C6', '8n', now + 0.24);
          break;

        case 'constellation':
          // Use the real deep OM recording
          players.player('om').start();
          break;

        case 'shankh':
          // Use the real Shankh ritual recording
          players.player('shankh').start();
          break;

        default:
          break;
      }
    } catch (e) {
      console.warn('Audio play failed:', e);
    }
  }, [unlock]);

  return { playSound };
}

