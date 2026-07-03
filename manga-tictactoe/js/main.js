/**
 * main.js — Application bootstrap, Router, and AppState
 * Manga Tic Tac Toe — INK & CHAOS
 *
 * Entry point — initializes all systems and manages screen routing.
 */

'use strict';

/* ════════════════════════════════════════
   APP STATE — Global shared state
════════════════════════════════════════ */

const AppState = {
  currentScreen: 'loading',
  settings: {
    music: true,
    sfx: true,
    volume: 70,
    animSpeed: 100,
    particles: true,
    shake: true,
    p1Name: 'PLAYER 1',
    p2Name: 'PLAYER 2'
  }
};

window.AppState = AppState;

/* ════════════════════════════════════════
   ROUTER — Screen navigation
════════════════════════════════════════ */

const Router = (() => {

  const screens = {
    loading:  document.getElementById('loading-screen'),
    menu:     document.getElementById('menu-screen'),
    mode:     document.getElementById('mode-screen'),
    game:     document.getElementById('game-screen'),
    settings: document.getElementById('settings-screen'),
    stats:    document.getElementById('stats-screen'),
    credits:  document.getElementById('credits-screen')
  };

  let currentScreen = 'loading';

  /**
   * Navigate to a screen
   * @param {string} target - Screen key
   */
  const navigate = (target) => {
    if (target === currentScreen) return;
    const fromEl = screens[currentScreen];
    const toEl   = screens[target];
    if (!toEl) return;

    AudioManager.whoosh();

    Animations.transition(fromEl, toEl, () => {
      currentScreen = target;
      AppState.currentScreen = target;

      // Screen-specific on-enter logic
      onEnterScreen(target);
    });
  };

  const onEnterScreen = (screen) => {
    switch (screen) {
      case 'menu': {
        Particles.startMenu();
        Animations.animateMenuEntrance();
        break;
      }
      case 'mode': {
        // Reset mode selection
        document.querySelectorAll('.mode-card').forEach(c => c.classList.remove('selected'));
        const diffPanel = document.getElementById('difficulty-panel');
        if (diffPanel) diffPanel.style.display = 'none';
        const startLocal = document.getElementById('start-local-btn');
        if (startLocal) startLocal.style.display = 'none';
        break;
      }
      case 'settings': {
        Settings.syncUI(); // Just re-sync UI values
        break;
      }
      case 'stats': {
        Stats.refresh();
        break;
      }
      case 'game': {
        Particles.stopMenu();
        break;
      }
    }
  };

  return { navigate, onEnterScreen, get current() { return currentScreen; } };

})();

window.Router = Router;

/* ════════════════════════════════════════
   BOOTSTRAP
════════════════════════════════════════ */

const App = (() => {

  const init = () => {
    // Initialize particle system (cursor trail + menu bg)
    Particles.initAll();

    // Initialize audio (deferred until user gesture)
    const initAudioOnGesture = () => {
      AudioManager.init();
      document.removeEventListener('click', initAudioOnGesture);
      document.removeEventListener('keydown', initAudioOnGesture);
      document.removeEventListener('touchstart', initAudioOnGesture);
    };
    document.addEventListener('click', initAudioOnGesture);
    document.addEventListener('keydown', initAudioOnGesture);
    document.addEventListener('touchstart', initAudioOnGesture);

    // Load settings
    const savedSettings = Utils.loadStorage('inkChaos_settings', AppState.settings);
    AppState.settings = { ...AppState.settings, ...savedSettings };
    AudioManager.sfxEnabled = AppState.settings.sfx;
    AudioManager.setVolume(AppState.settings.volume / 100);
    Animations.setSpeedMultiplier(AppState.settings.animSpeed / 100);

    // Initialize menu & settings logic
    Settings.setup();
    Menu.init();

    // Run loading sequence
    Animations.runLoadingSequence(() => {
      // Short pause then exit loading
      setTimeout(() => {
        Animations.exitLoading(() => {
          const menuScreen = document.getElementById('menu-screen');
          if (menuScreen) {
            menuScreen.classList.add('active');
            menuScreen.style.opacity = '1';
            menuScreen.style.pointerEvents = 'all';
          }
          AppState.currentScreen = 'menu';
          Particles.startMenu();
          Animations.animateMenuEntrance();
        });
      }, 300);
    });

    // Global touch support
    setupTouchSupport();

    // Handle window resize
    window.addEventListener('resize', Utils.debounce(() => {
      // Re-setup canvases handled in particles.js
    }, 200));

    // Prevent context menu (for immersion)
    document.addEventListener('contextmenu', (e) => e.preventDefault());
  };

  /**
   * Touch: convert touch events to mouse equivalents for buttons
   */
  const setupTouchSupport = () => {
    document.addEventListener('touchstart', (e) => {
      if (e.target.matches('button, .mode-card, .cell, .toggle-switch')) {
        e.target.style.transform = 'scale(0.97)';
      }
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
      if (e.target.style) {
        e.target.style.transform = '';
      }
    }, { passive: true });
  };

  return { init };

})();

// Boot when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', App.init);
} else {
  App.init();
}
