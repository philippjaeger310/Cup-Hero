import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card } from './Card';
import { ClubBadge } from './ClubBadge';
import { SeasonRecord } from '../types';
import { getClub } from '../data/clubs';
import { colors, radius, spacing, typography } from '../theme';
import { useLanguage } from '../i18n/LanguageContext';

interface SeasonHistoryTableProps {
  records: SeasonRecord[];
  /** Show the season-number column (used on the full career summary). */
  showSeason?: boolean;
  /** Show clean-sheets/conceded columns instead of goals/assists (goalkeepers). */
  showGk?: boolean;
  emptyText?: string;
}

export function SeasonHistoryTable({ records, showSeason = false, showGk = false, emptyText }: SeasonHistoryTableProps) {
  const { t } = useLanguage();
  const headersKey = showSeason ? 'summary.seasonsHeaders' : 'career.historyHeaders';

  return (
    <Card style={styles.card}>
      <View style={styles.headerRow}>
        {showSeason && <Text style={[styles.cell, styles.headerCell, { flex: 0.5 }]}>{t(`${headersKey}.season`)}</Text>}
        <Text style={[styles.cell, styles.headerCell, { flex: 0.6 }]}>{t(`${headersKey}.age`)}</Text>
        <Text style={[styles.cell, styles.headerCell, { flex: 1.4 }]}>{t(`${headersKey}.club`)}</Text>
        <Text style={[styles.cell, styles.headerCell, { flex: 0.6 }]}>{t(`${headersKey}.ovr`)}</Text>
        <Text style={[styles.cell, styles.headerCell, { flex: 0.6 }]}>{t(`${headersKey}.app`)}</Text>
        {showGk ? (
          <>
            <Text style={[styles.cell, styles.headerCell, { flex: 0.6 }]}>{t(`${headersKey}.cs`)}</Text>
            <Text style={[styles.cell, styles.headerCell, { flex: 0.6 }]}>{t(`${headersKey}.ga`)}</Text>
          </>
        ) : (
          <>
            <Text style={[styles.cell, styles.headerCell, { flex: 0.6 }]}>{t(`${headersKey}.g`)}</Text>
            <Text style={[styles.cell, styles.headerCell, { flex: 0.6 }]}>{t(`${headersKey}.a`)}</Text>
          </>
        )}
      </View>

      {records.length === 0 && emptyText && <Text style={styles.empty}>{emptyText}</Text>}

      {records.map((record) => {
        const rowClub = getClub(record.clubId);
        return (
          <View
            key={record.season}
            style={[
              styles.row,
              record.tier === 'early' && { backgroundColor: colors.rowEarly },
              record.tier === 'peak' && { backgroundColor: colors.rowPeak },
            ]}
          >
            {showSeason && <Text style={[styles.cell, { flex: 0.5 }]}>{record.season}</Text>}
            <Text style={[styles.cell, { flex: 0.6 }]}>{record.age}</Text>
            <View style={[styles.clubCell, { flex: 1.4 }]}>
              {record.onLoan && <Text style={styles.loanArrow}>↳</Text>}
              <ClubBadge club={rowClub} size={16} />
              <Text style={[styles.cell, styles.clubName]} numberOfLines={1}>
                {rowClub.shortName}
                {record.onLoan ? ` (${t('career.loanMarker')})` : ''}
              </Text>
            </View>
            <Text style={[styles.cell, { flex: 0.6 }]}>{record.ovr}</Text>
            <Text style={[styles.cell, { flex: 0.6 }]}>{record.apps}</Text>
            {showGk ? (
              <>
                <Text style={[styles.cell, { flex: 0.6 }]}>{record.cleanSheets ?? 0}</Text>
                <Text style={[styles.cell, { flex: 0.6 }]}>{record.goalsConceded ?? 0}</Text>
              </>
            ) : (
              <>
                <Text style={[styles.cell, { flex: 0.6 }]}>{record.goals}</Text>
                <Text style={[styles.cell, { flex: 0.6 }]}>{record.assists}</Text>
              </>
            )}
          </View>
        );
      })}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.sm,
    marginBottom: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerCell: {
    color: colors.textSecondary,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.xs,
  },
  cell: {
    ...typography.caption,
    color: colors.textPrimary,
  },
  clubCell: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clubName: {
    marginLeft: spacing.xs,
    flexShrink: 1,
  },
  loanArrow: {
    ...typography.caption,
    color: colors.textSecondary,
    marginRight: 2,
  },
  empty: {
    ...typography.caption,
    color: colors.textSecondary,
    paddingVertical: spacing.sm,
  },
});
