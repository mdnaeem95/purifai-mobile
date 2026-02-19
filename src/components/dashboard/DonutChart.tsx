import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, G, Text as SvgText } from 'react-native-svg';
import { colors, typography } from '../../constants/theme';
import { formatCurrency } from '../../utils/formatters';

export interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutSegment[];
  size?: number;
  strokeWidth?: number;
  centerLabel?: string;
  centerValue?: number;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  };
}

function describeArc(
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  startAngle: number,
  endAngle: number,
) {
  // Clamp near-full arcs to avoid rendering glitches
  const sweep = Math.min(endAngle - startAngle, 359.999);
  const largeArc = sweep > 180 ? 1 : 0;

  const outerStart = polarToCartesian(cx, cy, outerR, startAngle);
  const outerEnd = polarToCartesian(cx, cy, outerR, startAngle + sweep);
  const innerStart = polarToCartesian(cx, cy, innerR, startAngle + sweep);
  const innerEnd = polarToCartesian(cx, cy, innerR, startAngle);

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerStart.x} ${innerStart.y}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${innerEnd.x} ${innerEnd.y}`,
    'Z',
  ].join(' ');
}

export const DonutChart: React.FC<DonutChartProps> = ({
  data,
  size = 220,
  strokeWidth = 32,
  centerLabel = 'Total Assets',
  centerValue,
}) => {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) return null;

  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2 - 4; // small margin for rendering
  const innerR = outerR - strokeWidth;
  const gap = 1.5; // degrees gap between segments

  let currentAngle = 0;

  const segments = data.map((segment) => {
    const segmentAngle = (segment.value / total) * 360;
    const startAngle = currentAngle + gap / 2;
    const endAngle = currentAngle + segmentAngle - gap / 2;
    currentAngle += segmentAngle;

    // Only render segments that are visible
    if (endAngle - startAngle < 0.5) return null;

    const d = describeArc(cx, cy, outerR, innerR, startAngle, endAngle);
    return <Path key={segment.label} d={d} fill={segment.color} />;
  });

  const displayValue = centerValue ?? total;

  // Format center value: use compact notation for large numbers
  const formatCompact = (val: number): string => {
    if (val >= 1_000_000) return `S$${(val / 1_000_000).toFixed(1)}M`;
    if (val >= 1_000) return `S$${(val / 1_000).toFixed(1)}K`;
    return formatCurrency(val);
  };

  return (
    <View style={styles.container}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <G>{segments}</G>
        {/* Center text */}
        <SvgText
          x={cx}
          y={cy - 8}
          textAnchor="middle"
          fontSize={12}
          fill={colors.text.secondary}
          fontWeight="500"
        >
          {centerLabel}
        </SvgText>
        <SvgText
          x={cx}
          y={cy + 14}
          textAnchor="middle"
          fontSize={18}
          fill={colors.text.primary}
          fontWeight="700"
        >
          {formatCompact(displayValue)}
        </SvgText>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
