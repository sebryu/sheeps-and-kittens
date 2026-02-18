import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import WelcomeScreen from './src/components/WelcomeScreen';
import GameScreen from './src/components/GameScreen';

type Screen = 'welcome' | 'game';

export default function App() {
  const [screen, setScreen] = useState<Screen>('welcome');

  return (
    <>
      <StatusBar style="dark" />
      {screen === 'welcome' ? (
        <WelcomeScreen onPlay={() => setScreen('game')} />
      ) : (
        <GameScreen onBack={() => setScreen('welcome')} />
      )}
    </>
  );
}
