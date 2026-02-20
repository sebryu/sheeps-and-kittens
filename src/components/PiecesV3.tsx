import React from 'react';
import { View } from 'react-native';

interface PieceProps {
  size: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type Grid = (string | null)[][];

function renderPixelGrid(grid: Grid, pixelSize: number, gap: number) {
  const rows: React.ReactElement[] = [];
  for (let r = 0; r < grid.length; r++) {
    const cols: React.ReactElement[] = [];
    for (let c = 0; c < grid[r].length; c++) {
      const color = grid[r][c];
      cols.push(
        <View
          key={c}
          style={{
            width: pixelSize,
            height: pixelSize,
            marginRight: c < grid[r].length - 1 ? gap : 0,
            borderRadius: 0,
            backgroundColor: color === '.' ? 'transparent' : (color ?? 'transparent'),
          }}
        />,
      );
    }
    rows.push(
      <View
        key={r}
        style={{
          flexDirection: 'row',
          marginBottom: r < grid.length - 1 ? gap : 0,
        }}
      >
        {cols}
      </View>,
    );
  }
  return rows;
}

// ---------------------------------------------------------------------------
// SheepPiece — 10 × 10 chunky pixel art
// ---------------------------------------------------------------------------

const SHEEP_GRID: Grid = [
  [null, null, '#EEEEEE', '#EEEEEE', '#DDDDDD', '#DDDDDD', '#EEEEEE', '#EEEEEE', null, null],
  [null, '#EEEEEE', '#EEEEEE', '#EEEEEE', '#EEEEEE', '#EEEEEE', '#EEEEEE', '#EEEEEE', '#EEEEEE', null],
  ['#FFB6C1', '#EEEEEE', '#EEEEEE', '#DDDDDD', '#EEEEEE', '#EEEEEE', '#DDDDDD', '#EEEEEE', '#EEEEEE', '#FFB6C1'],
  ['#FFB6C1', '#EEEEEE', '#FFDEAD', '#FFDEAD', '#FFDEAD', '#FFDEAD', '#FFDEAD', '#FFDEAD', '#EEEEEE', '#FFB6C1'],
  [null, '#EEEEEE', '#FFDEAD', '#222222', '#FFDEAD', '#FFDEAD', '#222222', '#FFDEAD', '#EEEEEE', null],
  [null, '#EEEEEE', '#FFDEAD', '#FFDEAD', '#FFB6C1', '#FFB6C1', '#FFDEAD', '#FFDEAD', '#EEEEEE', null],
  [null, '#DDDDDD', '#EEEEEE', '#FFDEAD', '#FFDEAD', '#FFDEAD', '#FFDEAD', '#EEEEEE', '#DDDDDD', null],
  [null, null, '#DDDDDD', '#EEEEEE', '#EEEEEE', '#EEEEEE', '#EEEEEE', '#DDDDDD', null, null],
  [null, '#555555', '#555555', null, null, null, null, '#555555', '#555555', null],
  [null, '#555555', '#555555', null, null, null, null, '#555555', '#555555', null],
];

export function SheepPiece({ size }: PieceProps) {
  const gridSize = 10;
  const gap = Math.max(1, size / 100);
  const pixelSize = (size - gap * (gridSize - 1)) / gridSize;

  return (
    <View style={{ width: size, height: size }}>
      {renderPixelGrid(SHEEP_GRID, pixelSize, gap)}
    </View>
  );
}

// ---------------------------------------------------------------------------
// KittenPiece — 10 × 10 chunky pixel art
// ---------------------------------------------------------------------------

const KITTEN_GRID: Grid = [
  ['#FF8C00', '#FF8C00', null, null, null, null, null, null, '#FF8C00', '#FF8C00'],
  ['#FF8C00', '#FF69B4', '#FF8C00', null, null, null, null, '#FF8C00', '#FF69B4', '#FF8C00'],
  ['#FF8C00', '#FF8C00', '#FF8C00', '#FFA500', '#FFA500', '#FFA500', '#FFA500', '#FF8C00', '#FF8C00', '#FF8C00'],
  [null, '#FFA500', '#FFA500', '#FFA500', '#FFA500', '#FFA500', '#FFA500', '#FFA500', '#FFA500', null],
  [null, '#FFA500', '#00CC00', '#222222', '#FFA500', '#FFA500', '#222222', '#00CC00', '#FFA500', null],
  [null, '#FFA500', '#00CC00', '#FFA500', '#FFA500', '#FFA500', '#FFA500', '#00CC00', '#FFA500', null],
  [null, '#FFA500', '#FFA500', '#FFA500', '#FF69B4', '#FF69B4', '#FFA500', '#FFA500', '#FFA500', null],
  [null, '#FFA500', '#FFA500', '#222222', '#FFA500', '#FFA500', '#222222', '#FFA500', '#FFA500', null],
  [null, null, '#FFA500', '#FFA500', '#FFA500', '#FFA500', '#FFA500', '#FFA500', null, null],
  [null, null, null, '#FF8C00', '#FF8C00', '#FF8C00', '#FF8C00', null, null, null],
];

export function KittenPiece({ size }: PieceProps) {
  const gridSize = 10;
  const gap = Math.max(1, size / 100);
  const pixelSize = (size - gap * (gridSize - 1)) / gridSize;

  return (
    <View style={{ width: size, height: size }}>
      {renderPixelGrid(KITTEN_GRID, pixelSize, gap)}
    </View>
  );
}
