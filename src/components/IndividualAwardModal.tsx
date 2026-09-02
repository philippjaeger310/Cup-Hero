import React from 'react';
import { Image, Modal, StyleSheet, Text, View } from 'react-native';
import { IndividualAward } from '../types';
import { getIndividualAward } from '../data/individualAwards';
import { Button } from './Button';
import { colors, radius, spacing, typography } from '../theme';
import { useLanguage } from '../i18n/LanguageContext';

interface IndividualAwardModalProps {
  award: IndividualAward | null;
  onDismiss: () => void;
}

// User-supplied flat-icon graphics for the two awards a real trophy image
// exists for. Names/descriptions stay fully fictional (see
// data/individualAwards.ts) — only the graphic borrows a golden-ball /
// golden-boot silhouette, same treatment as TrophyImage.tsx. The remaining
// award (Wall of the Season) has no matching image and keeps its emoji icon.
const AWARD_IMAGES: Partial<Record<string, any>> = {
  'player-of-the-season': require('../../assets/trophies/award-player-of-the-season.png'),
  'top-scorer': require('../../assets/trophies/award-top-scorer.png'),
};

export function IndividualAwardModal({ award, onDismiss }: IndividualAwardModalProps) {
  const { t, pick } = useLanguage();
  if (!award) return null;
  const def = getIndividualAward(award.awardId);
  if (!def) return null;
  const image = AWARD_IMAGES[award.awardId];

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onDismiss}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {image ? (
            <Image source={image} style={styles.iconImage} resizeMode="contain" />
          ) : (
            <Text style={styles.icon}>{def.icon}</Text>
          )}
          <Text style={styles.title}>{t('career.awardModal.title')}</Text>
          <Text style={styles.name}>{pick(def.name)}</Text>
          <Text style={styles.description}>{pick(def.description)}</Text>
          <Button label={t('career.awardModal.continueButton')} onPress={onDismiss} style={styles.button} />
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
    borderColor: colors.warning,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
  },
  icon: {
    fontSize: 48,
  },
  iconImage: {
    width: 72,
    height: 72,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    marginTop: spacing.lg,
  },
  name: {
    ...typography.bodyBold,
    color: colors.warning,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  description: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  button: {
    minWidth: 160,
  },
});
