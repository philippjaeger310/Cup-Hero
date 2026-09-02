import React from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { Trophy } from '../types';
import { COMPETITIONS } from '../data/competitions';
import { Button } from './Button';
import { TrophyImage, realCompetitionName } from './TrophyImage';
import { colors, radius, spacing, typography } from '../theme';
import { useLanguage } from '../i18n/LanguageContext';

interface TrophyModalProps {
  trophy: Trophy | null;
  onDismiss: () => void;
}

export function TrophyModal({ trophy, onDismiss }: TrophyModalProps) {
  const { t } = useLanguage();
  if (!trophy) return null;
  const meta = COMPETITIONS[trophy.competitionId];
  const competitionName = realCompetitionName(trophy) ?? t(`competitions.${trophy.competitionId}`);

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onDismiss}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <TrophyImage trophy={trophy} color={meta.cupColor} size={110} />
          <Text style={styles.title}>{t('career.trophyModal.title')}</Text>
          <Text style={styles.competition}>{competitionName}</Text>
          <Button label={t('career.trophyModal.continueButton')} onPress={onDismiss} style={styles.button} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(10,10,10,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.accent,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    marginTop: spacing.lg,
  },
  competition: {
    ...typography.bodyBold,
    color: colors.accent,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  button: {
    minWidth: 160,
  },
});
