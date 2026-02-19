import React from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { GameState, Position } from '../engine/gameEngine';
import { SheepPiece, KittenPiece } from './Pieces';

const BOARD_SIZE = 5;
const SCREEN_WIDTH = Dimensions.get('window').width;
const BOARD_PADDING = 30;
const BOARD_WIDTH = SCREEN_WIDTH - 60;
const CELL_SIZE = BOARD_WIDTH / (BOARD_SIZE - 1);
const PIECE_SIZE = CELL_SIZE * 0.7;
const DOT_SIZE = 10;

function hasDiag(r: number, c: number): boolean {
  return (r + c) % 2 === 0;
}

interface BoardProps {
  gameState: GameState;
  onTap: (row: number, col: number) => void;
}

function BoardLines() {
  const lines: React.ReactElement[] = [];

  // Horizontal lines
  for (let r = 0; r < BOARD_SIZE; r++) {
    lines.push(
      <View
        key={`h-${r}`}
        style={{
          position: 'absolute',
          top: r * CELL_SIZE - 1,
          left: 0,
          width: BOARD_WIDTH,
          height: 2,
          backgroundColor: '#5D4037',
        }}
      />
    );
  }

  // Vertical lines
  for (let c = 0; c < BOARD_SIZE; c++) {
    lines.push(
      <View
        key={`v-${c}`}
        style={{
          position: 'absolute',
          top: 0,
          left: c * CELL_SIZE - 1,
          width: 2,
          height: BOARD_WIDTH,
          backgroundColor: '#5D4037',
        }}
      />
    );
  }

  // Diagonal lines - draw them using SVG-like approach with rotated views
  const diagonals: { from: Position; to: Position }[] = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (hasDiag(r, c)) {
        // Down-right diagonal
        if (r + 1 < BOARD_SIZE && c + 1 < BOARD_SIZE) {
          diagonals.push({ from: [r, c], to: [r + 1, c + 1] });
        }
        // Down-left diagonal
        if (r + 1 < BOARD_SIZE && c - 1 >= 0) {
          diagonals.push({ from: [r, c], to: [r + 1, c - 1] });
        }
      }
    }
  }

  diagonals.forEach(({ from, to }, i) => {
    const x1 = from[1] * CELL_SIZE;
    const y1 = from[0] * CELL_SIZE;
    const x2 = to[1] * CELL_SIZE;
    const y2 = to[0] * CELL_SIZE;

    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    lines.push(
      <View
        key={`d-${i}`}
        style={{
          position: 'absolute',
          top: y1 - 1,
          left: x1,
          width: length,
          height: 2,
          backgroundColor: '#5D4037',
          transformOrigin: 'left center',
          transform: [{ rotate: `${angle}deg` }],
        }}
      />
    );
  });

  return <>{lines}</>;
}

export default function Board({ gameState, onTap }: BoardProps) {
  const { board, selectedPiece, validMoves } = gameState;

  const isSelected = (r: number, c: number) =>
    selectedPiece !== null && selectedPiece[0] === r && selectedPiece[1] === c;

  const isValidMove = (r: number, c: number) =>
    validMoves.some(([mr, mc]) => mr === r && mc === c);

  return (
    <View style={styles.boardContainer}>
      <View style={styles.boardBackground}>
      <View style={styles.board}>
        <BoardLines />

        {/* Intersection dots and pieces */}
        {Array.from({ length: BOARD_SIZE }, (_, r) =>
          Array.from({ length: BOARD_SIZE }, (_, c) => {
            const piece = board[r][c];
            const selected = isSelected(r, c);
            const valid = isValidMove(r, c);

            return (
              <TouchableOpacity
                key={`${r}-${c}`}
                style={[
                  styles.intersection,
                  {
                    top: r * CELL_SIZE - PIECE_SIZE / 2,
                    left: c * CELL_SIZE - PIECE_SIZE / 2,
                  },
                ]}
                onPress={() => onTap(r, c)}
                activeOpacity={0.7}
              >
                {/* Valid move indicator */}
                {valid && piece === 'EMPTY' && (
                  <View style={styles.validMoveIndicator} />
                )}

                {/* Intersection dot */}
                {piece === 'EMPTY' && !valid && (
                  <View style={styles.dot} />
                )}

                {/* Pieces */}
                {piece === 'SHEEP' && (
                  <View style={[styles.pieceContainer, selected && styles.selectedPiece]}>
                    <SheepPiece size={PIECE_SIZE * 0.7} />
                  </View>
                )}
                {piece === 'KITTY' && (
                  <View style={[styles.pieceContainer, selected && styles.selectedPiece]}>
                    <KittenPiece size={PIECE_SIZE * 0.7} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })
        )}
      </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  boardContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: BOARD_PADDING,
  },
  boardBackground: {
    backgroundColor: '#D7CCC8',
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#8D6E63',
    padding: PIECE_SIZE / 2 + 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  board: {
    width: BOARD_WIDTH,
    height: BOARD_WIDTH,
    position: 'relative',
  },
  intersection: {
    position: 'absolute',
    width: PIECE_SIZE,
    height: PIECE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: '#5D4037',
  },
  validMoveIndicator: {
    width: PIECE_SIZE * 0.5,
    height: PIECE_SIZE * 0.5,
    borderRadius: PIECE_SIZE * 0.25,
    backgroundColor: 'rgba(76, 175, 80, 0.5)',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  pieceContainer: {
    width: PIECE_SIZE,
    height: PIECE_SIZE,
    borderRadius: PIECE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 5,
  },
  selectedPiece: {
    backgroundColor: '#FFF9C4',
    borderWidth: 3,
    borderColor: '#FFC107',
    shadowColor: '#FFC107',
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 10,
  },
});
