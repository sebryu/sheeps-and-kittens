import { Piece, Position } from './types';
import { BOARD_SIZE } from './constants';

export function isInBounds(r: number, c: number): boolean {
  return r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE;
}

export function hasDiagonals(r: number, c: number): boolean {
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

export function getValidMovesForPiece(board: Piece[][], r: number, c: number, piece: Piece): Position[] {
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
