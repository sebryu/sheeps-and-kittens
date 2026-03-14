import React, { useRef, useEffect, useCallback } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { BOARD_SIZE } from '../engine/constants';
import { MINI_BOARD_WIDTH, MINI_CELL, MINI_PIECE, MINI_DOT, hasDiag } from '../utils/boardLayout';
import { colors } from '../theme';
import { SheepPiece, KittenPiece } from './Pieces';
import { TutorialStepData } from './tutorialData';

// ── Mini board grid lines ──────────────────────────────────────────

function MiniBoardLines({ showDiagonals }: { showDiagonals: boolean }) {
  const lines: React.ReactElement[] = [];

  for (let r = 0; r < BOARD_SIZE; r++) {
    lines.push(
      <View
        key={`h-${r}`}
        style={{
          position: 'absolute',
          top: r * MINI_CELL - 0.75,
          left: 0,
          width: MINI_BOARD_WIDTH,
          height: 1.5,
          backgroundColor: colors.boardLine,
        }}
      />
    );
  }

  for (let c = 0; c < BOARD_SIZE; c++) {
    lines.push(
      <View
        key={`v-${c}`}
        style={{
          position: 'absolute',
          top: 0,
          left: c * MINI_CELL - 0.75,
          width: 1.5,
          height: MINI_BOARD_WIDTH,
          backgroundColor: colors.boardLine,
        }}
      />
    );
  }

  if (showDiagonals) {
    const diags: { from: [number, number]; to: [number, number] }[] = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (hasDiag(r, c)) {
          if (r + 1 < BOARD_SIZE && c + 1 < BOARD_SIZE) {
            diags.push({ from: [r, c], to: [r + 1, c + 1] });
          }
          if (r + 1 < BOARD_SIZE && c - 1 >= 0) {
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
            backgroundColor: colors.boardLine,
            transformOrigin: 'left center',
            transform: [{ rotate: `${angle}deg` }],
          }}
        />
      );
    });
  }

  return <>{lines}</>;
}

// ── Piece tracking ─────────────────────────────────────────────────

interface PieceEntry {
  row: number;
  col: number;
  type: 'KITTY' | 'SHEEP';
  animIndex: number;
  isInitial: boolean;
  willMove?: boolean;
  willBeCaptured?: boolean;
}

// ── MiniBoard component ────────────────────────────────────────────

interface MiniBoardProps {
  step: TutorialStepData;
  currentStepIndex: number;
}

const MAX_PIECES = 12;

export default function MiniBoard({ step, currentStepIndex }: MiniBoardProps) {
  const pieceAnims = useRef(
    Array.from({ length: MAX_PIECES }, () => ({
      opacity: new Animated.Value(0),
      scale: new Animated.Value(0.5),
      translateX: new Animated.Value(0),
      translateY: new Animated.Value(0),
    }))
  ).current;

  const highlightAnim = useRef(new Animated.Value(0.3)).current;
  const selectionPulse = useRef(new Animated.Value(0)).current;

  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const animsRef = useRef<Animated.CompositeAnimation[]>([]);

  const buildPieceList = useCallback((): PieceEntry[] => {
    const pieces: PieceEntry[] = [];
    let idx = 0;

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
    timeoutsRef.current.forEach((t) => clearTimeout(t));
    timeoutsRef.current = [];
    animsRef.current.forEach((a) => a.stop());
    animsRef.current = [];

    const pieces = buildPieceList();

    for (let i = 0; i < MAX_PIECES; i++) {
      pieceAnims[i].opacity.setValue(0);
      pieceAnims[i].scale.setValue(0.5);
      pieceAnims[i].translateX.setValue(0);
      pieceAnims[i].translateY.setValue(0);
    }
    highlightAnim.setValue(0.3);
    selectionPulse.setValue(0);

    // Show initial pieces with stagger
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

    // Highlight pulse
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

    // Animation steps
    step.animations.forEach((anim) => {
      if (anim.type === 'place') {
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
        const pEntry = pieces.find(
          (p) =>
            p.isInitial &&
            p.row === anim.from![0] &&
            p.col === anim.from![1] &&
            p.type === anim.piece
        );
        if (!pEntry) return;

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

    // Auto-replay
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
    <View style={styles.container}>
      <View style={styles.background}>
        <View style={{ width: MINI_BOARD_WIDTH, height: MINI_BOARD_WIDTH, position: 'relative' }}>
          <MiniBoardLines showDiagonals={step.showDiagonals} />

          {/* Intersection dots */}
          {Array.from({ length: BOARD_SIZE }, (_, r) =>
            Array.from({ length: BOARD_SIZE }, (_, c) => {
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
                      backgroundColor: colors.accent,
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
                      backgroundColor: colors.validMove,
                      borderWidth: 2,
                      borderColor: colors.validMoveBorder,
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
                      ? colors.boardDotFaded
                      : colors.boardDot,
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
                    styles.pieceCircle,
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

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  background: {
    backgroundColor: colors.boardSurface,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.boardBorder,
    padding: MINI_PIECE / 2 + 4,
  },
  pieceCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.pieceBackground,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
});
