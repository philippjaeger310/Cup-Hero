import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Screen } from '../components/Screen';
import { Button } from '../components/Button';
import { FootballScene } from '../components/FootballScene';
import { colors, spacing, typography } from '../theme';
import { useLanguage } from '../i18n/LanguageContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Start'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function StartScreen({ navigation }: Props) {
  const { t } = useLanguage();

  return (
    <Screen>
      <View style={styles.sceneWrap}>
        <FootballScene width={SCREEN_WIDTH} height={SCREEN_WIDTH * (220 / 320)} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{t('start.title')}</Text>
        <Text style={styles.tagline}>{t('start.tagline')}</Text>
        <Button label={t('start.cta')} onPress={() => navigation.replace('GamesHub')} style={styles.button} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  sceneWrap: {
    marginHorizontal: -spacing.lg,
    marginTop: -spacing.lg,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: spacing.xl,
  },
  title: {
    ...typography.h1,
    fontSize: 40,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    letterSpacing: 0.5,
  },
  tagline: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  button: {
    minWidth: 200,
  },
});
