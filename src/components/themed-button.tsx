import { ActivityIndicator, Pressable, Text, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

const LINK_COLOR = '#3c87f7';

export type ThemedButtonProps = Omit<PressableProps, 'style' | 'children'> & {
  title: string;
  hint?: string;
  variant?: 'primary' | 'link';
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function ThemedButton({ title, hint, variant = 'primary', loading = false, disabled, style, ...rest }: ThemedButtonProps) {
  const theme = useTheme();
  const primary = variant === 'primary';

  return (
    <Pressable
      disabled={disabled || loading}
      style={({ pressed }) => [
        { alignItems: 'center', borderRadius: 999 },
        primary ? { backgroundColor: theme.accent, padding: 16 } : { padding: 8 },
        pressed && { opacity: 0.7 },
        style,
      ]}
      {...rest}>
      {loading ? (
        <ActivityIndicator color={primary ? theme.onAccent : theme.text} />
      ) : (
        <Text style={primary ? { color: theme.onAccent, fontWeight: '700' } : { color: theme.text }}>
          {hint ? `${hint} ` : ''}
          <Text style={primary ? undefined : { color: LINK_COLOR, textDecorationLine: 'underline' }}>{title}</Text>
        </Text>
      )}
    </Pressable>
  );
}
