import React from 'react';
import { View } from 'react-native';

interface PieceProps {
  size: number;
}

// Shared helper: absolute circle at centre (cx, cy) with radius r
// Extracted outside components to avoid re-creation on every render.
function circle(
  key: string,
  cx: number,
  cy: number,
  r: number,
  color: string,
  u: number,
  extraStyle?: object,
) {
  return (
    <View
      key={key}
      style={{
        position: 'absolute',
        width:  r * 2 * u,
        height: r * 2 * u,
        borderRadius: r * u,
        backgroundColor: color,
        left: (cx - r) * u,
        top:  (cy - r) * u,
        ...extraStyle,
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// SheepPiece — Kawaii Round style
// ---------------------------------------------------------------------------

const SHEEP_WOOL_BACK  = '#EDE0D4';
const SHEEP_WOOL_MID   = '#FFF5EE';
const SHEEP_WOOL_FRONT = '#FFFAF0';
const SHEEP_FACE       = '#FFE4C4';
const SHEEP_EYE        = '#2C2C2C';
const SHEEP_SHINE      = '#FFFFFF';
const SHEEP_BLUSH      = '#FFB6C1';
const SHEEP_SMILE      = '#5C3A1E';
const SHEEP_EAR_OUTER  = '#E8D5C4';
const SHEEP_EAR_INNER  = '#FFC0CB';

export const SheepPiece = React.memo(function SheepPiece({ size }: PieceProps) {
  const u = size / 100;

  return (
    <View style={{ width: size, height: size, overflow: 'hidden' }}>

      {/* 1. Drop-shadow disc */}
      {circle('shadow', 50, 54, 38, 'rgba(0,0,0,0.07)', u)}

      {/* 2. Back wool puffs */}
      {circle('b1', 17, 56, 20, SHEEP_WOOL_BACK, u)}
      {circle('b2', 50, 49, 23, SHEEP_WOOL_BACK, u)}
      {circle('b3', 83, 56, 20, SHEEP_WOOL_BACK, u)}
      {circle('b4', 33, 38, 19, SHEEP_WOOL_BACK, u)}
      {circle('b5', 67, 38, 19, SHEEP_WOOL_BACK, u)}
      {circle('b6', 50, 70, 17, SHEEP_WOOL_BACK, u)}

      {/* 3. Middle wool puffs */}
      {circle('m1', 11, 52, 18, SHEEP_WOOL_MID, u)}
      {circle('m2', 30, 43, 20, SHEEP_WOOL_MID, u)}
      {circle('m3', 50, 37, 21, SHEEP_WOOL_MID, u)}
      {circle('m4', 70, 43, 20, SHEEP_WOOL_MID, u)}
      {circle('m5', 89, 52, 18, SHEEP_WOOL_MID, u)}
      {circle('m6', 20, 65, 16, SHEEP_WOOL_MID, u)}
      {circle('m7', 80, 65, 16, SHEEP_WOOL_MID, u)}
      {circle('m8', 40, 62, 17, SHEEP_WOOL_MID, u)}
      {circle('m9', 60, 62, 17, SHEEP_WOOL_MID, u)}
      {circle('m10', 50, 75, 15, SHEEP_WOOL_MID, u)}

      {/* 4. Ears peeking between wool layers */}
      {circle('elo', 29, 47, 8, SHEEP_EAR_OUTER, u)}
      {circle('ero', 71, 47, 8, SHEEP_EAR_OUTER, u)}
      {circle('eli', 29, 47, 4, SHEEP_EAR_INNER, u)}
      {circle('eri', 71, 47, 4, SHEEP_EAR_INNER, u)}

      {/* 5. Face oval — enlarged for readability at small sizes */}
      <View
        style={{
          position: 'absolute',
          width:  52 * u,
          height: 42 * u,
          borderRadius: 21 * u,
          backgroundColor: SHEEP_FACE,
          left: 24 * u,
          top:  49 * u,
        }}
      />

      {/* 6. Front wool puffs — overlap face edges */}
      {circle('f1', 9, 47, 15, SHEEP_WOOL_FRONT, u)}
      {circle('f2', 25, 35, 17, SHEEP_WOOL_FRONT, u)}
      {circle('f3', 43, 28, 19, SHEEP_WOOL_FRONT, u)}
      {circle('f4', 61, 31, 18, SHEEP_WOOL_FRONT, u)}
      {circle('f5', 78, 39, 16, SHEEP_WOOL_FRONT, u)}
      {circle('f6', 91, 48, 14, SHEEP_WOOL_FRONT, u)}
      {circle('f7', 13, 61, 14, SHEEP_WOOL_FRONT, u)}
      {circle('f8', 87, 61, 14, SHEEP_WOOL_FRONT, u)}

      {/* 7. Eyes — enlarged (radius 6 → visible at 36px) with white shine */}
      {circle('el', 38, 63, 6, SHEEP_EYE, u)}
      {circle('els', 36, 61, 2.5, SHEEP_SHINE, u)}
      {circle('er', 62, 63, 6, SHEEP_EYE, u)}
      {circle('ers', 60, 61, 2.5, SHEEP_SHINE, u)}

      {/* 8. Blush ovals */}
      <View
        style={{
          position: 'absolute',
          width:  12 * u,
          height: 8 * u,
          borderRadius: 6 * u,
          backgroundColor: SHEEP_BLUSH,
          opacity: 0.5,
          left: 25 * u,
          top: 69 * u,
        }}
      />
      <View
        style={{
          position: 'absolute',
          width:  12 * u,
          height: 8 * u,
          borderRadius: 6 * u,
          backgroundColor: SHEEP_BLUSH,
          opacity: 0.5,
          left: 63 * u,
          top: 69 * u,
        }}
      />

      {/* 9. Smile */}
      <View
        style={{
          position: 'absolute',
          width:  7 * u,
          height: 3 * u,
          borderRadius: 2 * u,
          backgroundColor: SHEEP_SMILE,
          left: 42 * u,
          top:  76 * u,
          transform: [{ rotate: '18deg' }],
        }}
      />
      <View
        style={{
          position: 'absolute',
          width:  7 * u,
          height: 3 * u,
          borderRadius: 2 * u,
          backgroundColor: SHEEP_SMILE,
          left: 51 * u,
          top:  76 * u,
          transform: [{ rotate: '-18deg' }],
        }}
      />
    </View>
  );
});

// ---------------------------------------------------------------------------
// KittenPiece — Kawaii Round style
// ---------------------------------------------------------------------------

const KITTEN_HEAD    = '#FFB74D';
const KITTEN_HEAD_D  = '#FFA726';
const KITTEN_BELLY   = '#FFE0B2';
const KITTEN_EAR_IN  = '#FF8A80';
const KITTEN_IRIS    = '#FFB300';
const KITTEN_PUPIL   = '#1A1A1A';
const KITTEN_SHINE   = '#FFFFFF';
const KITTEN_NOSE    = '#FF8A80';
const KITTEN_MOUTH   = '#7B3F00';
const KITTEN_PAW     = '#FFCC80';

export const KittenPiece = React.memo(function KittenPiece({ size }: PieceProps) {
  const u = size / 100;

  return (
    <View style={{ width: size, height: size, overflow: 'hidden' }}>

      {/* 1. Drop-shadow disc */}
      {circle('shadow', 50, 56, 40, 'rgba(0,0,0,0.08)', u)}

      {/* 2. Ears behind head */}
      <View
        style={{
          position: 'absolute',
          width:  22 * u,
          height: 26 * u,
          borderRadius: 12 * u,
          backgroundColor: KITTEN_HEAD_D,
          left: 10 * u,
          top:   6 * u,
          transform: [{ rotate: '-18deg' }],
        }}
      />
      <View
        style={{
          position: 'absolute',
          width:  22 * u,
          height: 26 * u,
          borderRadius: 12 * u,
          backgroundColor: KITTEN_HEAD_D,
          left: 68 * u,
          top:   6 * u,
          transform: [{ rotate: '18deg' }],
        }}
      />
      <View
        style={{
          position: 'absolute',
          width:  13 * u,
          height: 17 * u,
          borderRadius: 8 * u,
          backgroundColor: KITTEN_EAR_IN,
          left: 14.5 * u,
          top:  10 * u,
          transform: [{ rotate: '-18deg' }],
        }}
      />
      <View
        style={{
          position: 'absolute',
          width:  13 * u,
          height: 17 * u,
          borderRadius: 8 * u,
          backgroundColor: KITTEN_EAR_IN,
          left: 72.5 * u,
          top:  10 * u,
          transform: [{ rotate: '18deg' }],
        }}
      />

      {/* 3. Big round head */}
      {circle('head', 50, 53, 40, KITTEN_HEAD, u)}

      {/* 4. Muzzle patch */}
      <View
        style={{
          position: 'absolute',
          width:  50 * u,
          height: 42 * u,
          borderRadius: 25 * u,
          backgroundColor: KITTEN_BELLY,
          left: 25 * u,
          top:  55 * u,
        }}
      />

      {/* 5. Eyes */}
      {circle('li', 34, 46, 12, KITTEN_IRIS, u)}
      {circle('lp', 34, 46, 7, KITTEN_PUPIL, u)}
      {circle('ls1', 30, 42, 4, KITTEN_SHINE, u)}
      {circle('ls2', 38, 50, 2, KITTEN_SHINE, u)}

      {circle('ri', 66, 46, 12, KITTEN_IRIS, u)}
      {circle('rp', 66, 46, 7, KITTEN_PUPIL, u)}
      {circle('rs1', 62, 42, 4, KITTEN_SHINE, u)}
      {circle('rs2', 70, 50, 2, KITTEN_SHINE, u)}

      {/* 6. Nose */}
      <View
        style={{
          position: 'absolute',
          width:  9 * u,
          height: 8 * u,
          borderRadius: 3.5 * u,
          backgroundColor: KITTEN_NOSE,
          left: 45.5 * u,
          top:  59 * u,
          transform: [{ rotate: '45deg' }],
        }}
      />

      {/* 7. "w" mouth */}
      <View
        style={{
          position: 'absolute',
          width:  11 * u,
          height: 3 * u,
          borderRadius: 2 * u,
          backgroundColor: KITTEN_MOUTH,
          left: 36 * u,
          top:  70 * u,
          transform: [{ rotate: '28deg' }],
        }}
      />
      <View
        style={{
          position: 'absolute',
          width:  11 * u,
          height: 3 * u,
          borderRadius: 2 * u,
          backgroundColor: KITTEN_MOUTH,
          left: 44.5 * u,
          top:  70 * u,
          transform: [{ rotate: '-28deg' }],
        }}
      />
      <View
        style={{
          position: 'absolute',
          width:  11 * u,
          height: 3 * u,
          borderRadius: 2 * u,
          backgroundColor: KITTEN_MOUTH,
          left: 53 * u,
          top:  70 * u,
          transform: [{ rotate: '28deg' }],
        }}
      />

      {/* 8. Paws */}
      <View
        style={{
          position: 'absolute',
          width:  22 * u,
          height: 14 * u,
          borderRadius: 11 * u,
          backgroundColor: KITTEN_PAW,
          left: 10 * u,
          top:  84 * u,
        }}
      />
      {circle('lt1', 13, 83, 4, KITTEN_PAW, u)}
      {circle('lt2', 20, 81, 4, KITTEN_PAW, u)}
      {circle('lt3', 28, 83, 4, KITTEN_PAW, u)}

      <View
        style={{
          position: 'absolute',
          width:  22 * u,
          height: 14 * u,
          borderRadius: 11 * u,
          backgroundColor: KITTEN_PAW,
          left: 68 * u,
          top:  84 * u,
        }}
      />
      {circle('rt1', 72, 83, 4, KITTEN_PAW, u)}
      {circle('rt2', 80, 81, 4, KITTEN_PAW, u)}
      {circle('rt3', 88, 83, 4, KITTEN_PAW, u)}
    </View>
  );
});
