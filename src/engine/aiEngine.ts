import {
  GameState,
  GameMove,
  Piece,
  Turn,
  Difficulty,
  Position,
  getNeighbors,
  getCaptureTargets,
  getValidMovesForPiece,
  applyMove,
} from './gameEngine';

const BOARD_SIZE = 5;

const DEPTH_MAP: Record<Difficulty, number> = {
  easy: 2,
  medium: 4,
  hard: 6,
};

const RANDOM_MOVE_CHANCE: Record<Difficulty, number> = {
  easy: 0.3,
  medium: 0,
  hard: 0,
};

/**
 * Enumerate all legal moves for the current player.
 */
export function getAllMoves(state: GameState): GameMove[] {
  const moves: GameMove[] = [];

  if (state.turn === 'SHEEP' && state.phase === 'PLACEMENT') {
    // Every empty cell is a valid placement
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (state.board[r][c] === 'EMPTY') {
          moves.push({ type: 'place', to: [r, c] });
        }
      }
    }
    return moves;
  }

  // Movement phase (or kitty turn during placement)
  const piece: Piece = state.turn === 'SHEEP' ? 'SHEEP' : 'KITTY';

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (state.board[r][c] !== piece) continue;

      // Simple moves (step to adjacent empty)
      const neighbors = getNeighbors(r, c);
      for (const [nr, nc] of neighbors) {
        if (state.board[nr][nc] === 'EMPTY') {
          moves.push({ type: 'move', from: [r, c], to: [nr, nc] });
        }
      }

      // Capture moves (kittens only)
      if (piece === 'KITTY') {
        const captures = getCaptureTargets(state.board, r, c);
        for (const cap of captures) {
          moves.push({
            type: 'capture',
            from: [r, c],
            to: cap.to,
            captured: cap.captured,
          });
        }
      }
    }
  }

  return moves;
}

/**
 * Order moves for better alpha-beta pruning.
 * Captures first, then moves toward center.
 */
function orderMoves(moves: GameMove[]): GameMove[] {
  return moves.sort((a, b) => {
    // Captures first
    if (a.type === 'capture' && b.type !== 'capture') return -1;
    if (a.type !== 'capture' && b.type === 'capture') return 1;
    // Prefer center positions
    const centerDist = (pos: Position) => Math.abs(pos[0] - 2) + Math.abs(pos[1] - 2);
    return centerDist(a.to) - centerDist(b.to);
  });
}

/**
 * Evaluate board position. Positive favors kittens, negative favors sheep.
 */
function evaluate(state: GameState): number {
  // Terminal states
  if (state.winner === 'KITTY') return 10000;
  if (state.winner === 'SHEEP') return -10000;

  let score = 0;

  // Material: captured sheep strongly favor kittens
  score += state.sheepCaptured * 100;

  // Kitty mobility and threat analysis
  let kittyMobility = 0;
  let captureThreats = 0;
  let trappedKittens = 0;

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (state.board[r][c] === 'KITTY') {
        const moves = getValidMovesForPiece(state.board, r, c, 'KITTY');
        const captures = getCaptureTargets(state.board, r, c);
        kittyMobility += moves.length;
        captureThreats += captures.length;

        if (moves.length <= 1) {
          trappedKittens++;
        }

        // Center control bonus
        const centerDist = Math.abs(r - 2) + Math.abs(c - 2);
        score += (4 - centerDist) * 3;
      }
    }
  }

  score += kittyMobility * 10;
  score += captureThreats * 30;
  score -= trappedKittens * 25;

  // Sheep placement: more sheep on board gives sheep more blocking power
  if (state.phase === 'PLACEMENT') {
    score -= state.sheepPlaced * 2;
  }

  // In movement phase, evaluate sheep clustering near kittens
  if (state.phase === 'MOVEMENT') {
    // Penalize (from kitty perspective) sheep surrounding kittens
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (state.board[r][c] === 'KITTY') {
          const neighbors = getNeighbors(r, c);
          let sheepAround = 0;
          for (const [nr, nc] of neighbors) {
            if (state.board[nr][nc] === 'SHEEP') {
              sheepAround++;
            }
          }
          // More sheep around a kitty = worse for kittens
          score -= sheepAround * 5;
        }
      }
    }
  }

  return score;
}

/**
 * Minimax with alpha-beta pruning.
 */
function minimax(
  state: GameState,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
): number {
  if (depth === 0 || state.winner !== null) {
    return evaluate(state);
  }

  const moves = orderMoves(getAllMoves(state));
  if (moves.length === 0) {
    return evaluate(state);
  }

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      const newState = applyMove(state, move);
      // Next player: if it's still maximizing player's turn somehow, keep maximizing
      // Otherwise, the next player is the minimizer
      const nextIsMax = newState.turn === 'KITTY';
      const val = minimax(newState, depth - 1, alpha, beta, nextIsMax);
      maxEval = Math.max(maxEval, val);
      alpha = Math.max(alpha, val);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      const newState = applyMove(state, move);
      const nextIsMax = newState.turn === 'KITTY';
      const val = minimax(newState, depth - 1, alpha, beta, nextIsMax);
      minEval = Math.min(minEval, val);
      beta = Math.min(beta, val);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

/**
 * Find the best move for the current player at the given difficulty.
 */
export function findBestMove(state: GameState, difficulty: Difficulty): GameMove | null {
  const moves = getAllMoves(state);
  if (moves.length === 0) return null;

  // Random move chance for easier difficulties
  const randomChance = RANDOM_MOVE_CHANCE[difficulty];
  if (randomChance > 0 && Math.random() < randomChance) {
    return moves[Math.floor(Math.random() * moves.length)];
  }

  const depth = DEPTH_MAP[difficulty];
  const isMaximizing = state.turn === 'KITTY';

  let bestMove: GameMove = moves[0];
  let bestVal = isMaximizing ? -Infinity : Infinity;

  const orderedMoves = orderMoves(moves);

  for (const move of orderedMoves) {
    const newState = applyMove(state, move);
    const nextIsMax = newState.turn === 'KITTY';
    const val = minimax(newState, depth - 1, -Infinity, Infinity, nextIsMax);

    if (isMaximizing) {
      if (val > bestVal) {
        bestVal = val;
        bestMove = move;
      }
    } else {
      if (val < bestVal) {
        bestVal = val;
        bestMove = move;
      }
    }
  }

  return bestMove;
}
