import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { GameState, GameConfig } from '../engine/types';
import { applyMove } from '../engine/gameEngine';
import { findBestMove } from '../engine/aiEngine';

/**
 * Manages AI move orchestration: detects when it's the AI's turn,
 * computes the best move after a delay, and updates state.
 *
 * Also drives the "thinking" pulse animation on the status text.
 */
export function useAIPlayer(
  gameState: GameState,
  gameConfig: GameConfig,
  setGameState: React.Dispatch<React.SetStateAction<GameState>>,
  isAIThinking: boolean,
  setIsAIThinking: React.Dispatch<React.SetStateAction<boolean>>,
  aiPulseOpacity: Animated.Value,
) {
  const aiPulseLoop = useRef<Animated.CompositeAnimation | null>(null);

  const isAITurnFn = (state: GameState) =>
    (gameConfig.mode === 'ai-sheep' && state.turn === 'SHEEP') ||
    (gameConfig.mode === 'ai-kitty' && state.turn === 'KITTY');

  // AI thinking pulse
  useEffect(() => {
    if (isAIThinking) {
      aiPulseOpacity.setValue(0.4);
      aiPulseLoop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(aiPulseOpacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(aiPulseOpacity, {
            toValue: 0.4,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      );
      aiPulseLoop.current.start();
    } else {
      aiPulseLoop.current?.stop();
      aiPulseLoop.current = null;
      aiPulseOpacity.setValue(1);
    }
  }, [isAIThinking]);

  // AI move execution
  useEffect(() => {
    if (gameConfig.mode === 'local') return;
    if (!isAITurnFn(gameState)) return;
    if (gameState.winner) return;

    setIsAIThinking(true);

    const timer = setTimeout(() => {
      setGameState(prev => {
        const bestMove = findBestMove(prev, gameConfig.difficulty);
        if (bestMove) {
          return applyMove(prev, bestMove);
        }
        return prev;
      });
      setIsAIThinking(false);
    }, 600);

    return () => {
      clearTimeout(timer);
      setIsAIThinking(false);
    };
  }, [gameState.turn, gameState.winner, gameConfig.mode, gameConfig.difficulty]);

  return { isAITurn: isAITurnFn };
}
