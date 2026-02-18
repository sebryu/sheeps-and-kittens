export type Piece = 'EMPTY' | 'KITTY' | 'SHEEP';
export type Turn = 'SHEEP' | 'KITTY';
export type Phase = 'PLACEMENT' | 'MOVEMENT';
export type Position = [number, number];

export interface GameMove {
  type: 'place' | 'move' | 'capture';
  from?: Position;
  to: Position;
  captured?: Position;
}

export interface GameState {
  board: Piece[][];
  turn: Turn;
  phase: Phase;
  sheepPlaced: number;
  sheepCaptured: number;
  selectedPiece: Position | null;
  winner: Turn | null;
  validMoves: Position[];
  lastMove: GameMove | null;
}

const BOARD_SIZE = 5;
const TOTAL_SHEEP = 20;
const SHEEP_TO_WIN = 5;

function isInBounds(r: number, c: number): boolean {
  return r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE;
}

function hasDiagonals(r: number, c: number): boolean {
  return (r + c) % 2 === 0;
}

export function getNeighbors(r: number, c: number): Position[] {
  const neighbors: Position[] = [];
  // Orthogonal
  const orthoDirs: Position[] = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  for (const [dr, dc] of orthoDirs) {
    const nr = r + dr;
    const nc = c + dc;
    if (isInBounds(nr, nc)) {
      neighbors.push([nr, nc]);
    }
  }
  // Diagonals (only if (r+c) is even)
  if (hasDiagonals(r, c)) {
    const diagDirs: Position[] = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
    for (const [dr, dc] of diagDirs) {
      const nr = r + dr;
      const nc = c + dc;
      if (isInBounds(nr, nc)) {
        neighbors.push([nr, nc]);
      }
    }
  }
  return neighbors;
}

export function getCaptureTargets(board: Piece[][], r: number, c: number): { to: Position; captured: Position }[] {
  const targets: { to: Position; captured: Position }[] = [];
  if (board[r][c] !== 'KITTY') return targets;

  // Orthogonal captures
  const allDirs: Position[] = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  // Diagonal captures (only if source has diagonals)
  if (hasDiagonals(r, c)) {
    allDirs.push([-1, -1], [-1, 1], [1, -1], [1, 1]);
  }

  for (const [dr, dc] of allDirs) {
    const midR = r + dr;
    const midC = c + dc;
    const destR = r + 2 * dr;
    const destC = c + 2 * dc;

    if (
      isInBounds(midR, midC) &&
      isInBounds(destR, destC) &&
      board[midR][midC] === 'SHEEP' &&
      board[destR][destC] === 'EMPTY'
    ) {
      // Verify the mid-to-dest connection exists on the board
      // The mid point must connect to dest: either orthogonal (always) or diagonal (if mid has diags)
      const isDiagJump = dr !== 0 && dc !== 0;
      if (!isDiagJump || hasDiagonals(midR, midC)) {
        targets.push({ to: [destR, destC], captured: [midR, midC] });
      }
    }
  }
  return targets;
}

export function createInitialState(): GameState {
  const board: Piece[][] = Array.from({ length: BOARD_SIZE }, () =>
    Array(BOARD_SIZE).fill('EMPTY')
  );
  // Place 4 kitties at corners
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
    validMoves: [],
    lastMove: null,
  };
}

function getValidMovesForPiece(board: Piece[][], r: number, c: number, piece: Piece): Position[] {
  const moves: Position[] = [];
  const neighbors = getNeighbors(r, c);
  for (const [nr, nc] of neighbors) {
    if (board[nr][nc] === 'EMPTY') {
      moves.push([nr, nc]);
    }
  }
  if (piece === 'KITTY') {
    const captures = getCaptureTargets(board, r, c);
    for (const cap of captures) {
      moves.push(cap.to);
    }
  }
  return moves;
}

function checkKittiesBlocked(board: Piece[][]): boolean {
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
      if (checkKittiesBlocked(newBoard)) {
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
        if (checkKittiesBlocked(newBoard)) {
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
      } else if (checkKittiesBlocked(newBoard)) {
        winner = 'SHEEP';
      }

      // Check if sheep have any moves (in movement phase)
      const newPhase = state.sheepPlaced >= TOTAL_SHEEP ? 'MOVEMENT' : 'PLACEMENT';
      if (newPhase === 'MOVEMENT' && !winner && !checkSheepHaveMoves(newBoard)) {
        // Sheep can't move - kitties win (stalemate)
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
        validMoves: [],
        lastMove: move,
      };
    }
  }

  return state;
}

export function getGameStatusText(state: GameState): string {
  if (state.winner === 'SHEEP') return 'Sheeps win! All kitties are blocked!';
  if (state.winner === 'KITTY') return 'Kitties win! Captured 5 sheeps!';

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
