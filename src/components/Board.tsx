import React, { useRef, useEffect, useMemo } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import { GameState, Piece, Position } from '../engine/gameEngine';
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

interface BoardCellProps {
  row: number;
  col: number;
  piece: Piece;
  isSelected: boolean;
  isValidMove: boolean;
  isJustPlaced: boolean;
  capturedToken: string | null;
  onTap: (row: number, col: number) => void;
}

function BoardCell({
  row,
  col,
  piece,
  isSelected,
  isValidMove,
  isJustPlaced,
  capturedToken,
  onTap,
}: BoardCellProps) {
  // Scale from 0→1 spring when a new piece appears at this cell.
  const popInScale = useRef(new Animated.Value(1)).current;

  // Opacity of the red capture-flash overlay.
  const flashOpacity = useRef(new Animated.Value(0)).current;

  // Gentle scale pulse when this piece is selected.
  const pulseScale = useRef(new Animated.Value(1)).current;
  const pulseLoop = useRef<Animated.CompositeAnimation | null>(null);

  // Fade-in for the valid-move indicator circle.
  const validMoveFadeIn = useRef(new Animated.Value(0)).current;

  // Pop-in spring when a piece newly appears here.
  useEffect(() => {
    if (isJustPlaced) {
      popInScale.setValue(0);
      Animated.spring(popInScale, {
        toValue: 1,
        friction: 5,
        tension: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [isJustPlaced]);

  // Red flash when this cell's sheep is captured.
  useEffect(() => {
    if (capturedToken) {
      flashOpacity.setValue(0.9);
      Animated.timing(flashOpacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [capturedToken]);

  // Pulse loop while selected.
  useEffect(() => {
    if (isSelected) {
      pulseLoop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseScale, {
            toValue: 1.12,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseScale, {
            toValue: 1.0,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
      pulseLoop.current.start();
    } else {
      pulseLoop.current?.stop();
      pulseScale.setValue(1);
    }
    return () => {
      pulseLoop.current?.stop();
    };
  }, [isSelected]);

  // Fade in valid-move indicator.
  useEffect(() => {
    if (isValidMove) {
      validMoveFadeIn.setValue(0);
      Animated.timing(validMoveFadeIn, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      validMoveFadeIn.setValue(0);
    }
  }, [isValidMove]);

  const combinedScale = useMemo(
    () => Animated.multiply(popInScale, pulseScale),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <TouchableOpacity
      testID={`cell-${row}-${col}`}
      style={[
        styles.intersection,
        {
          top: row * CELL_SIZE - PIECE_SIZE / 2,
          left: col * CELL_SIZE - PIECE_SIZE / 2,
        },
      ]}
      onPress={() => onTap(row, col)}
      activeOpacity={0.7}
    >
      {/* Capture flash overlay */}
      <Animated.View style={[styles.captureFlash, { opacity: flashOpacity }]} />

      {/* Valid move indicator */}
      {isValidMove && piece === 'EMPTY' && (
        <Animated.View
          style={[styles.validMoveIndicator, { opacity: validMoveFadeIn }]}
        />
      )}

      {/* Intersection dot for empty, non-valid cells */}
      {piece === 'EMPTY' && !isValidMove && (
        <View style={styles.dot} />
      )}

      {/* Pieces with pop-in and pulse */}
      {piece !== 'EMPTY' && (
        <Animated.View
          style={[
            styles.pieceContainer,
            isSelected && styles.selectedPiece,
            { transform: [{ scale: combinedScale }] },
          ]}
        >
          {piece === 'SHEEP' ? (
            <SheepPiece size={PIECE_SIZE * 0.7} />
          ) : (
            <KittenPiece size={PIECE_SIZE * 0.7} />
          )}
        </Animated.View>
      )}
    </TouchableOpacity>
  );
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

  // Diagonal lines
  const diagonals: { from: Position; to: Position }[] = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (hasDiag(r, c)) {
        if (r + 1 < BOARD_SIZE && c + 1 < BOARD_SIZE) {
          diagonals.push({ from: [r, c], to: [r + 1, c + 1] });
        }
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
  captureFlash: {
    position: 'absolute',
    width: PIECE_SIZE,
    height: PIECE_SIZE,
    borderRadius: PIECE_SIZE / 2,
    backgroundColor: '#FF1744',
    zIndex: 20,
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
