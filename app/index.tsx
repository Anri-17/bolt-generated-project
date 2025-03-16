import { Redirect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function Index() {
  const { user } = useAuth();

  // Redirect to the appropriate screen based on authentication status
  if (!user) {
    return <Redirect href="/login" />;
  }

  return <Redirect href="/home" />;
}
