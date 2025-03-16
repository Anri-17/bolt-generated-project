import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Plus } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';

export default function CoursesScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const isTeacher = user?.role === 'teacher';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft color="#fff" size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Courses</Text>
        {isTeacher && (
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => router.push('/courses/create')}
          >
            <Plus color="#fff" size={20} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.emptyState}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800&auto=format&fit=crop&q=80' }}
            style={styles.emptyStateImage}
          />
          <Text style={styles.emptyStateTitle}>No Courses Yet</Text>
          <Text style={styles.emptyStateText}>
            {isTeacher
              ? 'Start creating your first course by clicking the plus button above.'
              : 'Courses will appear here once you are enrolled in them.'}
          </Text>
          {isTeacher && (
            <TouchableOpacity
              style={styles.createFirstButton}
              onPress={() => router.push('/courses/create')}
            >
              <Plus color="#fff" size={20} />
              <Text style={styles.createFirstButtonText}>Create Your First Course</Text>
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
  createButton: {
    width: 40,
    height: 40,
    backgroundColor: '#007AFF',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
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
  emptyStateImage: {
    width: 200,
    height: 200,
    borderRadius: 16,
    marginBottom: 24,
  },
  emptyStateTitle: {
    fontSize: 20,
    color: '#fff',
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    marginBottom: 24,
  },
  createFirstButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  createFirstButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
});
