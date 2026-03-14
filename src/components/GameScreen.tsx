import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Board from './Board';
import { SheepPiece, KittenPiece } from './Pieces';
import WinModal from './WinModal';
import { GameState, GameConfig } from '../engine/types';
import {
  createInitialState,
  handleTap,
  getGameStatusText,
  forfeitGame,
} from '../engine/gameEngine';
import { loadAllSounds, playSound, unloadAllSounds } from '../utils/sounds';
import { triggerHaptic } from '../utils/haptics';
import { colors } from '../theme';
import { useGameEvents } from '../hooks/useGameEvents';
import { useAIPlayer } from '../hooks/useAIPlayer';

interface GameScreenProps {
  onBack: () => void;
  gameConfig: GameConfig;
}

export default function GameScreen({ onBack, gameConfig }: GameScreenProps) {
  const [gameState, setGameState] = useState<GameState>(createInitialState());
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [phaseBannerVisible, setPhaseBannerVisible] = useState(false);

  // Ref kept in sync with the latest game state so event handlers can read
  // current state without closing over a stale value.
  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;

  // ── Animated values ────────────────────────────────────────────────
  const winModalScale = useRef(new Animated.Value(0.5)).current;
  const winOverlayOpacity = useRef(new Animated.Value(0)).current;
  const scoreBumpScale = useRef(new Animated.Value(1)).current;
  const phaseBannerY = useRef(new Animated.Value(-60)).current;
  const phaseBannerOpacity = useRef(new Animated.Value(0)).current;
  const aiPulseOpacity = useRef(new Animated.Value(1)).current;

  // ── Sound loading ──────────────────────────────────────────────────
  useEffect(() => {
    loadAllSounds();
    return () => { unloadAllSounds(); };
  }, []);

  // ── Phase banner helper ────────────────────────────────────────────
  const showPhaseBanner = useCallback(() => {
    setPhaseBannerVisible(true);
    phaseBannerY.setValue(-60);
    phaseBannerOpacity.setValue(0);
    Animated.sequence([
      Animated.parallel([
        Animated.spring(phaseBannerY, {
          toValue: 0,
          friction: 7,
          tension: 60,
          useNativeDriver: true,
        }),
        Animated.timing(phaseBannerOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(1800),
      Animated.parallel([
        Animated.timing(phaseBannerY, {
          toValue: -60,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(phaseBannerOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => setPhaseBannerVisible(false));
  }, []);

  // ── Game event detection (sounds, haptics, animations) ─────────────
  useGameEvents(gameState, { winModalScale, winOverlayOpacity, scoreBumpScale }, showPhaseBanner);

  // ── AI player ──────────────────────────────────────────────────────
  const { isAITurn } = useAIPlayer(
    gameState, gameConfig, setGameState,
    isAIThinking, setIsAIThinking, aiPulseOpacity,
  );

  // ── Board tap ──────────────────────────────────────────────────────
  const onBoardTap = useCallback((row: number, col: number) => {
    if (isAIThinking) return;
    const curr = gameStateRef.current;
    if (isAITurn(curr)) return;
    const next = handleTap(curr, row, col);
    if (next === curr) {
      triggerHaptic('invalid');
      playSound('invalid');
    }
    setGameState(next);
  }, [isAIThinking, gameConfig.mode]);

  const onRestart = useCallback(() => {
    setGameState(createInitialState());
  }, []);

  const onForfeit = useCallback(() => {
    if (gameState.winner) return;
    const side = gameState.turn === 'SHEEP' ? 'Sheeps' : 'Kittens';
    Alert.alert(
      'Forfeit Game?',
      `${side} will forfeit and the opponent wins.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Forfeit',
          style: 'destructive',
          onPress: () => setGameState(current => forfeitGame(current)),
        },
      ],
    );
  }, [gameState.winner, gameState.turn]);

  // ── Labels & text ──────────────────────────────────────────────────
  const sheepLabel = gameConfig.mode === 'ai-sheep'
    ? 'Sheeps (AI)' : gameConfig.mode === 'ai-kitty'
    ? 'Sheeps (You)' : 'Sheeps';
  const kittyLabel = gameConfig.mode === 'ai-kitty'
    ? 'Kittens (AI)' : gameConfig.mode === 'ai-sheep'
    ? 'Kittens (You)' : 'Kittens';

  const statusText = isAIThinking
    ? (gameState.turn === 'KITTY' ? 'Kitty is thinking...' : 'Sheep is thinking...')
    : getGameStatusText(gameState);

  const isSheepTurn = gameState.turn === 'SHEEP';

  // ── Render ─────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      {/* Phase transition banner */}
      {phaseBannerVisible && (
        <Animated.View
          style={[
            styles.phaseBanner,
            {
              transform: [{ translateY: phaseBannerY }],
              opacity: phaseBannerOpacity,
            },
          ]}
        >
          <Text style={styles.phaseBannerText}>Movement Phase Begins!</Text>
        </Animated.View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity testID="game-back-button" style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text testID="game-title" style={styles.title}>Sheeps & Kittens</Text>
        <TouchableOpacity testID="restart-button" style={styles.restartButton} onPress={onRestart}>
          <Text style={styles.restartButtonText}>↻</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
        {/* Score Panel */}
        <View style={styles.scorePanel}>
          <View style={[styles.scoreCard, isSheepTurn && !gameState.winner && styles.activeScoreCard]}>
            <SheepPiece size={36} />
            <Text style={styles.scoreLabel}>{sheepLabel}</Text>
            <Text style={styles.scoreDetail}>
              {gameState.phase === 'PLACEMENT'
                ? `${gameState.sheepPlaced}/20 placed`
                : `${20 - gameState.sheepCaptured} alive`}
            </Text>
          </View>
          <View style={styles.vsContainer}>
            <Text style={styles.vsText}>VS</Text>
          </View>
          <View style={[styles.scoreCard, !isSheepTurn && !gameState.winner && styles.activeScoreCard]}>
            <KittenPiece size={36} />
            <Text style={styles.scoreLabel}>{kittyLabel}</Text>
            <Animated.Text
              style={[styles.scoreDetail, { transform: [{ scale: scoreBumpScale }] }]}
            >
              {gameState.sheepCaptured}/5 captured
            </Animated.Text>
          </View>
        </View>

        {/* Status Bar */}
        <View testID="status-bar" style={[styles.statusBar, gameState.winner && styles.winnerStatusBar]}>
          <Animated.Text
            style={[
              styles.statusText,
              gameState.winner && styles.winnerStatusText,
              isAIThinking && { opacity: aiPulseOpacity },
            ]}
          >
            {statusText}
          </Animated.Text>
        </View>

        {/* Board */}
        <Board gameState={gameState} onTap={onBoardTap} />

        {/* Phase indicator */}
        <View style={styles.phaseBar}>
          <Text testID="phase-indicator" style={styles.phaseText}>
            Phase: {gameState.phase === 'PLACEMENT' ? '🏗 Placement' : '♟ Movement'}
          </Text>
        </View>

        {/* Forfeit button */}
        {!gameState.winner && (
          <TouchableOpacity testID="forfeit-button" style={styles.forfeitButton} onPress={onForfeit}>
            <Text style={styles.forfeitButtonText}>🏳 Forfeit</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Win Modal */}
      <WinModal
        gameState={gameState}
        gameConfig={gameConfig}
        winModalScale={winModalScale}
        winOverlayOpacity={winOverlayOpacity}
        onRestart={onRestart}
        onBack={onBack}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  phaseBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: colors.accent,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 12,
  },
  phaseBannerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
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
    color: colors.textSecondary,
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  restartButton: {
    padding: 8,
  },
  restartButtonText: {
    fontSize: 24,
    color: colors.textSecondary,
  },
  scorePanel: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  scoreCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 2,
    borderColor: colors.cardBorder,
  },
  activeScoreCard: {
    borderColor: colors.accent,
    backgroundColor: colors.surfaceLight,
  },
  scoreLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginTop: 2,
  },
  scoreDetail: {
    fontSize: 12,
    color: '#795548',
    marginTop: 2,
  },
  vsContainer: {
    paddingHorizontal: 12,
  },
  vsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textMuted,
  },
  statusBar: {
    backgroundColor: colors.inactive,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  winnerStatusBar: {
    backgroundColor: colors.successLight,
  },
  statusText: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },
  winnerStatusText: {
    color: colors.successDark,
    fontWeight: 'bold',
  },
  phaseBar: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  phaseText: {
    fontSize: 14,
    color: colors.textTertiary,
    fontWeight: '500',
  },
  forfeitButton: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.dangerLight,
    backgroundColor: colors.dangerSurface,
  },
  forfeitButtonText: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: '500',
  },
});
