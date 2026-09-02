import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { ClubBadge } from '../../components/ClubBadge';
import { PositionPitch } from '../../components/PositionPitch';
import { colors, radius, spacing, typography } from '../../theme';
import { COUNTRIES } from '../../data/countries';
import { starterClubOptionsFor } from '../../data/clubs';
import { POSITION_COORDS } from '../../data/positions';
import { Difficulty, PreferredFoot, Position } from '../../types';
import { useCareer } from '../../engine/CareerContext';
import { useLanguage } from '../../i18n/LanguageContext';
import {
  loadLastDifficulty,
  loadLastFoot,
  loadLastNationality,
  loadLastNumber,
  loadLastPlayerName,
  loadLastPosition,
  saveLastDifficulty,
  saveLastFoot,
  saveLastNationality,
  saveLastNumber,
  saveLastPlayerName,
  saveLastPosition,
} from '../../storage/careerStorage';

type Props = NativeStackScreenProps<RootStackParamList, 'LegendSetup'>;

const DIFFICULTIES: Difficulty[] = ['intense', 'normal', 'express'];
const FEET: PreferredFoot[] = ['right', 'left', 'both'];
// Nationality list is always Germany + England first, then the rest
// alphabetically (see sortedCountries below).
const PRIORITY_NATIONALITY_CODES = ['DE', 'EN'];

function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, selected && styles.chipSelected]}>
      <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>{label}</Text>
    </Pressable>
  );
}

export function LegendSetupScreen({ navigation }: Props) {
  const { startCareer } = useCareer();
  const { t, pick, lang } = useLanguage();
  const [step, setStep] = useState<'identity' | 'club'>('identity');
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [lastName, setLastName] = useState('');
  const [lastNamePrefilled, setLastNamePrefilled] = useState(false);
  const [number, setNumber] = useState('10');
  const [foot, setFoot] = useState<PreferredFoot>('right');
  const [nationality, setNationality] = useState('AR');
  const [position, setPosition] = useState<Position>('ST');
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showValidationWarning, setShowValidationWarning] = useState(false);

  // Pre-fill the last name from the previous career (this app session or an
  // earlier one) so the user doesn't have to retype it — still fully
  // editable, and never overwrites text the user already typed.
  useEffect(() => {
    if (lastNamePrefilled) return;
    loadLastPlayerName().then((saved) => {
      if (saved) setLastName((current) => (current.length === 0 ? saved : current));
      setLastNamePrefilled(true);
    });
  }, [lastNamePrefilled]);

  // Same idea for nationality, difficulty, squad number, preferred foot, and
  // position — all pre-filled from the last career, still fully changeable.
  useEffect(() => {
    loadLastNationality().then((saved) => {
      if (saved && COUNTRIES.some((c) => c.code === saved)) setNationality(saved);
    });
    loadLastDifficulty().then((saved) => {
      if (saved && DIFFICULTIES.includes(saved as Difficulty)) setDifficulty(saved as Difficulty);
    });
    loadLastNumber().then((saved) => {
      if (saved) setNumber(saved);
    });
    loadLastFoot().then((saved) => {
      if (saved && FEET.includes(saved as PreferredFoot)) setFoot(saved as PreferredFoot);
    });
    loadLastPosition().then((saved) => {
      if (saved && saved in POSITION_COORDS) setPosition(saved as Position);
    });
  }, []);

  const selectedCountry = COUNTRIES.find((c) => c.code === nationality) ?? COUNTRIES[0];
  const canStart = lastName.trim().length > 0 && Number(number) > 0 && Number(number) <= 99;
  const clubOptions = useMemo(() => starterClubOptionsFor(nationality), [nationality]);

  useEffect(() => {
    if (canStart) setShowValidationWarning(false);
  }, [canStart]);

  // Germany and England pinned to the top, everything else alphabetical by
  // its name in the currently selected language.
  const sortedCountries = useMemo(() => {
    const priority = PRIORITY_NATIONALITY_CODES.map((code) => COUNTRIES.find((c) => c.code === code)).filter(
      (c): c is (typeof COUNTRIES)[number] => !!c
    );
    const rest = COUNTRIES.filter((c) => !PRIORITY_NATIONALITY_CODES.includes(c.code)).sort((a, b) =>
      pick(a.name).localeCompare(pick(b.name), lang)
    );
    return [...priority, ...rest];
  }, [lang, pick]);

  const handleNextButton = () => {
    if (!canStart) {
      setShowValidationWarning(true);
      return;
    }
    setShowValidationWarning(false);
    setStep('club');
  };

  const handleConfirmClub = async (clubId: string) => {
    const trimmedName = lastName.trim();
    await saveLastPlayerName(trimmedName);
    await saveLastNationality(nationality);
    await saveLastDifficulty(difficulty);
    await saveLastNumber(number);
    await saveLastFoot(foot);
    await saveLastPosition(position);
    await startCareer(
      {
        lastName: trimmedName,
        number: Number(number),
        preferredFoot: foot,
        nationality,
        position,
        difficulty,
      },
      clubId
    );
    navigation.replace('LegendCareer');
  };

  if (step === 'club') {
    return (
      <Screen scroll>
        <Text style={styles.title}>{t('setup.clubStepTitle')}</Text>
        <Text style={styles.body}>{t('setup.clubStepSubtitle')}</Text>

        {clubOptions.map((club) => (
          <Card key={club.id} style={styles.clubCard} onPress={() => handleConfirmClub(club.id)}>
            <View style={styles.clubRow}>
              <ClubBadge club={club} size={44} />
              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <Text style={styles.clubName}>{club.name}</Text>
                <Text style={styles.clubLeague}>{club.league}</Text>
                <Text style={styles.clubMeta}>
                  {t('setup.clubReputation')}: {club.reputation}
                </Text>
              </View>
            </View>
          </Card>
        ))}

        <Button label={t('setup.backToIdentity')} variant="ghost" onPress={() => setStep('identity')} style={styles.startButton} />

        <Text style={styles.disclaimer}>{t('disclaimer.nonAffiliation')}</Text>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <Text style={styles.title}>{t('setup.identityTitle')}</Text>

      <Text style={styles.sectionLabel}>{t('setup.difficultyLabel')}</Text>
      <View style={styles.rowWrap}>
        {DIFFICULTIES.map((d) => (
          <Pressable
            key={d}
            onPress={() => setDifficulty(d)}
            style={[styles.difficultyCard, difficulty === d && styles.difficultyCardSelected]}
          >
            <Text style={[styles.difficultyLabel, difficulty === d && styles.difficultyLabelSelected]}>
              {t(`setup.difficulty.${d}.label`)}
            </Text>
            <Text style={styles.difficultyDescription}>{t(`setup.difficulty.${d}.description`)}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.sectionLabel}>{t('setup.lastNameLabel')}</Text>
      <TextInput
        value={lastName}
        onChangeText={setLastName}
        placeholder={t('setup.lastNamePlaceholder')}
        placeholderTextColor={colors.gray}
        style={styles.input}
      />

      <Text style={styles.sectionLabel}>{t('setup.numberLabel')}</Text>
      <TextInput
        value={number}
        onChangeText={(v) => setNumber(v.replace(/[^0-9]/g, ''))}
        keyboardType="number-pad"
        maxLength={2}
        style={styles.input}
      />

      <Text style={styles.sectionLabel}>{t('setup.footLabel')}</Text>
      <View style={styles.rowWrap}>
        {FEET.map((f) => (
          <Chip key={f} label={t(`setup.foot.${f}`)} selected={foot === f} onPress={() => setFoot(f)} />
        ))}
      </View>
      <Text style={styles.cosmeticNote}>{t('setup.cosmeticNote')}</Text>

      <Text style={styles.sectionLabel}>{t('setup.nationalityLabel')}</Text>
      <Pressable style={styles.input} onPress={() => setShowCountryPicker((v) => !v)}>
        <Text style={styles.inputText}>
          {selectedCountry.flagEmoji} {pick(selectedCountry.name)}
        </Text>
      </Pressable>
      {showCountryPicker && (
        <View style={styles.countryList}>
          {sortedCountries.map((item) => (
            <Pressable
              key={item.code}
              style={styles.countryRow}
              onPress={() => {
                setNationality(item.code);
                setShowCountryPicker(false);
              }}
            >
              <Text style={styles.countryText}>
                {item.flagEmoji} {pick(item.name)}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      <Text style={styles.sectionLabel}>{t('setup.positionLabel')}</Text>
      <PositionPitch selected={position} onSelect={setPosition} />

      <Button label={t('setup.nextButton')} onPress={handleNextButton} style={styles.startButton} />
      {showValidationWarning && <Text style={styles.validationWarning}>{t('setup.validation.missingFields')}</Text>}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  body: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  chipLabel: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  chipLabelSelected: {
    color: colors.black,
  },
  difficultyCard: {
    flexGrow: 1,
    minWidth: 100,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  difficultyCardSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.surfaceAlt,
  },
  difficultyLabel: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  difficultyLabelSelected: {
    color: colors.accent,
  },
  difficultyDescription: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    color: colors.textPrimary,
    ...typography.body,
  },
  inputText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  countryList: {
    maxHeight: 220,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.xs,
  },
  countryRow: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  countryText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  startButton: {
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  clubCard: {
    marginBottom: spacing.sm,
  },
  clubRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clubName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  clubLeague: {
    ...typography.caption,
    color: colors.accent,
  },
  clubMeta: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  cosmeticNote: {
    ...typography.caption,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
  validationWarning: {
    ...typography.caption,
    color: colors.danger,
    marginTop: -spacing.md,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  disclaimer: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
});
