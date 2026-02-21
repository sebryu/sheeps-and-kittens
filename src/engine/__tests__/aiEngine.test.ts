import {
  GameState,
  GameMove,
  Piece,
  Position,
  createInitialState,
  applyMove,
  getNeighbors,
} from '../gameEngine';
import { getAllMoves, findBestMove } from '../aiEngine';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function emptyBoard(): Piece[][] {
  return Array.from({ length: 5 }, () => Array(5).fill('EMPTY') as Piece[]);
}

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

// ===========================================================================
// getAllMoves
// ===========================================================================
describe('getAllMoves', () => {
  test('initial state (sheep placement) returns all empty cells', () => {
    const state = createInitialState();
    const moves = getAllMoves(state);
    // 25 cells - 4 corners (kittens) = 21 empty cells
    expect(moves).toHaveLength(21);
    expect(moves.every(m => m.type === 'place')).toBe(true);
  });

  test('placement moves target only empty cells', () => {
    const state = createInitialState();
    // Place a sheep
    const next = applyMove(state, { type: 'place', to: [2, 2] });
    // Now it's kitty turn, but let's test sheep placement after
    const sheepState = makeState({
      board: next.board,
      turn: 'SHEEP',
      phase: 'PLACEMENT',
      sheepPlaced: 1,
    });
    const moves = getAllMoves(sheepState);
    // 21 - 1 (sheep placed) = 20 empty cells
    expect(moves).toHaveLength(20);
    // None should target (2,2) or corners
    expect(moves.every(m => !(m.to[0] === 2 && m.to[1] === 2))).toBe(true);
  });

  test('kitty movement includes normal moves and captures', () => {
    const board = emptyBoard();
    board[2][2] = 'KITTY';
    board[2][3] = 'SHEEP'; // capturable
    const state = makeState({
      board,
      turn: 'KITTY',
      phase: 'PLACEMENT',
    });
    const moves = getAllMoves(state);
    const normalMoves = moves.filter(m => m.type === 'move');
    const captureMoves = moves.filter(m => m.type === 'capture');

    // 7 adjacent empties (8 neighbors - 1 sheep)
    expect(normalMoves).toHaveLength(7);
    // 1 capture: jump over (2,3) to (2,4)
    expect(captureMoves).toHaveLength(1);
    expect(captureMoves[0].to).toEqual([2, 4]);
    expect(captureMoves[0].captured).toEqual([2, 3]);
  });

  test('sheep movement phase returns only sheep moves', () => {
    const board = emptyBoard();
    board[2][2] = 'SHEEP';
    board[0][0] = 'KITTY';
    const state = makeState({
      board,
      turn: 'SHEEP',
      phase: 'MOVEMENT',
      sheepPlaced: 20,
    });
    const moves = getAllMoves(state);
    // All moves should be from the sheep
    expect(moves.every(m => m.type === 'move')).toBe(true);
    expect(moves.every(m => m.from![0] === 2 && m.from![1] === 2)).toBe(true);
  });

  test('returns empty array when all pieces are blocked', () => {
    const board = emptyBoard();
    board[0][0] = 'KITTY';
    board[0][1] = 'SHEEP';
    board[1][0] = 'SHEEP';
    board[1][1] = 'SHEEP';
    // Block all capture landings
    board[0][2] = 'SHEEP';
    board[2][0] = 'SHEEP';
    board[2][2] = 'SHEEP';
    const state = makeState({
      board,
      turn: 'KITTY',
      phase: 'MOVEMENT',
      sheepPlaced: 20,
    });
    const moves = getAllMoves(state);
    expect(moves).toHaveLength(0);
  });

  test('multiple kittens generate moves for all of them', () => {
    const board = emptyBoard();
    board[0][0] = 'KITTY';
    board[4][4] = 'KITTY';
    const state = makeState({
      board,
      turn: 'KITTY',
      phase: 'PLACEMENT',
    });
    const moves = getAllMoves(state);
    const from00 = moves.filter(m => m.from && m.from[0] === 0 && m.from[1] === 0);
    const from44 = moves.filter(m => m.from && m.from[0] === 4 && m.from[1] === 4);
    expect(from00.length).toBeGreaterThan(0);
    expect(from44.length).toBeGreaterThan(0);
  });

  test('captures are only generated for kittens, not sheep', () => {
    const board = emptyBoard();
    board[2][2] = 'SHEEP';
    board[2][3] = 'KITTY'; // adjacent kitty
    // (2,4) is empty — but sheep can't capture
    const state = makeState({
      board,
      turn: 'SHEEP',
      phase: 'MOVEMENT',
      sheepPlaced: 20,
    });
    const moves = getAllMoves(state);
    const captures = moves.filter(m => m.type === 'capture');
    expect(captures).toHaveLength(0);
  });
});

// ===========================================================================
// findBestMove
// ===========================================================================
describe('findBestMove', () => {
  test('returns a valid move from initial state (medium)', () => {
    const state = createInitialState();
    // It's sheep turn in placement
    const move = findBestMove(state, 'medium');
    expect(move).not.toBeNull();
    expect(move!.type).toBe('place');
    // Should target an empty cell
    expect(state.board[move!.to[0]][move!.to[1]]).toBe('EMPTY');
  });

  test('returns null when no moves available', () => {
    const board = emptyBoard();
    board[0][0] = 'KITTY';
    board[0][1] = 'SHEEP';
    board[1][0] = 'SHEEP';
    board[1][1] = 'SHEEP';
    board[0][2] = 'SHEEP';
    board[2][0] = 'SHEEP';
    board[2][2] = 'SHEEP';
    const state = makeState({
      board,
      turn: 'KITTY',
      phase: 'MOVEMENT',
      sheepPlaced: 20,
    });
    const move = findBestMove(state, 'medium');
    expect(move).toBeNull();
  });

  test('kitty prefers capture when available (hard difficulty)', () => {
    const board = emptyBoard();
    board[2][2] = 'KITTY';
    board[2][3] = 'SHEEP';
    // (2,4) empty → capturable
    const state = makeState({
      board,
      turn: 'KITTY',
      phase: 'PLACEMENT',
      sheepPlaced: 1,
    });
    const move = findBestMove(state, 'hard');
    expect(move).not.toBeNull();
    // At hard difficulty, the AI should strongly prefer capture
    expect(move!.type).toBe('capture');
    expect(move!.to).toEqual([2, 4]);
  });

  test('kitty takes winning capture (5th capture)', () => {
    const board = emptyBoard();
    board[2][2] = 'KITTY';
    board[2][3] = 'SHEEP';
    const state = makeState({
      board,
      turn: 'KITTY',
      phase: 'MOVEMENT',
      sheepPlaced: 20,
      sheepCaptured: 4,
    });
    const move = findBestMove(state, 'medium');
    expect(move).not.toBeNull();
    expect(move!.type).toBe('capture');
  });

  test('returns move for sheep in movement phase', () => {
    const board = emptyBoard();
    board[2][2] = 'SHEEP';
    board[0][0] = 'KITTY';
    const state = makeState({
      board,
      turn: 'SHEEP',
      phase: 'MOVEMENT',
      sheepPlaced: 20,
    });
    const move = findBestMove(state, 'medium');
    expect(move).not.toBeNull();
    expect(move!.type).toBe('move');
    expect(move!.from).toEqual([2, 2]);
  });

  test('easy difficulty returns a valid move', () => {
    const state = createInitialState();
    // Easy mode has randomness, but should still return valid move
    const move = findBestMove(state, 'easy');
    expect(move).not.toBeNull();
    expect(move!.type).toBe('place');
  });

  test('AI move applied via applyMove produces valid state', () => {
    let state = createInitialState();
    // Sheep places
    state = applyMove(state, { type: 'place', to: [2, 2] });
    // Kitty AI finds a move
    const kittyMove = findBestMove(state, 'medium');
    expect(kittyMove).not.toBeNull();
    const nextState = applyMove(state, kittyMove!);
    expect(nextState.turn).toBe('SHEEP');
    expect(nextState.winner).toBeNull();
    // The kitty should have moved
    if (kittyMove!.type === 'move') {
      expect(nextState.board[kittyMove!.to[0]][kittyMove!.to[1]]).toBe('KITTY');
      expect(nextState.board[kittyMove!.from![0]][kittyMove!.from![1]]).toBe('EMPTY');
    }
  });
});

// ===========================================================================
// Integration: AI plays multiple turns
// ===========================================================================
describe('integration – AI multi-turn game', () => {
  test('AI can play several turns without crashing', () => {
    let state = createInitialState();
    // Play 10 turns alternating
    for (let i = 0; i < 10; i++) {
      if (state.winner) break;
      const move = findBestMove(state, 'easy');
      if (!move) break;
      state = applyMove(state, move);
      // State should be consistent
      expect(state.sheepPlaced).toBeGreaterThanOrEqual(0);
      expect(state.sheepCaptured).toBeGreaterThanOrEqual(0);
      expect(state.sheepCaptured).toBeLessThanOrEqual(5);
    }
  });

  test('AI game produces legal board states throughout', () => {
    let state = createInitialState();
    for (let turn = 0; turn < 20; turn++) {
      if (state.winner) break;
      const move = findBestMove(state, 'easy');
      if (!move) break;
      state = applyMove(state, move);

      // Count pieces
      let kittens = 0;
      let sheep = 0;
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
          if (state.board[r][c] === 'KITTY') kittens++;
          if (state.board[r][c] === 'SHEEP') sheep++;
        }
      }
      // Always 4 kittens
      expect(kittens).toBe(4);
      // Sheep on board = placed - captured
      expect(sheep).toBe(state.sheepPlaced - state.sheepCaptured);
    }
  });
});

// ===========================================================================
// Move generation consistency
// ===========================================================================
describe('move generation consistency', () => {
  test('all generated moves produce valid states when applied', () => {
    const state = createInitialState();
    const moves = getAllMoves(state);
    for (const move of moves) {
      const next = applyMove(state, move);
      expect(next.turn).toBe('KITTY');
      expect(next.sheepPlaced).toBe(1);
      expect(next.board[move.to[0]][move.to[1]]).toBe('SHEEP');
    }
  });

  test('kitty moves all produce valid states', () => {
    const board = emptyBoard();
    board[0][0] = 'KITTY';
    board[0][4] = 'KITTY';
    board[4][0] = 'KITTY';
    board[4][4] = 'KITTY';
    board[1][1] = 'SHEEP';
    const state = makeState({
      board,
      turn: 'KITTY',
      phase: 'PLACEMENT',
      sheepPlaced: 1,
    });
    const moves = getAllMoves(state);
    for (const move of moves) {
      const next = applyMove(state, move);
      expect(next.turn).toBe('SHEEP');
      if (move.type === 'capture') {
        expect(next.sheepCaptured).toBe(1);
        expect(next.board[move.captured![0]][move.captured![1]]).toBe('EMPTY');
      }
      expect(next.board[move.to[0]][move.to[1]]).toBe('KITTY');
      if (move.from) {
        expect(next.board[move.from[0]][move.from[1]]).toBe('EMPTY');
      }
    }
  });
});
