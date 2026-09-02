import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { Screen } from '../../components/Screen';
import { Card } from '../../components/Card';
import { colors, spacing, typography } from '../../theme';
import { IDEOLOGY_QUESTIONS } from '../../data/ideologyQuestions';
import { useLanguage } from '../../i18n/LanguageContext';

type Props = NativeStackScreenProps<RootStackParamList, 'IdeologyQuiz'>;

type Axis = 'possession' | 'directness' | 'pressing' | 'individualism';

export function IdeologyQuizScreen({ navigation }: Props) {
  const { pick } = useLanguage();
  const [index, setIndex] = useState(0);
  const [scores, setScores] = useState<Record<Axis, number>>({
    possession: 0,
    directness: 0,
    pressing: 0,
    individualism: 0,
  });

  const question = IDEOLOGY_QUESTIONS[index];
  const progress = `${index + 1} / ${IDEOLOGY_QUESTIONS.length}`;

  const handleAnswer = (axis: Axis, value: number) => {
    const nextScores = { ...scores, [axis]: scores[axis] + value };
    if (index + 1 < IDEOLOGY_QUESTIONS.length) {
      setScores(nextScores);
      setIndex(index + 1);
    } else {
      navigation.replace('IdeologyResult', nextScores);
    }
  };

  return (
    <Screen>
      <Text style={styles.progress}>{progress}</Text>
      <Text style={styles.prompt}>{pick(question.prompt)}</Text>
      <View style={styles.options}>
        {question.options.map((option) => (
          <Card key={option.id} onPress={() => handleAnswer(option.axis, option.value)} style={styles.optionCard}>
            <Text style={styles.optionLabel}>{pick(option.label)}</Text>
          </Card>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  progress: {
    ...typography.caption,
    color: colors.accent,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
  },
  prompt: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.xl,
  },
  options: {
    gap: spacing.md,
  },
  optionCard: {
    marginBottom: spacing.md,
  },
  optionLabel: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
});
