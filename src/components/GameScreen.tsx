import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native';
import Board from './Board';
import {
  GameState,
  createInitialState,
  handleTap,
  getGameStatusText,
} from '../engine/gameEngine';

interface GameScreenProps {
  onBack: () => void;
}

export default function GameScreen({ onBack }: GameScreenProps) {
  const [gameState, setGameState] = useState<GameState>(createInitialState());

  const onBoardTap = useCallback((row: number, col: number) => {
    setGameState(prev => handleTap(prev, row, col));
  }, []);

  const onRestart = useCallback(() => {
    setGameState(createInitialState());
  }, []);

  const statusText = getGameStatusText(gameState);
  const isSheepTurn = gameState.turn === 'SHEEP';

  return (
    <SafeAreaView style={styles.container}>
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
          <Text style={styles.scoreEmoji}>🐑</Text>
          <Text style={styles.scoreLabel}>Sheeps</Text>
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
          <Text style={styles.scoreEmoji}>🐱</Text>
          <Text style={styles.scoreLabel}>Kittens</Text>
          <Text style={styles.scoreDetail}>{gameState.sheepCaptured}/5 captured</Text>
        </View>
      </View>

      {/* Status Bar */}
      <View style={[styles.statusBar, gameState.winner && styles.winnerStatusBar]}>
        <Text style={[styles.statusText, gameState.winner && styles.winnerStatusText]}>
          {statusText}
        </Text>
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
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalEmoji}>
              {gameState.winner === 'SHEEP' ? '🐑' : '🐱'}
            </Text>
            <Text style={styles.modalTitle}>
              {gameState.winner === 'SHEEP' ? 'Sheeps Win!' : 'Kittens Win!'}
            </Text>
            <Text style={styles.modalSubtitle}>
              {gameState.winner === 'SHEEP'
                ? 'All kittens have been blocked!'
                : `${gameState.sheepCaptured} sheeps were captured!`}
            </Text>
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
          </View>
        </View>
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
  scoreEmoji: {
    fontSize: 28,
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
  modalEmoji: {
    fontSize: 72,
    marginBottom: 12,
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
