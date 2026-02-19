import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native';
import Board from './Board';
import { SheepPiece, KittenPiece } from './Pieces';
import {
  GameState,
  GameConfig,
  createInitialState,
  handleTap,
  getGameStatusText,
  applyMove,
} from '../engine/gameEngine';
import { findBestMove } from '../engine/aiEngine';
import { triggerHaptic } from '../utils/haptics';
import { loadAllSounds, playSound, unloadAllSounds } from '../utils/sounds';

interface GameScreenProps {
  onBack: () => void;
  gameConfig: GameConfig;
}

export default function GameScreen({ onBack, gameConfig }: GameScreenProps) {
  const [gameState, setGameState] = useState<GameState>(createInitialState());
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [phaseBannerVisible, setPhaseBannerVisible] = useState(false);

  // ── Animated values ────────────────────────────────────────────────
  // Win modal: springs from small scale into full size
  const winModalScale = useRef(new Animated.Value(0.5)).current;
  const winOverlayOpacity = useRef(new Animated.Value(0)).current;

  // Score bump when sheepCaptured increments
  const scoreBumpScale = useRef(new Animated.Value(1)).current;

  // Phase banner: slides down from above, then back up
  const phaseBannerY = useRef(new Animated.Value(-60)).current;
  const phaseBannerOpacity = useRef(new Animated.Value(0)).current;

  // AI thinking status text pulse
  const aiPulseOpacity = useRef(new Animated.Value(1)).current;
  const aiPulseLoop = useRef<Animated.CompositeAnimation | null>(null);

  // ── Sound loading ──────────────────────────────────────────────────
  useEffect(() => {
    loadAllSounds();
    return () => { unloadAllSounds(); };
  }, []);

  // ── AI thinking pulse ──────────────────────────────────────────────
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

  // ── Game event detection ───────────────────────────────────────────
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
      winModalScale.setValue(0.5);
      winOverlayOpacity.setValue(0);
      Animated.parallel([
        Animated.spring(winModalScale, {
          toValue: 1,
          friction: 5,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(winOverlayOpacity, {
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
      scoreBumpScale.setValue(1);
      Animated.sequence([
        Animated.timing(scoreBumpScale, {
          toValue: 1.5,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.spring(scoreBumpScale, {
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

  // ── AI move ────────────────────────────────────────────────────────
  const isAITurn = (state: GameState) =>
    (gameConfig.mode === 'ai-sheep' && state.turn === 'SHEEP') ||
    (gameConfig.mode === 'ai-kitty' && state.turn === 'KITTY');

  useEffect(() => {
    if (gameConfig.mode === 'local') return;
    if (!isAITurn(gameState)) return;
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

  // ── Board tap ──────────────────────────────────────────────────────
  const onBoardTap = useCallback((row: number, col: number) => {
    if (isAIThinking) return;
    setGameState(prev => {
      if (isAITurn(prev)) return prev;
      const next = handleTap(prev, row, col);
      if (next === prev) {
        // No state change = invalid tap
        triggerHaptic('invalid');
        playSound('invalid');
      }
      return next;
    });
  }, [isAIThinking, gameConfig.mode]);

  const onRestart = useCallback(() => {
    setGameState(createInitialState());
  }, []);

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

  const getWinTitle = () => {
    if (gameConfig.mode === 'local') {
      return gameState.winner === 'SHEEP' ? 'Sheeps Win!' : 'Kittens Win!';
    }
    const humanSide = gameConfig.mode === 'ai-sheep' ? 'KITTY' : 'SHEEP';
    return gameState.winner === humanSide ? 'You Win!' : 'You Lose!';
  };

  const getWinSubtitle = () => {
    if (gameState.winner === 'SHEEP') {
      return 'All kittens have been blocked!';
    }
    return `${gameState.sheepCaptured} sheeps were captured!`;
  };

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
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Sheeps & Kittens</Text>
        <TouchableOpacity style={styles.restartButton} onPress={onRestart}>
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
        <View style={[styles.statusBar, gameState.winner && styles.winnerStatusBar]}>
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
          <Text style={styles.phaseText}>
            Phase: {gameState.phase === 'PLACEMENT' ? '🏗 Placement' : '♟ Movement'}
          </Text>
        </View>
      </ScrollView>

      {/* Win Modal */}
      <Modal
        visible={gameState.winner !== null}
        transparent
        animationType="none"
      >
        <Animated.View style={[styles.modalOverlay, { opacity: winOverlayOpacity }]}>
          <Animated.View
            style={[
              styles.modalContent,
              { transform: [{ scale: winModalScale }] },
            ]}
          >
            <View style={styles.modalPiece}>
              {gameState.winner === 'SHEEP' ? (
                <SheepPiece size={80} />
              ) : (
                <KittenPiece size={80} />
              )}
            </View>
            <Text style={styles.modalTitle}>{getWinTitle()}</Text>
            <Text style={styles.modalSubtitle}>{getWinSubtitle()}</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.playAgainButton]}
                onPress={onRestart}
              >
                <Text style={styles.playAgainText}>Play Again</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.menuButton]}
                onPress={onBack}
              >
                <Text style={styles.menuButtonText}>Menu</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8E1',
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
    backgroundColor: '#FFC107',
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
    color: '#3E2723',
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3E2723',
  },
  restartButton: {
    padding: 8,
  },
  restartButtonText: {
    fontSize: 24,
    color: '#5D4037',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeScoreCard: {
    borderColor: '#FFC107',
    backgroundColor: '#FFFDE7',
  },
  scoreLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3E2723',
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
    color: '#BDBDBD',
  },
  statusBar: {
    backgroundColor: '#EFEBE9',
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  winnerStatusBar: {
    backgroundColor: '#C8E6C9',
  },
  statusText: {
    fontSize: 15,
    color: '#5D4037',
    fontWeight: '600',
    textAlign: 'center',
  },
  winnerStatusText: {
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  phaseBar: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  phaseText: {
    fontSize: 14,
    color: '#8D6E63',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: '#FFF8E1',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  modalPiece: {
    marginBottom: 12,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3E2723',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#5D4037',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  playAgainButton: {
    backgroundColor: '#4CAF50',
  },
  playAgainText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  menuButton: {
    backgroundColor: '#EFEBE9',
  },
  menuButtonText: {
    color: '#5D4037',
    fontSize: 16,
    fontWeight: '600',
  },
});
