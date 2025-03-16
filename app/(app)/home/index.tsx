import { View, StyleSheet } from 'react-native';
import { RoleBasedDashboard } from '@/components/RoleBasedDashboard';
import { useAuth } from '@/contexts/AuthContext';

export default function HomeScreen() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <View style={styles.container}>
      <RoleBasedDashboard role={user.role} userData={user} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});
