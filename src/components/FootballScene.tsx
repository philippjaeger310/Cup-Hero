import React from 'react';
import Svg, { Circle, Line, Path, Rect, G } from 'react-native-svg';
import { colors } from '../theme';

interface FootballSceneProps {
  width: number;
  height: number;
}

// Original, entirely geometric stadium/pitch illustration for the launch
// screen — floodlights, a pitch with markings, a goal and a ball. No real
// stadium, team, or player likeness is depicted.
export function FootballScene({ width, height }: FootballSceneProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 320 220">
      {/* Sky */}
      <Rect x={0} y={0} width={320} height={220} fill={colors.background} />

      {/* Floodlights */}
      <G opacity={0.5}>
        <Line x1={24} y1={200} x2={24} y2={40} stroke={colors.gray} strokeWidth={3} />
        <Rect x={4} y={20} width={40} height={20} rx={3} fill={colors.gray} />
        <Line x1={296} y1={200} x2={296} y2={40} stroke={colors.gray} strokeWidth={3} />
        <Rect x={276} y={20} width={40} height={20} rx={3} fill={colors.gray} />
      </G>

      {/* Pitch */}
      <Rect x={0} y={130} width={320} height={90} fill="#123420" />
      <G opacity={0.35}>
        <Rect x={0} y={130} width={320} height={12} fill="#1C4A2C" />
        <Rect x={0} y={154} width={320} height={12} fill="#1C4A2C" />
        <Rect x={0} y={178} width={320} height={12} fill="#1C4A2C" />
        <Rect x={0} y={202} width={320} height={12} fill="#1C4A2C" />
      </G>

      {/* Pitch markings */}
      <Line x1={0} y1={130} x2={320} y2={130} stroke={colors.white} strokeWidth={2} opacity={0.8} />
      <Circle cx={160} cy={170} r={26} stroke={colors.white} strokeWidth={2} fill="none" opacity={0.8} />
      <Circle cx={160} cy={170} r={2.5} fill={colors.white} opacity={0.8} />

      {/* Goal, right side */}
      <G opacity={0.9}>
        <Rect x={250} y={140} width={44} height={30} fill="none" stroke={colors.white} strokeWidth={2.5} />
        <Line x1={250} y1={140} x2={262} y2={130} stroke={colors.white} strokeWidth={2} />
        <Line x1={294} y1={140} x2={282} y2={130} stroke={colors.white} strokeWidth={2} />
      </G>

      {/* Ball */}
      <G>
        <Circle cx={140} cy={188} r={9} fill={colors.white} />
        <Path
          d="M140 181 L146 185 L144 192 L136 192 L134 185 Z"
          fill={colors.background}
        />
      </G>

      {/* Pink accent glow behind the badge/title area */}
      <Circle cx={160} cy={70} r={70} fill={colors.pink} opacity={0.08} />
    </Svg>
  );
}
