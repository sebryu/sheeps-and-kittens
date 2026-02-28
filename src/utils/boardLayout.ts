import { Dimensions } from 'react-native';
import { BOARD_SIZE } from '../engine/constants';
import { hasDiagonals } from '../engine/boardOps';

const SCREEN_WIDTH = Dimensions.get('window').width;

// ── Main board dimensions ──────────────────────────────────────────
export const BOARD_PADDING = 30;
export const BOARD_WIDTH = SCREEN_WIDTH - 60;
export const CELL_SIZE = BOARD_WIDTH / (BOARD_SIZE - 1);
export const PIECE_SIZE = CELL_SIZE * 0.7;
export const DOT_SIZE = 10;

// ── Mini board dimensions (for tutorial) ───────────────────────────
export const MINI_BOARD_WIDTH = Math.min(220, SCREEN_WIDTH - 120);
export const MINI_CELL = MINI_BOARD_WIDTH / (BOARD_SIZE - 1);
export const MINI_PIECE = MINI_CELL * 0.6;
export const MINI_DOT = 6;

// Re-export from boardOps to keep rendering components decoupled from engine
export const hasDiag = hasDiagonals;
