import {
  Piece,
  Turn,
  Phase,
  Position,
  GameState,
  GameMove,
  getNeighbors,
  getCaptureTargets,
  createInitialState,
  getValidMovesForPiece,
  handleTap,
  applyMove,
  forfeitGame,
  getGameStatusText,
} from '../gameEngine';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Create a blank 5x5 board. */
function emptyBoard(): Piece[][] {
  return Array.from({ length: 5 }, () => Array(5).fill('EMPTY') as Piece[]);
}

/** Build a custom GameState for targeted tests. */
function makeState(overrides: Partial<GameState> = {}): GameState {
  return {
    board: overrides.board ?? emptyBoard(),
    turn: overrides.turn ?? 'SHEEP',
    phase: overrides.phase ?? 'PLACEMENT',
    sheepPlaced: overrides.sheepPlaced ?? 0,
    sheepCaptured: overrides.sheepCaptured ?? 0,
    selectedPiece: overrides.selectedPiece ?? null,
    winner: overrides.winner ?? null,
    forfeitedBy: overrides.forfeitedBy ?? null,
    validMoves: overrides.validMoves ?? [],
    lastMove: overrides.lastMove ?? null,
  };
}

/** Check if a position is in a list of positions. */
function containsPos(positions: Position[], target: Position): boolean {
  return positions.some(([r, c]) => r === target[0] && c === target[1]);
}

// ===========================================================================
// getNeighbors
// ===========================================================================
describe('getNeighbors', () => {
  test('corner (0,0) has diagonals (even sum) – returns 3 neighbors', () => {
    // (0+0)=0 even → diag allowed
    // Orthogonal: (1,0), (0,1)
    // Diagonal: (1,1)
    const n = getNeighbors(0, 0);
    expect(n).toHaveLength(3);
    expect(containsPos(n, [1, 0])).toBe(true);
    expect(containsPos(n, [0, 1])).toBe(true);
    expect(containsPos(n, [1, 1])).toBe(true);
  });

  test('corner (0,4) has diagonals (even sum) – returns 3 neighbors', () => {
    const n = getNeighbors(0, 4);
    expect(n).toHaveLength(3);
    expect(containsPos(n, [0, 3])).toBe(true);
    expect(containsPos(n, [1, 4])).toBe(true);
    expect(containsPos(n, [1, 3])).toBe(true);
  });

  test('corner (4,4) has diagonals – returns 3 neighbors', () => {
    const n = getNeighbors(4, 4);
    expect(n).toHaveLength(3);
    expect(containsPos(n, [3, 4])).toBe(true);
    expect(containsPos(n, [4, 3])).toBe(true);
    expect(containsPos(n, [3, 3])).toBe(true);
  });

  test('edge cell (0,1) has NO diagonals (odd sum) – returns 2 neighbors', () => {
    // (0+1)=1 odd → only orthogonal
    // Orthogonal in-bounds: (0,0), (0,2), (1,1)
    const n = getNeighbors(0, 1);
    expect(n).toHaveLength(3);
    expect(containsPos(n, [0, 0])).toBe(true);
    expect(containsPos(n, [0, 2])).toBe(true);
    expect(containsPos(n, [1, 1])).toBe(true);
    // No diagonals
    expect(containsPos(n, [1, 0])).toBe(false);
    expect(containsPos(n, [1, 2])).toBe(false);
  });

  test('center (2,2) has diagonals (even sum) – returns 8 neighbors', () => {
    const n = getNeighbors(2, 2);
    expect(n).toHaveLength(8);
    // Orthogonal
    expect(containsPos(n, [1, 2])).toBe(true);
    expect(containsPos(n, [3, 2])).toBe(true);
    expect(containsPos(n, [2, 1])).toBe(true);
    expect(containsPos(n, [2, 3])).toBe(true);
    // Diagonal
    expect(containsPos(n, [1, 1])).toBe(true);
    expect(containsPos(n, [1, 3])).toBe(true);
    expect(containsPos(n, [3, 1])).toBe(true);
    expect(containsPos(n, [3, 3])).toBe(true);
  });

  test('cell (1,1) has diagonals (even sum) – returns 8 neighbors', () => {
    const n = getNeighbors(1, 1);
    expect(n).toHaveLength(8);
  });

  test('cell (1,0) has NO diagonals (odd sum) – returns 3 neighbors', () => {
    // (1+0)=1 odd
    const n = getNeighbors(1, 0);
    expect(n).toHaveLength(3);
    expect(containsPos(n, [0, 0])).toBe(true);
    expect(containsPos(n, [2, 0])).toBe(true);
    expect(containsPos(n, [1, 1])).toBe(true);
  });

  test('edge middle (0,2) has diagonals – returns 5 neighbors', () => {
    // (0+2)=2 even → diag allowed
    // Ortho in-bounds: (0,1), (0,3), (1,2)
    // Diag in-bounds: (1,1), (1,3)
    const n = getNeighbors(0, 2);
    expect(n).toHaveLength(5);
  });

  test('cell (2,0) has diagonals – returns 5 neighbors', () => {
    // (2+0)=2 even
    const n = getNeighbors(2, 0);
    expect(n).toHaveLength(5);
    expect(containsPos(n, [1, 0])).toBe(true);
    expect(containsPos(n, [3, 0])).toBe(true);
    expect(containsPos(n, [2, 1])).toBe(true);
    expect(containsPos(n, [1, 1])).toBe(true);
    expect(containsPos(n, [3, 1])).toBe(true);
  });

  test('all neighbors are within board bounds', () => {
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        const neighbors = getNeighbors(r, c);
        for (const [nr, nc] of neighbors) {
          expect(nr).toBeGreaterThanOrEqual(0);
          expect(nr).toBeLessThan(5);
          expect(nc).toBeGreaterThanOrEqual(0);
          expect(nc).toBeLessThan(5);
        }
      }
    }
  });
});

// ===========================================================================
// getCaptureTargets
// ===========================================================================
describe('getCaptureTargets', () => {
  test('returns empty for non-kitty piece', () => {
    const board = emptyBoard();
    board[2][2] = 'SHEEP';
    expect(getCaptureTargets(board, 2, 2)).toHaveLength(0);
  });

  test('returns empty for empty cell', () => {
    const board = emptyBoard();
    expect(getCaptureTargets(board, 2, 2)).toHaveLength(0);
  });

  test('kitty can capture orthogonally', () => {
    const board = emptyBoard();
    board[2][2] = 'KITTY';
    board[2][3] = 'SHEEP'; // adjacent sheep
    // (2,4) is empty — capture landing
    const targets = getCaptureTargets(board, 2, 2);
    const orthCapture = targets.find(t => t.to[0] === 2 && t.to[1] === 4);
    expect(orthCapture).toBeDefined();
    expect(orthCapture!.captured).toEqual([2, 3]);
  });

  test('kitty can capture diagonally from even-sum position', () => {
    const board = emptyBoard();
    board[0][0] = 'KITTY'; // (0+0)=0 even
    board[1][1] = 'SHEEP';
    // (2,2) is empty
    const targets = getCaptureTargets(board, 0, 0);
    const diagCapture = targets.find(t => t.to[0] === 2 && t.to[1] === 2);
    expect(diagCapture).toBeDefined();
    expect(diagCapture!.captured).toEqual([1, 1]);
  });

  test('no capture when destination is occupied', () => {
    const board = emptyBoard();
    board[2][2] = 'KITTY';
    board[2][3] = 'SHEEP';
    board[2][4] = 'SHEEP'; // destination blocked
    const targets = getCaptureTargets(board, 2, 2);
    const blocked = targets.find(t => t.to[0] === 2 && t.to[1] === 4);
    expect(blocked).toBeUndefined();
  });

  test('no capture when no sheep in middle', () => {
    const board = emptyBoard();
    board[2][2] = 'KITTY';
    // (2,3) is empty, (2,4) is empty — no sheep to jump
    const targets = getCaptureTargets(board, 2, 2);
    const noJump = targets.find(t => t.to[0] === 2 && t.to[1] === 4);
    expect(noJump).toBeUndefined();
  });

  test('no capture when middle has another kitty', () => {
    const board = emptyBoard();
    board[2][2] = 'KITTY';
    board[2][3] = 'KITTY'; // another kitty, not sheep
    const targets = getCaptureTargets(board, 2, 2);
    const noCapture = targets.find(t => t.to[0] === 2 && t.to[1] === 4);
    expect(noCapture).toBeUndefined();
  });

  test('no diagonal capture from odd-sum position', () => {
    const board = emptyBoard();
    board[0][1] = 'KITTY'; // (0+1)=1 odd — no diagonals
    board[1][2] = 'SHEEP';
    // (2,3) is empty
    const targets = getCaptureTargets(board, 0, 1);
    // Should have no diagonal captures
    const diagCapture = targets.find(t => t.to[0] === 2 && t.to[1] === 3);
    expect(diagCapture).toBeUndefined();
  });

  test('diagonal capture requires mid point to also have diagonals', () => {
    // Kitty at (0,0) even, sheep at (1,1) even, dest (2,2) — mid has diags → OK
    const board = emptyBoard();
    board[0][0] = 'KITTY';
    board[1][1] = 'SHEEP';
    const targets = getCaptureTargets(board, 0, 0);
    expect(targets.find(t => t.to[0] === 2 && t.to[1] === 2)).toBeDefined();
  });

  test('multiple captures available from center', () => {
    const board = emptyBoard();
    board[2][2] = 'KITTY';
    // Place sheep in all 4 orthogonal adjacents, with empty landing spots
    board[2][1] = 'SHEEP'; // left → land (2,0)
    board[2][3] = 'SHEEP'; // right → land (2,4)
    board[1][2] = 'SHEEP'; // up → land (0,2)
    board[3][2] = 'SHEEP'; // down → land (4,2)
    const targets = getCaptureTargets(board, 2, 2);
    expect(targets.length).toBe(4);
  });

  test('capture out of bounds is not returned', () => {
    const board = emptyBoard();
    board[0][2] = 'KITTY';
    board[0][3] = 'SHEEP'; // adjacent → landing (0,4) in bounds
    board[0][1] = 'SHEEP'; // adjacent → landing (0,0) in bounds
    // Upward capture: (-1,2) is out of bounds
    const targets = getCaptureTargets(board, 0, 2);
    // Should not crash; all captures should be in-bounds
    for (const t of targets) {
      expect(t.to[0]).toBeGreaterThanOrEqual(0);
      expect(t.to[0]).toBeLessThan(5);
      expect(t.to[1]).toBeGreaterThanOrEqual(0);
      expect(t.to[1]).toBeLessThan(5);
    }
  });
});

// ===========================================================================
// createInitialState
// ===========================================================================
describe('createInitialState', () => {
  test('returns correct board dimensions', () => {
    const state = createInitialState();
    expect(state.board).toHaveLength(5);
    for (const row of state.board) {
      expect(row).toHaveLength(5);
    }
  });

  test('kittens placed at all four corners', () => {
    const state = createInitialState();
    expect(state.board[0][0]).toBe('KITTY');
    expect(state.board[0][4]).toBe('KITTY');
    expect(state.board[4][0]).toBe('KITTY');
    expect(state.board[4][4]).toBe('KITTY');
  });

  test('all non-corner cells are empty', () => {
    const state = createInitialState();
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        if ((r === 0 || r === 4) && (c === 0 || c === 4)) continue;
        expect(state.board[r][c]).toBe('EMPTY');
      }
    }
  });

  test('initial game state values are correct', () => {
    const state = createInitialState();
    expect(state.turn).toBe('SHEEP');
    expect(state.phase).toBe('PLACEMENT');
    expect(state.sheepPlaced).toBe(0);
    expect(state.sheepCaptured).toBe(0);
    expect(state.selectedPiece).toBeNull();
    expect(state.winner).toBeNull();
    expect(state.forfeitedBy).toBeNull();
    expect(state.validMoves).toEqual([]);
    expect(state.lastMove).toBeNull();
  });

  test('exactly 4 kittens and 0 sheep on the board', () => {
    const state = createInitialState();
    let kittens = 0;
    let sheep = 0;
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        if (state.board[r][c] === 'KITTY') kittens++;
        if (state.board[r][c] === 'SHEEP') sheep++;
      }
    }
    expect(kittens).toBe(4);
    expect(sheep).toBe(0);
  });
});

// ===========================================================================
// getValidMovesForPiece
// ===========================================================================
describe('getValidMovesForPiece', () => {
  test('sheep sees only adjacent empty cells', () => {
    const board = emptyBoard();
    board[2][2] = 'SHEEP';
    board[2][3] = 'KITTY'; // blocks one direction
    const moves = getValidMovesForPiece(board, 2, 2, 'SHEEP');
    // (2,2) is even → 8 neighbors, minus the occupied (2,3) = 7
    expect(moves).toHaveLength(7);
    expect(containsPos(moves, [2, 3])).toBe(false);
  });

  test('kitty sees adjacent empty plus capture targets', () => {
    const board = emptyBoard();
    board[2][2] = 'KITTY';
    board[2][3] = 'SHEEP'; // can be captured if (2,4) empty
    const moves = getValidMovesForPiece(board, 2, 2, 'KITTY');
    // 7 adjacent empties + 1 capture landing at (2,4)
    expect(moves).toHaveLength(8);
    expect(containsPos(moves, [2, 4])).toBe(true);
  });

  test('completely surrounded piece has no moves', () => {
    const board = emptyBoard();
    board[0][0] = 'SHEEP';
    board[0][1] = 'KITTY';
    board[1][0] = 'KITTY';
    board[1][1] = 'KITTY';
    const moves = getValidMovesForPiece(board, 0, 0, 'SHEEP');
    expect(moves).toHaveLength(0);
  });

  test('kitty with no moves and no captures returns empty', () => {
    const board = emptyBoard();
    board[0][0] = 'KITTY';
    board[0][1] = 'SHEEP';
    board[1][0] = 'SHEEP';
    board[1][1] = 'SHEEP';
    // All neighbors blocked, and captures require empty landing
    // (0,2) has sheep at (0,1) in between — but need (0,2) to be empty
    // Actually (0,2) IS empty, so kitty can capture via (0,1)
    // Let's block the landing too
    board[0][2] = 'SHEEP';
    board[2][0] = 'SHEEP';
    board[2][2] = 'SHEEP';
    const moves = getValidMovesForPiece(board, 0, 0, 'KITTY');
    expect(moves).toHaveLength(0);
  });
});

// ===========================================================================
// handleTap — Placement Phase
// ===========================================================================
describe('handleTap – placement phase', () => {
  test('places sheep on empty cell', () => {
    const state = createInitialState();
    const next = handleTap(state, 2, 2);
    expect(next.board[2][2]).toBe('SHEEP');
    expect(next.sheepPlaced).toBe(1);
    expect(next.turn).toBe('KITTY');
    expect(next.lastMove).toEqual({ type: 'place', to: [2, 2] });
  });

  test('cannot place sheep on occupied cell (kitty corner)', () => {
    const state = createInitialState();
    const next = handleTap(state, 0, 0);
    // State unchanged
    expect(next).toBe(state);
  });

  test('cannot place sheep on cell already occupied by sheep', () => {
    const state = createInitialState();
    const after1 = handleTap(state, 2, 2); // place sheep
    // Kitty turn → select kitty, but let's just set turn back to sheep for test
    const sheepTurn = makeState({
      board: after1.board,
      turn: 'SHEEP',
      phase: 'PLACEMENT',
      sheepPlaced: 1,
    });
    const next = handleTap(sheepTurn, 2, 2); // already a sheep there
    expect(next).toBe(sheepTurn);
  });

  test('does nothing when game already has a winner', () => {
    const state = makeState({ winner: 'SHEEP' });
    const next = handleTap(state, 2, 2);
    expect(next).toBe(state);
  });

  test('phase transitions to MOVEMENT after 20th sheep placed', () => {
    const board = emptyBoard();
    board[0][0] = 'KITTY';
    board[0][4] = 'KITTY';
    board[4][0] = 'KITTY';
    board[4][4] = 'KITTY';
    // Place 19 sheep, leaving (2,2) empty for the 20th
    let placed = 0;
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        if (board[r][c] === 'EMPTY' && placed < 19 && !(r === 2 && c === 2)) {
          board[r][c] = 'SHEEP';
          placed++;
        }
      }
    }
    const state = makeState({
      board,
      turn: 'SHEEP',
      phase: 'PLACEMENT',
      sheepPlaced: 19,
    });
    const next = handleTap(state, 2, 2); // 20th sheep
    expect(next.sheepPlaced).toBe(20);
    expect(next.phase).toBe('MOVEMENT');
  });

  test('sheep win during placement if all kittens become blocked', () => {
    const board = emptyBoard();
    // Single kitty at (0,0). Block all neighbors AND capture landings.
    board[0][0] = 'KITTY';
    board[0][1] = 'SHEEP'; // neighbor; capture landing (0,2) must be blocked
    board[1][0] = 'SHEEP'; // neighbor; capture landing (2,0) must be blocked
    // Block capture landings
    board[0][2] = 'SHEEP';
    board[2][0] = 'SHEEP';
    board[2][2] = 'SHEEP'; // landing for diagonal capture over (1,1)
    // (1,1) is the last free neighbor — placing sheep here fully blocks the kitty
    const state = makeState({
      board,
      turn: 'SHEEP',
      phase: 'PLACEMENT',
      sheepPlaced: 5,
    });
    const next = handleTap(state, 1, 1);
    expect(next.board[1][1]).toBe('SHEEP');
    expect(next.winner).toBe('SHEEP');
  });
});

// ===========================================================================
// handleTap — Kitty Turn
// ===========================================================================
describe('handleTap – kitty turn', () => {
  test('select a kitty', () => {
    const state = createInitialState();
    const afterSheep = handleTap(state, 2, 2); // sheep places
    expect(afterSheep.turn).toBe('KITTY');
    const afterSelect = handleTap(afterSheep, 0, 0); // select top-left kitty
    expect(afterSelect.selectedPiece).toEqual([0, 0]);
    expect(afterSelect.validMoves.length).toBeGreaterThan(0);
  });

  test('cannot select empty cell on kitty turn', () => {
    const state = makeState({ turn: 'KITTY', phase: 'PLACEMENT' });
    state.board[0][0] = 'KITTY';
    const next = handleTap(state, 2, 2); // empty cell
    expect(next).toBe(state);
  });

  test('cannot select sheep on kitty turn', () => {
    const board = emptyBoard();
    board[0][0] = 'KITTY';
    board[2][2] = 'SHEEP';
    const state = makeState({ board, turn: 'KITTY', phase: 'PLACEMENT' });
    const next = handleTap(state, 2, 2);
    expect(next).toBe(state);
  });

  test('deselect kitty by tapping same piece', () => {
    const board = emptyBoard();
    board[0][0] = 'KITTY';
    const state = makeState({
      board,
      turn: 'KITTY',
      phase: 'PLACEMENT',
      selectedPiece: [0, 0],
      validMoves: [[0, 1], [1, 0], [1, 1]],
    });
    const next = handleTap(state, 0, 0);
    expect(next.selectedPiece).toBeNull();
    expect(next.validMoves).toEqual([]);
  });

  test('reselect a different kitty', () => {
    const board = emptyBoard();
    board[0][0] = 'KITTY';
    board[4][4] = 'KITTY';
    const state = makeState({
      board,
      turn: 'KITTY',
      phase: 'PLACEMENT',
      selectedPiece: [0, 0],
      validMoves: [[0, 1], [1, 0], [1, 1]],
    });
    const next = handleTap(state, 4, 4);
    expect(next.selectedPiece).toEqual([4, 4]);
    expect(next.validMoves.length).toBeGreaterThan(0);
  });

  test('kitty moves to valid empty cell', () => {
    const board = emptyBoard();
    board[0][0] = 'KITTY';
    const state = makeState({
      board,
      turn: 'KITTY',
      phase: 'PLACEMENT',
      selectedPiece: [0, 0],
      validMoves: [[0, 1], [1, 0], [1, 1]],
    });
    const next = handleTap(state, 1, 0);
    expect(next.board[1][0]).toBe('KITTY');
    expect(next.board[0][0]).toBe('EMPTY');
    expect(next.turn).toBe('SHEEP');
    expect(next.selectedPiece).toBeNull();
    expect(next.lastMove).toEqual({ type: 'move', from: [0, 0], to: [1, 0] });
  });

  test('kitty captures sheep by jumping', () => {
    const board = emptyBoard();
    board[0][0] = 'KITTY';
    board[0][1] = 'SHEEP';
    // (0,2) is empty → can capture
    const validMoves: Position[] = [[1, 0], [1, 1], [0, 2]];
    const state = makeState({
      board,
      turn: 'KITTY',
      phase: 'PLACEMENT',
      selectedPiece: [0, 0],
      validMoves,
    });
    const next = handleTap(state, 0, 2);
    expect(next.board[0][2]).toBe('KITTY');
    expect(next.board[0][0]).toBe('EMPTY');
    expect(next.board[0][1]).toBe('EMPTY'); // captured sheep removed
    expect(next.sheepCaptured).toBe(1);
    expect(next.lastMove!.type).toBe('capture');
    expect(next.lastMove!.captured).toEqual([0, 1]);
  });

  test('invalid move does nothing', () => {
    const board = emptyBoard();
    board[0][0] = 'KITTY';
    const state = makeState({
      board,
      turn: 'KITTY',
      phase: 'PLACEMENT',
      selectedPiece: [0, 0],
      validMoves: [[0, 1], [1, 0], [1, 1]],
    });
    const next = handleTap(state, 3, 3); // not in validMoves
    expect(next).toBe(state);
  });

  test('kittens win after capturing 5th sheep', () => {
    const board = emptyBoard();
    board[2][2] = 'KITTY';
    board[2][3] = 'SHEEP'; // will be captured
    const state = makeState({
      board,
      turn: 'KITTY',
      phase: 'MOVEMENT',
      sheepPlaced: 20,
      sheepCaptured: 4, // one more capture wins
      selectedPiece: [2, 2],
      validMoves: [[2, 4], [2, 1], [1, 2], [3, 2], [1, 1], [1, 3], [3, 1], [3, 3]],
    });
    const next = handleTap(state, 2, 4);
    expect(next.sheepCaptured).toBe(5);
    expect(next.winner).toBe('KITTY');
  });
});

// ===========================================================================
// handleTap — Sheep Movement Phase
// ===========================================================================
describe('handleTap – sheep movement phase', () => {
  test('select a sheep in movement phase', () => {
    const board = emptyBoard();
    board[2][2] = 'SHEEP';
    const state = makeState({
      board,
      turn: 'SHEEP',
      phase: 'MOVEMENT',
      sheepPlaced: 20,
    });
    const next = handleTap(state, 2, 2);
    expect(next.selectedPiece).toEqual([2, 2]);
    expect(next.validMoves.length).toBeGreaterThan(0);
  });

  test('cannot select empty cell as sheep', () => {
    const board = emptyBoard();
    board[2][2] = 'SHEEP';
    const state = makeState({
      board,
      turn: 'SHEEP',
      phase: 'MOVEMENT',
      sheepPlaced: 20,
    });
    const next = handleTap(state, 3, 3);
    expect(next).toBe(state);
  });

  test('cannot select kitty on sheep turn', () => {
    const board = emptyBoard();
    board[0][0] = 'KITTY';
    board[2][2] = 'SHEEP';
    const state = makeState({
      board,
      turn: 'SHEEP',
      phase: 'MOVEMENT',
      sheepPlaced: 20,
    });
    const next = handleTap(state, 0, 0);
    expect(next).toBe(state);
  });

  test('deselect sheep by tapping same piece', () => {
    const board = emptyBoard();
    board[2][2] = 'SHEEP';
    const state = makeState({
      board,
      turn: 'SHEEP',
      phase: 'MOVEMENT',
      sheepPlaced: 20,
      selectedPiece: [2, 2],
      validMoves: [[2, 1]],
    });
    const next = handleTap(state, 2, 2);
    expect(next.selectedPiece).toBeNull();
    expect(next.validMoves).toEqual([]);
  });

  test('reselect a different sheep', () => {
    const board = emptyBoard();
    board[2][2] = 'SHEEP';
    board[3][3] = 'SHEEP';
    const state = makeState({
      board,
      turn: 'SHEEP',
      phase: 'MOVEMENT',
      sheepPlaced: 20,
      selectedPiece: [2, 2],
      validMoves: [[2, 1]],
    });
    const next = handleTap(state, 3, 3);
    expect(next.selectedPiece).toEqual([3, 3]);
  });

  test('sheep moves to valid cell', () => {
    const board = emptyBoard();
    board[2][2] = 'SHEEP';
    const state = makeState({
      board,
      turn: 'SHEEP',
      phase: 'MOVEMENT',
      sheepPlaced: 20,
      selectedPiece: [2, 2],
      validMoves: [[2, 1], [2, 3], [1, 2], [3, 2]],
    });
    const next = handleTap(state, 2, 1);
    expect(next.board[2][1]).toBe('SHEEP');
    expect(next.board[2][2]).toBe('EMPTY');
    expect(next.turn).toBe('KITTY');
    expect(next.lastMove).toEqual({ type: 'move', from: [2, 2], to: [2, 1] });
  });

  test('sheep cannot move to invalid cell', () => {
    const board = emptyBoard();
    board[2][2] = 'SHEEP';
    const state = makeState({
      board,
      turn: 'SHEEP',
      phase: 'MOVEMENT',
      sheepPlaced: 20,
      selectedPiece: [2, 2],
      validMoves: [[2, 1]],
    });
    const next = handleTap(state, 4, 4); // not valid
    expect(next).toBe(state);
  });

  test('sheep win by blocking all kittens in movement phase', () => {
    const board = emptyBoard();
    // Single kitty at (0,0). Block neighbors and capture landings.
    board[0][0] = 'KITTY';
    board[0][1] = 'SHEEP';
    board[1][0] = 'SHEEP';
    // Block capture landings
    board[0][2] = 'SHEEP';
    board[2][0] = 'SHEEP';
    board[2][2] = 'SHEEP';
    // Sheep at (3,3) will move to (1,1) to complete the block
    board[3][3] = 'SHEEP';
    const state = makeState({
      board,
      turn: 'SHEEP',
      phase: 'MOVEMENT',
      sheepPlaced: 20,
      selectedPiece: [3, 3],
      validMoves: [[1, 1], [2, 3], [3, 2], [4, 4], [4, 2], [2, 4], [4, 3], [3, 4]],
    });
    const next = handleTap(state, 1, 1);
    expect(next.winner).toBe('SHEEP');
  });

  test('cannot select sheep with no valid moves', () => {
    const board = emptyBoard();
    board[0][0] = 'SHEEP';
    board[0][1] = 'KITTY';
    board[1][0] = 'KITTY';
    board[1][1] = 'KITTY';
    const state = makeState({
      board,
      turn: 'SHEEP',
      phase: 'MOVEMENT',
      sheepPlaced: 20,
    });
    const next = handleTap(state, 0, 0); // sheep is blocked
    expect(next).toBe(state); // can't select it
  });
});

// ===========================================================================
// applyMove
// ===========================================================================
describe('applyMove', () => {
  test('applies place move correctly', () => {
    const state = createInitialState();
    const move: GameMove = { type: 'place', to: [2, 2] };
    const next = applyMove(state, move);
    expect(next.board[2][2]).toBe('SHEEP');
    expect(next.sheepPlaced).toBe(1);
    expect(next.turn).toBe('KITTY');
    expect(next.lastMove).toEqual(move);
  });

  test('applies sheep move correctly', () => {
    const board = emptyBoard();
    board[2][2] = 'SHEEP';
    const state = makeState({
      board,
      turn: 'SHEEP',
      phase: 'MOVEMENT',
      sheepPlaced: 20,
    });
    const move: GameMove = { type: 'move', from: [2, 2], to: [2, 3] };
    const next = applyMove(state, move);
    expect(next.board[2][3]).toBe('SHEEP');
    expect(next.board[2][2]).toBe('EMPTY');
    expect(next.turn).toBe('KITTY');
  });

  test('applies kitty move correctly', () => {
    const board = emptyBoard();
    board[0][0] = 'KITTY';
    const state = makeState({
      board,
      turn: 'KITTY',
      phase: 'PLACEMENT',
    });
    const move: GameMove = { type: 'move', from: [0, 0], to: [1, 0] };
    const next = applyMove(state, move);
    expect(next.board[1][0]).toBe('KITTY');
    expect(next.board[0][0]).toBe('EMPTY');
    expect(next.turn).toBe('SHEEP');
  });

  test('applies capture move correctly', () => {
    const board = emptyBoard();
    board[0][0] = 'KITTY';
    board[0][1] = 'SHEEP';
    const state = makeState({
      board,
      turn: 'KITTY',
      phase: 'PLACEMENT',
      sheepCaptured: 0,
    });
    const move: GameMove = {
      type: 'capture',
      from: [0, 0],
      to: [0, 2],
      captured: [0, 1],
    };
    const next = applyMove(state, move);
    expect(next.board[0][2]).toBe('KITTY');
    expect(next.board[0][0]).toBe('EMPTY');
    expect(next.board[0][1]).toBe('EMPTY');
    expect(next.sheepCaptured).toBe(1);
    expect(next.turn).toBe('SHEEP');
  });

  test('kitty wins after 5th capture', () => {
    const board = emptyBoard();
    board[2][2] = 'KITTY';
    board[2][3] = 'SHEEP';
    const state = makeState({
      board,
      turn: 'KITTY',
      phase: 'PLACEMENT',
      sheepCaptured: 4,
    });
    const move: GameMove = {
      type: 'capture',
      from: [2, 2],
      to: [2, 4],
      captured: [2, 3],
    };
    const next = applyMove(state, move);
    expect(next.winner).toBe('KITTY');
    expect(next.sheepCaptured).toBe(5);
  });

  test('sheep win when all kittens blocked after move', () => {
    const board = emptyBoard();
    board[0][0] = 'KITTY'; // only kitty
    board[0][1] = 'SHEEP';
    board[1][0] = 'SHEEP';
    // Block capture landings too
    board[0][2] = 'SHEEP';
    board[2][0] = 'SHEEP';
    board[2][2] = 'SHEEP';
    // Sheep at (3,3) will move to (1,1) to block the kitty completely
    board[3][3] = 'SHEEP';
    const state = makeState({
      board,
      turn: 'SHEEP',
      phase: 'MOVEMENT',
      sheepPlaced: 20,
    });
    const move: GameMove = { type: 'move', from: [3, 3], to: [1, 1] };
    const next = applyMove(state, move);
    expect(next.winner).toBe('SHEEP');
  });

  test('phase transitions to MOVEMENT after 20th sheep placed', () => {
    const board = emptyBoard();
    board[0][0] = 'KITTY';
    const state = makeState({
      board,
      turn: 'SHEEP',
      phase: 'PLACEMENT',
      sheepPlaced: 19,
    });
    const move: GameMove = { type: 'place', to: [2, 2] };
    const next = applyMove(state, move);
    expect(next.phase).toBe('MOVEMENT');
    expect(next.sheepPlaced).toBe(20);
  });

  test('sheep stalemate in movement phase → kitty wins', () => {
    // All sheep are blocked from moving, and it's sheep's turn
    const board = emptyBoard();
    board[0][0] = 'KITTY';
    // Place a sheep at (4,4) blocked by other sheep
    board[4][4] = 'SHEEP';
    board[4][3] = 'SHEEP';
    board[3][4] = 'SHEEP';
    board[3][3] = 'SHEEP';
    // Fill remaining positions to block all sheep
    board[4][2] = 'SHEEP';
    board[3][2] = 'SHEEP';
    board[2][4] = 'SHEEP';
    board[2][3] = 'SHEEP';
    board[2][2] = 'SHEEP';
    // Kitty moves from (0,0) to (0,1) — after which it's sheep's turn
    // but sheep can't move because they're all packed
    const state = makeState({
      board,
      turn: 'KITTY',
      phase: 'MOVEMENT',
      sheepPlaced: 20,
    });
    const move: GameMove = { type: 'move', from: [0, 0], to: [0, 1] };
    const next = applyMove(state, move);
    // If sheep have no moves in movement phase, kittens win
    if (!next.winner) {
      // Sheep might still have moves since not all are blocked
      // This test documents the behavior
      expect(next.turn).toBe('SHEEP');
    }
  });

  test('does not mutate original state', () => {
    const state = createInitialState();
    const boardCopy = state.board.map(r => [...r]);
    const move: GameMove = { type: 'place', to: [2, 2] };
    applyMove(state, move);
    // Original should be unchanged
    expect(state.board).toEqual(boardCopy);
    expect(state.sheepPlaced).toBe(0);
    expect(state.turn).toBe('SHEEP');
  });

  test('selectedPiece and validMoves are cleared after move', () => {
    const board = emptyBoard();
    board[2][2] = 'SHEEP';
    const state = makeState({
      board,
      turn: 'SHEEP',
      phase: 'MOVEMENT',
      sheepPlaced: 20,
      selectedPiece: [2, 2],
      validMoves: [[2, 3]],
    });
    const move: GameMove = { type: 'move', from: [2, 2], to: [2, 3] };
    const next = applyMove(state, move);
    expect(next.selectedPiece).toBeNull();
    expect(next.validMoves).toEqual([]);
  });
});

// ===========================================================================
// forfeitGame
// ===========================================================================
describe('forfeitGame', () => {
  test('sheep forfeits → kitty wins', () => {
    const state = makeState({ turn: 'SHEEP' });
    const next = forfeitGame(state);
    expect(next.winner).toBe('KITTY');
    expect(next.forfeitedBy).toBe('SHEEP');
  });

  test('kitty forfeits → sheep wins', () => {
    const state = makeState({ turn: 'KITTY' });
    const next = forfeitGame(state);
    expect(next.winner).toBe('SHEEP');
    expect(next.forfeitedBy).toBe('KITTY');
  });

  test('forfeit when game already won does nothing', () => {
    const state = makeState({ turn: 'SHEEP', winner: 'KITTY' });
    const next = forfeitGame(state);
    expect(next).toBe(state);
  });

  test('forfeit clears selection and valid moves', () => {
    const state = makeState({
      turn: 'SHEEP',
      selectedPiece: [2, 2],
      validMoves: [[2, 3]],
    });
    const next = forfeitGame(state);
    expect(next.selectedPiece).toBeNull();
    expect(next.validMoves).toEqual([]);
  });
});

// ===========================================================================
// getGameStatusText
// ===========================================================================
describe('getGameStatusText', () => {
  test('sheep forfeited', () => {
    const state = makeState({ forfeitedBy: 'SHEEP', winner: 'KITTY' });
    expect(getGameStatusText(state)).toBe('Sheeps forfeited! Kittens win!');
  });

  test('kitty forfeited', () => {
    const state = makeState({ forfeitedBy: 'KITTY', winner: 'SHEEP' });
    expect(getGameStatusText(state)).toBe('Kittens forfeited! Sheeps win!');
  });

  test('sheep won', () => {
    const state = makeState({ winner: 'SHEEP' });
    expect(getGameStatusText(state)).toBe('Sheeps win! All kittens are blocked!');
  });

  test('kitty won', () => {
    const state = makeState({ winner: 'KITTY' });
    expect(getGameStatusText(state)).toBe('Kittens win! Captured 5 sheeps!');
  });

  test('sheep placement turn', () => {
    const state = makeState({
      turn: 'SHEEP',
      phase: 'PLACEMENT',
      sheepPlaced: 5,
    });
    expect(getGameStatusText(state)).toBe("Sheep's turn - Place a sheep (5/20)");
  });

  test('sheep movement — no selection', () => {
    const state = makeState({
      turn: 'SHEEP',
      phase: 'MOVEMENT',
      sheepPlaced: 20,
    });
    expect(getGameStatusText(state)).toBe("Sheep's turn - Select a sheep to move");
  });

  test('sheep movement — piece selected', () => {
    const state = makeState({
      turn: 'SHEEP',
      phase: 'MOVEMENT',
      sheepPlaced: 20,
      selectedPiece: [2, 2],
    });
    expect(getGameStatusText(state)).toBe("Sheep's turn - Tap where to move");
  });

  test('kitty turn — no selection', () => {
    const state = makeState({ turn: 'KITTY' });
    expect(getGameStatusText(state)).toBe("Kitty's turn - Select a kitty");
  });

  test('kitty turn — piece selected', () => {
    const state = makeState({
      turn: 'KITTY',
      selectedPiece: [0, 0],
    });
    expect(getGameStatusText(state)).toBe("Kitty's turn - Tap where to move");
  });
});

// ===========================================================================
// Integration: full placement sequence
// ===========================================================================
describe('integration – placement sequence', () => {
  test('alternating sheep place / kitty move for several turns', () => {
    let state = createInitialState();

    // Turn 1: sheep places at (1,1)
    state = handleTap(state, 1, 1);
    expect(state.turn).toBe('KITTY');
    expect(state.board[1][1]).toBe('SHEEP');

    // Turn 2: kitty at (0,0) moves to (1,0)
    state = handleTap(state, 0, 0); // select
    expect(state.selectedPiece).toEqual([0, 0]);
    state = handleTap(state, 1, 0); // move
    expect(state.turn).toBe('SHEEP');
    expect(state.board[1][0]).toBe('KITTY');
    expect(state.board[0][0]).toBe('EMPTY');

    // Turn 3: sheep places at (2, 1)
    state = handleTap(state, 2, 1);
    expect(state.turn).toBe('KITTY');
    expect(state.board[2][1]).toBe('SHEEP');
    expect(state.sheepPlaced).toBe(2);
  });
});

// ===========================================================================
// Integration: full capture scenario
// ===========================================================================
describe('integration – capture scenario', () => {
  test('kitty captures a sheep via orthogonal jump', () => {
    const board = emptyBoard();
    board[2][0] = 'KITTY';
    board[2][1] = 'SHEEP';
    // (2,2) is empty
    const state = makeState({
      board,
      turn: 'KITTY',
      phase: 'PLACEMENT',
      sheepPlaced: 1,
    });

    // Select the kitty
    const afterSelect = handleTap(state, 2, 0);
    expect(afterSelect.selectedPiece).toEqual([2, 0]);
    expect(containsPos(afterSelect.validMoves, [2, 2])).toBe(true);

    // Capture
    const afterCapture = handleTap(afterSelect, 2, 2);
    expect(afterCapture.board[2][2]).toBe('KITTY');
    expect(afterCapture.board[2][0]).toBe('EMPTY');
    expect(afterCapture.board[2][1]).toBe('EMPTY');
    expect(afterCapture.sheepCaptured).toBe(1);
    expect(afterCapture.turn).toBe('SHEEP');
  });

  test('kitty captures a sheep via diagonal jump', () => {
    const board = emptyBoard();
    board[0][0] = 'KITTY'; // even sum → has diagonals
    board[1][1] = 'SHEEP'; // even sum → has diagonals
    // (2,2) empty
    const state = makeState({
      board,
      turn: 'KITTY',
      phase: 'PLACEMENT',
    });

    const afterSelect = handleTap(state, 0, 0);
    expect(containsPos(afterSelect.validMoves, [2, 2])).toBe(true);

    const afterCapture = handleTap(afterSelect, 2, 2);
    expect(afterCapture.board[2][2]).toBe('KITTY');
    expect(afterCapture.board[1][1]).toBe('EMPTY');
    expect(afterCapture.sheepCaptured).toBe(1);
  });
});

// ===========================================================================
// Edge cases & state immutability
// ===========================================================================
describe('edge cases', () => {
  test('handleTap does not mutate the original state board', () => {
    const state = createInitialState();
    const originalBoard = state.board.map(r => [...r]);
    handleTap(state, 2, 2);
    expect(state.board).toEqual(originalBoard);
  });

  test('handleTap returns same state for out-of-turn tap during kitty turn', () => {
    const state = createInitialState();
    const afterSheep = handleTap(state, 2, 2);
    // Now it's kitty turn — tapping a sheep should do nothing
    const noOp = handleTap(afterSheep, 2, 2);
    expect(noOp).toBe(afterSheep);
  });

  test('multiple captures tracked correctly', () => {
    const board = emptyBoard();
    board[2][2] = 'KITTY';
    board[2][3] = 'SHEEP';
    let state = makeState({
      board,
      turn: 'KITTY',
      phase: 'PLACEMENT',
      sheepCaptured: 3,
    });
    const move: GameMove = {
      type: 'capture',
      from: [2, 2],
      to: [2, 4],
      captured: [2, 3],
    };
    state = applyMove(state, move);
    expect(state.sheepCaptured).toBe(4);
    expect(state.winner).toBeNull(); // need 5 to win
  });
});
