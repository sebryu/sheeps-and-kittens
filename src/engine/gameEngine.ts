// Re-export types, constants, and board operations for backward compatibility.
// Consumers can import from these sub-modules directly for more granular access.
export type { Piece, Turn, Phase, Position, GameMode, Difficulty, GameConfig, GameMove, GameState } from './types';
export { BOARD_SIZE, TOTAL_SHEEP, SHEEP_TO_WIN } from './constants';
export { isInBounds, hasDiagonals, getNeighbors, getCaptureTargets, getValidMovesForPiece } from './boardOps';

import { Piece, Turn, Phase, Position, GameMove, GameState } from './types';
import { BOARD_SIZE, TOTAL_SHEEP, SHEEP_TO_WIN } from './constants';
import { getNeighbors, getCaptureTargets, getValidMovesForPiece } from './boardOps';

function checkKittensBlocked(board: Piece[][]): boolean {
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] === 'KITTY') {
        const moves = getValidMovesForPiece(board, r, c, 'KITTY');
        if (moves.length > 0) return false;
      }
    }
  }
  return true;
}

function checkSheepHaveMoves(board: Piece[][]): boolean {
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] === 'SHEEP') {
        const neighbors = getNeighbors(r, c);
        for (const [nr, nc] of neighbors) {
          if (board[nr][nc] === 'EMPTY') return true;
        }
      }
    }
  }
  return false;
}

export function createInitialState(): GameState {
  const board: Piece[][] = Array.from({ length: BOARD_SIZE }, () =>
    Array(BOARD_SIZE).fill('EMPTY')
  );
  // Place 4 kittens at corners
  board[0][0] = 'KITTY';
  board[0][4] = 'KITTY';
  board[4][0] = 'KITTY';
  board[4][4] = 'KITTY';

  return {
    board,
    turn: 'SHEEP',
    phase: 'PLACEMENT',
    sheepPlaced: 0,
    sheepCaptured: 0,
    selectedPiece: null,
    winner: null,
    forfeitedBy: null,
    validMoves: [],
    lastMove: null,
  };
}

export function handleTap(state: GameState, row: number, col: number): GameState {
  if (state.winner) return state;

  const newBoard = state.board.map(r => [...r]);

  // SHEEP's turn
  if (state.turn === 'SHEEP') {
    if (state.phase === 'PLACEMENT') {
      // Place a sheep on empty intersection
      if (newBoard[row][col] !== 'EMPTY') return state;
      newBoard[row][col] = 'SHEEP';
      const newSheepPlaced = state.sheepPlaced + 1;
      const newPhase = newSheepPlaced >= TOTAL_SHEEP ? 'MOVEMENT' : 'PLACEMENT';
      const move: GameMove = { type: 'place', to: [row, col] };

      let winner: Turn | null = null;
      if (checkKittensBlocked(newBoard)) {
        winner = 'SHEEP';
      }

      return {
        board: newBoard,
        turn: 'KITTY',
        phase: newPhase,
        sheepPlaced: newSheepPlaced,
        sheepCaptured: state.sheepCaptured,
        selectedPiece: null,
        winner,
        forfeitedBy: null,
        validMoves: [],
        lastMove: move,
      };
    } else {
      // MOVEMENT phase - select then move
      if (state.selectedPiece === null) {
        // Select a sheep
        if (newBoard[row][col] !== 'SHEEP') return state;
        const moves = getValidMovesForPiece(newBoard, row, col, 'SHEEP');
        if (moves.length === 0) return state;
        return {
          ...state,
          selectedPiece: [row, col],
          validMoves: moves,
        };
      } else {
        const [sr, sc] = state.selectedPiece;
        // Tap same piece to deselect
        if (row === sr && col === sc) {
          return { ...state, selectedPiece: null, validMoves: [] };
        }
        // Tap another sheep to re-select
        if (newBoard[row][col] === 'SHEEP') {
          const moves = getValidMovesForPiece(newBoard, row, col, 'SHEEP');
          if (moves.length === 0) return state;
          return {
            ...state,
            selectedPiece: [row, col],
            validMoves: moves,
          };
        }
        // Check if this is a valid move
        const isValid = state.validMoves.some(([mr, mc]) => mr === row && mc === col);
        if (!isValid) return state;

        newBoard[row][col] = 'SHEEP';
        newBoard[sr][sc] = 'EMPTY';
        const move: GameMove = { type: 'move', from: [sr, sc], to: [row, col] };

        let winner: Turn | null = null;
        if (checkKittensBlocked(newBoard)) {
          winner = 'SHEEP';
        }

        return {
          board: newBoard,
          turn: 'KITTY',
          phase: state.phase,
          sheepPlaced: state.sheepPlaced,
          sheepCaptured: state.sheepCaptured,
          selectedPiece: null,
          winner,
          forfeitedBy: null,
          validMoves: [],
          lastMove: move,
        };
      }
    }
  }

  // KITTY's turn
  if (state.turn === 'KITTY') {
    if (state.selectedPiece === null) {
      // Select a kitty
      if (newBoard[row][col] !== 'KITTY') return state;
      const moves = getValidMovesForPiece(newBoard, row, col, 'KITTY');
      if (moves.length === 0) return state;
      return {
        ...state,
        selectedPiece: [row, col],
        validMoves: moves,
      };
    } else {
      const [sr, sc] = state.selectedPiece;
      // Tap same kitty to deselect
      if (row === sr && col === sc) {
        return { ...state, selectedPiece: null, validMoves: [] };
      }
      // Tap another kitty to re-select
      if (newBoard[row][col] === 'KITTY') {
        const moves = getValidMovesForPiece(newBoard, row, col, 'KITTY');
        if (moves.length === 0) return state;
        return {
          ...state,
          selectedPiece: [row, col],
          validMoves: moves,
        };
      }
      // Check if valid move
      const isValid = state.validMoves.some(([mr, mc]) => mr === row && mc === col);
      if (!isValid) return state;

      // Is it a capture?
      const captures = getCaptureTargets(state.board, sr, sc);
      const capture = captures.find(cap => cap.to[0] === row && cap.to[1] === col);

      newBoard[row][col] = 'KITTY';
      newBoard[sr][sc] = 'EMPTY';

      let newCaptured = state.sheepCaptured;
      let move: GameMove;

      if (capture) {
        newBoard[capture.captured[0]][capture.captured[1]] = 'EMPTY';
        newCaptured++;
        move = { type: 'capture', from: [sr, sc], to: [row, col], captured: capture.captured };
      } else {
        move = { type: 'move', from: [sr, sc], to: [row, col] };
      }

      let winner: Turn | null = null;
      if (newCaptured >= SHEEP_TO_WIN) {
        winner = 'KITTY';
      } else if (checkKittensBlocked(newBoard)) {
        winner = 'SHEEP';
      }

      // Check if sheep have any moves (in movement phase)
      const newPhase = state.sheepPlaced >= TOTAL_SHEEP ? 'MOVEMENT' : 'PLACEMENT';
      if (newPhase === 'MOVEMENT' && !winner && !checkSheepHaveMoves(newBoard)) {
        // Sheep can't move - kittens win (stalemate)
        winner = 'KITTY';
      }

      return {
        board: newBoard,
        turn: 'SHEEP',
        phase: newPhase,
        sheepPlaced: state.sheepPlaced,
        sheepCaptured: newCaptured,
        selectedPiece: null,
        winner,
        forfeitedBy: null,
        validMoves: [],
        lastMove: move,
      };
    }
  }

  return state;
}

export function applyMove(state: GameState, move: GameMove): GameState {
  const newBoard = state.board.map(r => [...r]);
  let newSheepPlaced = state.sheepPlaced;
  let newSheepCaptured = state.sheepCaptured;
  let newPhase = state.phase;
  let nextTurn: Turn;

  if (move.type === 'place') {
    newBoard[move.to[0]][move.to[1]] = 'SHEEP';
    newSheepPlaced++;
    newPhase = newSheepPlaced >= TOTAL_SHEEP ? 'MOVEMENT' : 'PLACEMENT';
    nextTurn = 'KITTY';
  } else if (move.type === 'move') {
    const [fr, fc] = move.from!;
    const piece = newBoard[fr][fc];
    newBoard[move.to[0]][move.to[1]] = piece;
    newBoard[fr][fc] = 'EMPTY';
    nextTurn = state.turn === 'SHEEP' ? 'KITTY' : 'SHEEP';
  } else {
    // capture
    const [fr, fc] = move.from!;
    newBoard[move.to[0]][move.to[1]] = 'KITTY';
    newBoard[fr][fc] = 'EMPTY';
    newBoard[move.captured![0]][move.captured![1]] = 'EMPTY';
    newSheepCaptured++;
    nextTurn = 'SHEEP';
  }

  let winner: Turn | null = null;
  if (newSheepCaptured >= SHEEP_TO_WIN) {
    winner = 'KITTY';
  } else if (checkKittensBlocked(newBoard)) {
    winner = 'SHEEP';
  } else if (newPhase === 'MOVEMENT' && nextTurn === 'SHEEP' && !checkSheepHaveMoves(newBoard)) {
    winner = 'KITTY';
  }

  return {
    board: newBoard,
    turn: nextTurn,
    phase: newPhase,
    sheepPlaced: newSheepPlaced,
    sheepCaptured: newSheepCaptured,
    selectedPiece: null,
    winner,
    forfeitedBy: null,
    validMoves: [],
    lastMove: move,
  };
}

export function forfeitGame(state: GameState): GameState {
  if (state.winner) return state;
  const forfeitingPlayer = state.turn;
  const opponent: Turn = forfeitingPlayer === 'SHEEP' ? 'KITTY' : 'SHEEP';
  return {
    ...state,
    winner: opponent,
    forfeitedBy: forfeitingPlayer,
    selectedPiece: null,
    validMoves: [],
  };
}

export function getGameStatusText(state: GameState): string {
  if (state.forfeitedBy === 'SHEEP') return 'Sheeps forfeited! Kittens win!';
  if (state.forfeitedBy === 'KITTY') return 'Kittens forfeited! Sheeps win!';
  if (state.winner === 'SHEEP') return 'Sheeps win! All kittens are blocked!';
  if (state.winner === 'KITTY') return 'Kittens win! Captured 5 sheeps!';

  if (state.turn === 'SHEEP') {
    if (state.phase === 'PLACEMENT') {
      return `Sheep's turn - Place a sheep (${state.sheepPlaced}/${TOTAL_SHEEP})`;
    }
    if (state.selectedPiece) return "Sheep's turn - Tap where to move";
    return "Sheep's turn - Select a sheep to move";
  }

  if (state.selectedPiece) return "Kitty's turn - Tap where to move";
  return "Kitty's turn - Select a kitty";
}
