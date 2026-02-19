import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import WelcomeScreen from './src/components/WelcomeScreen';
import GameScreen from './src/components/GameScreen';
import { GameConfig } from './src/engine/gameEngine';

type Screen = 'welcome' | 'game';

export default function App() {
  const [screen, setScreen] = useState<Screen>('welcome');
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
      {screen === 'welcome' ? (
        <WelcomeScreen onPlay={handlePlay} />
      ) : (
        <GameScreen gameConfig={gameConfig} onBack={() => setScreen('welcome')} />
      )}
    </SafeAreaProvider>
  );
}
