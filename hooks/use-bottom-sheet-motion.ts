import { useCallback, useEffect } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

type UseBottomSheetMotionParams = {
  visible: boolean;
  hiddenY: number;
  onClose: () => void;
  closeDuration?: number;
  swipeCloseDuration?: number;
  dismissDistance?: number;
  dismissVelocity?: number;
};

const OPEN_SPRING = {
  damping: 26,
  stiffness: 260,
  mass: 0.5,
} as const;

const RESTORE_SPRING = {
  damping: 26,
  stiffness: 260,
} as const;

export function useBottomSheetMotion({
  visible,
  hiddenY,
  onClose,
  closeDuration = 280,
  swipeCloseDuration = 250,
  dismissDistance = 100,
  dismissVelocity = 900,
}: UseBottomSheetMotionParams) {
  const translateY = useSharedValue(hiddenY);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, OPEN_SPRING);
      return;
    }

    translateY.value = hiddenY;
  }, [hiddenY, translateY, visible]);

  const closeSheet = useCallback(() => {
    translateY.value = withTiming(hiddenY, { duration: closeDuration }, () => {
      scheduleOnRN(onClose);
    });
  }, [closeDuration, hiddenY, onClose, translateY]);

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (e.translationY > 0) {
        translateY.value = e.translationY;
      }
    })
    .onEnd((e) => {
      if (e.translationY > dismissDistance || e.velocityY > dismissVelocity) {
        translateY.value = withTiming(
          hiddenY,
          { duration: swipeCloseDuration },
          () => {
            scheduleOnRN(onClose);
          },
        );
      } else {
        translateY.value = withSpring(0, RESTORE_SPRING);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return {
    animatedStyle,
    panGesture,
    closeSheet,
  };
}
