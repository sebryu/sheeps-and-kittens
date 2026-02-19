import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native';
import { SheepPiece, KittenPiece } from './Pieces';
import { GameConfig, GameMode, Difficulty } from '../engine/gameEngine';

interface WelcomeScreenProps {
  onPlay: (config: GameConfig) => void;
}

export default function WelcomeScreen({ onPlay }: WelcomeScreenProps) {
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const sheepAnim = useRef(new Animated.Value(-50)).current;
  const kittyAnim = useRef(new Animated.Value(50)).current;

  const [selectedMode, setSelectedMode] = useState<GameMode>('local');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('medium');

  useEffect(() => {
    // Fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Slide in pieces
    Animated.parallel([
      Animated.spring(sheepAnim, {
        toValue: 0,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(kittyAnim, {
        toValue: 0,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Bounce button
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -8,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handlePlay = () => {
    onPlay({ mode: selectedMode, difficulty: selectedDifficulty });
  };

  const isAIMode = selectedMode !== 'local';

  const footerText = isAIMode
    ? `Playing against AI - ${selectedDifficulty} difficulty`
    : 'Two players - take turns on the same device';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Title */}
        <View style={styles.titleSection}>
          <View style={styles.emojiRow}>
            <Animated.View
              style={{ transform: [{ translateX: sheepAnim }] }}
            >
              <SheepPiece size={64} />
            </Animated.View>
            <Text style={styles.vsEmoji}>⚔️</Text>
            <Animated.View
              style={{ transform: [{ translateX: kittyAnim }] }}
            >
              <KittenPiece size={64} />
            </Animated.View>
          </View>
          <Text style={styles.title}>Sheeps & Kittens</Text>
          <Text style={styles.subtitle}>A BaghChal Board Game</Text>
        </View>

        {/* Rules preview */}
        <View style={styles.rulesCard}>
          <Text style={styles.rulesTitle}>How to Play</Text>
          <View style={styles.ruleRow}>
            <View style={styles.ruleIcon}>
              <SheepPiece size={28} />
            </View>
            <Text style={styles.ruleText}>
              20 Sheeps try to block all kittens by surrounding them
            </Text>
          </View>
          <View style={styles.ruleRow}>
            <View style={styles.ruleIcon}>
              <KittenPiece size={28} />
            </View>
            <Text style={styles.ruleText}>
              4 Kittens try to capture 5 sheeps by jumping over them
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.ruleRow}>
            <View style={styles.ruleIcon}>
              <Text style={styles.ruleNumber}>1️⃣</Text>
            </View>
            <Text style={styles.ruleText}>
              First, sheeps are placed one at a time
            </Text>
          </View>
          <View style={styles.ruleRow}>
            <View style={styles.ruleIcon}>
              <Text style={styles.ruleNumber}>2️⃣</Text>
            </View>
            <Text style={styles.ruleText}>
              Then both sides move along the lines
            </Text>
          </View>
        </View>

        {/* Game Mode Selection */}
        <View style={styles.modeCard}>
          <Text style={styles.modeTitle}>Game Mode</Text>
          <TouchableOpacity
            style={[styles.modeOption, selectedMode === 'local' && styles.modeOptionActive]}
            onPress={() => setSelectedMode('local')}
            activeOpacity={0.7}
          >
            <Text style={[styles.modeOptionText, selectedMode === 'local' && styles.modeOptionTextActive]}>
              Two Players
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeOption, selectedMode === 'ai-kitty' && styles.modeOptionActive]}
            onPress={() => setSelectedMode('ai-kitty')}
            activeOpacity={0.7}
          >
            <View style={styles.modeOptionRow}>
              <Text style={[styles.modeOptionText, selectedMode === 'ai-kitty' && styles.modeOptionTextActive]}>
                vs AI
              </Text>
              <Text style={[styles.modeOptionSub, selectedMode === 'ai-kitty' && styles.modeOptionSubActive]}>
                You play as Sheep
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeOption, selectedMode === 'ai-sheep' && styles.modeOptionActive]}
            onPress={() => setSelectedMode('ai-sheep')}
            activeOpacity={0.7}
          >
            <View style={styles.modeOptionRow}>
              <Text style={[styles.modeOptionText, selectedMode === 'ai-sheep' && styles.modeOptionTextActive]}>
                vs AI
              </Text>
              <Text style={[styles.modeOptionSub, selectedMode === 'ai-sheep' && styles.modeOptionSubActive]}>
                You play as Kittens
              </Text>
            </View>
          </TouchableOpacity>

          {/* Difficulty selector */}
          {isAIMode && (
            <View style={styles.difficultySection}>
              <Text style={styles.difficultyLabel}>Difficulty</Text>
              <View style={styles.difficultyRow}>
                {(['easy', 'medium', 'hard'] as Difficulty[]).map((diff) => (
                  <TouchableOpacity
                    key={diff}
                    style={[styles.difficultyPill, selectedDifficulty === diff && styles.difficultyPillActive]}
                    onPress={() => setSelectedDifficulty(diff)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.difficultyText, selectedDifficulty === diff && styles.difficultyTextActive]}>
                      {diff.charAt(0).toUpperCase() + diff.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Play button */}
        <Animated.View style={{ transform: [{ translateY: bounceAnim }] }}>
          <TouchableOpacity style={styles.playButton} onPress={handlePlay} activeOpacity={0.8}>
            <Text style={styles.playButtonText}>Play Game</Text>
          </TouchableOpacity>
        </Animated.View>

        <Text style={styles.footer}>{footerText}</Text>
      </Animated.View>
      </ScrollView>
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
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  emojiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
  },
  vsEmoji: {
    fontSize: 32,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#3E2723',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#8D6E63',
    marginTop: 4,
  },
  rulesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rulesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3E2723',
    textAlign: 'center',
    marginBottom: 12,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
    gap: 12,
  },
  ruleIcon: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ruleNumber: {
    fontSize: 24,
    textAlign: 'center',
  },
  ruleText: {
    fontSize: 14,
    color: '#5D4037',
    flex: 1,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#EFEBE9',
    marginVertical: 10,
  },
  // Mode selection card
  modeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    width: '100%',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3E2723',
    textAlign: 'center',
    marginBottom: 10,
  },
  modeOption: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#EFEBE9',
    marginVertical: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  modeOptionActive: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  modeOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modeOptionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#5D4037',
  },
  modeOptionTextActive: {
    color: '#2E7D32',
  },
  modeOptionSub: {
    fontSize: 13,
    color: '#8D6E63',
  },
  modeOptionSubActive: {
    color: '#4CAF50',
  },
  // Difficulty selector
  difficultySection: {
    marginTop: 12,
    alignItems: 'center',
  },
  difficultyLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5D4037',
    marginBottom: 8,
  },
  difficultyRow: {
    flexDirection: 'row',
    gap: 8,
  },
  difficultyPill: {
    paddingVertical: 6,
    paddingHorizontal: 18,
    borderRadius: 16,
    backgroundColor: '#EFEBE9',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  difficultyPillActive: {
    backgroundColor: '#FFF8E1',
    borderColor: '#FFC107',
  },
  difficultyText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8D6E63',
  },
  difficultyTextActive: {
    color: '#F57F17',
  },
  playButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 16,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  playButtonText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  footer: {
    fontSize: 13,
    color: '#BDBDBD',
    marginTop: 20,
  },
});
