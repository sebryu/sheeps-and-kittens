import React from 'react';
import { View } from 'react-native';

interface PieceProps {
  size: number;
}

// ---------------------------------------------------------------------------
// SheepPiece — Geometric Minimalist
// ---------------------------------------------------------------------------
//
// Layout (in 0-100 u-space, all values multiplied by u = size / 100):
//
//   Container: size x size
//   Body:      rounded square, top=16, left=8, width=84, height=84
//              borderRadius=25 (~30% of width), border 2u warm-gray #9E9E9E
//              Color: #F5F0E8 (cream)
//   Wool:      5 circles diameter=20u, centres sit exactly on the body top edge
//              so only the upper half protrudes. The body painted afterward masks
//              the lower halves.
//              Color: #E8E0D4 (slightly darker cream)
//   Face oval: width=52u, height=40u, centred horizontally in body,
//              verticalCentre at bodyTop + 52% of bodySize.
//              borderRadius = faceH/2 for a full oval.
//              Color: #EDE8DE (warm eggshell)
//   Eyes:      two 7u perfect circles, charcoal #333333
//              Y = faceTop + 9u
//              Left  X = faceLeft + 9u
//              Right X = faceLeft + faceW - 9u - eyeD
//   Nose:      5u circle, charcoal #333333
//              centred horizontally in face, 7u below eye top + eyeD
//
// ---------------------------------------------------------------------------

export function SheepPiece({ size }: PieceProps) {
  const u = size / 100;

  // Body
  const bodyTop    = 16 * u;
  const bodyLeft   = 8 * u;
  const bodySize   = 84 * u;
  const bodyRadius = 25 * u;
  const borderW    = Math.max(1.5, 2 * u);

  // Wool bumps: 5 circles, centres on the body top edge
  const woolD = 20 * u;
  const woolR = woolD / 2;
  const woolCentreXs = [
    bodyLeft + 9  * u,
    bodyLeft + 28 * u,
    bodyLeft + 42 * u,
    bodyLeft + 56 * u,
    bodyLeft + 75 * u,
  ];
  const woolCentreY = bodyTop;

  // Face oval
  const faceW       = 52 * u;
  const faceH       = 40 * u;
  const faceCentreX = bodyLeft + bodySize / 2;
  const faceCentreY = bodyTop  + bodySize * 0.52;
  const faceLeft    = faceCentreX - faceW / 2;
  const faceTopPos  = faceCentreY - faceH / 2;

  // Eyes
  const eyeD      = 7 * u;
  const eyeY      = faceTopPos + 9 * u;
  const eyeLeftX  = faceLeft + 9 * u;
  const eyeRightX = faceLeft + faceW - 9 * u - eyeD;

  // Nose
  const noseD = 5 * u;
  const noseX = faceCentreX - noseD / 2;
  const noseY = eyeY + eyeD + 7 * u;

  return (
    <View style={{ width: size, height: size }}>

      {/* Wool bumps drawn first; body covers their lower halves */}
      {woolCentreXs.map((cx, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            top:          woolCentreY - woolR,
            left:         cx - woolR,
            width:        woolD,
            height:       woolD,
            borderRadius: woolR,
            backgroundColor: '#E8E0D4',
          }}
        />
      ))}

      {/* Body rounded square, painted over lower halves of wool bumps */}
      <View
        style={{
          position: 'absolute',
          top:    bodyTop,
          left:   bodyLeft,
          width:  bodySize,
          height: bodySize,
          borderRadius:    bodyRadius,
          backgroundColor: '#F5F0E8',
          borderWidth: borderW,
          borderColor: '#9E9E9E',
        }}
      />

      {/* Face oval */}
      <View
        style={{
          position: 'absolute',
          top:    faceTopPos,
          left:   faceLeft,
          width:  faceW,
          height: faceH,
          borderRadius:    faceH / 2,
          backgroundColor: '#EDE8DE',
        }}
      />

      {/* Left eye */}
      <View
        style={{
          position: 'absolute',
          top:    eyeY,
          left:   eyeLeftX,
          width:  eyeD,
          height: eyeD,
          borderRadius:    eyeD / 2,
          backgroundColor: '#333333',
        }}
      />

      {/* Right eye */}
      <View
        style={{
          position: 'absolute',
          top:    eyeY,
          left:   eyeRightX,
          width:  eyeD,
          height: eyeD,
          borderRadius:    eyeD / 2,
          backgroundColor: '#333333',
        }}
      />

      {/* Nose dot */}
      <View
        style={{
          position: 'absolute',
          top:    noseY,
          left:   noseX,
          width:  noseD,
          height: noseD,
          borderRadius:    noseD / 2,
          backgroundColor: '#333333',
        }}
      />

    </View>
  );
}

// ---------------------------------------------------------------------------
// KittenPiece — Geometric Minimalist
// ---------------------------------------------------------------------------
//
// Layout (in 0-100 u-space):
//
//   Container: size x size
//   Head:      rounded square, top=24, left=6, width=88, height=76
//              borderRadius=22, border 2u #E8961C
//              Color: #F5A623 (warm amber)
//   Ears:      Two upward triangles using the CSS zero-width border trick.
//              Outer: half-base=22u, height=22u, color #E8961C
//                Left  centreX = headLeft + 20u
//                Right centreX = headLeft + headW - 20u
//                Base dips 4u inside head top for seamless integration.
//              Inner: half-base=11u, height=11u, color #FFD180
//                Offset 7u down from outer ear top.
//   Eyes:      Two 14u circles, yellow-green #C5E1A5, with vertical-slit
//              pupil: width=5u, height=11u, borderRadius=2.5u, #333333
//              eyeTopY = headTop + 20u
//              Left  X = headLeft + 12u
//              Right X = headLeft + headW - 12u - eyeD
//   Nose:      Inverted triangle via border-top trick
//              half-base=7u, height=6u, color #333333
//              Centred horizontally, 8u below eye bottom
//   Whiskers:  3 lines per side, charcoal #333333, height=max(1, 1.5u)
//              Vertical positions: headTop+42u, +53u, +64u (11u apart)
//              Lengths (top to bottom): 24u, 20u, 16u
//              Left whiskers right-aligned to headLeft + 28u
//              Right whiskers left-aligned from headLeft + headW - 28u
//
// ---------------------------------------------------------------------------

export function KittenPiece({ size }: PieceProps) {
  const u = size / 100;

  // Head
  const headTop    = 24 * u;
  const headLeft   = 6  * u;
  const headW      = 88 * u;
  const headH      = 76 * u;
  const headRadius = 22 * u;
  const borderW    = Math.max(1.5, 2 * u);

  // Outer ear triangles
  const earHB      = 22 * u;
  const earH       = 22 * u;
  const earOverlap = 4  * u;

  const leftEarCX   = headLeft + 20 * u;
  const leftEarLeft = leftEarCX - earHB;
  const leftEarTop  = headTop - earH + earOverlap;

  const rightEarCX   = headLeft + headW - 20 * u;
  const rightEarLeft = rightEarCX - earHB;
  const rightEarTop  = leftEarTop;

  // Inner ear triangles
  const innerHB      = 11 * u;
  const innerH       = 11 * u;
  const innerOffsetY = 7  * u;

  const leftInnerLeft  = leftEarCX  - innerHB;
  const leftInnerTop   = leftEarTop + innerOffsetY;
  const rightInnerLeft = rightEarCX - innerHB;
  const rightInnerTop  = rightEarTop + innerOffsetY;

  // Eyes
  const eyeD      = 14 * u;
  const eyeRadius = eyeD / 2;
  const pupilW    = 5  * u;
  const pupilH    = 11 * u;

  const eyeTopY   = headTop + 20 * u;
  const eyeLeftX  = headLeft + 12 * u;
  const eyeRightX = headLeft + headW - 12 * u - eyeD;

  // Nose (inverted triangle)
  const noseHB   = 7 * u;
  const noseH    = 6 * u;
  const noseCX   = headLeft + headW / 2;
  const noseTopPos = eyeTopY + eyeD + 8 * u;
  const noseLeft = noseCX - noseHB;

  // Whiskers
  const wStroke = Math.max(1, Math.round(1.5 * u));
  const wBR     = wStroke / 2;
  const wY      = [headTop + 42 * u, headTop + 53 * u, headTop + 64 * u];
  const wLengths = [24 * u, 20 * u, 16 * u];
  const leftWhiskerEnd    = headLeft + 28 * u;
  const rightWhiskerStart = headLeft + headW - 28 * u;

  return (
    <View style={{ width: size, height: size }}>

      {/* Left outer ear */}
      <View
        style={{
          position: 'absolute',
          top:  leftEarTop,
          left: leftEarLeft,
          width:  0,
          height: 0,
          borderLeftWidth:   earHB,
          borderRightWidth:  earHB,
          borderBottomWidth: earH,
          borderLeftColor:   'transparent',
          borderRightColor:  'transparent',
          borderBottomColor: '#E8961C',
        }}
      />

      {/* Left inner ear */}
      <View
        style={{
          position: 'absolute',
          top:  leftInnerTop,
          left: leftInnerLeft,
          width:  0,
          height: 0,
          borderLeftWidth:   innerHB,
          borderRightWidth:  innerHB,
          borderBottomWidth: innerH,
          borderLeftColor:   'transparent',
          borderRightColor:  'transparent',
          borderBottomColor: '#FFD180',
        }}
      />

      {/* Right outer ear */}
      <View
        style={{
          position: 'absolute',
          top:  rightEarTop,
          left: rightEarLeft,
          width:  0,
          height: 0,
          borderLeftWidth:   earHB,
          borderRightWidth:  earHB,
          borderBottomWidth: earH,
          borderLeftColor:   'transparent',
          borderRightColor:  'transparent',
          borderBottomColor: '#E8961C',
        }}
      />

      {/* Right inner ear */}
      <View
        style={{
          position: 'absolute',
          top:  rightInnerTop,
          left: rightInnerLeft,
          width:  0,
          height: 0,
          borderLeftWidth:   innerHB,
          borderRightWidth:  innerHB,
          borderBottomWidth: innerH,
          borderLeftColor:   'transparent',
          borderRightColor:  'transparent',
          borderBottomColor: '#FFD180',
        }}
      />

      {/* Head drawn after ears so it clips their bases cleanly */}
      <View
        style={{
          position: 'absolute',
          top:    headTop,
          left:   headLeft,
          width:  headW,
          height: headH,
          borderRadius:    headRadius,
          backgroundColor: '#F5A623',
          borderWidth: borderW,
          borderColor: '#E8961C',
        }}
      />

      {/* Left eye: yellow-green circle with vertical slit pupil */}
      <View
        style={{
          position: 'absolute',
          top:    eyeTopY,
          left:   eyeLeftX,
          width:  eyeD,
          height: eyeD,
          borderRadius:    eyeRadius,
          backgroundColor: '#C5E1A5',
          alignItems:      'center',
          justifyContent:  'center',
        }}
      >
        <View
          style={{
            width:  pupilW,
            height: pupilH,
            borderRadius:    pupilW / 2,
            backgroundColor: '#333333',
          }}
        />
      </View>

      {/* Right eye: yellow-green circle with vertical slit pupil */}
      <View
        style={{
          position: 'absolute',
          top:    eyeTopY,
          left:   eyeRightX,
          width:  eyeD,
          height: eyeD,
          borderRadius:    eyeRadius,
          backgroundColor: '#C5E1A5',
          alignItems:      'center',
          justifyContent:  'center',
        }}
      >
        <View
          style={{
            width:  pupilW,
            height: pupilH,
            borderRadius:    pupilW / 2,
            backgroundColor: '#333333',
          }}
        />
      </View>

      {/* Nose: inverted triangle via border-top trick */}
      <View
        style={{
          position: 'absolute',
          top:  noseTopPos,
          left: noseLeft,
          width:  0,
          height: 0,
          borderLeftWidth:  noseHB,
          borderRightWidth: noseHB,
          borderTopWidth:   noseH,
          borderLeftColor:  'transparent',
          borderRightColor: 'transparent',
          borderTopColor:   '#333333',
        }}
      />

      {/* Whiskers left side, right-aligned to leftWhiskerEnd */}
      {wLengths.map((len, i) => (
        <View
          key={`wl-${i}`}
          style={{
            position: 'absolute',
            top:    wY[i],
            left:   leftWhiskerEnd - len,
            width:  len,
            height: wStroke,
            borderRadius:    wBR,
            backgroundColor: '#333333',
          }}
        />
      ))}

      {/* Whiskers right side, left-aligned from rightWhiskerStart */}
      {wLengths.map((len, i) => (
        <View
          key={`wr-${i}`}
          style={{
            position: 'absolute',
            top:    wY[i],
            left:   rightWhiskerStart,
            width:  len,
            height: wStroke,
            borderRadius:    wBR,
            backgroundColor: '#333333',
          }}
        />
      ))}

    </View>
  );
}
