/**
 * menu.js — Main menu interactions and mode select
 * Manga Tic Tac Toe — INK & CHAOS
 */

'use strict';

const Menu = (() => {

  let selectedMode = null; // 'local' | 'ai'
  let selectedDifficulty = 'medium';

  /* ════════════════════════════════════════
     BUTTON HOVER & CLICK EFFECTS
  ════════════════════════════════════════ */

  /**
   * Attach ink ripple and hover sounds to all interactive buttons
   */
  const attachButtonEffects = () => {
    document.querySelectorAll('.menu-btn, .result-btn, .ctrl-btn, .back-btn, .start-game-btn, .diff-btn, .mode-card, .settings-btn').forEach(btn => {
      btn.addEventListener('mouseenter', () => AudioManager.hover());
      btn.addEventListener('click', (e) => {
        AudioManager.click();
        Animations.addButtonRipple(btn, e);
      });
    });
  };

  /* ════════════════════════════════════════
     MAIN MENU SETUP
  ════════════════════════════════════════ */

  const setupMainMenu = () => {
    // Play / Mode Select
    document.getElementById('btn-play')?.addEventListener('click', () => {
      Router.navigate('mode');
    });

    document.getElementById('btn-multiplayer')?.addEventListener('click', () => {
      Router.navigate('mode');
      // Pre-select local mode
      setTimeout(() => selectModeCard('local'), 600);
    });

    document.getElementById('btn-ai')?.addEventListener('click', () => {
      Router.navigate('mode');
      // Pre-select AI mode
      setTimeout(() => selectModeCard('ai'), 600);
    });

    document.getElementById('btn-settings')?.addEventListener('click', () => {
      Router.navigate('settings');
    });

    document.getElementById('btn-stats')?.addEventListener('click', () => {
      Router.navigate('stats');
      Stats.refresh();
    });

    document.getElementById('btn-credits')?.addEventListener('click', () => {
      Router.navigate('credits');
    });

    // Keyboard: any key to start
    document.addEventListener('keydown', (e) => {
      if (AppState.currentScreen === 'menu' && e.key !== 'Tab') {
        if (!['Escape', 'F5', 'F11', 'F12'].includes(e.key)) {
          AudioManager.click();
        }
      }
    }, { once: false });

    // Menu parallax on mouse move
    const menuKanji = document.querySelector('.menu-kanji-bg');
    document.getElementById('menu-screen')?.addEventListener('mousemove', (e) => {
      if (!menuKanji) return;
      const dx = (e.clientX / window.innerWidth - 0.5) * 30;
      const dy = (e.clientY / window.innerHeight - 0.5) * 30;
      if (typeof gsap !== 'undefined') {
        gsap.to(menuKanji, { x: dx, y: dy, duration: 1, ease: 'power2.out' });
      }
    });
  };

  /* ════════════════════════════════════════
     MODE SELECT
  ════════════════════════════════════════ */

  const setupModeSelect = () => {
    const diffPanel = document.getElementById('difficulty-panel');
    const startLocalBtn = document.getElementById('start-local-btn');
    const startAIBtn = document.getElementById('start-ai-btn');

    // Back button
    document.getElementById('mode-back-btn')?.addEventListener('click', () => {
      Router.navigate('menu');
    });

    // Mode cards
    document.getElementById('mode-local')?.addEventListener('click', () => {
      selectModeCard('local');
    });

    document.getElementById('mode-ai')?.addEventListener('click', () => {
      selectModeCard('ai');
    });

    // Difficulty buttons
    document.querySelectorAll('.diff-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedDifficulty = btn.dataset.difficulty;
      });
    });

    // Start AI
    startAIBtn?.addEventListener('click', () => {
      if (!selectedMode) return;
      Router.navigate('game');
      setTimeout(() => {
        Game.setAIMarks('O', 'X');
        Game.startGame('ai', selectedDifficulty);
      }, 700);
    });

    // Start Local
    startLocalBtn?.addEventListener('click', () => {
      Router.navigate('game');
      setTimeout(() => {
        Game.startGame('local');
      }, 700);
    });

    // Mode card animation reset on screen change
    if (diffPanel) diffPanel.style.display = 'none';
  };

  /**
   * Select a mode card (local or ai)
   */
  const selectModeCard = (mode) => {
    selectedMode = mode;
    const diffPanel = document.getElementById('difficulty-panel');
    const startLocalBtn = document.getElementById('start-local-btn');

    document.querySelectorAll('.mode-card').forEach(c => c.classList.remove('selected'));
    document.getElementById(`mode-${mode}`)?.classList.add('selected');

    if (mode === 'ai') {
      if (diffPanel) {
        diffPanel.style.display = 'flex';
        diffPanel.classList.add('visible');
      }
      if (startLocalBtn) startLocalBtn.style.display = 'none';
    } else {
      if (diffPanel) {
        diffPanel.style.display = 'none';
        diffPanel.classList.remove('visible');
      }
      if (startLocalBtn) startLocalBtn.style.display = 'flex';
    }

    AudioManager.click();
  };

  /* ════════════════════════════════════════
     GAME CONTROLS
  ════════════════════════════════════════ */

  const setupGameControls = () => {
    document.getElementById('btn-restart')?.addEventListener('click', () => {
      AudioManager.click();
      Animations.hideResult();
      setTimeout(() => Game.restart(), 300);
    });

    document.getElementById('btn-menu')?.addEventListener('click', () => {
      AudioManager.click();
      Animations.hideResult();
      Router.navigate('menu');
    });

    // Result overlay buttons
    document.getElementById('result-play-again')?.addEventListener('click', () => {
      AudioManager.click();
      Animations.hideResult();
      setTimeout(() => Game.restart(), 300);
    });

    document.getElementById('result-menu')?.addEventListener('click', () => {
      AudioManager.click();
      Animations.hideResult();
      setTimeout(() => Router.navigate('menu'), 300);
    });
  };

  /* ════════════════════════════════════════
     BACK BUTTONS
  ════════════════════════════════════════ */

  const setupBackButtons = () => {
    document.getElementById('settings-back-btn')?.addEventListener('click', () => Router.navigate('menu'));
    document.getElementById('stats-back-btn')?.addEventListener('click', () => Router.navigate('menu'));
    document.getElementById('credits-back-btn')?.addEventListener('click', () => Router.navigate('menu'));
  };

  /* ════════════════════════════════════════
     CREDITS EASTER EGG
  ════════════════════════════════════════ */

  const setupEasterEgg = () => {
    let clickCount = 0;
    document.getElementById('credits-easter')?.addEventListener('click', () => {
      clickCount++;
      AudioManager.click();
      if (clickCount >= 5) {
        clickCount = 0;
        Animations.showToast('⚡ SHONEN SPIRIT ACTIVATED — You found the hidden power!');
        // Dramatic flash
        const flash = document.createElement('div');
        flash.style.cssText = 'position:fixed;inset:0;background:white;z-index:9999;pointer-events:none;opacity:0.8;';
        document.body.appendChild(flash);
        if (typeof gsap !== 'undefined') {
          gsap.to(flash, { opacity: 0, duration: 0.5, onComplete: () => flash.remove() });
        } else {
          setTimeout(() => flash.remove(), 500);
        }
      }
    });
  };

  /* ════════════════════════════════════════
     KEYBOARD NAVIGATION
  ════════════════════════════════════════ */

  const setupKeyboardNav = () => {
    document.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'Escape':
          if (AppState.currentScreen !== 'menu' && AppState.currentScreen !== 'loading') {
            if (AppState.currentScreen === 'game') {
              Router.navigate('menu');
            } else {
              Router.navigate('menu');
            }
          }
          break;
        case 'r':
        case 'R':
          if (AppState.currentScreen === 'game') {
            Game.restart();
          }
          break;
      }
    });
  };

  /* ════════════════════════════════════════
     INIT
  ════════════════════════════════════════ */

  const init = () => {
    setupMainMenu();
    setupModeSelect();
    setupGameControls();
    setupBackButtons();
    setupEasterEgg();
    setupKeyboardNav();
    attachButtonEffects();
  };

  return { init, selectModeCard };

})();

window.Menu = Menu;
