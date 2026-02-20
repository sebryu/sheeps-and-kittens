import React from 'react';
import { View } from 'react-native';

interface PieceProps {
  size: number;
}

// ---------------------------------------------------------------------------
// SheepPiece — Expressive Character
// ---------------------------------------------------------------------------
// Layout (in 0-100 u-space):
//   Head: oval ~54×46u centred at (50, 31) — occupies top ~45% of space
//   Wool tufts: 7 asymmetric circles around top and sides of head
//   Ears: small rounded stubs poking sideways below the wool
//   Face: peach oval inset inside the head
//   Eyes: large ovals — white sclera, dark iris, white highlight dot
//   Eyebrow ridges: thin dark rounded rects above each eye
//   Nose: small pink oval
//   Smile: two short rotated segments forming a gentle curve
//   Body: wider rounded rect below head + 3 wool puffs on top edge
//   Legs: four small dark rounded stubs at the bottom
// ---------------------------------------------------------------------------

export function SheepPiece({ size }: PieceProps) {
  const u = size / 100;

  // ── Head ──────────────────────────────────────────────────────────────────
  const headCX = 50 * u;
  const headCY = 31 * u;
  const headW  = 54 * u;
  const headH  = 46 * u;
  const headLeft = headCX - headW / 2;
  const headTop  = headCY - headH / 2;

  // ── Wool tufts (7 circles, deliberately asymmetric sizes/positions) ───────
  // Each entry: [centreX (u-space), centreY (u-space), diameter (u-space)]
  const tufts: [number, number, number][] = [
    [38,  9, 20],
    [50,  6, 23],
    [63,  9, 19],
    [31, 17, 17],
    [69, 15, 18],
    [24, 25, 14],
    [76, 23, 15],
  ];

  // ── Ears ──────────────────────────────────────────────────────────────────
  const earW = 10 * u;
  const earH  =  8 * u;
  const earY  = headTop + 16 * u;
  const leftEarX  = headLeft - earW * 0.55;
  const rightEarX = headLeft + headW - earW * 0.45;

  // ── Face oval ─────────────────────────────────────────────────────────────
  const faceW = 38 * u;
  const faceH = 34 * u;
  const faceCX = headCX;
  const faceCY = headCY + 4 * u;
  const faceLeft = faceCX - faceW / 2;
  const faceTop  = faceCY - faceH / 2;

  // ── Eyes ──────────────────────────────────────────────────────────────────
  const eyeW = 10 * u;
  const eyeH  =  9 * u;
  const eyeY  = faceTop + 5 * u;
  const leftEyeX  = faceLeft + 2 * u;
  const rightEyeX = faceLeft + faceW - eyeW - 2 * u;

  const irisD      = 7 * u;
  const highlightD = 2.5 * u;

  // ── Eyebrow ridges ────────────────────────────────────────────────────────
  const browW = 9 * u;
  const browH = Math.max(1.5, 1.8 * u);
  const browY = eyeY - 3.5 * u;

  // ── Nose ──────────────────────────────────────────────────────────────────
  const noseW = 7 * u;
  const noseH = 5 * u;
  const noseY  = eyeY + eyeH + 5 * u;
  const noseLeft = faceCX - noseW / 2;

  // ── Smile ─────────────────────────────────────────────────────────────────
  const smileW = 7 * u;
  const smileH = Math.max(1.5, 2 * u);
  const smileY = noseY + noseH + 3 * u;

  // ── Body ──────────────────────────────────────────────────────────────────
  const bodyW  = 68 * u;
  const bodyH  = 28 * u;
  const bodyCX = 50 * u;
  const bodyCY = 72 * u;
  const bodyLeft = bodyCX - bodyW / 2;
  const bodyTop  = bodyCY - bodyH / 2;
  const bodyRadius = 14 * u;

  const bTuftD = 14 * u;
  const bTuftY = bodyTop - bTuftD * 0.35;
  const bTuftXs = [
    bodyLeft + 12 * u,
    bodyLeft + (bodyW - bTuftD) / 2,
    bodyLeft + bodyW - 12 * u - bTuftD,
  ];

  // ── Legs ──────────────────────────────────────────────────────────────────
  const legW = 8 * u;
  const legH = 12 * u;
  const legRadius = 4 * u;
  const legY = bodyTop + bodyH - 4 * u;
  const legXs = [
    bodyLeft + 6 * u,
    bodyLeft + 18 * u,
    bodyLeft + bodyW - 18 * u - legW,
    bodyLeft + bodyW - 6 * u  - legW,
  ];

  return (
    <View style={{ width: size, height: size }}>

      {/* Body wool puffs rendered before body; body covers their bases */}
      {bTuftXs.map((tx, i) => (
        <View
          key={`bt-${i}`}
          style={{
            position: 'absolute',
            top: bTuftY,
            left: tx,
            width: bTuftD,
            height: bTuftD,
            borderRadius: bTuftD / 2,
            backgroundColor: '#FFF8E7',
          }}
        />
      ))}

      {/* Body */}
      <View
        style={{
          position: 'absolute',
          top: bodyTop,
          left: bodyLeft,
          width: bodyW,
          height: bodyH,
          borderRadius: bodyRadius,
          backgroundColor: '#F5ECD7',
          borderWidth: Math.max(1, 1.5 * u),
          borderColor: '#C8B89A',
        }}
      />

      {/* Legs */}
      {legXs.map((lx, i) => (
        <View
          key={`leg-${i}`}
          style={{
            position: 'absolute',
            top: legY,
            left: lx,
            width: legW,
            height: legH,
            borderRadius: legRadius,
            backgroundColor: '#6D6D6D',
          }}
        />
      ))}

      {/* Head wool tufts rendered before head; head covers their bases */}
      {tufts.map(([cx, cy, d], i) => (
        <View
          key={`wt-${i}`}
          style={{
            position: 'absolute',
            top: cy * u - (d * u) / 2,
            left: cx * u - (d * u) / 2,
            width: d * u,
            height: d * u,
            borderRadius: (d * u) / 2,
            backgroundColor: i % 2 === 0 ? '#FFF8E7' : '#F5ECD7',
          }}
        />
      ))}

      {/* Ears rendered behind head */}
      <View
        style={{
          position: 'absolute',
          top: earY,
          left: leftEarX,
          width: earW,
          height: earH,
          borderRadius: earH / 2,
          backgroundColor: '#FFE4C4',
          borderWidth: Math.max(1, 1.2 * u),
          borderColor: '#E8A0BF',
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: earY - 2 * u,
          left: rightEarX,
          width: earW,
          height: earH,
          borderRadius: earH / 2,
          backgroundColor: '#FFE4C4',
          borderWidth: Math.max(1, 1.2 * u),
          borderColor: '#E8A0BF',
        }}
      />

      {/* Head covers tuft and ear bases */}
      <View
        style={{
          position: 'absolute',
          top: headTop,
          left: headLeft,
          width: headW,
          height: headH,
          borderRadius: headH / 2,
          backgroundColor: '#FFF8E7',
          borderWidth: Math.max(1, 1.5 * u),
          borderColor: '#C8B89A',
        }}
      />

      {/* Face oval */}
      <View
        style={{
          position: 'absolute',
          top: faceTop,
          left: faceLeft,
          width: faceW,
          height: faceH,
          borderRadius: faceH / 2,
          backgroundColor: '#FFE4C4',
        }}
      />

      {/* Left eyebrow */}
      <View
        style={{
          position: 'absolute',
          top: browY,
          left: leftEyeX - 0.5 * u,
          width: browW,
          height: browH,
          borderRadius: browH / 2,
          backgroundColor: '#8B6A52',
          transform: [{ rotate: '-6deg' }],
        }}
      />

      {/* Right eyebrow */}
      <View
        style={{
          position: 'absolute',
          top: browY,
          left: rightEyeX - 0.5 * u,
          width: browW,
          height: browH,
          borderRadius: browH / 2,
          backgroundColor: '#8B6A52',
          transform: [{ rotate: '6deg' }],
        }}
      />

      {/* Left eye sclera */}
      <View
        style={{
          position: 'absolute',
          top: eyeY,
          left: leftEyeX,
          width: eyeW,
          height: eyeH,
          borderRadius: eyeH / 2,
          backgroundColor: '#FFFFFF',
          borderWidth: Math.max(1, 1.2 * u),
          borderColor: '#3D3D3D',
        }}
      />
      {/* Left eye iris */}
      <View
        style={{
          position: 'absolute',
          top: eyeY + (eyeH - irisD) / 2,
          left: leftEyeX + (eyeW - irisD) / 2,
          width: irisD,
          height: irisD,
          borderRadius: irisD / 2,
          backgroundColor: '#3D3D3D',
        }}
      />
      {/* Left eye highlight */}
      <View
        style={{
          position: 'absolute',
          top: eyeY + 1.2 * u,
          left: leftEyeX + eyeW * 0.55,
          width: highlightD,
          height: highlightD,
          borderRadius: highlightD / 2,
          backgroundColor: '#FFFFFF',
        }}
      />

      {/* Right eye sclera */}
      <View
        style={{
          position: 'absolute',
          top: eyeY,
          left: rightEyeX,
          width: eyeW,
          height: eyeH,
          borderRadius: eyeH / 2,
          backgroundColor: '#FFFFFF',
          borderWidth: Math.max(1, 1.2 * u),
          borderColor: '#3D3D3D',
        }}
      />
      {/* Right eye iris */}
      <View
        style={{
          position: 'absolute',
          top: eyeY + (eyeH - irisD) / 2,
          left: rightEyeX + (eyeW - irisD) / 2,
          width: irisD,
          height: irisD,
          borderRadius: irisD / 2,
          backgroundColor: '#3D3D3D',
        }}
      />
      {/* Right eye highlight */}
      <View
        style={{
          position: 'absolute',
          top: eyeY + 1.2 * u,
          left: rightEyeX + eyeW * 0.55,
          width: highlightD,
          height: highlightD,
          borderRadius: highlightD / 2,
          backgroundColor: '#FFFFFF',
        }}
      />

      {/* Nose */}
      <View
        style={{
          position: 'absolute',
          top: noseY,
          left: noseLeft,
          width: noseW,
          height: noseH,
          borderRadius: noseH / 2,
          backgroundColor: '#E8A0BF',
        }}
      />

      {/* Smile left segment tilts down-left */}
      <View
        style={{
          position: 'absolute',
          top: smileY,
          left: faceCX - 7 * u,
          width: smileW,
          height: smileH,
          borderRadius: smileH / 2,
          backgroundColor: '#C07A6E',
          transform: [{ rotate: '15deg' }],
        }}
      />

      {/* Smile right segment tilts down-right */}
      <View
        style={{
          position: 'absolute',
          top: smileY,
          left: faceCX + 1 * u,
          width: smileW,
          height: smileH,
          borderRadius: smileH / 2,
          backgroundColor: '#C07A6E',
          transform: [{ rotate: '-15deg' }],
        }}
      />

    </View>
  );
}

// ---------------------------------------------------------------------------
// KittenPiece — Expressive Character
// ---------------------------------------------------------------------------
// Layout (in 0-100 u-space):
//   Head: wide rounded oval ~62×56u, centred at (50, 36) — top 50% of space
//   Ears: two tall pointed triangles (border trick). Left ear slightly tilted.
//         Each ear has a pink inner triangle for detail.
//   Tabby stripes: 3 thin parallel marks on forehead (widest to narrowest)
//   Eyes: large ovals — vivid green iris (#4CAF50), slit pupil, white highlight
//         Each eye rotated ~10deg: inner corner lower than outer (mischievous)
//   Eyebrow marks: short dark rounded rects above each eye (fur attitude)
//   Nose: small inverted triangle, pink (#FF8A80)
//   Mouth: asymmetric smirk — left side drops lower than right
//   Whiskers: 3 per side, fanning outward from cheek area
//   Body: wide rounded oval below head (sitting silhouette)
//   Belly: cream oval patch inset in body
//   Tail: 5 rotated rounded rects suggesting an upward curl
// ---------------------------------------------------------------------------

export function KittenPiece({ size }: PieceProps) {
  const u = size / 100;

  // ── Head ──────────────────────────────────────────────────────────────────
  const headW  = 62 * u;
  const headH  = 56 * u;
  const headCX = 50 * u;
  const headCY = 36 * u;
  const headLeft = headCX - headW / 2;
  const headTop  = headCY - headH / 2;
  const headRadius = headH * 0.48;

  // ── Left ear (slightly tilted) ────────────────────────────────────────────
  const lEarHB  = 16 * u;
  const lEarH   = 22 * u;
  const lEarCX  = headLeft + 14 * u;
  const lEarTop = headTop - lEarH + 6 * u;

  const lInnerHB  = 8 * u;
  const lInnerH   = 12 * u;
  const lInnerTop = lEarTop + 7 * u;

  // ── Right ear (straighter, slightly taller) ───────────────────────────────
  const rEarHB  = 15 * u;
  const rEarH   = 24 * u;
  const rEarCX  = headLeft + headW - 14 * u;
  const rEarTop = headTop - rEarH + 6 * u;

  const rInnerHB  = 7 * u;
  const rInnerH   = 13 * u;
  const rInnerTop = rEarTop + 8 * u;

  // ── Tabby forehead stripes ─────────────────────────────────────────────────
  const stripeH = Math.max(1.5, 2 * u);
  const stripeCX = headCX;
  const stripes = [
    { w: 14 * u, y: headTop + 6  * u },
    { w: 11 * u, y: headTop + 11 * u },
    { w:  7 * u, y: headTop + 16 * u },
  ];

  // ── Eyes ──────────────────────────────────────────────────────────────────
  const eyeW = 13 * u;
  const eyeH = 11 * u;
  const eyeCY = headTop + 26 * u;

  const lEyeCX   = headLeft + 15 * u;
  const lEyeLeft = lEyeCX - eyeW / 2;
  const lEyeTop  = eyeCY - eyeH / 2;

  const rEyeCX   = headLeft + headW - 15 * u;
  const rEyeLeft = rEyeCX - eyeW / 2;
  const rEyeTop  = eyeCY - eyeH / 2;

  const irisW = 9 * u;
  const irisH = 9 * u;
  const pupilW = 3 * u;
  const pupilH = 7.5 * u;
  const highlightD = 2.5 * u;

  // ── Eyebrow fur marks ─────────────────────────────────────────────────────
  const browW = 9 * u;
  const browH = Math.max(1.5, 2 * u);

  // ── Nose ──────────────────────────────────────────────────────────────────
  const noseHB  = 5 * u;
  const noseH   = 4 * u;
  const noseCX  = headCX;
  const noseTop = eyeCY + eyeH / 2 + 5 * u;
  const noseLeft = noseCX - noseHB;

  // ── Mouth (asymmetric smirk) ──────────────────────────────────────────────
  const smirkH = Math.max(1.5, 2 * u);
  const smirkW = 8 * u;
  const smirkY_left  = noseTop + noseH + 4 * u;
  const smirkY_right = noseTop + noseH + 1.5 * u;
  const smirkX_left  = noseCX - smirkW - 1 * u;
  const smirkX_right = noseCX + 1 * u;

  // ── Whiskers ──────────────────────────────────────────────────────────────
  const wH = Math.max(1, 1.5 * u);
  const wRadius = wH / 2;
  const wOriginY = noseTop + 1 * u;
  const leftWhiskers  = [
    { len: 23 * u, x: headLeft - 20 * u, y: wOriginY - 5 * u, rot: '-8deg'  },
    { len: 26 * u, x: headLeft - 23 * u, y: wOriginY,          rot: '2deg'   },
    { len: 20 * u, x: headLeft - 17 * u, y: wOriginY + 5 * u,  rot: '14deg'  },
  ];
  const rightWhiskers = [
    { len: 23 * u, x: headLeft + headW,  y: wOriginY - 5 * u, rot: '8deg'   },
    { len: 26 * u, x: headLeft + headW,  y: wOriginY,          rot: '-2deg'  },
    { len: 20 * u, x: headLeft + headW,  y: wOriginY + 5 * u,  rot: '-14deg' },
  ];

  // ── Body ──────────────────────────────────────────────────────────────────
  const bodyW  = 52 * u;
  const bodyH  = 30 * u;
  const bodyCX = 50 * u;
  const bodyCY = 76 * u;
  const bodyLeft = bodyCX - bodyW / 2;
  const bodyTop  = bodyCY - bodyH / 2;
  const bodyRadius = 15 * u;

  const bellyW = 30 * u;
  const bellyH = 20 * u;
  const bellyLeft = bodyCX - bellyW / 2;
  const bellyTop  = bodyCY - bellyH / 2;

  // ── Tail ──────────────────────────────────────────────────────────────────
  const tailSegs = [
    { top: bodyCY + 6  * u, left: bodyLeft + bodyW - 4 * u, w: 10 * u, h: 7 * u, rot: '30deg'  },
    { top: bodyCY + 0  * u, left: bodyLeft + bodyW + 3 * u, w:  9 * u, h: 7 * u, rot: '0deg'   },
    { top: bodyCY - 8  * u, left: bodyLeft + bodyW + 5 * u, w:  8 * u, h: 6 * u, rot: '-25deg' },
    { top: bodyCY - 16 * u, left: bodyLeft + bodyW + 1 * u, w:  7 * u, h: 6 * u, rot: '-50deg' },
    { top: bodyCY - 22 * u, left: bodyLeft + bodyW - 5 * u, w:  6 * u, h: 5 * u, rot: '-75deg' },
  ];

  return (
    <View style={{ width: size, height: size }}>

      {/* Tail segments behind body */}
      {tailSegs.map((seg, i) => (
        <View
          key={`tail-${i}`}
          style={{
            position: 'absolute',
            top: seg.top,
            left: seg.left,
            width: seg.w,
            height: seg.h,
            borderRadius: seg.h / 2,
            backgroundColor: '#F5A623',
            borderWidth: Math.max(1, 1 * u),
            borderColor: '#E8871E',
            transform: [{ rotate: seg.rot }],
          }}
        />
      ))}

      {/* Body */}
      <View
        style={{
          position: 'absolute',
          top: bodyTop,
          left: bodyLeft,
          width: bodyW,
          height: bodyH,
          borderRadius: bodyRadius,
          backgroundColor: '#F5A623',
          borderWidth: Math.max(1, 1.5 * u),
          borderColor: '#E8871E',
        }}
      />

      {/* Belly cream patch */}
      <View
        style={{
          position: 'absolute',
          top: bellyTop,
          left: bellyLeft,
          width: bellyW,
          height: bellyH,
          borderRadius: bellyH / 2,
          backgroundColor: '#FFF3E0',
        }}
      />

      {/* Left outer ear */}
      <View
        style={{
          position: 'absolute',
          top: lEarTop,
          left: lEarCX - lEarHB,
          width: 0,
          height: 0,
          borderLeftWidth: lEarHB,
          borderRightWidth: lEarHB,
          borderBottomWidth: lEarH,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderBottomColor: '#E8871E',
          transform: [{ rotate: '-8deg' }],
        }}
      />

      {/* Left inner ear */}
      <View
        style={{
          position: 'absolute',
          top: lInnerTop,
          left: lEarCX - lInnerHB,
          width: 0,
          height: 0,
          borderLeftWidth: lInnerHB,
          borderRightWidth: lInnerHB,
          borderBottomWidth: lInnerH,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderBottomColor: '#FF8A80',
          transform: [{ rotate: '-8deg' }],
        }}
      />

      {/* Right outer ear */}
      <View
        style={{
          position: 'absolute',
          top: rEarTop,
          left: rEarCX - rEarHB,
          width: 0,
          height: 0,
          borderLeftWidth: rEarHB,
          borderRightWidth: rEarHB,
          borderBottomWidth: rEarH,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderBottomColor: '#E8871E',
        }}
      />

      {/* Right inner ear */}
      <View
        style={{
          position: 'absolute',
          top: rInnerTop,
          left: rEarCX - rInnerHB,
          width: 0,
          height: 0,
          borderLeftWidth: rInnerHB,
          borderRightWidth: rInnerHB,
          borderBottomWidth: rInnerH,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderBottomColor: '#FF8A80',
        }}
      />

      {/* Head covers ear bases */}
      <View
        style={{
          position: 'absolute',
          top: headTop,
          left: headLeft,
          width: headW,
          height: headH,
          borderRadius: headRadius,
          backgroundColor: '#F5A623',
          borderWidth: Math.max(1, 1.5 * u),
          borderColor: '#E8871E',
        }}
      />

      {/* Tabby forehead stripes */}
      {stripes.map((s, i) => (
        <View
          key={`stripe-${i}`}
          style={{
            position: 'absolute',
            top: s.y,
            left: stripeCX - s.w / 2,
            width: s.w,
            height: stripeH,
            borderRadius: stripeH / 2,
            backgroundColor: '#E8871E',
          }}
        />
      ))}

      {/* Left eyebrow fur mark */}
      <View
        style={{
          position: 'absolute',
          top: lEyeTop - 4 * u,
          left: lEyeLeft + 1 * u,
          width: browW,
          height: browH,
          borderRadius: browH / 2,
          backgroundColor: '#C06010',
          transform: [{ rotate: '-12deg' }],
        }}
      />

      {/* Right eyebrow fur mark */}
      <View
        style={{
          position: 'absolute',
          top: rEyeTop - 4 * u,
          left: rEyeLeft + 1 * u,
          width: browW,
          height: browH,
          borderRadius: browH / 2,
          backgroundColor: '#C06010',
          transform: [{ rotate: '12deg' }],
        }}
      />

      {/* Left eye sclera */}
      <View
        style={{
          position: 'absolute',
          top: lEyeTop,
          left: lEyeLeft,
          width: eyeW,
          height: eyeH,
          borderRadius: eyeH / 2,
          backgroundColor: '#FFFFFF',
          borderWidth: Math.max(1, 1.2 * u),
          borderColor: '#2D2D2D',
          transform: [{ rotate: '-10deg' }],
        }}
      />
      {/* Left eye iris */}
      <View
        style={{
          position: 'absolute',
          top: lEyeTop + (eyeH - irisH) / 2,
          left: lEyeLeft + (eyeW - irisW) / 2,
          width: irisW,
          height: irisH,
          borderRadius: irisH / 2,
          backgroundColor: '#4CAF50',
        }}
      />
      {/* Left eye slit pupil */}
      <View
        style={{
          position: 'absolute',
          top: lEyeTop + (eyeH - pupilH) / 2,
          left: lEyeLeft + (eyeW - pupilW) / 2,
          width: pupilW,
          height: pupilH,
          borderRadius: pupilW / 2,
          backgroundColor: '#2D2D2D',
        }}
      />
      {/* Left eye highlight */}
      <View
        style={{
          position: 'absolute',
          top: lEyeTop + 1.5 * u,
          left: lEyeLeft + eyeW * 0.5,
          width: highlightD,
          height: highlightD,
          borderRadius: highlightD / 2,
          backgroundColor: '#FFFFFF',
        }}
      />

      {/* Right eye sclera */}
      <View
        style={{
          position: 'absolute',
          top: rEyeTop,
          left: rEyeLeft,
          width: eyeW,
          height: eyeH,
          borderRadius: eyeH / 2,
          backgroundColor: '#FFFFFF',
          borderWidth: Math.max(1, 1.2 * u),
          borderColor: '#2D2D2D',
          transform: [{ rotate: '10deg' }],
        }}
      />
      {/* Right eye iris */}
      <View
        style={{
          position: 'absolute',
          top: rEyeTop + (eyeH - irisH) / 2,
          left: rEyeLeft + (eyeW - irisW) / 2,
          width: irisW,
          height: irisH,
          borderRadius: irisH / 2,
          backgroundColor: '#4CAF50',
        }}
      />
      {/* Right eye slit pupil */}
      <View
        style={{
          position: 'absolute',
          top: rEyeTop + (eyeH - pupilH) / 2,
          left: rEyeLeft + (eyeW - pupilW) / 2,
          width: pupilW,
          height: pupilH,
          borderRadius: pupilW / 2,
          backgroundColor: '#2D2D2D',
        }}
      />
      {/* Right eye highlight */}
      <View
        style={{
          position: 'absolute',
          top: rEyeTop + 1.5 * u,
          left: rEyeLeft + eyeW * 0.5,
          width: highlightD,
          height: highlightD,
          borderRadius: highlightD / 2,
          backgroundColor: '#FFFFFF',
        }}
      />

      {/* Nose inverted triangle */}
      <View
        style={{
          position: 'absolute',
          top: noseTop,
          left: noseLeft,
          width: 0,
          height: 0,
          borderLeftWidth: noseHB,
          borderRightWidth: noseHB,
          borderTopWidth: noseH,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderTopColor: '#FF8A80',
        }}
      />

      {/* Smirk left side drops lower */}
      <View
        style={{
          position: 'absolute',
          top: smirkY_left,
          left: smirkX_left,
          width: smirkW,
          height: smirkH,
          borderRadius: smirkH / 2,
          backgroundColor: '#2D2D2D',
          transform: [{ rotate: '10deg' }],
        }}
      />

      {/* Smirk right side stays higher */}
      <View
        style={{
          position: 'absolute',
          top: smirkY_right,
          left: smirkX_right,
          width: smirkW * 0.75,
          height: smirkH,
          borderRadius: smirkH / 2,
          backgroundColor: '#2D2D2D',
          transform: [{ rotate: '-8deg' }],
        }}
      />

      {/* Left whiskers */}
      {leftWhiskers.map((w, i) => (
        <View
          key={`lw-${i}`}
          style={{
            position: 'absolute',
            top: w.y,
            left: w.x,
            width: w.len,
            height: wH,
            borderRadius: wRadius,
            backgroundColor: '#2D2D2D',
            transform: [{ rotate: w.rot }],
          }}
        />
      ))}

      {/* Right whiskers */}
      {rightWhiskers.map((w, i) => (
        <View
          key={`rw-${i}`}
          style={{
            position: 'absolute',
            top: w.y,
            left: w.x,
            width: w.len,
            height: wH,
            borderRadius: wRadius,
            backgroundColor: '#2D2D2D',
            transform: [{ rotate: w.rot }],
          }}
        />
      ))}

    </View>
  );
}
