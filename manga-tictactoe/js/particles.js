/**
 * particles.js — Canvas-based particle systems
 * Manga Tic Tac Toe — INK & CHAOS
 *
 * Manages multiple canvas layers:
 * - Cursor trail
 * - Menu background particles
 * - Win celebration fragments
 * - Speed line generators
 */

'use strict';

const Particles = (() => {

  /* ── Cursor Trail ── */
  const cursorCanvas = document.getElementById('cursor-canvas');
  const cursorCtx = cursorCanvas ? cursorCanvas.getContext('2d') : null;
  const cursorTrail = []; // Array of {x, y, age, size}
  let mouseX = -100, mouseY = -100;
  let cursorEnabled = true;
  let cursorRAF = null;

  const resizeCursorCanvas = () => {
    if (!cursorCanvas) return;
    cursorCanvas.width = window.innerWidth;
    cursorCanvas.height = window.innerHeight;
  };

  const updateCursor = (e) => {
    const touch = e.touches ? e.touches[0] : e;
    mouseX = touch.clientX;
    mouseY = touch.clientY;
    // Add trail point
    cursorTrail.push({ x: mouseX, y: mouseY, age: 0, size: Utils.randBetween(3, 7) });
    if (cursorTrail.length > 30) cursorTrail.shift();
  };

  const drawCursor = () => {
    if (!cursorCtx || !cursorEnabled) {
      cursorRAF = requestAnimationFrame(drawCursor);
      return;
    }
    cursorCtx.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);

    // Age trail points
    for (let i = cursorTrail.length - 1; i >= 0; i--) {
      cursorTrail[i].age++;
      if (cursorTrail[i].age > 20) {
        cursorTrail.splice(i, 1);
      }
    }

    // Draw trail
    cursorTrail.forEach((p, i) => {
      const alpha = (1 - p.age / 20) * 0.7;
      const size = p.size * (1 - p.age / 20);
      cursorCtx.beginPath();
      cursorCtx.arc(p.x, p.y, size, 0, Math.PI * 2);
      cursorCtx.fillStyle = `rgba(255,255,255,${alpha})`;
      cursorCtx.fill();
    });

    // Main cursor dot
    cursorCtx.beginPath();
    cursorCtx.arc(mouseX, mouseY, 5, 0, Math.PI * 2);
    cursorCtx.fillStyle = 'rgba(255,255,255,0.9)';
    cursorCtx.fill();

    // Cursor ring
    cursorCtx.beginPath();
    cursorCtx.arc(mouseX, mouseY, 14, 0, Math.PI * 2);
    cursorCtx.strokeStyle = 'rgba(255,255,255,0.4)';
    cursorCtx.lineWidth = 1;
    cursorCtx.stroke();

    cursorRAF = requestAnimationFrame(drawCursor);
  };

  /* ── Menu Background Canvas ── */
  const menuCanvas = document.getElementById('menu-canvas');
  const menuCtx = menuCanvas ? menuCanvas.getContext('2d') : null;
  let menuParticles = [];
  let menuSpeedLines = [];
  let menuRAF = null;
  let menuAnimating = false;

  const resizeMenuCanvas = () => {
    if (!menuCanvas) return;
    menuCanvas.width = window.innerWidth;
    menuCanvas.height = window.innerHeight;
  };

  const createMenuParticle = () => ({
    x: Utils.randBetween(0, window.innerWidth),
    y: Utils.randBetween(window.innerHeight + 20, window.innerHeight + 100),
    size: Utils.randBetween(1, 5),
    speedX: Utils.randBetween(-0.5, 0.5),
    speedY: Utils.randBetween(-1.5, -0.3),
    opacity: Utils.randBetween(0.1, 0.6),
    rotation: Utils.randBetween(0, 360),
    rotSpeed: Utils.randBetween(-2, 2),
    shape: Utils.randItem(['circle', 'square', 'line'])
  });

  const createSpeedLine = () => ({
    y: Utils.randBetween(0, window.innerHeight),
    x: Utils.randBetween(-200, 0),
    length: Utils.randBetween(100, 500),
    speed: Utils.randBetween(8, 20),
    opacity: Utils.randBetween(0.05, 0.25),
    width: Utils.randBetween(0.5, 2)
  });

  const initMenuCanvas = () => {
    if (!menuCtx) return;
    menuParticles = Array.from({ length: 60 }, createMenuParticle);
    menuSpeedLines = Array.from({ length: 20 }, createSpeedLine);
    menuAnimating = true;
    animateMenu();
  };

  const animateMenu = () => {
    if (!menuCtx || !menuAnimating) return;
    menuCtx.clearRect(0, 0, menuCanvas.width, menuCanvas.height);

    // Draw speed lines
    menuSpeedLines.forEach(line => {
      line.x += line.speed;
      if (line.x > window.innerWidth + 100) {
        line.x = Utils.randBetween(-200, -100);
        line.y = Utils.randBetween(0, window.innerHeight);
      }
      menuCtx.save();
      menuCtx.globalAlpha = line.opacity;
      menuCtx.strokeStyle = 'white';
      menuCtx.lineWidth = line.width;
      menuCtx.beginPath();
      menuCtx.moveTo(line.x, line.y);
      menuCtx.lineTo(line.x + line.length, line.y);
      menuCtx.stroke();
      menuCtx.restore();
    });

    // Draw particles
    menuParticles.forEach((p, i) => {
      p.x += p.speedX;
      p.y += p.speedY;
      p.rotation += p.rotSpeed;

      if (p.y < -20) {
        menuParticles[i] = createMenuParticle();
        return;
      }

      menuCtx.save();
      menuCtx.translate(p.x, p.y);
      menuCtx.rotate((p.rotation * Math.PI) / 180);
      menuCtx.globalAlpha = p.opacity;
      menuCtx.fillStyle = 'white';

      if (p.shape === 'circle') {
        menuCtx.beginPath();
        menuCtx.arc(0, 0, p.size, 0, Math.PI * 2);
        menuCtx.fill();
      } else if (p.shape === 'square') {
        menuCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      } else {
        menuCtx.strokeStyle = 'white';
        menuCtx.lineWidth = p.size / 2;
        menuCtx.beginPath();
        menuCtx.moveTo(-p.size * 2, 0);
        menuCtx.lineTo(p.size * 2, 0);
        menuCtx.stroke();
      }

      menuCtx.restore();
    });

    // Radial ink vignette
    const grad = menuCtx.createRadialGradient(
      menuCanvas.width / 2, menuCanvas.height / 2, 0,
      menuCanvas.width / 2, menuCanvas.height / 2, Math.max(menuCanvas.width, menuCanvas.height) * 0.7
    );
    grad.addColorStop(0, 'transparent');
    grad.addColorStop(1, 'rgba(0,0,0,0.4)');
    menuCtx.fillStyle = grad;
    menuCtx.fillRect(0, 0, menuCanvas.width, menuCanvas.height);

    menuRAF = requestAnimationFrame(animateMenu);
  };

  const stopMenu = () => {
    menuAnimating = false;
    if (menuRAF) cancelAnimationFrame(menuRAF);
  };

  const startMenu = () => {
    menuAnimating = true;
    animateMenu();
  };

  /* ── Win Celebration Particles ── */
  const resultCanvas = document.getElementById('result-canvas');
  const resultCtx = resultCanvas ? resultCanvas.getContext('2d') : null;
  let winParticles = [];
  let winAnimating = false;
  let winRAF = null;

  const resizeResultCanvas = () => {
    if (!resultCanvas) return;
    resultCanvas.width = window.innerWidth;
    resultCanvas.height = window.innerHeight;
  };

  /**
   * Start win celebration particle burst
   * @param {number} cx - Center X
   * @param {number} cy - Center Y
   * @param {number} count - Number of particles
   */
  const startWinCelebration = (cx, cy, count = 80) => {
    if (!resultCtx) return;
    winParticles = [];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Utils.randBetween(-0.2, 0.2);
      const speed = Utils.randBetween(3, 12);
      winParticles.push({
        x: cx, y: cy,
        vx: Math.cos(angle) * speed + Utils.randBetween(-2, 2),
        vy: Math.sin(angle) * speed + Utils.randBetween(-2, 2),
        size: Utils.randBetween(2, 10),
        size2: Utils.randBetween(4, 20),
        opacity: 1,
        gravity: Utils.randBetween(0.2, 0.5),
        rotation: Utils.randBetween(0, 360),
        rotSpeed: Utils.randBetween(-8, 8),
        shape: Utils.randItem(['rect', 'circle', 'stroke']),
        life: 1
      });
    }
    winAnimating = true;
    animateWin();
  };

  const animateWin = () => {
    if (!resultCtx || !winAnimating) return;
    resultCtx.clearRect(0, 0, resultCanvas.width, resultCanvas.height);

    let alive = false;
    winParticles.forEach(p => {
      if (p.life <= 0) return;
      alive = true;

      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= 0.99;
      p.rotation += p.rotSpeed;
      p.life -= 0.015;
      p.opacity = p.life;

      resultCtx.save();
      resultCtx.translate(p.x, p.y);
      resultCtx.rotate((p.rotation * Math.PI) / 180);
      resultCtx.globalAlpha = p.opacity;
      resultCtx.fillStyle = 'white';
      resultCtx.strokeStyle = 'white';

      if (p.shape === 'rect') {
        resultCtx.fillRect(-p.size / 2, -p.size2 / 2, p.size, p.size2);
      } else if (p.shape === 'circle') {
        resultCtx.beginPath();
        resultCtx.arc(0, 0, p.size, 0, Math.PI * 2);
        resultCtx.fill();
      } else {
        resultCtx.lineWidth = 2;
        resultCtx.beginPath();
        resultCtx.moveTo(0, -p.size2 / 2);
        resultCtx.lineTo(0, p.size2 / 2);
        resultCtx.stroke();
      }
      resultCtx.restore();
    });

    if (alive) {
      winRAF = requestAnimationFrame(animateWin);
    } else {
      winAnimating = false;
      resultCtx.clearRect(0, 0, resultCanvas.width, resultCanvas.height);
    }
  };

  const stopWinCelebration = () => {
    winAnimating = false;
    if (winRAF) cancelAnimationFrame(winRAF);
    if (resultCtx) resultCtx.clearRect(0, 0, resultCanvas.width, resultCanvas.height);
  };

  /* ── Ink Splash Effect ── */

  /**
   * Create an ink splash burst at position
   * @param {number} x
   * @param {number} y
   * @param {HTMLElement} container - Element to append splashes into
   */
  const createInkSplash = (x, y, container = document.body) => {
    const count = Utils.randInt(4, 8);
    for (let i = 0; i < count; i++) {
      const splash = document.createElement('div');
      splash.className = 'ink-splash';
      const size = Utils.randBetween(20, 60);
      splash.style.cssText = `
        left: ${x - size / 2}px;
        top: ${y - size / 2}px;
        width: ${size}px;
        height: ${size}px;
        position: fixed;
        pointer-events: none;
        z-index: 999;
        animation-duration: ${Utils.randBetween(0.3, 0.7)}s;
        animation-delay: ${Utils.randBetween(0, 0.1)}s;
      `;
      container.appendChild(splash);
      setTimeout(() => splash.remove(), 800);
    }
  };

  /* ── Init all & resize ── */
  const initAll = () => {
    resizeCursorCanvas();
    resizeMenuCanvas();
    resizeResultCanvas();

    // Cursor
    window.addEventListener('mousemove', updateCursor);
    window.addEventListener('touchmove', updateCursor, { passive: true });
    drawCursor();

    // Menu
    initMenuCanvas();
  };

  const resizeAll = () => {
    resizeCursorCanvas();
    resizeMenuCanvas();
    resizeResultCanvas();
  };

  window.addEventListener('resize', Utils.debounce(resizeAll, 200));

  return {
    initAll,
    stopMenu, startMenu,
    startWinCelebration, stopWinCelebration,
    createInkSplash,
    get cursorEnabled() { return cursorEnabled; },
    set cursorEnabled(v) { cursorEnabled = v; }
  };

})();

window.Particles = Particles;
