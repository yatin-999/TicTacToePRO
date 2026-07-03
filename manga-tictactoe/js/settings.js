/**
 * settings.js — Settings management with persistence
 * Manga Tic Tac Toe — INK & CHAOS
 */

'use strict';

const Settings = (() => {

  const STORAGE_KEY = 'inkChaos_settings';

  const defaults = {
    music: true,
    sfx: true,
    volume: 70,
    animSpeed: 100,
    particles: true,
    shake: true,
    p1Name: 'PLAYER 1',
    p2Name: 'PLAYER 2'
  };

  let current = { ...defaults };

  /* ════════════════════════════════════════
     LOAD & SAVE
  ════════════════════════════════════════ */

  const load = () => {
    const saved = Utils.loadStorage(STORAGE_KEY, defaults);
    current = { ...defaults, ...saved };
    applySettings();
  };

  const save = () => {
    Utils.saveStorage(STORAGE_KEY, current);
    // Apply to AppState
    if (window.AppState) AppState.settings = current;
  };

  const applySettings = () => {
    AudioManager.sfxEnabled = current.sfx;
    AudioManager.setVolume(current.volume / 100);
    Animations.setSpeedMultiplier(current.animSpeed / 100);
    Particles.cursorEnabled = current.particles;
    if (window.AppState) AppState.settings = current;
  };

  /* ════════════════════════════════════════
     UI SYNC
  ════════════════════════════════════════ */

  const syncUI = () => {
    // Toggle switches
    syncToggle('toggle-music', current.music);
    syncToggle('toggle-sfx', current.sfx);
    syncToggle('toggle-particles', current.particles);
    syncToggle('toggle-shake', current.shake);

    // Sliders
    syncSlider('slider-volume', 'vol-display', current.volume, '%');
    syncSlider('slider-anim', 'anim-display', current.animSpeed, '%');

    // Text inputs
    const p1Input = document.getElementById('p1-name-input');
    const p2Input = document.getElementById('p2-name-input');
    if (p1Input) p1Input.value = current.p1Name;
    if (p2Input) p2Input.value = current.p2Name;
  };

  const syncToggle = (id, value) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (value) {
      el.classList.add('active');
      el.setAttribute('aria-checked', 'true');
    } else {
      el.classList.remove('active');
      el.setAttribute('aria-checked', 'false');
    }
  };

  const syncSlider = (sliderId, displayId, value, suffix = '') => {
    const slider = document.getElementById(sliderId);
    const display = document.getElementById(displayId);
    if (slider) slider.value = value;
    if (display) display.textContent = value + suffix;
  };

  /* ════════════════════════════════════════
     EVENT BINDINGS
  ════════════════════════════════════════ */

  let setupDone = false;

  const setup = () => {
    load();
    syncUI();
    if (setupDone) return; // Prevent duplicate event listeners
    setupDone = true;

    // Toggle: music
    setupToggle('toggle-music', 'music', (v) => {
      AudioManager.enabled = v;
    });

    // Toggle: sfx
    setupToggle('toggle-sfx', 'sfx', (v) => {
      AudioManager.sfxEnabled = v;
    });

    // Toggle: particles
    setupToggle('toggle-particles', 'particles', (v) => {
      Particles.cursorEnabled = v;
    });

    // Toggle: shake
    setupToggle('toggle-shake', 'shake');

    // Slider: volume
    setupSlider('slider-volume', 'vol-display', 'volume', '%', (v) => {
      AudioManager.setVolume(v / 100);
    });

    // Slider: animation speed
    setupSlider('slider-anim', 'anim-display', 'animSpeed', '%', (v) => {
      Animations.setSpeedMultiplier(v / 100);
    });

    // Player name inputs
    document.getElementById('p1-name-input')?.addEventListener('input', (e) => {
      current.p1Name = e.target.value.toUpperCase() || 'PLAYER 1';
      save();
    });

    document.getElementById('p2-name-input')?.addEventListener('input', (e) => {
      current.p2Name = e.target.value.toUpperCase() || 'PLAYER 2';
      save();
    });

    // Fullscreen button
    document.getElementById('btn-fullscreen')?.addEventListener('click', () => {
      AudioManager.click();
      toggleFullscreen();
    });

    // Reset scores
    document.getElementById('btn-reset-scores')?.addEventListener('click', () => {
      AudioManager.click();
      const stats = {
        totalGames: 0, p1Wins: 0, p2Wins: 0,
        draws: 0, winStreak: 0, aiWins: 0, history: []
      };
      Utils.saveStorage('inkChaos_stats', stats);
      Animations.showToast('⚔ SCORES RESET — The slate is wiped clean');
    });
  };

  /* ════════════════════════════════════════
     HELPERS
  ════════════════════════════════════════ */

  const setupToggle = (id, key, onChange = null) => {
    const el = document.getElementById(id);
    if (!el) return;

    const toggle = () => {
      current[key] = !current[key];
      syncToggle(id, current[key]);
      save();
      if (onChange) onChange(current[key]);
      AudioManager.click();
      Animations.showToast(`${key.toUpperCase()}: ${current[key] ? 'ON' : 'OFF'}`);
    };

    el.addEventListener('click', toggle);
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });
  };

  const setupSlider = (sliderId, displayId, key, suffix, onChange = null) => {
    const slider = document.getElementById(sliderId);
    const display = document.getElementById(displayId);
    if (!slider) return;

    slider.addEventListener('input', () => {
      const v = parseInt(slider.value);
      current[key] = v;
      if (display) display.textContent = v + suffix;
      save();
      if (onChange) onChange(v);
    });
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {
        Animations.showToast('Fullscreen not available');
      });
    } else {
      document.exitFullscreen();
    }
  };

  /* ════════════════════════════════════════
     GET SETTING
  ════════════════════════════════════════ */

  const get = (key) => current[key] ?? defaults[key];

  return { setup, load, save, get, syncUI, get current() { return current; } };

})();

window.Settings = Settings;

/* ════════════════════════════════════════
   STATS MODULE
════════════════════════════════════════ */

const Stats = (() => {

  const STORAGE_KEY = 'inkChaos_stats';

  const getDefault = () => ({
    totalGames: 0, p1Wins: 0, p2Wins: 0,
    draws: 0, winStreak: 0, aiWins: 0, history: []
  });

  const refresh = () => {
    const stats = Utils.loadStorage(STORAGE_KEY, getDefault());

    // Update stat cards
    document.querySelectorAll('[data-stat]').forEach(el => {
      const key = el.dataset.stat;
      el.textContent = stats[key] ?? 0;
    });

    // Update win rate bars
    const total = stats.totalGames || 1;
    const p1Pct = Math.round((stats.p1Wins / total) * 100);
    const p2Pct = Math.round((stats.p2Wins / total) * 100);
    const drawPct = 100 - p1Pct - p2Pct;

    const p1Bar = document.getElementById('winrate-p1');
    const p2Bar = document.getElementById('winrate-p2');
    const drawBar = document.getElementById('winrate-draw');

    if (p1Bar)   p1Bar.style.width   = `${p1Pct}%`;
    if (p2Bar)   p2Bar.style.width   = `${p2Pct}%`;
    if (drawBar) drawBar.style.width  = `${Math.max(drawPct, 0)}%`;

    // History list
    const histList = document.getElementById('history-list');
    if (histList) {
      if (!stats.history?.length) {
        histList.innerHTML = '<div class="history-empty">No battles recorded yet...</div>';
      } else {
        histList.innerHTML = stats.history.slice(0, 10).map(h => `
          <div class="history-item">
            <span class="history-result">${h.result}</span>
            <span>${h.winner}</span>
            <span>${h.mode?.toUpperCase() || 'LOCAL'}</span>
            <span>${Utils.formatDate(new Date(h.date))}</span>
          </div>
        `).join('');
      }
    }
  };

  return { refresh };

})();

window.Stats = Stats;
