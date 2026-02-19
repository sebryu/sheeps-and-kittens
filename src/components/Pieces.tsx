import React from 'react';
import { View } from 'react-native';

interface PieceProps {
  size: number;
}

export function SheepPiece({ size }: PieceProps) {
  const u = size / 100;
  const puffSize = 26 * u;

  const puffs = [
    { top: 4, left: 28 },
    { top: 1, left: 48 },
    { top: 6, left: 66 },
    { top: 20, left: 8 },
    { top: 20, left: 78 },
    { top: 42, left: 2 },
    { top: 42, left: 82 },
    { top: 64, left: 10 },
    { top: 64, left: 74 },
    { top: 74, left: 32 },
    { top: 72, left: 54 },
  ];

  return (
    <View style={{ width: size, height: size }}>
      {/* Ears */}
      <View
        style={{
          position: 'absolute',
          top: 30 * u,
          left: 2 * u,
          width: 16 * u,
          height: 10 * u,
          borderRadius: 5 * u,
          backgroundColor: '#FFCDD2',
          transform: [{ rotate: '-25deg' }],
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: 30 * u,
          right: 2 * u,
          width: 16 * u,
          height: 10 * u,
          borderRadius: 5 * u,
          backgroundColor: '#FFCDD2',
          transform: [{ rotate: '25deg' }],
        }}
      />

      {/* Wool puffs */}
      {puffs.map((p, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            top: p.top * u,
            left: p.left * u,
            width: puffSize,
            height: puffSize,
            borderRadius: puffSize / 2,
            backgroundColor: '#EFEBE9',
          }}
        />
      ))}

      {/* Main body */}
      <View
        style={{
          position: 'absolute',
          top: 14 * u,
          left: 14 * u,
          width: 72 * u,
          height: 72 * u,
          borderRadius: 36 * u,
          backgroundColor: '#FAFAFA',
          borderWidth: Math.max(1, 1.5 * u),
          borderColor: '#E0D8D0',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Face */}
        <View
          style={{
            width: 42 * u,
            height: 36 * u,
            borderRadius: 18 * u,
            backgroundColor: '#FFECD2',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Eyes */}
          <View style={{ flexDirection: 'row', marginBottom: 3 * u }}>
            <View
              style={{
                width: 7 * u,
                height: 8 * u,
                borderRadius: 4 * u,
                backgroundColor: '#1A1A1A',
                marginHorizontal: 5 * u,
              }}
            />
            <View
              style={{
                width: 7 * u,
                height: 8 * u,
                borderRadius: 4 * u,
                backgroundColor: '#1A1A1A',
                marginHorizontal: 5 * u,
              }}
            />
          </View>

          {/* Nose */}
          <View
            style={{
              width: 6 * u,
              height: 4 * u,
              borderRadius: 3 * u,
              backgroundColor: '#F48FB1',
            }}
          />
        </View>
      </View>
    </View>
  );
}

export function KittenPiece({ size }: PieceProps) {
  const u = size / 100;

  return (
    <View style={{ width: size, height: size }}>
      {/* Left ear (outer) */}
      <View
        style={{
          position: 'absolute',
          top: 2 * u,
          left: 10 * u,
          width: 0,
          height: 0,
          borderLeftWidth: 16 * u,
          borderRightWidth: 16 * u,
          borderBottomWidth: 28 * u,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderBottomColor: '#F57C00',
          transform: [{ rotate: '-6deg' }],
        }}
      />
      {/* Left ear (inner) */}
      <View
        style={{
          position: 'absolute',
          top: 12 * u,
          left: 17 * u,
          width: 0,
          height: 0,
          borderLeftWidth: 9 * u,
          borderRightWidth: 9 * u,
          borderBottomWidth: 16 * u,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderBottomColor: '#FFCC80',
          transform: [{ rotate: '-6deg' }],
        }}
      />

      {/* Right ear (outer) */}
      <View
        style={{
          position: 'absolute',
          top: 2 * u,
          right: 10 * u,
          width: 0,
          height: 0,
          borderLeftWidth: 16 * u,
          borderRightWidth: 16 * u,
          borderBottomWidth: 28 * u,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderBottomColor: '#F57C00',
          transform: [{ rotate: '6deg' }],
        }}
      />
      {/* Right ear (inner) */}
      <View
        style={{
          position: 'absolute',
          top: 12 * u,
          right: 17 * u,
          width: 0,
          height: 0,
          borderLeftWidth: 9 * u,
          borderRightWidth: 9 * u,
          borderBottomWidth: 16 * u,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderBottomColor: '#FFCC80',
          transform: [{ rotate: '6deg' }],
        }}
      />

      {/* Head */}
      <View
        style={{
          position: 'absolute',
          top: 20 * u,
          left: 10 * u,
          width: 80 * u,
          height: 72 * u,
          borderRadius: 36 * u,
          backgroundColor: '#FFB74D',
          borderWidth: Math.max(1, 1.5 * u),
          borderColor: '#F57C00',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'visible',
        }}
      >
        {/* Eyes */}
        <View
          style={{ flexDirection: 'row', marginBottom: 4 * u, marginTop: 2 * u }}
        >
          {/* Left eye */}
          <View
            style={{
              width: 10 * u,
              height: 11 * u,
              borderRadius: 5 * u,
              backgroundColor: '#388E3C',
              marginHorizontal: 5 * u,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <View
              style={{
                width: 5 * u,
                height: 9 * u,
                borderRadius: 2.5 * u,
                backgroundColor: '#1A1A1A',
              }}
            />
          </View>
          {/* Right eye */}
          <View
            style={{
              width: 10 * u,
              height: 11 * u,
              borderRadius: 5 * u,
              backgroundColor: '#388E3C',
              marginHorizontal: 5 * u,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <View
              style={{
                width: 5 * u,
                height: 9 * u,
                borderRadius: 2.5 * u,
                backgroundColor: '#1A1A1A',
              }}
            />
          </View>
        </View>

        {/* Nose */}
        <View
          style={{
            width: 0,
            height: 0,
            borderLeftWidth: 4 * u,
            borderRightWidth: 4 * u,
            borderTopWidth: 5 * u,
            borderLeftColor: 'transparent',
            borderRightColor: 'transparent',
            borderTopColor: '#F48FB1',
          }}
        />

        {/* Mouth */}
        <View style={{ flexDirection: 'row', marginTop: u }}>
          <View
            style={{
              width: 6 * u,
              height: 3 * u,
              borderBottomLeftRadius: 6 * u,
              borderBottomWidth: Math.max(1, 1.5 * u),
              borderLeftWidth: Math.max(1, 1.5 * u),
              borderTopWidth: 0,
              borderRightWidth: 0,
              borderColor: '#BF360C',
            }}
          />
          <View
            style={{
              width: 6 * u,
              height: 3 * u,
              borderBottomRightRadius: 6 * u,
              borderBottomWidth: Math.max(1, 1.5 * u),
              borderRightWidth: Math.max(1, 1.5 * u),
              borderTopWidth: 0,
              borderLeftWidth: 0,
              borderColor: '#BF360C',
            }}
          />
        </View>

        {/* Whiskers */}
        <View
          style={{
            position: 'absolute',
            left: 0,
            top: 38 * u,
            width: 18 * u,
            height: Math.max(1, 1.5 * u),
            borderRadius: u,
            backgroundColor: '#E09840',
            transform: [{ rotate: '-6deg' }],
          }}
        />
        <View
          style={{
            position: 'absolute',
            left: 2 * u,
            top: 44 * u,
            width: 16 * u,
            height: Math.max(1, 1.5 * u),
            borderRadius: u,
            backgroundColor: '#E09840',
            transform: [{ rotate: '6deg' }],
          }}
        />
        <View
          style={{
            position: 'absolute',
            right: 0,
            top: 38 * u,
            width: 18 * u,
            height: Math.max(1, 1.5 * u),
            borderRadius: u,
            backgroundColor: '#E09840',
            transform: [{ rotate: '6deg' }],
          }}
        />
        <View
          style={{
            position: 'absolute',
            right: 2 * u,
            top: 44 * u,
            width: 16 * u,
            height: Math.max(1, 1.5 * u),
            borderRadius: u,
            backgroundColor: '#E09840',
            transform: [{ rotate: '-6deg' }],
          }}
        />
      </View>
    </View>
  );
}
