/**
 * audio.js — Audio manager with Web Audio API tone synthesis
 * Manga Tic Tac Toe — INK & CHAOS
 *
 * Since no audio files are provided, we synthesize tones
 * procedurally using the Web Audio API for authentic feedback.
 */

'use strict';

const AudioManager = (() => {

  let ctx = null;
  let masterGain = null;
  let enabled = true;
  let sfxEnabled = true;
  let volume = 0.7;

  /**
   * Initialize Web Audio context (lazy, must be called after user gesture)
   */
  const init = () => {
    if (ctx) return;
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      masterGain = ctx.createGain();
      masterGain.gain.value = volume;
      masterGain.connect(ctx.destination);
    } catch (e) {
      console.warn('Web Audio API not supported', e);
    }
  };

  /**
   * Resume context if suspended (browser policy)
   */
  const resume = () => {
    if (ctx && ctx.state === 'suspended') ctx.resume();
  };

  /**
   * Set master volume (0 - 1)
   */
  const setVolume = (v) => {
    volume = Utils.clamp(v, 0, 1);
    if (masterGain) masterGain.gain.value = volume;
  };

  /**
   * Core tone player
   * @param {number} freq - Frequency in Hz
   * @param {string} type - Oscillator type ('sine','square','sawtooth','triangle')
   * @param {number} duration - Duration in seconds
   * @param {number} attack - Attack time in seconds
   * @param {number} decay - Decay time in seconds
   * @param {number} gainVal - Gain (0-1)
   */
  const playTone = (freq, type = 'sine', duration = 0.3, attack = 0.01, decay = 0.2, gainVal = 0.3) => {
    if (!ctx || !sfxEnabled) return;
    resume();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(gainVal, now + attack);
    gain.gain.exponentialRampToValueAtTime(0.001, now + attack + decay);

    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(now);
    osc.stop(now + duration);
  };

  /**
   * Play noise burst (ink splash)
   */
  const playNoise = (duration = 0.1, gainVal = 0.15) => {
    if (!ctx || !sfxEnabled) return;
    resume();
    const bufSize = ctx.sampleRate * duration;
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 800;
    gain.gain.value = gainVal;
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    src.start();
  };

  /* ── Sound Library ── */

  /**
   * Button hover — soft high tick
   */
  const hover = () => playTone(880, 'sine', 0.1, 0.005, 0.08, 0.12);

  /**
   * Button click — ink drop sound
   */
  const click = () => {
    playTone(220, 'triangle', 0.2, 0.005, 0.15, 0.25);
    playNoise(0.05, 0.1);
  };

  /**
   * Mark placed — brush stroke sweep
   */
  const brushStroke = () => {
    playNoise(0.15, 0.2);
    playTone(330, 'sine', 0.25, 0.01, 0.2, 0.15);
  };

  /**
   * Ink splash — X placed
   */
  const inkSplashX = () => {
    playTone(180, 'sawtooth', 0.2, 0.005, 0.15, 0.2);
    playNoise(0.08, 0.25);
    setTimeout(() => playTone(120, 'triangle', 0.15, 0.005, 0.1, 0.1), 80);
  };

  /**
   * Ink splash — O placed (calligraphic sweep)
   */
  const inkSplashO = () => {
    // Rising sweep for O draw
    if (ctx) {
      resume();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.4);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.5);
    }
    playNoise(0.12, 0.1);
  };

  /**
   * Victory fanfare
   */
  const victory = () => {
    const notes = [440, 550, 660, 880];
    notes.forEach((freq, i) => {
      setTimeout(() => playTone(freq, 'triangle', 0.4, 0.01, 0.35, 0.3), i * 100);
    });
    setTimeout(() => playNoise(0.3, 0.1), 50);
  };

  /**
   * Draw / tie — descending tones
   */
  const draw = () => {
    const notes = [330, 277, 220];
    notes.forEach((freq, i) => {
      setTimeout(() => playTone(freq, 'sine', 0.4, 0.01, 0.35, 0.25), i * 120);
    });
  };

  /**
   * Screen shake thud
   */
  const thud = () => {
    playTone(60, 'sine', 0.3, 0.001, 0.25, 0.4);
    playNoise(0.1, 0.3);
  };

  /**
   * AI thinking tick
   */
  const thinking = () => playTone(660, 'sine', 0.08, 0.005, 0.06, 0.08);

  /**
   * Transition whoosh
   */
  const whoosh = () => {
    playNoise(0.4, 0.25);
    if (ctx) {
      resume();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.4);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.15, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.4);
    }
  };

  return {
    init, setVolume,
    hover, click, brushStroke, inkSplashX, inkSplashO,
    victory, draw, thud, thinking, whoosh,
    get enabled() { return enabled; },
    set enabled(v) { enabled = v; },
    get sfxEnabled() { return sfxEnabled; },
    set sfxEnabled(v) { sfxEnabled = v; }
  };

})();

window.AudioManager = AudioManager;
