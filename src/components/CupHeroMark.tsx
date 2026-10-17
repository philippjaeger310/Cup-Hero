import React from 'react';
import Svg, { Path, Text as SvgText } from 'react-native-svg';

interface CupHeroMarkProps {
  size?: number;
  fg?: string;
  crown?: string;
}

/**
 * Cup Hero brand mark — player from behind, number 10, crown. Ported from
 * the design team's CupHeroMark.rn.jsx (Cup Hero app design.zip) 1:1;
 * outline is drawn as a stroke (not a fill), which reads correctly on the
 * app's dark backgrounds but will look "empty" if ever previewed on a
 * transparent canvas composited onto white.
 */
export function CupHeroMark({ size = 96, fg = '#FFFFFF', crown = '#F7B5CD' }: CupHeroMarkProps) {
  return (
    <Svg width={size} height={size} viewBox="9 9 82 82" fill="none">
      <Path
        d="M38.5 27 L38.5 21 L43.2 15.5 L46.8 21.5 L50 12 L53.2 21.5 L56.8 15.5 L61.5 21 L61.5 27 Z"
        fill={crown}
        stroke={crown}
        strokeWidth={3.2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <Path
        d="M50 30.5 C55.8 30.5 60 34.7 60 39.7 C60 44.7 55.8 48.9 50 48.9 C44.2 48.9 40 44.7 40 39.7 C40 34.7 44.2 30.5 50 30.5 Z"
        stroke={fg}
        strokeWidth={5.5}
        strokeLinejoin="round"
      />
      <Path
        d="M50 52 C40.5 52 35.8 54.6 33.6 58.2 C31.6 61.5 29.8 64.6 29 67.2 C28 70.4 30 73 33.2 72.5 C34.9 72.2 36.1 71.3 36.9 70 L36.9 83.5 C36.9 87.6 39.6 90.5 44 90.5 L56 90.5 C60.4 90.5 63.1 87.6 63.1 83.5 L63.1 70 C63.9 71.3 65.1 72.2 66.8 72.5 C70 73 72 70.4 71 67.2 C70.2 64.6 68.4 61.5 66.4 58.2 C64.2 54.6 59.5 52 50 52 Z"
        stroke={fg}
        strokeWidth={5.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <SvgText x={50} y={71} textAnchor="middle" fontSize={10} fontWeight="800" fill={fg}>
        10
      </SvgText>
    </Svg>
  );
}
