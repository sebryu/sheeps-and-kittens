import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native';

interface WelcomeScreenProps {
  onPlay: () => void;
}

export default function WelcomeScreen({ onPlay }: WelcomeScreenProps) {
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const sheepAnim = useRef(new Animated.Value(-50)).current;
  const kittyAnim = useRef(new Animated.Value(50)).current;

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

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Title */}
        <View style={styles.titleSection}>
          <View style={styles.emojiRow}>
            <Animated.Text
              style={[styles.titleEmoji, { transform: [{ translateX: sheepAnim }] }]}
            >
              🐑
            </Animated.Text>
            <Text style={styles.vsEmoji}>⚔️</Text>
            <Animated.Text
              style={[styles.titleEmoji, { transform: [{ translateX: kittyAnim }] }]}
            >
              🐱
            </Animated.Text>
          </View>
          <Text style={styles.title}>Sheeps & Kittens</Text>
          <Text style={styles.subtitle}>A BaghChal Board Game</Text>
        </View>

        {/* Rules preview */}
        <View style={styles.rulesCard}>
          <Text style={styles.rulesTitle}>How to Play</Text>
          <View style={styles.ruleRow}>
            <Text style={styles.ruleEmoji}>🐑</Text>
            <Text style={styles.ruleText}>
              20 Sheeps try to block all kittens by surrounding them
            </Text>
          </View>
          <View style={styles.ruleRow}>
            <Text style={styles.ruleEmoji}>🐱</Text>
            <Text style={styles.ruleText}>
              4 Kittens try to capture 5 sheeps by jumping over them
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.ruleRow}>
            <Text style={styles.ruleEmoji}>1️⃣</Text>
            <Text style={styles.ruleText}>
              First, sheeps are placed one at a time
            </Text>
          </View>
          <View style={styles.ruleRow}>
            <Text style={styles.ruleEmoji}>2️⃣</Text>
            <Text style={styles.ruleText}>
              Then both sides move along the lines
            </Text>
          </View>
        </View>

        {/* Play button */}
        <Animated.View style={{ transform: [{ translateY: bounceAnim }] }}>
          <TouchableOpacity style={styles.playButton} onPress={onPlay} activeOpacity={0.8}>
            <Text style={styles.playButtonText}>Play Game</Text>
          </TouchableOpacity>
        </Animated.View>

        <Text style={styles.footer}>Two players - take turns on the same device</Text>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8E1',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  emojiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
  },
  titleEmoji: {
    fontSize: 56,
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
    marginBottom: 32,
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
  ruleEmoji: {
    fontSize: 24,
    width: 32,
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
