import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { CupHeroMark } from './CupHeroMark';

interface AnimatedSplashProps {
  onFinish: () => void;
}

const BACKGROUND = '#0A0A0A';
const ACCENT = '#F7B5CD';

/**
 * Branded splash overlay shown once, right after the native splash screen
 * hides (see App.tsx). Timing matches the design spec exactly (Cup Hero app
 * design.zip / README.md): mark fades + scales in over 700ms
 * (0.84 -> 1, ease-out), the "CUP HERO" wordmark follows 600ms later via
 * translateY(12 -> 0) + fade, and three accent dots pulse in a 1200ms loop
 * with a 200ms stagger. The whole overlay fades itself out and unmounts
 * (via onFinish) ~1.4s after it appears.
 */
export function AnimatedSplash({ onFinish }: AnimatedSplashProps) {
  const markOpacity = useRef(new Animated.Value(0)).current;
  const markScale = useRef(new Animated.Value(0.84)).current;
  const wordOpacity = useRef(new Animated.Value(0)).current;
  const wordTranslateY = useRef(new Animated.Value(12)).current;
  const dotValues = useRef([0, 1, 2].map(() => new Animated.Value(0.3))).current;
  const overlayOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(markOpacity, {
      toValue: 1,
      duration: 700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
    Animated.timing(markScale, {
      toValue: 1,
      duration: 700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    const wordTimer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(wordOpacity, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(wordTranslateY, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }, 600);

    const dotLoops = dotValues.map((value, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 200),
          Animated.timing(value, {
            toValue: 1,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0.3,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      )
    );
    dotLoops.forEach((loop) => loop.start());

    const finishTimer = setTimeout(() => {
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 250,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(() => {
        dotLoops.forEach((loop) => loop.stop());
        onFinish();
      });
    }, 1400);

    return () => {
      clearTimeout(wordTimer);
      clearTimeout(finishTimer);
      dotLoops.forEach((loop) => loop.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: overlayOpacity }]}>
      <Animated.View style={{ opacity: markOpacity, transform: [{ scale: markScale }] }}>
        <CupHeroMark size={96} />
      </Animated.View>
      <Animated.View style={{ opacity: wordOpacity, transform: [{ translateY: wordTranslateY }] }}>
        <Text style={styles.wordmark}>CUP HERO</Text>
      </Animated.View>
      <View style={styles.dotRow}>
        {dotValues.map((value, i) => (
          <Animated.View key={i} style={[styles.dot, { opacity: value }]} />
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    backgroundColor: BACKGROUND,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  wordmark: {
    marginTop: 16,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 6,
    color: '#FFFFFF',
  },
  dotRow: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: ACCENT,
  },
});
