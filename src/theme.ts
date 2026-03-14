/**
 * Centralized color palette for Sheeps & Kittens.
 *
 * Import colors from here instead of hardcoding hex values in components.
 */

export const colors = {
  // Background & surface
  background: '#FFF8E1',
  surface: '#FFFFFF',
  surfaceLight: '#FFFDE7',

  // Board
  boardSurface: '#D7CCC8',
  boardBorder: '#8D6E63',
  boardLine: '#5D4037',
  boardDot: '#5D4037',
  boardDotFaded: '#A1887F',

  // Text
  textPrimary: '#3E2723',
  textSecondary: '#5D4037',
  textTertiary: '#8D6E63',
  textMuted: '#BDBDBD',

  // Accents
  accent: '#FFC107',
  accentDark: '#F57F17',
  success: '#4CAF50',
  successDark: '#2E7D32',
  successLight: '#C8E6C9',
  successSurface: '#E8F5E9',
  danger: '#C62828',
  dangerLight: '#FFCDD2',
  dangerSurface: '#FFF3F3',
  captureFlash: '#FF1744',

  // UI elements
  cardBorder: 'transparent',
  divider: '#EFEBE9',
  inactive: '#EFEBE9',
  overlay: 'rgba(0, 0, 0, 0.6)',
  validMove: 'rgba(76, 175, 80, 0.5)',
  validMoveBorder: '#4CAF50',

  // Piece containers
  pieceBackground: 'rgba(255, 255, 255, 0.9)',
  selectedPieceBackground: '#FFF9C4',
  selectedPieceBorder: '#FFC107',
} as const;
