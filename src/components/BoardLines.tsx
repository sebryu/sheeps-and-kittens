import React from 'react';
import { View } from 'react-native';
import { Position } from '../engine/types';
import { BOARD_SIZE } from '../engine/constants';
import { BOARD_WIDTH, CELL_SIZE, hasDiag } from '../utils/boardLayout';
import { colors } from '../theme';

export default function BoardLines() {
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
          backgroundColor: colors.boardLine,
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
          backgroundColor: colors.boardLine,
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
          backgroundColor: colors.boardLine,
          transformOrigin: 'left center',
          transform: [{ rotate: `${angle}deg` }],
        }}
      />
    );
  });

  return <>{lines}</>;
}
