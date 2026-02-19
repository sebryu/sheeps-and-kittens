#!/usr/bin/env node
// Generates simple WAV sound effects for Sheeps & Kittens game.
// Pure Node.js, no dependencies. 16-bit PCM mono at 44100 Hz.

const fs = require('fs');
const path = require('path');

const SAMPLE_RATE = 44100;
const CHANNELS = 1;
const BIT_DEPTH = 16;

function writeWavHeader(buffer, numSamples) {
  const dataSize = numSamples * CHANNELS * (BIT_DEPTH / 8);
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);               // PCM
  buffer.writeUInt16LE(CHANNELS, 22);
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(SAMPLE_RATE * CHANNELS * (BIT_DEPTH / 8), 28);
  buffer.writeUInt16LE(CHANNELS * (BIT_DEPTH / 8), 32);
  buffer.writeUInt16LE(BIT_DEPTH, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);
}

// Generate a tone from one or more sine waves with exponential decay.
function generateTone(freqs, durationMs, decayRate) {
  const numSamples = Math.floor(SAMPLE_RATE * durationMs / 1000);
  const buffer = Buffer.alloc(44 + numSamples * 2);
  writeWavHeader(buffer, numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    let sample = 0;
    for (const freq of freqs) {
      sample += Math.sin(2 * Math.PI * freq * t) * Math.exp(-decayRate * t);
    }
    sample = Math.max(-1, Math.min(1, sample / freqs.length));
    buffer.writeInt16LE(Math.round(sample * 32767), 44 + i * 2);
  }
  return buffer;
}

// Victory fanfare: C-E-G-C5 arpeggio, each note starts slightly later.
function generateWin() {
  const durationMs = 800;
  const numSamples = Math.floor(SAMPLE_RATE * durationMs / 1000);
  const buffer = Buffer.alloc(44 + numSamples * 2);
  writeWavHeader(buffer, numSamples);

  const notes = [
    { freq: 523, startMs: 0 },    // C5
    { freq: 659, startMs: 130 },  // E5
    { freq: 784, startMs: 260 },  // G5
    { freq: 1047, startMs: 400 }, // C6
  ];

  for (let i = 0; i < numSamples; i++) {
    const tMs = (i / SAMPLE_RATE) * 1000;
    let sample = 0;
    for (const note of notes) {
      if (tMs >= note.startMs) {
        const t = (tMs - note.startMs) / 1000;
        sample += Math.sin(2 * Math.PI * note.freq * t) * Math.exp(-4 * t) * 0.45;
      }
    }
    sample = Math.max(-1, Math.min(1, sample));
    buffer.writeInt16LE(Math.round(sample * 32767), 44 + i * 2);
  }
  return buffer;
}

const sounds = {
  select:  () => generateTone([880], 80, 25),           // soft click
  place:   () => generateTone([440, 660], 150, 15),     // pop
  move:    () => generateTone([330], 120, 20),           // slide
  capture: () => generateTone([110], 400, 5),            // low thud
  win:     () => generateWin(),                          // victory fanfare
  invalid: () => generateTone([200, 202], 200, 10),     // beating error buzz
};

const outDir = path.join(__dirname, '..', 'assets', 'sounds');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

for (const [name, generate] of Object.entries(sounds)) {
  const outPath = path.join(outDir, `${name}.wav`);
  fs.writeFileSync(outPath, generate());
  console.log(`Generated ${name}.wav`);
}

console.log('Done! All sounds written to assets/sounds/');
