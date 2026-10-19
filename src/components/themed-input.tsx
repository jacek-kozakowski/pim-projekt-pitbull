import { TextInput, type TextInputProps } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

export function ThemedInput({ style, ...rest }: TextInputProps) {
  const theme = useTheme();

  return (
    <TextInput
      placeholderTextColor={theme.placeholder}
      style={[
        {
          borderWidth: 1,
          borderColor: theme.backgroundSelected,
          backgroundColor: theme.backgroundElement,
          color: theme.text,
          padding: 14,
          borderRadius: 12,
          marginBottom: 12,
        },
        style,
      ]}
      {...rest}
    />
  );
}
