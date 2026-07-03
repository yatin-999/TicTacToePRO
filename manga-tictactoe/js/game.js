/**
 * game.js — Core game logic and board rendering
 * Manga Tic Tac Toe — INK & CHAOS
 *
 * Manages:
 * - Board state
 * - Turn management
 * - Win/draw detection
 * - Score tracking
 * - Match history
 * - Cell interactions
 */

'use strict';

const Game = (() => {

  /* ── Game State ── */
  let board = Array(9).fill(null);
  let currentTurn = 'X';   // 'X' or 'O'
  let gameActive = false;
  let gameMode = 'local';   // 'local' | 'ai'
  let aiDifficulty = 'medium';
  let aiMark = 'O';
  let humanMark = 'X';
  let round = 1;
  let isProcessing = false; // Prevent double clicks

  /* ── Score ── */
  let scores = { p1: 0, p2: 0 };

  /* ── Getters ── */
  const getBoard = () => [...board];
  const getCurrentTurn = () => currentTurn;
  const isActive = () => gameActive;

  /* ════════════════════════════════════════
     BOARD INITIALIZATION
  ════════════════════════════════════════ */

  /**
   * Build the game board DOM
   */
  const buildBoard = () => {
    const boardEl = document.getElementById('game-board');
    if (!boardEl) return;
    boardEl.innerHTML = '';

    for (let i = 0; i < 9; i++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.index = i;
      cell.setAttribute('role', 'button');
      cell.setAttribute('aria-label', `Cell ${i + 1}`);
      cell.setAttribute('tabindex', '0');

      // Ghost hover preview container
      const ghost = document.createElement('div');
      ghost.className = 'cell-hover-ghost';
      // We'll update the ghost's content when turns change
      cell.appendChild(ghost);

      // Mark container
      const markContainer = document.createElement('div');
      markContainer.className = 'mark-container';
      cell.appendChild(markContainer);

      // Interaction events
      cell.addEventListener('click', () => onCellClick(i));
      cell.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onCellClick(i);
        }
      });
      cell.addEventListener('mouseenter', () => onCellHover(i, true));
      cell.addEventListener('mouseleave', () => onCellHover(i, false));

      boardEl.appendChild(cell);
    }
  };

  /**
   * Reset grid lines animation
   */
  const resetGridLines = () => {
    document.querySelectorAll('.grid-line').forEach(line => {
      line.style.strokeDashoffset = '300';
    });
    Animations.clearWinLine();
  };

  /* ════════════════════════════════════════
     GAME CONTROL
  ════════════════════════════════════════ */

  /**
   * Start a new game
   * @param {'local'|'ai'} mode
   * @param {'easy'|'medium'|'impossible'} difficulty
   */
  const startGame = (mode, difficulty = 'medium') => {
    gameMode = mode;
    aiDifficulty = difficulty;
    round = 1;
    scores = { p1: 0, p2: 0 };

    // Update player names from settings
    updatePlayerDisplay();
    updateScoreDisplay();

    newRound();
  };

  /**
   * Start a new round (reset board, keep scores)
   */
  const newRound = () => {
    board = Array(9).fill(null);
    currentTurn = 'X';
    gameActive = true;
    isProcessing = false;

    // Reset visual state
    buildBoard();
    resetGridLines();
    updateTurnIndicator();
    updateActivePlayer();
    updateHoverGhosts();

    // Animate board entrance
    Animations.animateBoardEntrance();

    // If AI goes first
    if (gameMode === 'ai' && aiMark === 'X') {
      triggerAIMove();
    }
  };

  /**
   * Restart the current round
   */
  const restart = () => {
    Animations.hideResult();
    newRound();
  };

  /* ════════════════════════════════════════
     CELL INTERACTION
  ════════════════════════════════════════ */

  /**
   * Handle cell hover
   */
  const onCellHover = (index, isEntering) => {
    const cell = getCellEl(index);
    if (!cell || board[index] !== null || !gameActive) return;

    if (isEntering) {
      AudioManager.hover();
      // Show ghost mark
      const ghost = cell.querySelector('.cell-hover-ghost');
      if (ghost) ghost.style.opacity = '0.12';
    } else {
      const ghost = cell.querySelector('.cell-hover-ghost');
      if (ghost) ghost.style.opacity = '0';
    }
  };

  /**
   * Handle cell click
   */
  const onCellClick = (index) => {
    if (!gameActive || isProcessing) return;
    if (board[index] !== null) return;
    // In AI mode, ignore if it's AI's turn
    if (gameMode === 'ai' && currentTurn === aiMark) return;

    AudioManager.click();
    placeMarker(index, currentTurn);
  };

  /**
   * Place a marker on the board
   */
  const placeMarker = async (index, mark) => {
    if (!gameActive) return;
    isProcessing = true;
    board[index] = mark;

    const cell = getCellEl(index);
    if (cell) {
      cell.classList.add('taken');
      cell.setAttribute('aria-label', `Cell ${index + 1}: ${mark}`);
      // Animate mark
      if (mark === 'X') {
        await new Promise(resolve => Animations.animateX(cell, resolve));
      } else {
        await new Promise(resolve => Animations.animateO(cell, resolve));
      }
    }

    // Check game result
    const result = checkGameResult();

    if (!result) {
      // Switch turn
      currentTurn = currentTurn === 'X' ? 'O' : 'X';
      updateTurnIndicator();
      updateActivePlayer();
      updateHoverGhosts();
      isProcessing = false;

      // AI turn
      if (gameMode === 'ai' && currentTurn === aiMark && gameActive) {
        triggerAIMove();
      }
    }
  };

  /* ════════════════════════════════════════
     AI TRIGGER
  ════════════════════════════════════════ */

  const triggerAIMove = async () => {
    if (!gameActive) return;
    isProcessing = true;
    try {
      const move = await AI.getMove(board, aiMark, humanMark, aiDifficulty);
      if (move !== -1 && gameActive) {
        await placeMarker(move, aiMark);
      }
    } catch (e) {
      console.error('AI error:', e);
      isProcessing = false;
    }
  };

  /* ════════════════════════════════════════
     WIN / DRAW DETECTION
  ════════════════════════════════════════ */

  /**
   * Check and handle game result
   * @returns {boolean} true if game is over
   */
  const checkGameResult = () => {
    // Check win
    for (const combo of AI.WIN_COMBOS) {
      const [a, b, c] = combo;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        handleWin(board[a], combo);
        return true;
      }
    }

    // Check draw
    if (board.every(cell => cell !== null)) {
      handleDraw();
      return true;
    }

    return false;
  };

  const handleWin = (winner, combo) => {
    gameActive = false;

    // Update scores
    const isP1 = (winner === 'X');
    if (isP1) scores.p1++;
    else scores.p2++;
    updateScoreDisplay(isP1);

    // Highlight cells
    const allCells = document.querySelectorAll('.cell');
    const winCells = combo.map(i => allCells[i]).filter(Boolean);
    const losingCells = [...allCells].filter(c => !combo.includes(parseInt(c.dataset.index)));

    winCells.forEach(c => c.classList.add('winning'));
    losingCells.forEach(c => c.classList.add('losing'));

    // Determine combo key for win line
    const comboKey = getComboKey(combo);
    Animations.animateWinLine(comboKey);

    // Win name
    const winnerName = isP1
      ? (document.getElementById('p1-name')?.textContent || 'PLAYER 1')
      : (document.getElementById('p2-name')?.textContent || 'PLAYER 2');

    // Stats
    const stats = Utils.loadStorage('inkChaos_stats', getDefaultStats());
    stats.totalGames++;
    if (isP1) stats.p1Wins++;
    else stats.p2Wins++;
    if (gameMode === 'ai' && !isP1) stats.aiWins++;
    stats.winStreak = isP1 ? (stats.winStreak + 1) : 0;
    addMatchHistory(stats, winner === 'X' ? 'P1 WIN' : 'P2 WIN', winnerName);
    Utils.saveStorage('inkChaos_stats', stats);

    // Cinematic sequence
    Animations.winSequence(winnerName, winCells, losingCells, () => {});

    round++;
  };

  const handleDraw = () => {
    gameActive = false;

    // Stats
    const stats = Utils.loadStorage('inkChaos_stats', getDefaultStats());
    stats.totalGames++;
    stats.draws++;
    stats.winStreak = 0;
    addMatchHistory(stats, 'DRAW', '—');
    Utils.saveStorage('inkChaos_stats', stats);

    Animations.drawSequence(() => {});
    round++;
  };

  /* ════════════════════════════════════════
     HELPERS
  ════════════════════════════════════════ */

  const getCellEl = (index) => document.querySelector(`.cell[data-index="${index}"]`);

  const getComboKey = (combo) => {
    const c = combo.sort((a, b) => a - b);
    if (c[0] === 0 && c[1] === 1 && c[2] === 2) return 'row0';
    if (c[0] === 3 && c[1] === 4 && c[2] === 5) return 'row1';
    if (c[0] === 6 && c[1] === 7 && c[2] === 8) return 'row2';
    if (c[0] === 0 && c[1] === 3 && c[2] === 6) return 'col0';
    if (c[0] === 1 && c[1] === 4 && c[2] === 7) return 'col1';
    if (c[0] === 2 && c[1] === 5 && c[2] === 8) return 'col2';
    if (c[0] === 0 && c[1] === 4 && c[2] === 8) return 'diag0';
    if (c[0] === 2 && c[1] === 4 && c[2] === 6) return 'diag1';
    return 'row0';
  };

  /* ════════════════════════════════════════
     DISPLAY UPDATES
  ════════════════════════════════════════ */

  const updateTurnIndicator = () => {
    const turnText = document.getElementById('turn-text');
    if (turnText) turnText.textContent = `ROUND ${round}`;
  };

  const updateActivePlayer = () => {
    const p1Card = document.getElementById('player1-card');
    const p2Card = document.getElementById('player2-card');
    if (!p1Card || !p2Card) return;

    if (currentTurn === 'X') {
      p1Card.classList.add('active');
      p2Card.classList.remove('active');
    } else {
      p1Card.classList.remove('active');
      p2Card.classList.add('active');
    }
  };

  const updateScoreDisplay = (p1Scored = false) => {
    const p1Score = document.getElementById('p1-score');
    const p2Score = document.getElementById('p2-score');
    if (p1Score) {
      p1Score.textContent = scores.p1;
      if (p1Scored) p1Score.classList.add('bump');
      setTimeout(() => p1Score?.classList.remove('bump'), 400);
    }
    if (p2Score) {
      p2Score.textContent = scores.p2;
      if (!p1Scored) {
        p2Score.classList.add('bump');
        setTimeout(() => p2Score?.classList.remove('bump'), 400);
      }
    }
  };

  const updatePlayerDisplay = () => {
    const settings = Utils.loadStorage('inkChaos_settings', {});
    const p1Name = settings.p1Name || AppState?.settings?.p1Name || 'PLAYER 1';
    const p2Name = gameMode === 'ai' ? 'AI' : (settings.p2Name || AppState?.settings?.p2Name || 'PLAYER 2');

    const p1NameEl = document.getElementById('p1-name');
    const p2NameEl = document.getElementById('p2-name');
    if (p1NameEl) p1NameEl.textContent = p1Name.toUpperCase();
    if (p2NameEl) p2NameEl.textContent = p2Name.toUpperCase();
  };

  /**
   * Update ghost (preview) marks in empty cells
   */
  const updateHoverGhosts = () => {
    document.querySelectorAll('.cell').forEach((cell, i) => {
      if (board[i] !== null) return;
      const ghost = cell.querySelector('.cell-hover-ghost');
      if (!ghost) return;
      ghost.innerHTML = currentTurn === 'X'
        ? `<svg viewBox="0 0 100 100" style="width:100%;height:100%;opacity:0.2">
             <line x1="15" y1="15" x2="85" y2="85" stroke="white" stroke-width="8" stroke-linecap="round"/>
             <line x1="85" y1="15" x2="15" y2="85" stroke="white" stroke-width="8" stroke-linecap="round"/>
           </svg>`
        : `<svg viewBox="0 0 100 100" style="width:100%;height:100%;opacity:0.2">
             <circle cx="50" cy="50" r="33" fill="none" stroke="white" stroke-width="7"/>
           </svg>`;
    });
  };

  /* ════════════════════════════════════════
     STATS HELPERS
  ════════════════════════════════════════ */

  const getDefaultStats = () => ({
    totalGames: 0,
    p1Wins: 0,
    p2Wins: 0,
    draws: 0,
    winStreak: 0,
    aiWins: 0,
    history: []
  });

  const addMatchHistory = (stats, result, winnerName) => {
    stats.history = stats.history || [];
    stats.history.unshift({
      result,
      winner: winnerName,
      date: new Date().toISOString(),
      mode: gameMode
    });
    // Keep only last 20
    if (stats.history.length > 20) stats.history = stats.history.slice(0, 20);
  };

  /* ════════════════════════════════════════
     AI MARK ASSIGNMENT
  ════════════════════════════════════════ */

  /**
   * Set AI vs Human marks
   * AI always plays as 'O', human as 'X' (can be customized)
   */
  const setAIMarks = (ai = 'O', human = 'X') => {
    aiMark = ai;
    humanMark = human;
  };

  return {
    startGame,
    newRound,
    restart,
    getBoard,
    getCurrentTurn,
    isActive,
    setAIMarks,
    updatePlayerDisplay
  };

})();

window.Game = Game;
