import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ScrollView,
} from 'react-native';
import Animated, {
  SharedValue,
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  interpolate,
  Extrapolation,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Button } from '../../components/common/Button';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';
import { useUserStore } from '../../store/userStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// --- Slide Data ---

interface SlideData {
  id: string;
  icon: keyof typeof Feather.glyphMap;
  title: string;
  description: string;
  iconColor: string;
  iconBg: string;
}

const SLIDES: SlideData[] = [
  {
    id: 'welcome',
    icon: 'heart',
    title: 'Welcome to Purifai',
    description: 'Modern Investments, Timeless Obligations.\nYour trusted companion for Zakat calculation and fulfilment.',
    iconColor: colors.primary[600],
    iconBg: colors.primary[50],
  },
  {
    id: 'calculate',
    icon: 'layers',
    title: '16 Asset Calculators',
    description: 'From cash and gold to crypto and NFTs — every modern asset type covered with Shariah-compliant methods.',
    iconColor: colors.emerald[600],
    iconBg: colors.emerald[50],
  },
  {
    id: 'smart',
    icon: 'target',
    title: 'Nisab-Aware',
    description: 'Real-time calculations with automatic Nisab threshold comparison. Know exactly what you owe.',
    iconColor: colors.primary[500],
    iconBg: colors.primary[50],
  },
  {
    id: 'pay',
    icon: 'credit-card',
    title: 'Pay Your Zakat',
    description: 'Distribute to verified beneficiary organisations with transparent allocation and payment tracking.',
    iconColor: colors.emerald[700],
    iconBg: colors.emerald[50],
  },
  {
    id: 'ready',
    icon: 'check-circle',
    title: "You're All Set!",
    description: 'Start calculating and fulfilling your Zakat obligations with confidence.',
    iconColor: colors.primary[700],
    iconBg: colors.primary[50],
  },
];

// --- Dot Indicator ---

const DotIndicator: React.FC<{ index: number; scrollX: SharedValue<number> }> = ({
  index,
  scrollX,
}) => {
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * SCREEN_WIDTH,
      index * SCREEN_WIDTH,
      (index + 1) * SCREEN_WIDTH,
    ];
    const width = interpolate(scrollX.value, inputRange, [8, 28, 8], Extrapolation.CLAMP);
    const opacity = interpolate(scrollX.value, inputRange, [0.3, 1, 0.3], Extrapolation.CLAMP);

    return { width, opacity };
  });

  return <Animated.View style={[styles.dot, animatedStyle]} />;
};

// --- Main Screen ---

const OnboardingScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const completeOnboarding = useUserStore((s) => s.completeOnboarding);

  const scrollX = useSharedValue(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const handleMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setActiveIndex(index);
  };

  const isLastSlide = activeIndex === SLIDES.length - 1;

  const handleNext = () => {
    if (isLastSlide) {
      completeOnboarding();
    } else {
      const nextIndex = activeIndex + 1;
      scrollViewRef.current?.scrollTo({ x: nextIndex * SCREEN_WIDTH, animated: true });
      setActiveIndex(nextIndex);
    }
  };

  const handleSkip = () => {
    completeOnboarding();
  };

  // Entrance fade
  const screenOpacity = useSharedValue(0);
  React.useEffect(() => {
    screenOpacity.value = withTiming(1, { duration: 400 });
  }, []);

  const screenStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
  }));

  return (
    <Animated.View style={[styles.container, screenStyle]}>
      {/* Skip button */}
      {!isLastSlide && (
        <TouchableOpacity
          style={[styles.skipButton, { top: insets.top + spacing.md }]}
          onPress={handleSkip}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}

      {/* Slides */}
      <Animated.ScrollView
        ref={scrollViewRef as any}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        style={styles.scrollView}
      >
        {SLIDES.map((slide) => (
          <View key={slide.id} style={[styles.slide, { width: SCREEN_WIDTH }]}>
            <View style={[styles.iconContainer, { backgroundColor: slide.iconBg }]}>
              <Feather name={slide.icon} size={48} color={slide.iconColor} />
            </View>
            <Text style={styles.slideTitle}>{slide.title}</Text>
            <Text style={styles.slideDescription}>{slide.description}</Text>
          </View>
        ))}
      </Animated.ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing['2xl'] }]}>
        {/* Dot indicators */}
        <View style={styles.dotsContainer}>
          {SLIDES.map((_, index) => (
            <DotIndicator key={index} index={index} scrollX={scrollX} />
          ))}
        </View>

        {/* Action button */}
        <Button
          title={isLastSlide ? 'Get Started' : 'Next'}
          onPress={handleNext}
          variant="primary"
          size="lg"
          fullWidth
        />
      </View>
    </Animated.View>
  );
};

// --- Styles ---

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  skipButton: {
    position: 'absolute',
    right: spacing.xl,
    zIndex: 10,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  skipText: {
    fontSize: typography.fontSizes.base,
    fontWeight: typography.fontWeights.medium,
    color: colors.gray[500],
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing['3xl'],
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing['3xl'],
  },
  slideTitle: {
    fontSize: typography.fontSizes['3xl'],
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  slideDescription: {
    fontSize: typography.fontSizes.base,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: typography.fontSizes.base * typography.lineHeights.relaxed,
    paddingHorizontal: spacing.xl,
  },
  footer: {
    paddingHorizontal: spacing['2xl'],
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  dot: {
    height: 8,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[500],
    marginHorizontal: 4,
  },
});

export default OnboardingScreen;
