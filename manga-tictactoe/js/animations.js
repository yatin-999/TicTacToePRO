/**
 * animations.js — GSAP-powered animation controller
 * Manga Tic Tac Toe — INK & CHAOS
 *
 * Centralizes all GSAP animations:
 * - Screen transitions
 * - Loading sequence
 * - Board entrance
 * - Mark animations (X and O)
 * - Win / Draw sequences
 * - Button interactions
 */

'use strict';

const Animations = (() => {

  // Register GSAP plugins
  if (typeof gsap !== 'undefined') {
    gsap.registerPlugin(TextPlugin, CustomEase);
    CustomEase.create('inkEase', 'M0,0 C0.14,0 0.242,0.438 0.272,0.561 0.313,0.728 0.354,0.963 0.362,1');
    CustomEase.create('brushStroke', 'M0,0 C0,0 0.02,0.308 0.5,0.7 0.8,0.968 1,1 1,1');
  }

  let speedMultiplier = 1; // Controlled by settings

  /* ════════════════════════════════════════
     SCREEN TRANSITIONS
  ════════════════════════════════════════ */

  /**
   * Wipe transition between screens
   * @param {HTMLElement} fromEl - Current screen
   * @param {HTMLElement} toEl - Target screen
   * @param {Function} onMidpoint - Called at transition midpoint
   */
  const transition = (fromEl, toEl, onMidpoint = null) => {
    const overlay = document.getElementById('transition-overlay');
    const ink = overlay?.querySelector('.transition-ink');
    const lines = overlay?.querySelector('.transition-lines');

    if (!overlay || typeof gsap === 'undefined') {
      // Fallback: instant switch
      if (fromEl) { fromEl.style.opacity = 0; fromEl.style.pointerEvents = 'none'; fromEl.classList.remove('active'); }
      if (toEl) { toEl.style.opacity = 1; toEl.style.pointerEvents = 'all'; toEl.classList.add('active'); }
      if (onMidpoint) onMidpoint();
      return;
    }

    // Build speed lines in overlay
    lines.innerHTML = '';
    for (let i = 0; i < 15; i++) {
      const line = document.createElement('div');
      line.style.cssText = `
        position:absolute;
        left:0; right:0;
        top:${(i / 15) * 100}%;
        height:${Utils.randBetween(1, 4)}px;
        background:rgba(255,255,255,${Utils.randBetween(0.1, 0.4)});
        transform:scaleX(0);
        transform-origin:left;
      `;
      lines.appendChild(line);
    }

    const dur = 0.35 / speedMultiplier;
    const tl = gsap.timeline();

    // Speed lines burst in
    tl.to(lines.children, { scaleX: 1, duration: dur * 0.4, stagger: 0.01, ease: 'power3.out' })
      // Ink wipe covers screen
      .fromTo(ink, { scaleX: 0, transformOrigin: 'left' }, { scaleX: 1, duration: dur, ease: 'power3.inOut' }, '-=0.1')
      // Midpoint: swap screens
      .add(() => {
        if (fromEl) fromEl.classList.remove('active');
        if (toEl) toEl.classList.add('active');
        gsap.set(toEl, { opacity: 1, pointerEvents: 'all' });
        gsap.set(fromEl, { opacity: 0, pointerEvents: 'none' });
        if (onMidpoint) onMidpoint();
      })
      // Lines fade out
      .to(lines.children, { scaleX: 0, duration: dur * 0.3, stagger: 0.008, ease: 'power2.in' })
      // Ink wipe exits
      .fromTo(ink, { scaleX: 1, transformOrigin: 'right' }, { scaleX: 0, duration: dur, ease: 'power3.inOut' }, '-=0.2');
  };

  /* ════════════════════════════════════════
     LOADING SEQUENCE
  ════════════════════════════════════════ */

  /**
   * Animated loading progress
   * @param {Function} onComplete
   */
  const runLoadingSequence = (onComplete) => {
    const bar = document.getElementById('loading-bar');
    const text = document.getElementById('loading-text');
    const messages = [
      'Summoning the spirits...',
      'Mixing the ink...',
      'Drawing the grid...',
      'Awakening the AI...',
      'Preparing the battlefield...',
      '準備完了 — READY'
    ];

    if (!bar || typeof gsap === 'undefined') {
      setTimeout(onComplete, 500);
      return;
    }

    // Build speed lines for loading screen
    const linesContainer = document.getElementById('loading-speed-lines');
    if (linesContainer) {
      for (let i = 0; i < 30; i++) {
        const line = document.createElement('div');
        const y = Utils.randBetween(0, 100);
        const len = Utils.randBetween(100, 600);
        const spd = Utils.randBetween(1.5, 4);
        line.style.cssText = `
          position:absolute;
          top:${y}%;
          left:-${len}px;
          width:${len}px;
          height:${Utils.randBetween(1, 3)}px;
          background:linear-gradient(90deg, transparent, rgba(255,255,255,${Utils.randBetween(0.05, 0.3)}), transparent);
          animation: speedLine ${spd}s ease-in-out ${Utils.randBetween(0, 3)}s infinite;
        `;
        linesContainer.appendChild(line);
      }
    }

    let progress = 0;
    let msgIdx = 0;
    const tl = gsap.timeline({ onComplete });

    tl.to(bar, {
      width: '100%',
      duration: 2.5,
      ease: 'power1.inOut',
      onUpdate: function () {
        progress = Math.round(this.progress() * 100);
        const newMsgIdx = Math.floor((progress / 100) * messages.length);
        if (newMsgIdx !== msgIdx && text && messages[newMsgIdx]) {
          msgIdx = newMsgIdx;
          gsap.to(text, { opacity: 0, duration: 0.2, onComplete: () => {
            text.textContent = messages[msgIdx];
            gsap.to(text, { opacity: 1, duration: 0.2 });
          }});
        }
      }
    });

    return tl;
  };

  /**
   * Exit loading screen
   * @param {Function} onComplete
   */
  const exitLoading = (onComplete) => {
    const loading = document.getElementById('loading-screen');
    if (!loading || typeof gsap === 'undefined') {
      if (onComplete) onComplete();
      return;
    }
    gsap.to(loading, {
      opacity: 0,
      duration: 0.5,
      ease: 'power2.in',
      onComplete: () => {
        loading.classList.remove('active');
        if (onComplete) onComplete();
      }
    });
  };

  /* ════════════════════════════════════════
     MENU ENTRANCE
  ════════════════════════════════════════ */

  const animateMenuEntrance = () => {
    if (typeof gsap === 'undefined') return;
    const title = document.querySelector('.menu-title');
    const eyebrow = document.querySelector('.title-eyebrow');
    const subtitle = document.querySelector('.title-subtitle');
    const btns = document.querySelectorAll('.menu-btn');
    const footer = document.querySelector('.menu-footer');
    const jp = document.querySelector('.title-jp');

    gsap.set([title, eyebrow, subtitle, btns, footer, jp], { opacity: 0, y: 30 });
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.to(eyebrow, { opacity: 1, y: 0, duration: 0.5 })
      .to(title, { opacity: 1, y: 0, duration: 0.7, ease: 'back.out(1.7)' }, '-=0.2')
      .to(jp, { opacity: 1, y: 0, duration: 0.5 }, '-=0.3')
      .to(subtitle, { opacity: 1, y: 0, duration: 0.5 }, '-=0.3')
      .to(btns, { opacity: 1, y: 0, duration: 0.4, stagger: 0.08 }, '-=0.2')
      .to(footer, { opacity: 1, y: 0, duration: 0.4 }, '-=0.2');
  };

  /* ════════════════════════════════════════
     BOARD ENTRANCE
  ════════════════════════════════════════ */

  /**
   * Animate grid lines drawing in
   */
  const animateBoardEntrance = () => {
    if (typeof gsap === 'undefined') return;
    const lines = document.querySelectorAll('.grid-line');
    const playerCards = document.querySelectorAll('.player-card');
    const controls = document.querySelector('.game-controls');

    gsap.set([playerCards, controls], { opacity: 0, y: -20 });

    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

    // Draw grid lines one by one
    lines.forEach((line, i) => {
      const length = 290; // SVG viewbox length
      tl.to(line, {
        strokeDashoffset: 0,
        duration: 0.4 / speedMultiplier,
        ease: 'power2.inOut'
      }, i * 0.1);
    });

    tl.to(playerCards, { opacity: 1, y: 0, duration: 0.4, stagger: 0.1 }, 0.2)
      .to(controls, { opacity: 1, y: 0, duration: 0.3 }, '-=0.2');
  };

  /* ════════════════════════════════════════
     MARK ANIMATIONS — X
  ════════════════════════════════════════ */

  /**
   * Animate an X mark being drawn
   * @param {HTMLElement} cell - The cell element
   * @param {Function} onComplete
   */
  const animateX = (cell, onComplete) => {
    const container = cell.querySelector('.mark-container');
    if (!container) return;

    // Create SVG
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('overflow', 'visible');
    svg.classList.add('mark-x');
    svg.style.cssText = 'width:100%;height:100%;filter:drop-shadow(0 0 8px rgba(255,255,255,0.6))';

    const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line1.setAttribute('x1', '15'); line1.setAttribute('y1', '15');
    line1.setAttribute('x2', '85'); line1.setAttribute('y2', '85');
    line1.classList.add('stroke1');

    const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line2.setAttribute('x1', '85'); line2.setAttribute('y1', '15');
    line2.setAttribute('x2', '15'); line2.setAttribute('y2', '85');
    line2.classList.add('stroke2');

    svg.appendChild(line1);
    svg.appendChild(line2);
    container.innerHTML = '';
    container.appendChild(svg);

    // Ink splash at cell center
    const rect = cell.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    // Add drawn class to trigger CSS animation
    requestAnimationFrame(() => {
      svg.classList.add('drawn');
    });

    // Create ink drops
    createCellInkSplash(cx, cy);
    AudioManager.inkSplashX();

    // GSAP camera jolt
    if (typeof gsap !== 'undefined') {
      gsap.to(cell, {
        scale: 1.08,
        duration: 0.1,
        ease: 'power2.out',
        yoyo: true,
        repeat: 1,
        onComplete
      });
    } else if (onComplete) {
      setTimeout(onComplete, 350);
    }
  };

  /* ════════════════════════════════════════
     MARK ANIMATIONS — O
  ════════════════════════════════════════ */

  /**
   * Animate an O mark being drawn
   * @param {HTMLElement} cell
   * @param {Function} onComplete
   */
  const animateO = (cell, onComplete) => {
    const container = cell.querySelector('.mark-container');
    if (!container) return;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('overflow', 'visible');
    svg.classList.add('mark-o');
    svg.style.cssText = 'width:100%;height:100%;filter:drop-shadow(0 0 8px rgba(255,255,255,0.6))';

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', '50');
    circle.setAttribute('cy', '50');
    circle.setAttribute('r', '33');
    circle.classList.add('circle-stroke');
    circle.style.transform = 'rotate(-90deg)';
    circle.style.transformOrigin = '50% 50%';

    svg.appendChild(circle);
    container.innerHTML = '';
    container.appendChild(svg);

    const rect = cell.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    requestAnimationFrame(() => {
      svg.classList.add('drawn');
    });

    createCellInkSplash(cx, cy);
    AudioManager.inkSplashO();

    if (typeof gsap !== 'undefined') {
      gsap.fromTo(circle,
        { strokeDashoffset: 502 },
        {
          strokeDashoffset: 0,
          duration: 0.5 / speedMultiplier,
          ease: 'power2.inOut',
          onComplete
        }
      );
    } else if (onComplete) {
      setTimeout(onComplete, 550);
    }
  };

  /* ════════════════════════════════════════
     WIN SEQUENCE
  ════════════════════════════════════════ */

  /**
   * Full cinematic win sequence
   * @param {string} winnerName
   * @param {Array} winCells - Array of winning cell elements
   * @param {Array} losingCells - Array of losing cell elements
   * @param {Function} onComplete
   */
  const winSequence = (winnerName, winCells, losingCells, onComplete) => {
    if (typeof gsap === 'undefined') {
      if (onComplete) onComplete();
      return;
    }

    const dur = 1 / speedMultiplier;
    const tl = gsap.timeline({ onComplete });

    // 1. Screen shake
    AppState.settings.shake && tl.to(document.getElementById('game-screen'), {
      keyframes: [
        { x: -6, y: -3, duration: 0.05 },
        { x: 6, y: 3, duration: 0.05 },
        { x: -4, y: 4, duration: 0.05 },
        { x: 4, y: -4, duration: 0.05 },
        { x: -2, y: 2, duration: 0.05 },
        { x: 0, y: 0, duration: 0.05 }
      ]
    });

    // 2. Dim losing cells
    tl.to(losingCells, { opacity: 0.3, duration: 0.3 }, 0.1);

    // 3. Flash
    const flash = document.createElement('div');
    flash.className = 'victory-flash';
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 1000);

    // 4. Pulse winning cells
    tl.to(winCells, {
      scale: 1.1,
      duration: 0.3,
      ease: 'back.out(2)',
      stagger: 0.05
    }, 0.3);

    // 5. Sound
    tl.add(() => AudioManager.victory(), 0.1);
    tl.add(() => AudioManager.thud(), 0);

    // 6. Screen reset
    tl.to(document.getElementById('game-screen'), { x: 0, y: 0, duration: 0.1 }, 0.3);

    // 7. Result
    tl.add(() => showResult('WIN', winnerName), 0.7 * dur);
  };

  /* ════════════════════════════════════════
     DRAW SEQUENCE
  ════════════════════════════════════════ */

  const drawSequence = (onComplete) => {
    const tl = gsap.timeline({ onComplete });
    // Shake
    AppState.settings.shake && tl.to(document.getElementById('game-screen'), {
      keyframes: [
        { x: -4, duration: 0.06 }, { x: 4, duration: 0.06 },
        { x: -3, duration: 0.06 }, { x: 3, duration: 0.06 },
        { x: 0, duration: 0.06 }
      ]
    });
    tl.add(() => AudioManager.draw(), 0);
    tl.add(() => showResult('DRAW', null), 0.5);
  };

  /* ════════════════════════════════════════
     RESULT OVERLAY
  ════════════════════════════════════════ */

  /**
   * Show result overlay
   * @param {'WIN'|'DRAW'} type
   * @param {string|null} winnerName
   */
  const showResult = (type, winnerName) => {
    const overlay = document.getElementById('result-overlay');
    const mainText = document.getElementById('result-main-text');
    const subText = document.getElementById('result-sub-text');
    const kanji = document.getElementById('result-kanji');
    const crack = document.getElementById('result-panel-crack');

    if (!overlay) return;

    if (type === 'WIN') {
      mainText.textContent = 'VICTORY';
      subText.textContent = `${winnerName} WINS THE BATTLE`;
      kanji.textContent = '勝';
      crack.classList.remove('show');
    } else {
      mainText.textContent = 'DRAW';
      subText.textContent = 'THE BATTLE ENDS IN STALEMATE';
      kanji.textContent = '引';
      crack.classList.add('show');
    }

    // Reset any leftover inline styles from a previous hideResult
    gsap.killTweensOf(overlay);
    gsap.set(overlay, { clearProps: 'all' });

    overlay.classList.add('active');

    if (typeof gsap !== 'undefined') {
      const panel = overlay.querySelector('.result-panel');
      const btns = overlay.querySelectorAll('.result-btn');

      gsap.set([panel, mainText, subText, btns], { opacity: 0 });
      gsap.set(panel, { scale: 0.7, rotation: -3 });
      gsap.set(kanji, { scale: 0.5, opacity: 0 });

      const tl = gsap.timeline();
      tl.to(kanji, { scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(2)' })
        .to(panel, { opacity: 1, scale: 1, rotation: 0, duration: 0.5, ease: 'back.out(1.7)' }, '-=0.2')
        .to(mainText, { opacity: 1, duration: 0.3, ease: 'power2.out' }, '-=0.2')
        .to(subText, { opacity: 1, duration: 0.3 }, '-=0.1')
        .to(btns, { opacity: 1, stagger: 0.1, duration: 0.3 }, '-=0.1');

      // Celebration
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      if (type === 'WIN') Particles.startWinCelebration(cx, cy, 100);
    }
  };

  const hideResult = () => {
    const overlay = document.getElementById('result-overlay');
    if (!overlay) return;
    Particles.stopWinCelebration();

    // Immediately block further clicks while fading out
    overlay.style.pointerEvents = 'none';

    if (typeof gsap !== 'undefined') {
      gsap.killTweensOf(overlay); // Cancel any in-flight animations first
      gsap.to(overlay, {
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          overlay.classList.remove('active');
          // CRITICAL: clear ALL inline styles GSAP added so CSS opacity:0 takes over
          gsap.set(overlay, { clearProps: 'all' });
        }
      });
    } else {
      overlay.classList.remove('active');
      overlay.style.opacity = '';
      overlay.style.pointerEvents = '';
    }
  };

  /* ════════════════════════════════════════
     WIN LINE
  ════════════════════════════════════════ */

  /**
   * Draw animated win line on the SVG grid
   * @param {string} combo - e.g. 'row0', 'col1', 'diag0', 'diag1'
   */
  const animateWinLine = (combo) => {
    const svg = document.getElementById('board-grid-svg');
    const line = document.getElementById('win-line-svg');
    if (!svg || !line) return;

    // Map combo to SVG coordinates
    const coords = {
      'row0': { x1: 10, y1: 50,  x2: 290, y2: 50  },
      'row1': { x1: 10, y1: 150, x2: 290, y2: 150 },
      'row2': { x1: 10, y1: 250, x2: 290, y2: 250 },
      'col0': { x1: 50,  y1: 10, x2: 50,  y2: 290 },
      'col1': { x1: 150, y1: 10, x2: 150, y2: 290 },
      'col2': { x1: 250, y1: 10, x2: 250, y2: 290 },
      'diag0': { x1: 10,  y1: 10,  x2: 290, y2: 290 },
      'diag1': { x1: 290, y1: 10,  x2: 10,  y2: 290 }
    };

    const c = coords[combo];
    if (!c) return;

    // Calculate length
    const dx = c.x2 - c.x1, dy = c.y2 - c.y1;
    const length = Math.sqrt(dx * dx + dy * dy);

    line.setAttribute('x1', c.x1);
    line.setAttribute('y1', c.y1);
    line.setAttribute('x2', c.x2);
    line.setAttribute('y2', c.y2);
    line.setAttribute('stroke-dasharray', length);
    line.setAttribute('stroke-dashoffset', length);

    if (typeof gsap !== 'undefined') {
      gsap.to(line, {
        attr: { strokeDashoffset: 0, opacity: 1 },
        duration: 0.5 / speedMultiplier,
        ease: 'power2.inOut'
      });
    } else {
      line.setAttribute('stroke-dashoffset', '0');
      line.setAttribute('opacity', '1');
    }
  };

  const clearWinLine = () => {
    const line = document.getElementById('win-line-svg');
    if (line) {
      line.setAttribute('opacity', '0');
      line.setAttribute('stroke-dashoffset', '500');
    }
  };

  /* ════════════════════════════════════════
     CELL INK SPLASH (helper)
  ════════════════════════════════════════ */

  const createCellInkSplash = (cx, cy) => {
    if (!AppState?.settings?.particles) return;
    Particles.createInkSplash(cx, cy, document.getElementById('ink-splash-overlay'));
  };

  /* ════════════════════════════════════════
     BUTTON INTERACTIONS
  ════════════════════════════════════════ */

  /**
   * Add ink ripple effect to button click
   */
  const addButtonRipple = (btn, e) => {
    const rect = btn.getBoundingClientRect();
    const x = (e.clientX || rect.left + rect.width / 2) - rect.left;
    const y = (e.clientY || rect.top + rect.height / 2) - rect.top;

    const ripple = document.createElement('span');
    ripple.style.cssText = `
      position:absolute;
      left:${x}px; top:${y}px;
      width:10px; height:10px;
      background:rgba(255,255,255,0.3);
      border-radius:50%;
      transform:translate(-50%,-50%) scale(0);
      pointer-events:none;
      z-index:10;
    `;
    btn.appendChild(ripple);

    if (typeof gsap !== 'undefined') {
      gsap.to(ripple, {
        scale: 20, opacity: 0, duration: 0.6,
        ease: 'power2.out',
        onComplete: () => ripple.remove()
      });
    } else {
      setTimeout(() => ripple.remove(), 600);
    }
  };

  /* ════════════════════════════════════════
     AI THINKING ANIMATION
  ════════════════════════════════════════ */

  const showAIThinking = () => {
    const el = document.getElementById('ai-thinking');
    if (el) el.classList.add('visible');
  };

  const hideAIThinking = () => {
    const el = document.getElementById('ai-thinking');
    if (el) el.classList.remove('visible');
  };

  /* ════════════════════════════════════════
     TOAST NOTIFICATIONS
  ════════════════════════════════════════ */

  const showToast = (message, duration = 2000) => {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    container.appendChild(toast);

    if (typeof gsap !== 'undefined') {
      gsap.fromTo(toast, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3 });
      setTimeout(() => {
        gsap.to(toast, { opacity: 0, y: -10, duration: 0.3, onComplete: () => toast.remove() });
      }, duration);
    } else {
      setTimeout(() => toast.remove(), duration + 300);
    }
  };

  /* ════════════════════════════════════════
     SETTINGS CONTROL
  ════════════════════════════════════════ */

  const setSpeedMultiplier = (v) => {
    speedMultiplier = Utils.clamp(v, 0.1, 2);
    if (typeof gsap !== 'undefined') {
      gsap.globalTimeline.timeScale(speedMultiplier);
    }
  };

  return {
    transition,
    runLoadingSequence,
    exitLoading,
    animateMenuEntrance,
    animateBoardEntrance,
    animateX,
    animateO,
    winSequence,
    drawSequence,
    showResult,
    hideResult,
    animateWinLine,
    clearWinLine,
    addButtonRipple,
    showAIThinking,
    hideAIThinking,
    showToast,
    setSpeedMultiplier
  };

})();

window.Animations = Animations;
