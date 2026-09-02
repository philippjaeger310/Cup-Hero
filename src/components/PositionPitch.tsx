import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Rect } from 'react-native-svg';
import { Position } from '../types';
import { POSITION_COORDS } from '../data/positions';
import { colors, radius, typography } from '../theme';
import { useLanguage } from '../i18n/LanguageContext';

interface PositionPitchProps {
  selected: Position;
  onSelect: (position: Position) => void;
}

const ALL_POSITIONS = Object.keys(POSITION_COORDS) as Position[];
const MARKER_WIDTH = 68; // 52 * 1.3
const MARKER_HEIGHT = 36; // 28 * 1.3

// Original, geometric pitch illustration — same style as FootballScene.
// Positions are laid out schematically (one marker per position, roughly
// where that position plays), not a literal 11-a-side formation. Two-tone
// halves (lighter attacking third at top, darker own half at bottom) and
// pill-shaped markers, matching the reference layout the user supplied.
export function PositionPitch({ selected, onSelect }: PositionPitchProps) {
  const { t } = useLanguage();

  return (
    <View style={styles.wrapper}>
      <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={StyleSheet.absoluteFill}>
        <Rect x={0} y={0} width={100} height={50} fill="#1E6B3C" />
        <Rect x={0} y={50} width={100} height={50} fill="#123420" />
        <Rect x={2} y={2} width={96} height={96} fill="none" stroke={colors.white} strokeWidth={0.6} opacity={0.7} />
        <Line x1={2} y1={50} x2={98} y2={50} stroke={colors.white} strokeWidth={1} opacity={0.9} />
        <Circle cx={50} cy={50} r={9} stroke={colors.white} strokeWidth={0.6} fill="none" opacity={0.7} />
        <Circle cx={50} cy={50} r={0.8} fill={colors.white} opacity={0.7} />
        {/* Penalty + goal boxes, attacking third (top) */}
        <Rect x={22} y={2} width={56} height={16} fill="none" stroke={colors.white} strokeWidth={0.6} opacity={0.7} />
        <Rect x={37} y={2} width={26} height={6} fill="none" stroke={colors.white} strokeWidth={0.6} opacity={0.7} />
        {/* Penalty + goal boxes, own third (bottom) */}
        <Rect x={22} y={82} width={56} height={16} fill="none" stroke={colors.white} strokeWidth={0.6} opacity={0.7} />
        <Rect x={37} y={92} width={26} height={6} fill="none" stroke={colors.white} strokeWidth={0.6} opacity={0.7} />
      </Svg>

      {ALL_POSITIONS.map((pos) => {
        const coord = POSITION_COORDS[pos];
        const isSelected = pos === selected;
        return (
          <Pressable
            key={pos}
            onPress={() => onSelect(pos)}
            style={[
              styles.marker,
              isSelected && styles.markerSelected,
              {
                left: `${coord.x}%`,
                top: `${coord.y}%`,
                marginLeft: -MARKER_WIDTH / 2,
                marginTop: -MARKER_HEIGHT / 2,
              },
            ]}
          >
            <Text style={[styles.markerLabel, isSelected && styles.markerLabelSelected]} numberOfLines={1}>
              {t(`positionAbbr.${pos}`)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    // Square, matching the SVG's square viewBox 1:1 — with
    // preserveAspectRatio="none" this is what keeps the center circle
    // perfectly round instead of stretched into an oval.
    aspectRatio: 1,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  marker: {
    position: 'absolute',
    width: MARKER_WIDTH,
    height: MARKER_HEIGHT,
    borderRadius: MARKER_HEIGHT / 2,
    backgroundColor: 'rgba(8,14,20,0.85)',
    borderWidth: 1.5,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  markerLabel: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '700',
  },
  markerLabelSelected: {
    color: colors.black,
  },
});
