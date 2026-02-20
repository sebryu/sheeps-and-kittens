import { Platform } from 'react-native';
import { Audio } from 'expo-av';

export type SoundName = 'select' | 'place' | 'move' | 'capture' | 'win' | 'invalid';

const soundCache: Partial<Record<SoundName, Audio.Sound>> = {};

// Static requires so Metro bundler includes the assets at build time.
const SOUND_ASSETS: Record<SoundName, number> = {
  select:  require('../../assets/sounds/select.wav'),
  place:   require('../../assets/sounds/place.wav'),
  move:    require('../../assets/sounds/move.wav'),
  capture: require('../../assets/sounds/capture.wav'),
  win:     require('../../assets/sounds/win.wav'),
  invalid: require('../../assets/sounds/invalid.wav'),
};

export async function loadAllSounds(): Promise<void> {
  if (Platform.OS === 'web') return;

  await Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
    playsInSilentModeIOS: true,
    staysActiveInBackground: false,
  });

  const names = Object.keys(SOUND_ASSETS) as SoundName[];
  await Promise.all(
    names.map(async (name) => {
      try {
        const { sound } = await Audio.Sound.createAsync(SOUND_ASSETS[name], {
          shouldPlay: false,
          volume: 1.0,
        });
        soundCache[name] = sound;
      } catch {
        // Non-fatal: sound simply won't play if loading fails
      }
    })
  );
}

export async function playSound(name: SoundName): Promise<void> {
  if (Platform.OS === 'web') return;

  const sound = soundCache[name];
  if (!sound) return;

  try {
    await sound.replayAsync();
  } catch {
    // Ignore playback errors (e.g. audio session interruption)
  }
}

export async function unloadAllSounds(): Promise<void> {
  if (Platform.OS === 'web') return;

  const sounds = Object.values(soundCache) as Audio.Sound[];
  await Promise.all(sounds.map(s => s.unloadAsync().catch(() => {})));
  (Object.keys(soundCache) as SoundName[]).forEach(k => delete soundCache[k]);
}
