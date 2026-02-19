import { Platform } from 'react-native';

// Lazily imported to avoid crashing on web where expo-haptics isn't linked.
let Haptics: typeof import('expo-haptics') | null = null;

if (Platform.OS !== 'web') {
  try {
    Haptics = require('expo-haptics');
  } catch {
    Haptics = null;
  }
}

export type HapticEvent =
  | 'select'       // Light impact — piece tap / selection
  | 'place'        // Medium impact — sheep placed on board
  | 'move'         // Light impact — piece moved
  | 'capture'      // Heavy impact — sheep captured
  | 'win'          // Success notification — game won
  | 'invalid'      // Error notification — invalid tap
  | 'phaseChange'; // Double-pulse — placement → movement transition

export async function triggerHaptic(event: HapticEvent): Promise<void> {
  if (!Haptics) return;

  switch (event) {
    case 'select':
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      break;
    case 'place':
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      break;
    case 'move':
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      break;
    case 'capture':
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      break;
    case 'win':
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      break;
    case 'invalid':
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      break;
    case 'phaseChange':
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await new Promise<void>(resolve => setTimeout(resolve, 100));
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      break;
  }
}
