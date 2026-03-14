import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Animated,
} from 'react-native';
import { GameState, GameConfig } from '../engine/types';
import { SheepPiece, KittenPiece } from './Pieces';
import { colors } from '../theme';

interface WinModalProps {
  gameState: GameState;
  gameConfig: GameConfig;
  winModalScale: Animated.Value;
  winOverlayOpacity: Animated.Value;
  onRestart: () => void;
  onBack: () => void;
}

export default function WinModal({
  gameState,
  gameConfig,
  winModalScale,
  winOverlayOpacity,
  onRestart,
  onBack,
}: WinModalProps) {
  const getWinTitle = () => {
    if (gameConfig.mode === 'local') {
      return gameState.winner === 'SHEEP' ? 'Sheeps Win!' : 'Kittens Win!';
    }
    const humanSide = gameConfig.mode === 'ai-sheep' ? 'KITTY' : 'SHEEP';
    return gameState.winner === humanSide ? 'You Win!' : 'You Lose!';
  };

  const getWinSubtitle = () => {
    if (gameState.forfeitedBy) {
      const side = gameState.forfeitedBy === 'SHEEP' ? 'Sheeps' : 'Kittens';
      return `${side} forfeited the game.`;
    }
    if (gameState.winner === 'SHEEP') {
      return 'All kittens have been blocked!';
    }
    return `${gameState.sheepCaptured} sheeps were captured!`;
  };

  return (
    <Modal
      visible={gameState.winner !== null}
      transparent
      animationType="none"
    >
      <Animated.View style={[styles.overlay, { opacity: winOverlayOpacity }]}>
        <Animated.View
          style={[
            styles.content,
            { transform: [{ scale: winModalScale }] },
          ]}
        >
          <View style={styles.piece}>
            {gameState.winner === 'SHEEP' ? (
              <SheepPiece size={80} />
            ) : (
              <KittenPiece size={80} />
            )}
          </View>
          <Text style={styles.title}>{getWinTitle()}</Text>
          <Text style={styles.subtitle}>{getWinSubtitle()}</Text>
          <View style={styles.buttons}>
            <TouchableOpacity
              testID="play-again-button"
              style={[styles.button, styles.playAgainButton]}
              onPress={onRestart}
            >
              <Text style={styles.playAgainText}>Play Again</Text>
            </TouchableOpacity>
            <TouchableOpacity
              testID="menu-button"
              style={[styles.button, styles.menuButton]}
              onPress={onBack}
            >
              <Text style={styles.menuButtonText}>Menu</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    backgroundColor: colors.background,
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
  piece: {
    marginBottom: 12,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  playAgainButton: {
    backgroundColor: colors.success,
  },
  playAgainText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  menuButton: {
    backgroundColor: colors.inactive,
  },
  menuButtonText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
});
