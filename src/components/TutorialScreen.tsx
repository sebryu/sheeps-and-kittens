import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SheepPiece, KittenPiece } from './Pieces';

const SCREEN_WIDTH = Dimensions.get('window').width;

// ──────────────────────────────────────
//  Tutorial Step Data
// ──────────────────────────────────────

interface PiecePlacement {
  row: number;
  col: number;
  type: 'KITTY' | 'SHEEP';
}

interface AnimStep {
  type: 'place' | 'move' | 'capture';
  piece: 'KITTY' | 'SHEEP';
  from?: [number, number];
  to: [number, number];
  captured?: [number, number];
  delay: number;
}

interface TutorialStepData {
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

const STEPS: TutorialStepData[] = [
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

// ──────────────────────────────────────
//  Mini Board Component
// ──────────────────────────────────────

const MINI_BOARD_WIDTH = Math.min(220, SCREEN_WIDTH - 120);
const MINI_GRID = 5;
const MINI_CELL = MINI_BOARD_WIDTH / (MINI_GRID - 1);
const MINI_PIECE = MINI_CELL * 0.6;
const MINI_DOT = 6;

function hasDiag(r: number, c: number): boolean {
  return (r + c) % 2 === 0;
}

function MiniBoardLines({ showDiagonals }: { showDiagonals: boolean }) {
  const lines: React.ReactElement[] = [];

  for (let r = 0; r < MINI_GRID; r++) {
    lines.push(
      <View
        key={`h-${r}`}
        style={{
          position: 'absolute',
          top: r * MINI_CELL - 0.75,
          left: 0,
          width: MINI_BOARD_WIDTH,
          height: 1.5,
          backgroundColor: '#5D4037',
        }}
      />
    );
  }

  for (let c = 0; c < MINI_GRID; c++) {
    lines.push(
      <View
        key={`v-${c}`}
        style={{
          position: 'absolute',
          top: 0,
          left: c * MINI_CELL - 0.75,
          width: 1.5,
          height: MINI_BOARD_WIDTH,
          backgroundColor: '#5D4037',
        }}
      />
    );
  }

  if (showDiagonals) {
    const diags: { from: [number, number]; to: [number, number] }[] = [];
    for (let r = 0; r < MINI_GRID; r++) {
      for (let c = 0; c < MINI_GRID; c++) {
        if (hasDiag(r, c)) {
          if (r + 1 < MINI_GRID && c + 1 < MINI_GRID) {
            diags.push({ from: [r, c], to: [r + 1, c + 1] });
          }
          if (r + 1 < MINI_GRID && c - 1 >= 0) {
            diags.push({ from: [r, c], to: [r + 1, c - 1] });
          }
        }
      }
    }
    diags.forEach(({ from, to }, i) => {
      const x1 = from[1] * MINI_CELL;
      const y1 = from[0] * MINI_CELL;
      const x2 = to[1] * MINI_CELL;
      const y2 = to[0] * MINI_CELL;
      const dx = x2 - x1;
      const dy = y2 - y1;
      const length = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);
      lines.push(
        <View
          key={`d-${i}`}
          style={{
            position: 'absolute',
            top: y1 - 0.75,
            left: x1,
            width: length,
            height: 1.5,
            backgroundColor: '#5D4037',
            transformOrigin: 'left center',
            transform: [{ rotate: `${angle}deg` }],
          }}
        />
      );
    });
  }

  return <>{lines}</>;
}

interface MiniBoardProps {
  step: TutorialStepData;
  currentStepIndex: number;
}

function MiniBoard({ step, currentStepIndex }: MiniBoardProps) {
  // Track pieces on the board: map of "r,c" -> { type, animated values }
  const MAX_PIECES = 12;
  const pieceAnims = useRef(
    Array.from({ length: MAX_PIECES }, () => ({
      opacity: new Animated.Value(0),
      scale: new Animated.Value(0.5),
      translateX: new Animated.Value(0),
      translateY: new Animated.Value(0),
    }))
  ).current;

  // Highlight animation for valid moves / highlighted cells
  const highlightAnim = useRef(new Animated.Value(0.3)).current;

  // Selection pulse for pieces about to move
  const selectionPulse = useRef(new Animated.Value(0)).current;

  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const animsRef = useRef<Animated.CompositeAnimation[]>([]);

  // Build piece list: initial + animated placements
  interface PieceEntry {
    row: number;
    col: number;
    type: 'KITTY' | 'SHEEP';
    animIndex: number;
    isInitial: boolean;
    willMove?: boolean;
    willBeCaptured?: boolean;
  }

  const buildPieceList = useCallback((): PieceEntry[] => {
    const pieces: PieceEntry[] = [];
    let idx = 0;

    // Initial pieces
    for (const p of step.initialPieces) {
      const willMove = step.animations.some(
        (a) => a.from && a.from[0] === p.row && a.from[1] === p.col
      );
      const willBeCaptured = step.animations.some(
        (a) => a.captured && a.captured[0] === p.row && a.captured[1] === p.col
      );
      pieces.push({
        row: p.row,
        col: p.col,
        type: p.type,
        animIndex: idx,
        isInitial: true,
        willMove,
        willBeCaptured,
      });
      idx++;
    }

    // Animated placements (new pieces that appear via animation)
    for (const a of step.animations) {
      if (a.type === 'place') {
        pieces.push({
          row: a.to[0],
          col: a.to[1],
          type: a.piece,
          animIndex: idx,
          isInitial: false,
        });
        idx++;
      }
    }

    return pieces;
  }, [step]);

  const resetAndAnimate = useCallback(() => {
    // Clear previous
    timeoutsRef.current.forEach((t) => clearTimeout(t));
    timeoutsRef.current = [];
    animsRef.current.forEach((a) => a.stop());
    animsRef.current = [];

    const pieces = buildPieceList();

    // Reset all anims
    for (let i = 0; i < MAX_PIECES; i++) {
      pieceAnims[i].opacity.setValue(0);
      pieceAnims[i].scale.setValue(0.5);
      pieceAnims[i].translateX.setValue(0);
      pieceAnims[i].translateY.setValue(0);
    }
    highlightAnim.setValue(0.3);
    selectionPulse.setValue(0);

    // Show initial pieces immediately with a stagger
    pieces
      .filter((p) => p.isInitial)
      .forEach((p, i) => {
        const t = setTimeout(() => {
          pieceAnims[p.animIndex].opacity.setValue(1);
          const spring = Animated.spring(pieceAnims[p.animIndex].scale, {
            toValue: 1,
            friction: 5,
            tension: 40,
            useNativeDriver: true,
          });
          spring.start();
          animsRef.current.push(spring);
        }, i * 80);
        timeoutsRef.current.push(t);
      });

    // Highlight pulse for highlighted cells / diagonal nodes
    if (step.highlightDiagonalNodes || step.highlightCells) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(highlightAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(highlightAnim, {
            toValue: 0.3,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      animsRef.current.push(pulse);
    }

    // Run animation steps
    step.animations.forEach((anim) => {
      if (anim.type === 'place') {
        // Find the piece entry
        const pEntry = pieces.find(
          (p) => !p.isInitial && p.row === anim.to[0] && p.col === anim.to[1]
        );
        if (!pEntry) return;
        const t = setTimeout(() => {
          const seq = Animated.parallel([
            Animated.timing(pieceAnims[pEntry.animIndex].opacity, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.spring(pieceAnims[pEntry.animIndex].scale, {
              toValue: 1,
              friction: 5,
              tension: 40,
              useNativeDriver: true,
            }),
          ]);
          seq.start();
          animsRef.current.push(seq);
        }, anim.delay);
        timeoutsRef.current.push(t);
      } else if (anim.type === 'move') {
        // Find the piece at 'from'
        const pEntry = pieces.find(
          (p) =>
            p.isInitial &&
            p.row === anim.from![0] &&
            p.col === anim.from![1] &&
            p.type === anim.piece
        );
        if (!pEntry) return;

        // Pulse selection first
        const selectT = setTimeout(() => {
          const pulse = Animated.loop(
            Animated.sequence([
              Animated.timing(selectionPulse, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
              }),
              Animated.timing(selectionPulse, {
                toValue: 0,
                duration: 400,
                useNativeDriver: true,
              }),
            ])
          );
          pulse.start();
          animsRef.current.push(pulse);
        }, anim.delay - 600);
        timeoutsRef.current.push(selectT);

        const t = setTimeout(() => {
          selectionPulse.setValue(0);
          const dx = (anim.to[1] - anim.from![1]) * MINI_CELL;
          const dy = (anim.to[0] - anim.from![0]) * MINI_CELL;
          const moveAnim = Animated.parallel([
            Animated.spring(pieceAnims[pEntry.animIndex].translateX, {
              toValue: dx,
              friction: 5,
              tension: 40,
              useNativeDriver: true,
            }),
            Animated.spring(pieceAnims[pEntry.animIndex].translateY, {
              toValue: dy,
              friction: 5,
              tension: 40,
              useNativeDriver: true,
            }),
          ]);
          moveAnim.start();
          animsRef.current.push(moveAnim);
        }, anim.delay);
        timeoutsRef.current.push(t);
      } else if (anim.type === 'capture') {
        const pEntry = pieces.find(
          (p) =>
            p.isInitial &&
            p.row === anim.from![0] &&
            p.col === anim.from![1] &&
            p.type === anim.piece
        );
        const capturedEntry = pieces.find(
          (p) => p.row === anim.captured![0] && p.col === anim.captured![1] && p.willBeCaptured
        );
        if (!pEntry) return;

        // Pulse selection
        const selectT = setTimeout(() => {
          const pulse = Animated.loop(
            Animated.sequence([
              Animated.timing(selectionPulse, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
              }),
              Animated.timing(selectionPulse, {
                toValue: 0,
                duration: 400,
                useNativeDriver: true,
              }),
            ])
          );
          pulse.start();
          animsRef.current.push(pulse);
        }, anim.delay - 800);
        timeoutsRef.current.push(selectT);

        const t = setTimeout(() => {
          selectionPulse.setValue(0);
          const dx = (anim.to[1] - anim.from![1]) * MINI_CELL;
          const dy = (anim.to[0] - anim.from![0]) * MINI_CELL;

          const jumpAnim = Animated.parallel([
            Animated.spring(pieceAnims[pEntry.animIndex].translateX, {
              toValue: dx,
              friction: 5,
              tension: 40,
              useNativeDriver: true,
            }),
            Animated.spring(pieceAnims[pEntry.animIndex].translateY, {
              toValue: dy,
              friction: 5,
              tension: 40,
              useNativeDriver: true,
            }),
          ]);
          jumpAnim.start();
          animsRef.current.push(jumpAnim);

          // Captured piece disappears
          if (capturedEntry) {
            const disappearT = setTimeout(() => {
              const disappear = Animated.parallel([
                Animated.timing(pieceAnims[capturedEntry.animIndex].scale, {
                  toValue: 0,
                  duration: 300,
                  useNativeDriver: true,
                }),
                Animated.timing(pieceAnims[capturedEntry.animIndex].opacity, {
                  toValue: 0,
                  duration: 300,
                  useNativeDriver: true,
                }),
              ]);
              disappear.start();
              animsRef.current.push(disappear);
            }, 250);
            timeoutsRef.current.push(disappearT);
          }
        }, anim.delay);
        timeoutsRef.current.push(t);
      }
    });

    // Auto-replay after all animations finish
    const totalDuration = step.animations.length > 0
      ? Math.max(...step.animations.map((a) => a.delay)) + 2000
      : 0;

    if (totalDuration > 0) {
      const replayT = setTimeout(() => {
        resetAndAnimate();
      }, totalDuration + 2000);
      timeoutsRef.current.push(replayT);
    }
  }, [step, buildPieceList, pieceAnims, highlightAnim, selectionPulse]);

  useEffect(() => {
    resetAndAnimate();
    return () => {
      timeoutsRef.current.forEach((t) => clearTimeout(t));
      animsRef.current.forEach((a) => a.stop());
    };
  }, [currentStepIndex, resetAndAnimate]);

  const pieces = buildPieceList();

  return (
    <View style={miniStyles.container}>
      <View style={miniStyles.background}>
        <View style={{ width: MINI_BOARD_WIDTH, height: MINI_BOARD_WIDTH, position: 'relative' }}>
          <MiniBoardLines showDiagonals={step.showDiagonals} />

          {/* Intersection dots */}
          {Array.from({ length: MINI_GRID }, (_, r) =>
            Array.from({ length: MINI_GRID }, (_, c) => {
              const isHighlightedDiag =
                step.highlightDiagonalNodes && hasDiag(r, c);
              const isHighlightedCell = step.highlightCells?.some(
                ([hr, hc]) => hr === r && hc === c
              );
              const hasPiece = pieces.some((p) => p.row === r && p.col === c);

              if (hasPiece) return null;

              if (isHighlightedDiag) {
                return (
                  <Animated.View
                    key={`dot-${r}-${c}`}
                    style={{
                      position: 'absolute',
                      top: r * MINI_CELL - 6,
                      left: c * MINI_CELL - 6,
                      width: 12,
                      height: 12,
                      borderRadius: 6,
                      backgroundColor: '#FFC107',
                      opacity: highlightAnim,
                    }}
                  />
                );
              }

              if (isHighlightedCell) {
                return (
                  <Animated.View
                    key={`dot-${r}-${c}`}
                    style={{
                      position: 'absolute',
                      top: r * MINI_CELL - 10,
                      left: c * MINI_CELL - 10,
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      backgroundColor: 'rgba(76, 175, 80, 0.4)',
                      borderWidth: 2,
                      borderColor: '#4CAF50',
                      opacity: highlightAnim,
                    }}
                  />
                );
              }

              return (
                <View
                  key={`dot-${r}-${c}`}
                  style={{
                    position: 'absolute',
                    top: r * MINI_CELL - MINI_DOT / 2,
                    left: c * MINI_CELL - MINI_DOT / 2,
                    width: MINI_DOT,
                    height: MINI_DOT,
                    borderRadius: MINI_DOT / 2,
                    backgroundColor: step.highlightDiagonalNodes && !hasDiag(r, c)
                      ? '#A1887F'
                      : '#5D4037',
                  }}
                />
              );
            })
          )}

          {/* Pieces */}
          {pieces.map((p) => {
            const anim = pieceAnims[p.animIndex];
            const isMoving = p.willMove;

            return (
              <Animated.View
                key={`piece-${p.animIndex}-${p.row}-${p.col}`}
                style={{
                  position: 'absolute',
                  top: p.row * MINI_CELL - MINI_PIECE / 2,
                  left: p.col * MINI_CELL - MINI_PIECE / 2,
                  width: MINI_PIECE,
                  height: MINI_PIECE,
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: anim.opacity,
                  transform: [
                    { translateX: anim.translateX },
                    { translateY: anim.translateY },
                    { scale: anim.scale },
                  ],
                  zIndex: isMoving ? 20 : 10,
                }}
              >
                <View
                  style={[
                    miniStyles.pieceCircle,
                    { width: MINI_PIECE, height: MINI_PIECE, borderRadius: MINI_PIECE / 2 },
                  ]}
                >
                  {p.type === 'SHEEP' ? (
                    <SheepPiece size={MINI_PIECE * 0.7} />
                  ) : (
                    <KittenPiece size={MINI_PIECE * 0.7} />
                  )}
                </View>
              </Animated.View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const miniStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  background: {
    backgroundColor: '#D7CCC8',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#8D6E63',
    padding: MINI_PIECE / 2 + 4,
  },
  pieceCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
});

// ──────────────────────────────────────
//  Tutorial Screen
// ──────────────────────────────────────

interface TutorialScreenProps {
  onBack: () => void;
}

export default function TutorialScreen({ onBack }: TutorialScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const navigatingRef = useRef(false);

  const step = STEPS[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === STEPS.length - 1;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const goToStep = (next: number) => {
    if (navigatingRef.current) return;
    navigatingRef.current = true;

    const direction = next > currentStep ? -1 : 1;
    Animated.timing(slideAnim, {
      toValue: direction * SCREEN_WIDTH,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setCurrentStep(next);
      slideAnim.setValue(-direction * SCREEN_WIDTH);
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start(() => {
        navigatingRef.current = false;
      });
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.innerContainer, { opacity: fadeAnim }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity testID="tutorial-back-button" style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text testID="tutorial-header" style={styles.headerTitle}>How to Play</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Card */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          bounces={false}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[styles.card, { transform: [{ translateX: slideAnim }] }]}
          >
            {/* Step icon */}
            <View style={styles.iconRow}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>
                  {currentStep + 1} / {STEPS.length}
                </Text>
              </View>
            </View>

            <Text style={styles.stepTitle}>{step.title}</Text>
            <Text style={styles.stepSubtitle}>{step.subtitle}</Text>

            {/* Mini Board */}
            <MiniBoard step={step} currentStepIndex={currentStep} />

            <Text style={styles.stepDescription}>{step.description}</Text>

            {/* Tip */}
            {step.tip && (
              <View style={styles.tipBox}>
                <Text style={styles.tipLabel}>Tip</Text>
                <Text style={styles.tipText}>{step.tip}</Text>
              </View>
            )}
          </Animated.View>
        </ScrollView>

        {/* Progress dots */}
        <View style={styles.progressRow}>
          {STEPS.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === currentStep && styles.activeDot,
              ]}
            />
          ))}
        </View>

        {/* Navigation buttons */}
        <View style={styles.navRow}>
          {!isFirst ? (
            <TouchableOpacity
              testID="tutorial-prev-button"
              style={styles.navButton}
              onPress={() => goToStep(currentStep - 1)}
              activeOpacity={0.7}
            >
              <Text style={styles.navButtonText}>← Previous</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.navSpacer} />
          )}

          {!isLast ? (
            <TouchableOpacity
              testID="tutorial-next-button"
              style={[styles.navButton, styles.nextButton]}
              onPress={() => goToStep(currentStep + 1)}
              activeOpacity={0.7}
            >
              <Text style={[styles.navButtonText, styles.nextButtonText]}>
                Next →
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              testID="tutorial-start-button"
              style={[styles.navButton, styles.startButton]}
              onPress={onBack}
              activeOpacity={0.7}
            >
              <Text style={[styles.navButtonText, styles.startButtonText]}>
                Start Playing!
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8E1',
  },
  innerContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#5D4037',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3E2723',
  },
  headerSpacer: {
    width: 60,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconRow: {
    alignItems: 'center',
    marginBottom: 8,
  },
  stepBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stepBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4CAF50',
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#3E2723',
    textAlign: 'center',
  },
  stepSubtitle: {
    fontSize: 14,
    color: '#8D6E63',
    textAlign: 'center',
    marginTop: 4,
  },
  stepDescription: {
    fontSize: 15,
    color: '#5D4037',
    lineHeight: 22,
    textAlign: 'center',
    marginTop: 12,
  },
  tipBox: {
    backgroundColor: '#FFFDE7',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#FFC107',
    padding: 12,
    marginTop: 12,
  },
  tipLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F57F17',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tipText: {
    fontSize: 13,
    color: '#5D4037',
    lineHeight: 18,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginVertical: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D7CCC8',
  },
  activeDot: {
    backgroundColor: '#4CAF50',
    width: 20,
    borderRadius: 4,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  navSpacer: {
    width: 100,
  },
  navButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#EFEBE9',
  },
  navButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#5D4037',
  },
  nextButton: {
    backgroundColor: '#4CAF50',
  },
  nextButtonText: {
    color: '#FFFFFF',
  },
  startButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 28,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
