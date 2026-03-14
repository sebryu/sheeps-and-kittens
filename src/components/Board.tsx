import React, { useRef, useEffect, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { GameState, Piece } from '../engine/types';
import { BOARD_SIZE } from '../engine/constants';
import { BOARD_PADDING, BOARD_WIDTH, PIECE_SIZE } from '../utils/boardLayout';
import { colors } from '../theme';
import BoardLines from './BoardLines';
import BoardCell from './BoardCell';

interface BoardProps {
  gameState: GameState;
  onTap: (row: number, col: number) => void;
}

export default function Board({ gameState, onTap }: BoardProps) {
  const { board, selectedPiece, validMoves, lastMove } = gameState;

  // Track the previous board to detect newly placed/moved pieces.
  const prevBoard = useRef<Piece[][] | null>(null);

  // Which cells have a new piece this render (computed during render with old prevBoard).
  const justPlacedCells = useMemo(() => {
    const set = new Set<string>();
    if (prevBoard.current) {
      for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
          if (prevBoard.current[r][c] === 'EMPTY' && board[r][c] !== 'EMPTY') {
            set.add(`${r}-${c}`);
          }
        }
      }
    }
    return set;
  }, [board]);

  // Update prevBoard after every render so the next render sees the current board.
  useEffect(() => {
    prevBoard.current = board;
  });

  return (
    <View style={styles.boardContainer}>
      <View style={styles.boardBackground}>
        <View style={styles.board}>
          <BoardLines />

          {Array.from({ length: BOARD_SIZE }, (_, r) =>
            Array.from({ length: BOARD_SIZE }, (_, c) => {
              const key = `${r}-${c}`;
              const piece = board[r][c];
              const selected =
                selectedPiece !== null &&
                selectedPiece[0] === r &&
                selectedPiece[1] === c;
              const valid = validMoves.some(([mr, mc]) => mr === r && mc === c);
              const isJustPlaced = justPlacedCells.has(key);

              // Unique token per capture so the same cell can flash multiple times.
              const capturedToken =
                lastMove?.type === 'capture' &&
                lastMove.captured?.[0] === r &&
                lastMove.captured?.[1] === c
                  ? `${r}-${c}-${gameState.sheepCaptured}`
                  : null;

              return (
                <BoardCell
                  key={key}
                  row={r}
                  col={c}
                  piece={piece}
                  isSelected={selected}
                  isValidMove={valid}
                  isJustPlaced={isJustPlaced}
                  capturedToken={capturedToken}
                  onTap={onTap}
                />
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
    backgroundColor: colors.boardSurface,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: colors.boardBorder,
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
});
