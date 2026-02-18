import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  runOnJS,
  Easing,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface AnimatedSplashScreenProps {
  onAnimationComplete: () => void;
}

const AnimatedSplashScreen: React.FC<AnimatedSplashScreenProps> = ({ onAnimationComplete }) => {
  // Animation values
  const logoScale = useSharedValue(0.3);
  const logoOpacity = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(20);
  const taglineOpacity = useSharedValue(0);
  const screenOpacity = useSharedValue(1);

  useEffect(() => {
    // Step 1: Logo scales in and fades in
    logoScale.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.back(1.5)) });
    logoOpacity.value = withTiming(1, { duration: 400 });

    // Step 2: Title fades in and slides up
    titleOpacity.value = withDelay(400, withTiming(1, { duration: 400 }));
    titleTranslateY.value = withDelay(400, withTiming(0, { duration: 400, easing: Easing.out(Easing.quad) }));

    // Step 3: Tagline fades in
    taglineOpacity.value = withDelay(700, withTiming(1, { duration: 400 }));

    // Step 4: Entire screen fades out
    screenOpacity.value = withDelay(2000, withTiming(0, { duration: 400 }, (finished) => {
      if (finished) {
        runOnJS(onAnimationComplete)();
      }
    }));
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const taglineAnimatedStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
  }));

  const screenAnimatedStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
  }));

  return (
    <Animated.View style={[styles.container, screenAnimatedStyle]}>
      <View style={styles.content}>
        {/* Logo */}
        <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
          <View style={styles.logoSquare}>
            <Text style={styles.logoLetter}>P</Text>
          </View>
        </Animated.View>

        {/* App Name */}
        <Animated.View style={titleAnimatedStyle}>
          <Text style={styles.title}>Purifai</Text>
        </Animated.View>

        {/* Tagline */}
        <Animated.View style={taglineAnimatedStyle}>
          <Text style={styles.tagline}>Zakat Made Simple</Text>
        </Animated.View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#4338CA',
    zIndex: 999,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoSquare: {
    width: 90,
    height: 90,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoLetter: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.7)',
    letterSpacing: 0.5,
  },
});

export default AnimatedSplashScreen;
