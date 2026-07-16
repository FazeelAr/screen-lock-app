import * as Haptics from 'expo-haptics';
import React from 'react';
import { Platform, Pressable, PressableProps } from 'react-native';

type Props = PressableProps & { children?: React.ReactNode };

export function HapticTab(props: Props) {
  const { onPressIn, children, ...rest } = props;

  return (
    <Pressable
      {...rest}
      onPressIn={(ev) => {
        if (Platform.OS === 'ios') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        onPressIn?.(ev as any);
      }}>
      {children}
    </Pressable>
  );
}
