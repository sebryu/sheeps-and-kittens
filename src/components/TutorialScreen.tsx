import React, { useEffect, useRef, useState } from 'react';
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
import { colors } from '../theme';
import { STEPS } from './tutorialData';
import MiniBoard from './MiniBoard';

const SCREEN_WIDTH = Dimensions.get('window').width;

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
    backgroundColor: colors.background,
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
    color: colors.textSecondary,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  headerSpacer: {
    width: 60,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 8,
  },
  card: {
    backgroundColor: colors.surface,
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
    backgroundColor: colors.successSurface,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stepBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.success,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  stepSubtitle: {
    fontSize: 14,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: 4,
  },
  stepDescription: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: 12,
  },
  tipBox: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.accent,
    padding: 12,
    marginTop: 12,
  },
  tipLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.accentDark,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tipText: {
    fontSize: 13,
    color: colors.textSecondary,
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
    backgroundColor: colors.boardSurface,
  },
  activeDot: {
    backgroundColor: colors.success,
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
    backgroundColor: colors.inactive,
  },
  navButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  nextButton: {
    backgroundColor: colors.success,
  },
  nextButtonText: {
    color: '#FFFFFF',
  },
  startButton: {
    backgroundColor: colors.success,
    paddingHorizontal: 28,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
