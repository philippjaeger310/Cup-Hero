import React from 'react';
import Svg, { Path, Rect, Ellipse } from 'react-native-svg';

interface TrophyCupProps {
  color: string;
  size?: number;
}

// An original, simplified cup silhouette — no real trophy/competition
// artwork is referenced. Purely geometric so it works for any of our
// fictional in-game competitions (see src/data/competitions.ts).
export function TrophyCup({ color, size = 96 }: TrophyCupProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Path
        d="M30 10 H70 V32 C70 48 58 58 50 58 C42 58 30 48 30 32 Z"
        fill={color}
      />
      <Path d="M30 14 C18 14 12 22 14 32 C16 42 26 46 32 44" stroke={color} strokeWidth={5} fill="none" />
      <Path d="M70 14 C82 14 88 22 86 32 C84 42 74 46 68 44" stroke={color} strokeWidth={5} fill="none" />
      <Rect x={45} y={58} width={10} height={16} fill={color} />
      <Ellipse cx={50} cy={80} rx={22} ry={6} fill={color} />
      <Rect x={30} y={76} width={40} height={8} rx={3} fill={color} />
    </Svg>
  );
}
