import React, { useRef, useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  Animated, 
  Pressable, 
  Dimensions,
  Platform
} from 'react-native';
import { colors } from '@/constants/colors';

interface WaveformVisualizerProps {
  waveformData: number[];
  isPlaying?: boolean;
  progress: number;
  onSeek?: (progress: number) => void;
  style?: any;
  interactive?: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onHoverChange?: (isHovering: boolean) => void;
  color?: string;
  backgroundColor?: string;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function WaveformVisualizer({
  waveformData,
  isPlaying = false,
  progress,
  onSeek,
  style,
  interactive = false,
  onDragStart,
  onDragEnd,
  onHoverChange,
  color = colors.primary,
  backgroundColor = 'rgba(255,255,255,0.3)'
}: WaveformVisualizerProps) {
  const containerRef = useRef<View>(null);
  const [containerWidth, setContainerWidth] = useState(SCREEN_WIDTH - 32);
  const [isDragging, setIsDragging] = useState(false);
  const [hoverPosition, setHoverPosition] = useState<number | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  
  // Animation for playback progress
  const progressAnim = useRef(new Animated.Value(0)).current;
  
  // Animation values for each bar
  const barAnimations = useRef(
    waveformData.map(() => new Animated.Value(1))
  ).current;
  
  // Update progress animation when progress changes
  useEffect(() => {
    if (!isDragging) {
      progressAnim.setValue(progress);
    }
  }, [progress, isDragging]);
  
  // Animate bars when playing
  useEffect(() => {
    if (isPlaying && !isDragging) {
      // Create staggered animations for bars
      const animations = barAnimations.map((anim, index) => {
        return Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 0.3 + Math.random() * 0.7,
              duration: 200 + Math.random() * 300,
              useNativeDriver: false,
            }),
            Animated.timing(anim, {
              toValue: 0.5 + Math.random() * 0.5,
              duration: 200 + Math.random() * 300,
              useNativeDriver: false,
            }),
          ])
        );
      });
      
      // Start animations with slight delays
      animations.forEach((animation, index) => {
        setTimeout(() => {
          animation.start();
        }, index * 20);
      });
      
      return () => {
        animations.forEach(animation => animation.stop());
      };
    } else {
      // Reset all bars to their original values when not playing
      barAnimations.forEach((anim, index) => {
        anim.setValue(waveformData[index] || 0.5);
      });
    }
  }, [isPlaying, isDragging, waveformData]);
  
  // Update bar animations when waveform data changes
  useEffect(() => {
    if (barAnimations.length !== waveformData.length) {
      // Recreate animations if data length changed
      barAnimations.splice(0);
      waveformData.forEach(() => {
        barAnimations.push(new Animated.Value(1));
      });
    }
    
    // Set initial values
    barAnimations.forEach((anim, index) => {
      anim.setValue(waveformData[index] || 0.5);
    });
  }, [waveformData]);
  
  // Handle container layout to get width
  const handleLayout = (event: any) => {
    const { width } = event.nativeEvent.layout;
    setContainerWidth(width);
  };
  
  // Handle press/touch on waveform
  const handlePress = (event: any) => {
    if (!interactive || !onSeek) return;
    
    const { locationX } = event.nativeEvent;
    const newProgress = Math.max(0, Math.min(1, locationX / containerWidth));
    
    onSeek(newProgress);
  };
  
  // Handle touch start
  const handleTouchStart = (event: any) => {
    if (!interactive || !onSeek) return;
    
    setIsDragging(true);
    if (onDragStart) onDragStart();
    
    const { locationX } = event.nativeEvent;
    const newProgress = Math.max(0, Math.min(1, locationX / containerWidth));
    
    progressAnim.setValue(newProgress);
    onSeek(newProgress);
  };
  
  // Handle touch move
  const handleTouchMove = (event: any) => {
    if (!interactive || !onSeek || !isDragging) return;
    
    const { locationX } = event.nativeEvent;
    const newProgress = Math.max(0, Math.min(1, locationX / containerWidth));
    
    progressAnim.setValue(newProgress);
    onSeek(newProgress);
  };
  
  // Handle touch end
  const handleTouchEnd = () => {
    if (!interactive || !isDragging) return;
    
    setIsDragging(false);
    if (onDragEnd) onDragEnd();
  };
  
  // Handle mouse move (web only)
  const handleMouseMove = Platform.OS === 'web' ? (event: any) => {
    if (!interactive) return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const hoverProgress = Math.max(0, Math.min(1, x / containerWidth));
    
    setHoverPosition(hoverProgress * containerWidth);
    
    if (!isHovering) {
      setIsHovering(true);
      if (onHoverChange) onHoverChange(true);
    }
  } : undefined;
  
  // Handle mouse leave (web only)
  const handleMouseLeave = Platform.OS === 'web' ? () => {
    setHoverPosition(null);
    setIsHovering(false);
    if (onHoverChange) onHoverChange(false);
  } : undefined;
  
  // Calculate bar width based on container width and number of bars
  const barWidth = Math.max(2, (containerWidth / waveformData.length) - 1);
  
  // Create dynamic props for Pressable
  const pressableProps: any = {
    ref: containerRef,
    style: [styles.container, style],
    onLayout: handleLayout,
    onPress: handlePress,
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  };
  
  // Add mouse event handlers only on web platform
  if (Platform.OS === 'web') {
    pressableProps.onMouseMove = handleMouseMove;
    pressableProps.onMouseLeave = handleMouseLeave;
  }
  
  // Get current progress value for comparison
  const [progressValue, setProgressValue] = useState(0);
  
  // Update progressValue when animation updates
  useEffect(() => {
    const id = progressAnim.addListener(({ value }) => {
      setProgressValue(value);
    });
    
    return () => {
      progressAnim.removeListener(id);
    };
  }, [progressAnim]);
  
  return (
    <Pressable {...pressableProps}>
      <View style={styles.waveformContainer}>
        {waveformData.map((value, index) => {
          const barLeft = index * (barWidth + 1);
          
          // Determine if this bar is before or after the progress point
          const isBeforeProgress = barLeft / containerWidth < progressValue;
          
          // For hover effect (web only)
          const isBeforeHover = hoverPosition !== null && barLeft < hoverPosition;
          
          return (
            <Animated.View
              key={index}
              style={[
                styles.bar,
                {
                  height: barAnimations[index]?.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['20%', '100%'],
                  }) || `${value * 100}%`,
                  width: barWidth,
                  left: barLeft,
                  backgroundColor: isBeforeProgress 
                    ? color 
                    : isBeforeHover && Platform.OS === 'web'
                      ? `${color}80`
                      : backgroundColor,
                },
              ]}
            />
          );
        })}
      </View>
      
      {/* Progress indicator */}
      <Animated.View
        style={[
          styles.progressIndicator,
          {
            left: progressAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, containerWidth],
            }),
            backgroundColor: color,
          },
        ]}
      />
      
      {/* Hover indicator (web only) */}
      {Platform.OS === 'web' && hoverPosition !== null && (
        <View
          style={[
            styles.hoverIndicator,
            {
              left: hoverPosition,
            },
          ]}
        />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 80,
    backgroundColor: 'transparent',
    position: 'relative',
    overflow: 'hidden',
  },
  waveformContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    position: 'relative',
    paddingVertical: 8,
  },
  bar: {
    position: 'absolute',
    bottom: 8,
    width: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  progressIndicator: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: colors.primary,
    zIndex: 10,
  },
  hoverIndicator: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: colors.text,
    opacity: 0.5,
    zIndex: 5,
  },
});