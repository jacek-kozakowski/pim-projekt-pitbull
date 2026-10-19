import { View, type ViewProps } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ScreenProps = ViewProps & {
  centered?: boolean;
};


export function Screen({ style, centered = false, ...rest }: ScreenProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        { flex: 1, backgroundColor: theme.background, padding: Spacing.four },
        centered && { justifyContent: 'center', alignItems: 'center' },
        style,
      ]}
      {...rest}
    />
  );
}
