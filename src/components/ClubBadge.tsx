import React, { useState } from 'react';
import { Image, View } from 'react-native';
import Svg, { Path, Text as SvgText, ClipPath, Defs, Rect } from 'react-native-svg';
import { Club } from '../types';

interface ClubBadgeProps {
  club: Club;
  size?: number;
}

// Real club crest, loaded from `club.logoUrl` (TheSportsDB / Wikimedia
// Commons — see the content-source note in src/data/clubs.ts). Plain
// <Image> only decodes raster formats (png/jpg), so any originally-SVG
// crest was rewritten at data-generation time (see research/merge.py's
// svg_to_png_thumb) to a Wikimedia Special:FilePath?width=200 URL, which
// redirects to a server-rendered PNG of the same source image — no SVG
// ever reaches this component. (An earlier attempt to render SVG crests
// directly via react-native-svg's SvgUri crashed the app under Fabric/New
// Architecture — "Could not find component config for native component" —
// so don't reintroduce that without testing on-device first.) If the image
// still fails to load at runtime (offline, dead link, etc.) this falls
// back to an original, procedurally-drawn shield built from the club's
// placeholder colors and initials, so the UI never shows a broken-image
// icon or crashes.
const SHIELD_PATH =
  'M50 4 L92 16 V50 C92 76 74 94 50 108 C26 94 8 76 8 50 V16 Z';

function initialsFor(club: Club): string {
  const words = club.shortName.split(/\s+/).filter(Boolean);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return club.shortName.slice(0, 2).toUpperCase();
}

function FallbackShield({ club, size }: { club: Club; size: number }) {
  const initials = initialsFor(club);
  const clipId = `clip-${club.id}`;
  return (
    <Svg width={size} height={size * 1.08} viewBox="0 0 100 108">
      <Defs>
        <ClipPath id={clipId}>
          <Path d={SHIELD_PATH} />
        </ClipPath>
      </Defs>
      <Path d={SHIELD_PATH} fill={club.colorPrimary} stroke={club.colorSecondary} strokeWidth={4} />
      <Rect x={0} y={54} width={100} height={54} fill={club.colorSecondary} opacity={0.85} clipPath={`url(#${clipId})`} />
      <SvgText
        x={50}
        y={62}
        fontSize={30}
        fontWeight="800"
        fill={club.colorPrimary}
        stroke={club.colorSecondary}
        strokeWidth={0.5}
        textAnchor="middle"
      >
        {initials}
      </SvgText>
    </Svg>
  );
}

export function ClubBadge({ club, size = 40 }: ClubBadgeProps) {
  const [failed, setFailed] = useState(false);

  if (!club.logoUrl || failed) {
    return <FallbackShield club={club} size={size} />;
  }

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Image
        source={{ uri: club.logoUrl }}
        style={{ width: size, height: size }}
        resizeMode="contain"
        onError={() => setFailed(true)}
      />
    </View>
  );
}
