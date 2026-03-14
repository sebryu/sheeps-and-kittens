import { useRef, useEffect, useCallback } from 'react';
import { Animated } from 'react-native';
import { GameState } from '../engine/types';
import { triggerHaptic } from '../utils/haptics';
import { playSound } from '../utils/sounds';

/**
 * Detects game events (win, phase change, capture, selection, moves)
 * and triggers appropriate haptics, sounds, and animations.
 */
export function useGameEvents(
  gameState: GameState,
  animations: {
    winModalScale: Animated.Value;
    winOverlayOpacity: Animated.Value;
    scoreBumpScale: Animated.Value;
  },
  showPhaseBanner: () => void,
) {
  const prevGameStateRef = useRef<GameState | null>(null);

  useEffect(() => {
    const prev = prevGameStateRef.current;
    const curr = gameState;
    prevGameStateRef.current = curr;

    if (!prev) return;

    // Win
    if (!prev.winner && curr.winner) {
      triggerHaptic('win');
      playSound('win');
      animations.winModalScale.setValue(0.5);
      animations.winOverlayOpacity.setValue(0);
      Animated.parallel([
        Animated.spring(animations.winModalScale, {
          toValue: 1,
          friction: 5,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(animations.winOverlayOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
      return;
    }

    // Phase transition (Placement → Movement)
    if (prev.phase !== curr.phase && curr.phase === 'MOVEMENT') {
      triggerHaptic('phaseChange');
      showPhaseBanner();
    }

    // Score bump on capture
    if (curr.sheepCaptured > prev.sheepCaptured) {
      animations.scoreBumpScale.setValue(1);
      Animated.sequence([
        Animated.timing(animations.scoreBumpScale, {
          toValue: 1.5,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.spring(animations.scoreBumpScale, {
          toValue: 1,
          friction: 3,
          tension: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }

    // Selection event (new selection, no lastMove change)
    if (!prev.selectedPiece && curr.selectedPiece) {
      triggerHaptic('select');
      playSound('select');
      return;
    }

    // Move events
    const move = curr.lastMove;
    if (!move || move === prev.lastMove) return;

    switch (move.type) {
      case 'place':
        triggerHaptic('place');
        playSound('place');
        break;
      case 'move':
        triggerHaptic('move');
        playSound('move');
        break;
      case 'capture':
        triggerHaptic('capture');
        playSound('capture');
        break;
    }
  }, [gameState]);
}
