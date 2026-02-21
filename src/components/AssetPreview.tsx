import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SheepPiece, KittenPiece } from './Pieces';

interface Props {
  onBack: () => void;
}

const SIZES = [100, 60, 36];

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
        {SIZES.map((sz) => (
          <View key={sz} style={styles.card}>
            <Text style={styles.sizeLabel}>{sz}px</Text>
            <View style={styles.piecesRow}>
              <View style={[styles.pieceBox, { width: sz + 20, height: sz + 20 }]}>
                <SheepPiece size={sz} />
              </View>
              <View style={[styles.pieceBox, { width: sz + 20, height: sz + 20 }]}>
                <KittenPiece size={sz} />
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
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sizeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8D6E63',
    marginBottom: 12,
  },
  piecesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  pieceBox: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F0E8',
    borderRadius: 12,
  },
});
