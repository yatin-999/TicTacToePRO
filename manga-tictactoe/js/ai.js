/**
 * ai.js — AI Engine with three difficulty modes
 * Manga Tic Tac Toe — INK & CHAOS
 *
 * Difficulties:
 *   Easy       — Random moves (30%), otherwise strategic (70%)
 *   Medium     — Plays optimally 70% of the time
 *   Impossible — Perfect minimax with alpha-beta pruning
 */

'use strict';

const AI = (() => {

  /* ── Win condition checks ── */
  const WIN_COMBOS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
    [0, 4, 8], [2, 4, 6]             // diags
  ];

  /**
   * Check if a board state has a winner
   * @param {Array} board - 9-cell array of 'X', 'O', or null
   * @returns {'X'|'O'|null}
   */
  const checkWinner = (board) => {
    for (const [a, b, c] of WIN_COMBOS) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    return null;
  };

  /**
   * Check if board is full (draw)
   */
  const isBoardFull = (board) => board.every(cell => cell !== null);

  /**
   * Get all available (empty) cells
   */
  const getAvailable = (board) => board.reduce((acc, cell, i) => {
    if (cell === null) acc.push(i);
    return acc;
  }, []);

  /* ════════════════════════════════════════
     MINIMAX WITH ALPHA-BETA PRUNING
  ════════════════════════════════════════ */

  /**
   * Minimax algorithm
   * @param {Array} board
   * @param {boolean} isMaximizing - true = AI's turn
   * @param {string} aiMark - AI's mark ('X' or 'O')
   * @param {string} humanMark
   * @param {number} alpha
   * @param {number} beta
   * @param {number} depth
   * @returns {number} score
   */
  const minimax = (board, isMaximizing, aiMark, humanMark, alpha, beta, depth = 0) => {
    const winner = checkWinner(board);
    if (winner === aiMark) return 10 - depth;
    if (winner === humanMark) return depth - 10;
    if (isBoardFull(board)) return 0;

    const available = getAvailable(board);

    if (isMaximizing) {
      let best = -Infinity;
      for (const i of available) {
        board[i] = aiMark;
        const score = minimax(board, false, aiMark, humanMark, alpha, beta, depth + 1);
        board[i] = null;
        best = Math.max(best, score);
        alpha = Math.max(alpha, best);
        if (beta <= alpha) break; // Prune
      }
      return best;
    } else {
      let best = Infinity;
      for (const i of available) {
        board[i] = humanMark;
        const score = minimax(board, true, aiMark, humanMark, alpha, beta, depth + 1);
        board[i] = null;
        best = Math.min(best, score);
        beta = Math.min(beta, best);
        if (beta <= alpha) break; // Prune
      }
      return best;
    }
  };

  /**
   * Find best move using minimax
   * @param {Array} board
   * @param {string} aiMark
   * @param {string} humanMark
   * @returns {number} index of best move
   */
  const bestMove = (board, aiMark, humanMark) => {
    const available = getAvailable(board);
    if (available.length === 0) return -1;

    let bestScore = -Infinity;
    let bestIdx = available[0];

    for (const i of available) {
      board[i] = aiMark;
      const score = minimax(board, false, aiMark, humanMark, -Infinity, Infinity, 0);
      board[i] = null;
      if (score > bestScore) {
        bestScore = score;
        bestIdx = i;
      }
    }
    return bestIdx;
  };

  /* ════════════════════════════════════════
     STRATEGIC HELPERS
  ════════════════════════════════════════ */

  /**
   * Find winning move for a player
   */
  const findWinningMove = (board, mark) => {
    const available = getAvailable(board);
    for (const i of available) {
      board[i] = mark;
      if (checkWinner(board)) {
        board[i] = null;
        return i;
      }
      board[i] = null;
    }
    return -1;
  };

  /**
   * Get strategic move (center > corners > edges)
   */
  const getStrategicMove = (board) => {
    const available = getAvailable(board);
    // Center
    if (board[4] === null) return 4;
    // Corners
    const corners = [0, 2, 6, 8].filter(i => available.includes(i));
    if (corners.length) return Utils.randItem(corners);
    // Edges
    const edges = [1, 3, 5, 7].filter(i => available.includes(i));
    if (edges.length) return Utils.randItem(edges);
    return available[0];
  };

  /* ════════════════════════════════════════
     DIFFICULTY IMPLEMENTATIONS
  ════════════════════════════════════════ */

  /**
   * Easy — Mostly random, sometimes strategic
   */
  const easyMove = (board, aiMark, humanMark) => {
    const available = getAvailable(board);
    if (available.length === 0) return -1;

    // 40% chance: play random
    if (Math.random() < 0.4) return Utils.randItem(available);
    // Win if possible
    const win = findWinningMove(board, aiMark);
    if (win !== -1) return win;
    // Otherwise random
    return Utils.randItem(available);
  };

  /**
   * Medium — Blocks wins, plays strategically 70%
   */
  const mediumMove = (board, aiMark, humanMark) => {
    const available = getAvailable(board);
    if (available.length === 0) return -1;

    // Win if possible
    const win = findWinningMove(board, aiMark);
    if (win !== -1) return win;

    // Block opponent win
    const block = findWinningMove(board, humanMark);
    if (block !== -1) return block;

    // 70% chance: strategic; 30%: random
    if (Math.random() < 0.7) return getStrategicMove(board);
    return Utils.randItem(available);
  };

  /**
   * Impossible — Perfect minimax
   */
  const impossibleMove = (board, aiMark, humanMark) => {
    return bestMove(board, aiMark, humanMark);
  };

  /* ════════════════════════════════════════
     PUBLIC API
  ════════════════════════════════════════ */

  /**
   * Get AI's next move
   * @param {Array} board - Current 9-cell board
   * @param {string} aiMark - AI's mark ('X' or 'O')
   * @param {string} humanMark - Human's mark
   * @param {'easy'|'medium'|'impossible'} difficulty
   * @returns {Promise<number>} Promise resolving to the chosen cell index
   */
  const getMove = (board, aiMark, humanMark, difficulty) => {
    return new Promise((resolve) => {
      // Simulate thinking delay
      const delay = {
        easy: Utils.randBetween(300, 600),
        medium: Utils.randBetween(400, 800),
        impossible: Utils.randBetween(600, 1200)
      }[difficulty] || 500;

      // Show thinking animation
      Animations.showAIThinking();
      // Tick sounds
      let ticks = 0;
      const tickInterval = setInterval(() => {
        AudioManager.thinking();
        ticks++;
        if (ticks >= 3) clearInterval(tickInterval);
      }, delay / 4);

      setTimeout(() => {
        Animations.hideAIThinking();
        clearInterval(tickInterval);

        let move;
        const boardCopy = [...board];

        switch (difficulty) {
          case 'easy':      move = easyMove(boardCopy, aiMark, humanMark); break;
          case 'medium':    move = mediumMove(boardCopy, aiMark, humanMark); break;
          case 'impossible':move = impossibleMove(boardCopy, aiMark, humanMark); break;
          default:          move = easyMove(boardCopy, aiMark, humanMark);
        }

        resolve(move);
      }, delay);
    });
  };

  return { getMove, checkWinner, isBoardFull, WIN_COMBOS };

})();

window.AI = AI;
