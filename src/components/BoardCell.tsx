import React, { useRef, useEffect, useMemo } from 'react';
import {
  TouchableOpacity,
  View,
  StyleSheet,
  Animated,
} from 'react-native';
import { Piece } from '../engine/types';
import { SheepPiece, KittenPiece } from './Pieces';
import { PIECE_SIZE, DOT_SIZE, CELL_SIZE } from '../utils/boardLayout';
import { colors } from '../theme';

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

export default function BoardCell({
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

const styles = StyleSheet.create({
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
    backgroundColor: colors.boardDot,
  },
  validMoveIndicator: {
    width: PIECE_SIZE * 0.5,
    height: PIECE_SIZE * 0.5,
    borderRadius: PIECE_SIZE * 0.25,
    backgroundColor: colors.validMove,
    borderWidth: 2,
    borderColor: colors.validMoveBorder,
  },
  captureFlash: {
    position: 'absolute',
    width: PIECE_SIZE,
    height: PIECE_SIZE,
    borderRadius: PIECE_SIZE / 2,
    backgroundColor: colors.captureFlash,
    zIndex: 20,
  },
  pieceContainer: {
    width: PIECE_SIZE,
    height: PIECE_SIZE,
    borderRadius: PIECE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.pieceBackground,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 5,
  },
  selectedPiece: {
    backgroundColor: colors.selectedPieceBackground,
    borderWidth: 3,
    borderColor: colors.selectedPieceBorder,
    shadowColor: colors.selectedPieceBorder,
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 10,
  },
});
