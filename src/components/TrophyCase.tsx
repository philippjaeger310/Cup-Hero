import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Trophy } from '../types';
import { getClub } from '../data/clubs';
import { COMPETITIONS } from '../data/competitions';
import { TrophyImage } from './TrophyImage';
import { colors, spacing, typography } from '../theme';

interface TrophyCaseProps {
  trophies: Trophy[];
  size?: number;
}

interface Group {
  key: string;
  trophy: Trophy;
  count: number;
}

/**
 * Groups trophies of the same real competition together (by the winning
 * club's country + competition slot — see countryCompetitions.ts) instead
 * of listing them chronologically. Groups render as a small overlapping
 * stack with an "Nx" count underneath once there's more than one, so a
 * long career's trophy case stays compact instead of repeating the same
 * icon over and over.
 */
function groupTrophies(trophies: Trophy[]): Group[] {
  const order: string[] = [];
  const map = new Map<string, Group>();
  for (const trophy of trophies) {
    const club = getClub(trophy.clubId);
    const key = `${club.country}-${trophy.competitionId}`;
    const existing = map.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      map.set(key, { key, trophy, count: 1 });
      order.push(key);
    }
  }
  return order.map((k) => map.get(k)!);
}

export function TrophyCase({ trophies, size = 22 }: TrophyCaseProps) {
  const groups = groupTrophies(trophies);
  const overlap = size * 0.45;

  return (
    <View style={styles.row}>
      {groups.map((group) => {
        const color = COMPETITIONS[group.trophy.competitionId].cupColor;
        const stackCount = Math.min(group.count, 3);
        return (
          <View key={group.key} style={styles.groupItem}>
            <View style={styles.stack}>
              {Array.from({ length: stackCount }).map((_, i) => (
                <View key={i} style={i > 0 ? { marginLeft: -overlap } : undefined}>
                  <TrophyImage trophy={group.trophy} color={color} size={size} />
                </View>
              ))}
            </View>
            {group.count > 1 && <Text style={styles.countLabel}>{group.count}x</Text>}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  groupItem: {
    alignItems: 'center',
    marginRight: spacing.sm,
    marginBottom: spacing.xs,
  },
  stack: {
    flexDirection: 'row',
  },
  countLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
