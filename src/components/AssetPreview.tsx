import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SheepPiece as SheepV1, KittenPiece as KittenV1 } from './PiecesV1';
import { SheepPiece as SheepV2, KittenPiece as KittenV2 } from './PiecesV2';
import { SheepPiece as SheepV3, KittenPiece as KittenV3 } from './PiecesV3';
import { SheepPiece as SheepV4, KittenPiece as KittenV4 } from './PiecesV4';

interface Props {
  onBack: () => void;
}

const VERSIONS = [
  {
    label: 'A — Kawaii Round',
    description: 'Extra-cute Japanese kawaii style. Huge fluffy wool puffs, close-set eyes, blush cheeks, oversized kitten head with sparkly eyes.',
    Sheep: SheepV1,
    Kitten: KittenV1,
  },
  {
    label: 'B — Geometric Minimalist',
    description: 'Clean Bauhaus-inspired shapes. Rounded-square bodies, flat colors, precise geometry. Semicircle wool crown, slit-pupil cat eyes.',
    Sheep: SheepV2,
    Kitten: KittenV2,
  },
  {
    label: 'C — Chunky Pixel Art',
    description: 'Retro 8-bit sprite style. 10x10 pixel grid, blocky squares, limited color palette. Classic Game Boy aesthetic.',
    Sheep: SheepV3,
    Kitten: KittenV3,
  },
  {
    label: 'D — Expressive Character',
    description: 'Detailed storybook characters with full bodies, personality, and attitude. Asymmetric wool curls, mischievous kitten with tabby stripes and tail.',
    Sheep: SheepV4,
    Kitten: KittenV4,
  },
];

export default function AssetPreview({ onBack }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.title}>Asset Preview</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {VERSIONS.map((v, i) => (
          <View key={i} style={styles.card}>
            <Text style={styles.versionLabel}>{v.label}</Text>
            <Text style={styles.versionDesc}>{v.description}</Text>

            <View style={styles.sizesRow}>
              {/* Large preview */}
              <View style={styles.sizeGroup}>
                <Text style={styles.sizeLabel}>100px</Text>
                <View style={styles.piecesRow}>
                  <View style={styles.pieceContainer}>
                    <v.Sheep size={100} />
                  </View>
                  <View style={styles.pieceContainer}>
                    <v.Kitten size={100} />
                  </View>
                </View>
              </View>

              {/* Medium preview */}
              <View style={styles.sizeGroup}>
                <Text style={styles.sizeLabel}>60px</Text>
                <View style={styles.piecesRow}>
                  <View style={[styles.pieceContainer, { width: 70, height: 70 }]}>
                    <v.Sheep size={60} />
                  </View>
                  <View style={[styles.pieceContainer, { width: 70, height: 70 }]}>
                    <v.Kitten size={60} />
                  </View>
                </View>
              </View>

              {/* Small preview */}
              <View style={styles.sizeGroup}>
                <Text style={styles.sizeLabel}>36px</Text>
                <View style={styles.piecesRow}>
                  <View style={[styles.pieceContainer, { width: 46, height: 46 }]}>
                    <v.Sheep size={36} />
                  </View>
                  <View style={[styles.pieceContainer, { width: 46, height: 46 }]}>
                    <v.Kitten size={36} />
                  </View>
                </View>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8E1',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0D8D0',
  },
  backButton: {
    width: 60,
  },
  backText: {
    fontSize: 16,
    color: '#5D4037',
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#3E2723',
  },
  scroll: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  versionLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3E2723',
    marginBottom: 4,
  },
  versionDesc: {
    fontSize: 13,
    color: '#6D4C41',
    marginBottom: 16,
    lineHeight: 18,
  },
  sizesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
  },
  sizeGroup: {
    alignItems: 'center',
  },
  sizeLabel: {
    fontSize: 11,
    color: '#9E9E9E',
    marginBottom: 6,
    fontWeight: '500',
  },
  piecesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pieceContainer: {
    width: 110,
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F0E8',
    borderRadius: 12,
  },
});
