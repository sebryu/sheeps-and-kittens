export type Piece = 'EMPTY' | 'KITTY' | 'SHEEP';
export type Turn = 'SHEEP' | 'KITTY';
export type Phase = 'PLACEMENT' | 'MOVEMENT';
export type Position = [number, number];
export type GameMode = 'local' | 'ai-sheep' | 'ai-kitty';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface GameConfig {
  mode: GameMode;
  difficulty: Difficulty;
}

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
  forfeitedBy: Turn | null;
  validMoves: Position[];
  lastMove: GameMove | null;
}
