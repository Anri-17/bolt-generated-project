import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Bell, Plus } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';

export default function NotificationsScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const canCreateAnnouncements = user?.role === 'admin' || user?.role === 'teacher';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft color="#fff" size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
        <Bell color="#007AFF" size={24} />
      </View>

      <ScrollView style={styles.notificationList} showsVerticalScrollIndicator={false}>
        <View style={styles.emptyState}>
          <Bell color="#666" size={48} />
          <Text style={styles.emptyStateTitle}>No Notifications Yet</Text>
          <Text style={styles.emptyStateText}>
            New notifications will appear here when teachers post announcements or grade assignments.
          </Text>
          {canCreateAnnouncements && (
            <TouchableOpacity style={styles.createButton}>
              <Plus color="#fff" size={20} />
              <Text style={styles.createButtonText}>Create Announcement</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#1a1a1a',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    color: '#fff',
    fontFamily: 'Inter_600SemiBold',
  },
  notificationList: {
    flex: 1,
    padding: 20,
  },
  emptyState: {
    flex: 1,
    minHeight: 400,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 24,
  },
  emptyStateTitle: {
    fontSize: 20,
    color: '#fff',
    fontFamily: 'Inter_600SemiBold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    marginBottom: 24,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
});
