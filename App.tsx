import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import WelcomeScreen from './src/components/WelcomeScreen';
import GameScreen from './src/components/GameScreen';
import TutorialScreen from './src/components/TutorialScreen';
import AssetPreview from './src/components/AssetPreview';
import { GameConfig } from './src/engine/gameEngine';

type Screen = 'welcome' | 'game' | 'tutorial' | 'assetPreview';

export default function App() {
  const [screen, setScreen] = useState<Screen>('assetPreview');
  const [gameConfig, setGameConfig] = useState<GameConfig>({
    mode: 'local',
    difficulty: 'medium',
  });

  const handlePlay = (config: GameConfig) => {
    setGameConfig(config);
    setScreen('game');
  };

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {screen === 'assetPreview' ? (
        <AssetPreview onBack={() => setScreen('welcome')} />
      ) : screen === 'welcome' ? (
        <WelcomeScreen onPlay={handlePlay} onTutorial={() => setScreen('tutorial')} />
      ) : screen === 'tutorial' ? (
        <TutorialScreen onBack={() => setScreen('welcome')} />
      ) : (
        <GameScreen gameConfig={gameConfig} onBack={() => setScreen('welcome')} />
      )}
    </SafeAreaProvider>
  );
}
