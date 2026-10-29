import { type StyleProp, type TextStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';

const TITLE = { fontSize: 18, lineHeight: 24, fontWeight: '700' } as const;

export function AppTitle({ style }: { style?: StyleProp<TextStyle> }) {
  return (
    <ThemedText style={[TITLE, style]}>
      Jednoręki Bandyta <ThemedText themeColor="accent" style={TITLE}>ECTS</ThemedText>
    </ThemedText>
  );
}
