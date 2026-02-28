export interface PiecePlacement {
  row: number;
  col: number;
  type: 'KITTY' | 'SHEEP';
}

export interface AnimStep {
  type: 'place' | 'move' | 'capture';
  piece: 'KITTY' | 'SHEEP';
  from?: [number, number];
  to: [number, number];
  captured?: [number, number];
  delay: number;
}

export interface TutorialStepData {
  title: string;
  subtitle: string;
  description: string;
  tip?: string;
  boardSize: number;
  initialPieces: PiecePlacement[];
  showDiagonals: boolean;
  highlightDiagonalNodes?: boolean;
  highlightCells?: [number, number][];
  animations: AnimStep[];
}

export const STEPS: TutorialStepData[] = [
  {
    title: 'The Board',
    subtitle: 'A 5x5 grid of intersections',
    description:
      'Sheeps & Kittens is played on a 5x5 grid. Pieces sit on the intersections where lines cross and move along the lines. Some intersections also have diagonal connections.',
    tip: 'The board has 25 intersections. Controlling the center gives more movement options!',
    boardSize: 5,
    initialPieces: [],
    showDiagonals: true,
    animations: [],
  },
  {
    title: 'Meet the Kittens',
    subtitle: '4 kittens start at the corners',
    description:
      'The 4 Kittens begin at the four corners of the board. They are the hunters — their goal is to capture sheeps by jumping over them.',
    boardSize: 5,
    initialPieces: [],
    showDiagonals: true,
    animations: [
      { type: 'place', piece: 'KITTY', to: [0, 0], delay: 300 },
      { type: 'place', piece: 'KITTY', to: [0, 4], delay: 700 },
      { type: 'place', piece: 'KITTY', to: [4, 0], delay: 1100 },
      { type: 'place', piece: 'KITTY', to: [4, 4], delay: 1500 },
    ],
  },
  {
    title: 'Placing Sheeps',
    subtitle: '20 sheeps, one at a time',
    description:
      'Sheeps go first! During the Placement phase, place one sheep on any empty intersection each turn. After each placement, one kitten moves. Continue until all 20 sheeps are on the board.',
    tip: 'Place sheeps strategically to surround kittens while keeping escape routes blocked.',
    boardSize: 5,
    initialPieces: [
      { row: 0, col: 0, type: 'KITTY' },
      { row: 0, col: 4, type: 'KITTY' },
      { row: 4, col: 0, type: 'KITTY' },
      { row: 4, col: 4, type: 'KITTY' },
    ],
    showDiagonals: true,
    animations: [
      { type: 'place', piece: 'SHEEP', to: [0, 2], delay: 600 },
      { type: 'place', piece: 'SHEEP', to: [2, 0], delay: 1400 },
      { type: 'place', piece: 'SHEEP', to: [2, 4], delay: 2200 },
      { type: 'place', piece: 'SHEEP', to: [4, 2], delay: 3000 },
    ],
  },
  {
    title: 'Moving Pieces',
    subtitle: 'Move along the lines',
    description:
      'After all 20 sheeps are placed, the Movement phase begins. Both sides take turns moving one piece to an adjacent empty intersection along a connected line.',
    boardSize: 5,
    initialPieces: [
      { row: 2, col: 2, type: 'SHEEP' },
      { row: 0, col: 0, type: 'KITTY' },
    ],
    showDiagonals: true,
    animations: [
      { type: 'move', piece: 'SHEEP', from: [2, 2], to: [2, 3], delay: 1000 },
      { type: 'move', piece: 'KITTY', from: [0, 0], to: [1, 0], delay: 2500 },
    ],
  },
  {
    title: 'Kitten Captures',
    subtitle: 'Jump over a sheep to capture',
    description:
      'A kitten captures by jumping over an adjacent sheep and landing on the empty space directly beyond. The captured sheep is removed! Captures can happen in both phases.',
    tip: 'Kittens can capture in any direction — including diagonals at eligible intersections.',
    boardSize: 5,
    initialPieces: [
      { row: 2, col: 0, type: 'KITTY' },
      { row: 2, col: 1, type: 'SHEEP' },
    ],
    showDiagonals: true,
    highlightCells: [[2, 2]],
    animations: [
      { type: 'capture', piece: 'KITTY', from: [2, 0], to: [2, 2], captured: [2, 1], delay: 1200 },
    ],
  },
  {
    title: 'Diagonal Rules',
    subtitle: 'Not all intersections are equal',
    description:
      'Diagonal lines only exist where (row + column) is even — the corners, center, and edge midpoints. At these golden intersections, pieces can move in up to 8 directions. Others allow only 4.',
    tip: 'Diagonal intersections are strategically powerful — they connect to more neighbors!',
    boardSize: 5,
    initialPieces: [],
    showDiagonals: true,
    highlightDiagonalNodes: true,
    animations: [],
  },
  {
    title: 'Winning the Game',
    subtitle: 'Two paths to victory',
    description:
      'Sheeps win by surrounding and blocking all 4 kittens so none can move. Kittens win by capturing 5 sheeps. If sheeps cannot move during the Movement phase, kittens also win by stalemate.',
    tip: 'Strategy: Sheeps should work together to corner kittens. Kittens should stay mobile while hunting for captures.',
    boardSize: 5,
    initialPieces: [
      // Show a blocked kitten scenario
      { row: 0, col: 0, type: 'KITTY' },
      { row: 0, col: 1, type: 'SHEEP' },
      { row: 1, col: 0, type: 'SHEEP' },
      { row: 1, col: 1, type: 'SHEEP' },
      // Show captures tally area
      { row: 4, col: 4, type: 'KITTY' },
      { row: 3, col: 3, type: 'SHEEP' },
    ],
    showDiagonals: true,
    animations: [
      { type: 'capture', piece: 'KITTY', from: [4, 4], to: [2, 2], captured: [3, 3], delay: 1500 },
    ],
  },
];
