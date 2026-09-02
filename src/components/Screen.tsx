import React from 'react';
import { ScrollView, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../theme';

interface ScreenProps {
  children: React.ReactNode;
  scroll?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Screen({ children, scroll = false, style }: ScreenProps) {
  const Content = scroll ? ScrollView : View;
  const contentProps = scroll
    ? { contentContainerStyle: [styles.content, style] }
    : { style: [styles.content, style] };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <Content {...(contentProps as any)}>{children}</Content>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    padding: spacing.lg,
  },
});
