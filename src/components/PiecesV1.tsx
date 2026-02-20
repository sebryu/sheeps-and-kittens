import React from 'react';
import { View } from 'react-native';

interface PieceProps {
  size: number;
}

// ---------------------------------------------------------------------------
// SheepPiece — Kawaii Round style
//
// Layers (bottom to top):
//   1. Subtle drop-shadow disc
//   2. Back wool puffs (beige/cream, largest, darkest shade of white)
//   3. Middle wool puffs (floral white)
//   4. Tiny round ears peeking through wool
//   5. Cream face oval
//   6. Front wool puffs (warmest white, overlap face edges)
//   7. Eyes (close-set black dots with white shine)
//   8. Pink blush ovals
//   9. Tiny smile (two angled rounded rects)
// ---------------------------------------------------------------------------

export function SheepPiece({ size }: PieceProps) {
  const u = size / 100;

  // Colour palette
  const WOOL_BACK   = '#EDE0D4'; // deepest cream for back-layer depth
  const WOOL_MID    = '#FFF5EE'; // seashell warm white
  const WOOL_FRONT  = '#FFFAF0'; // floral white brightest
  const FACE        = '#FFE4C4'; // bisque warm cream
  const EYE         = '#2C2C2C';
  const SHINE       = '#FFFFFF';
  const BLUSH       = '#FFB6C1';
  const SMILE       = '#5C3A1E';
  const EAR_OUTER   = '#E8D5C4';
  const EAR_INNER   = '#FFC0CB';

  // Helper: absolute circle at centre (cx, cy) with radius r
  const circle = (
    key: string,
    cx: number,
    cy: number,
    r: number,
    color: string,
    extraStyle?: object,
  ) => (
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

  return (
    <View style={{ width: size, height: size }}>

      {/* 1. Drop-shadow disc */}
      {circle('shadow', 50, 54, 38, 'rgba(0,0,0,0.07)')}

      {/* 2. Back wool puffs — large, deepest shade, create body volume */}
      {circle('b1',  17, 56, 20, WOOL_BACK)}
      {circle('b2',  50, 49, 23, WOOL_BACK)}
      {circle('b3',  83, 56, 20, WOOL_BACK)}
      {circle('b4',  33, 38, 19, WOOL_BACK)}
      {circle('b5',  67, 38, 19, WOOL_BACK)}
      {circle('b6',  50, 70, 17, WOOL_BACK)}

      {/* 3. Middle wool puffs — floral white, overlap back layer */}
      {circle('m1',  11, 52, 18, WOOL_MID)}
      {circle('m2',  30, 43, 20, WOOL_MID)}
      {circle('m3',  50, 37, 21, WOOL_MID)}
      {circle('m4',  70, 43, 20, WOOL_MID)}
      {circle('m5',  89, 52, 18, WOOL_MID)}
      {circle('m6',  20, 65, 16, WOOL_MID)}
      {circle('m7',  80, 65, 16, WOOL_MID)}
      {circle('m8',  40, 62, 17, WOOL_MID)}
      {circle('m9',  60, 62, 17, WOOL_MID)}
      {circle('m10', 50, 75, 15, WOOL_MID)}

      {/* 4. Tiny ears peeking between wool layers */}
      {/* Left ear outer */}
      {circle('elo', 29, 47, 8, EAR_OUTER)}
      {/* Right ear outer */}
      {circle('ero', 71, 47, 8, EAR_OUTER)}
      {/* Left ear inner pink */}
      {circle('eli', 29, 47, 4, EAR_INNER)}
      {/* Right ear inner pink */}
      {circle('eri', 71, 47, 4, EAR_INNER)}

      {/* 5. Face oval */}
      <View
        style={{
          position: 'absolute',
          width:  46 * u,
          height: 38 * u,
          borderRadius: 23 * u,
          backgroundColor: FACE,
          left: 27 * u,
          top:  52 * u,
        }}
      />

      {/* 6. Front wool puffs — warmest white, overlap face edges for fluffiness */}
      {circle('f1',  9,  47, 15, WOOL_FRONT)}
      {circle('f2', 25,  35, 17, WOOL_FRONT)}
      {circle('f3', 43,  28, 19, WOOL_FRONT)}
      {circle('f4', 61,  31, 18, WOOL_FRONT)}
      {circle('f5', 78,  39, 16, WOOL_FRONT)}
      {circle('f6', 91,  48, 14, WOOL_FRONT)}
      {circle('f7', 13,  61, 14, WOOL_FRONT)}
      {circle('f8', 87,  61, 14, WOOL_FRONT)}

      {/* 7. Eyes — two close-set black dots with white shine */}
      {/* Left eye */}
      {circle('el', 38, 65, 4, EYE)}
      {circle('els', 36.5, 63.5, 1.5, SHINE)}
      {/* Right eye */}
      {circle('er', 62, 65, 4, EYE)}
      {circle('ers', 60.5, 63.5, 1.5, SHINE)}

      {/* 8. Blush ovals under eyes */}
      <View
        style={{
          position: 'absolute',
          width:  11 * u,
          height:  7 * u,
          borderRadius: 6 * u,
          backgroundColor: BLUSH,
          opacity: 0.5,
          left: 27 * u,
          top: 70 * u,
        }}
      />
      <View
        style={{
          position: 'absolute',
          width:  11 * u,
          height:  7 * u,
          borderRadius: 6 * u,
          backgroundColor: BLUSH,
          opacity: 0.5,
          left: 62 * u,
          top: 70 * u,
        }}
      />

      {/* 9. Smile — two tiny angled rounded rects forming a small ∪ */}
      <View
        style={{
          position: 'absolute',
          width:  6 * u,
          height: 2.5 * u,
          borderRadius: 2 * u,
          backgroundColor: SMILE,
          left: 43 * u,
          top:  77 * u,
          transform: [{ rotate: '18deg' }],
        }}
      />
      <View
        style={{
          position: 'absolute',
          width:  6 * u,
          height: 2.5 * u,
          borderRadius: 2 * u,
          backgroundColor: SMILE,
          left: 51 * u,
          top:  77 * u,
          transform: [{ rotate: '-18deg' }],
        }}
      />
    </View>
  );
}

// ---------------------------------------------------------------------------
// KittenPiece — Kawaii Round style
//
// Layers (bottom to top):
//   1. Subtle drop-shadow disc
//   2. Rounded ear blobs (outer orange, inner pink) — behind head
//   3. Big round head (amber-orange)
//   4. Lighter belly/muzzle patch on lower face
//   5. Large eyes: amber iris → black pupil → two white shine dots
//   6. Tiny pink triangle nose (rotated rounded square)
//   7. "w" mouth: three small angled rounded rects
//   8. Stubby paw blobs peeking at bottom with toe bumps
// ---------------------------------------------------------------------------

export function KittenPiece({ size }: PieceProps) {
  const u = size / 100;

  // Colour palette
  const HEAD    = '#FFB74D'; // amber orange
  const HEAD_D  = '#FFA726'; // deeper orange for ears / edge
  const BELLY   = '#FFE0B2'; // light peach belly
  const EAR_IN  = '#FF8A80'; // pink inner ear
  const IRIS    = '#FFB300'; // amber gold iris
  const PUPIL   = '#1A1A1A';
  const SHINE   = '#FFFFFF';
  const NOSE    = '#FF8A80';
  const MOUTH   = '#7B3F00'; // warm dark brown
  const PAW     = '#FFCC80'; // light apricot paw

  const circle = (
    key: string,
    cx: number,
    cy: number,
    r: number,
    color: string,
    extraStyle?: object,
  ) => (
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

  return (
    <View style={{ width: size, height: size }}>

      {/* 1. Drop-shadow disc */}
      {circle('shadow', 50, 56, 40, 'rgba(0,0,0,0.08)')}

      {/* 2. Ears — rounded ovals behind head */}
      {/* Left ear outer */}
      <View
        style={{
          position: 'absolute',
          width:  22 * u,
          height: 26 * u,
          borderRadius: 12 * u,
          backgroundColor: HEAD_D,
          left: 10 * u,
          top:   6 * u,
          transform: [{ rotate: '-18deg' }],
        }}
      />
      {/* Right ear outer */}
      <View
        style={{
          position: 'absolute',
          width:  22 * u,
          height: 26 * u,
          borderRadius: 12 * u,
          backgroundColor: HEAD_D,
          left: 68 * u,
          top:   6 * u,
          transform: [{ rotate: '18deg' }],
        }}
      />
      {/* Left ear inner */}
      <View
        style={{
          position: 'absolute',
          width:  13 * u,
          height: 17 * u,
          borderRadius: 8 * u,
          backgroundColor: EAR_IN,
          left: 14.5 * u,
          top:  10 * u,
          transform: [{ rotate: '-18deg' }],
        }}
      />
      {/* Right ear inner */}
      <View
        style={{
          position: 'absolute',
          width:  13 * u,
          height: 17 * u,
          borderRadius: 8 * u,
          backgroundColor: EAR_IN,
          left: 72.5 * u,
          top:  10 * u,
          transform: [{ rotate: '18deg' }],
        }}
      />

      {/* 3. Big round head (~80% of space) */}
      {circle('head', 50, 53, 40, HEAD)}

      {/* 4. Lighter belly / muzzle patch */}
      <View
        style={{
          position: 'absolute',
          width:  50 * u,
          height: 42 * u,
          borderRadius: 25 * u,
          backgroundColor: BELLY,
          left: 25 * u,
          top:  55 * u,
        }}
      />

      {/* 5. LEFT EYE */}
      {/* Iris */}
      {circle('li', 34, 46, 12, IRIS)}
      {/* Pupil */}
      {circle('lp', 34, 46,  7, PUPIL)}
      {/* Large shine */}
      {circle('ls1', 30, 42,  4, SHINE)}
      {/* Small shine */}
      {circle('ls2', 38, 50,  2, SHINE)}

      {/* 5. RIGHT EYE */}
      {/* Iris */}
      {circle('ri', 66, 46, 12, IRIS)}
      {/* Pupil */}
      {circle('rp', 66, 46,  7, PUPIL)}
      {/* Large shine */}
      {circle('rs1', 62, 42,  4, SHINE)}
      {/* Small shine */}
      {circle('rs2', 70, 50,  2, SHINE)}

      {/* 6. Nose — small pink diamond (rotated rounded square) */}
      <View
        style={{
          position: 'absolute',
          width:  9 * u,
          height: 8 * u,
          borderRadius: 3.5 * u,
          backgroundColor: NOSE,
          left: 45.5 * u,
          top:  59 * u,
          transform: [{ rotate: '45deg' }],
        }}
      />

      {/* 7. Mouth — "w" shape: three small angled rounded rects */}
      {/* Left stroke */}
      <View
        style={{
          position: 'absolute',
          width:  11 * u,
          height:  3 * u,
          borderRadius: 2 * u,
          backgroundColor: MOUTH,
          left: 36 * u,
          top:  70 * u,
          transform: [{ rotate: '28deg' }],
        }}
      />
      {/* Centre V */}
      <View
        style={{
          position: 'absolute',
          width:  11 * u,
          height:  3 * u,
          borderRadius: 2 * u,
          backgroundColor: MOUTH,
          left: 44.5 * u,
          top:  70 * u,
          transform: [{ rotate: '-28deg' }],
        }}
      />
      {/* Right stroke */}
      <View
        style={{
          position: 'absolute',
          width:  11 * u,
          height:  3 * u,
          borderRadius: 2 * u,
          backgroundColor: MOUTH,
          left: 53 * u,
          top:  70 * u,
          transform: [{ rotate: '28deg' }],
        }}
      />

      {/* 8. Stubby paws peeking at the bottom */}
      {/* Left paw pad */}
      <View
        style={{
          position: 'absolute',
          width:  22 * u,
          height: 14 * u,
          borderRadius: 11 * u,
          backgroundColor: PAW,
          left: 10 * u,
          top:  84 * u,
        }}
      />
      {/* Left toe bumps */}
      {circle('lt1', 13, 83, 4, PAW)}
      {circle('lt2', 20, 81, 4, PAW)}
      {circle('lt3', 28, 83, 4, PAW)}

      {/* Right paw pad */}
      <View
        style={{
          position: 'absolute',
          width:  22 * u,
          height: 14 * u,
          borderRadius: 11 * u,
          backgroundColor: PAW,
          left: 68 * u,
          top:  84 * u,
        }}
      />
      {/* Right toe bumps */}
      {circle('rt1', 72, 83, 4, PAW)}
      {circle('rt2', 80, 81, 4, PAW)}
      {circle('rt3', 88, 83, 4, PAW)}
    </View>
  );
}
