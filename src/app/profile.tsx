import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/lib/auth';

export default function Profile() {
    const {profile } = useAuth();
    return (
        <Screen centered>
            <ThemedText type="subtitle">Cześć, {profile?.nick}!</ThemedText>
            <ThemedText>Twój aktualny stan konta: {profile?.balance} ECTS</ThemedText>

        </Screen>
  )
}
