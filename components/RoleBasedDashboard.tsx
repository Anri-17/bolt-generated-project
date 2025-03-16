import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Bell, Users, BookOpen, Calendar, GraduationCap, FileText, Plus } from 'lucide-react-native';
import { Link } from 'expo-router';

type DashboardProps = {
  role: 'admin' | 'teacher' | 'student' | 'parent';
  userData: {
    name: string;
    role: string;
  };
};

export function RoleBasedDashboard({ role, userData }: DashboardProps) {
  const getEmptyMessage = () => {
    switch (role) {
      case 'admin':
        return 'Start by adding teachers and students to your school.';
      case 'teacher':
        return 'Create your first course or announcement.';
      case 'student':
        return 'No courses or assignments yet.';
      case 'parent':
        return 'No student data available yet.';
      default:
        return 'Welcome to ANKO';
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.name}>{userData.name}</Text>
            <Text style={styles.role}>{userData.role}</Text>
          </View>
          <Link href="/home/notifications" asChild>
            <TouchableOpacity style={styles.notificationButton}>
              <Bell color="#fff" size={24} />
            </TouchableOpacity>
          </Link>
        </View>

        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>{getEmptyMessage()}</Text>
          {role === 'admin' && (
            <TouchableOpacity style={styles.addButton}>
              <Plus color="#fff" size={24} />
              <Text style={styles.addButtonText}>Add Users</Text>
            </TouchableOpacity>
          )}
          {role === 'teacher' && (
            <TouchableOpacity style={styles.addButton}>
              <Plus color="#fff" size={24} />
              <Text style={styles.addButtonText}>Create Course</Text>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          {role === 'teacher' && (
            <>
              <Link href="/courses/create" asChild>
                <TouchableOpacity style={styles.actionCard}>
                  <BookOpen color="#007AFF" size={24} />
                  <Text style={styles.actionText}>Create Course</Text>
                </TouchableOpacity>
              </Link>
              <Link href="/attendance/mark" asChild>
                <TouchableOpacity style={styles.actionCard}>
                  <Calendar color="#007AFF" size={24} />
                  <Text style={styles.actionText}>Mark Attendance</Text>
                </TouchableOpacity>
              </Link>
              <Link href="/grades/update" asChild>
                <TouchableOpacity style={styles.actionCard}>
                  <GraduationCap color="#007AFF" size={24} />
                  <Text style={styles.actionText}>Update Grades</Text>
                </TouchableOpacity>
              </Link>
              <Link href="/materials/upload" asChild>
                <TouchableOpacity style={styles.actionCard}>
                  <FileText color="#007AFF" size={24} />
                  <Text style={styles.actionText}>Upload Materials</Text>
                </TouchableOpacity>
              </Link>
            </>
          )}
          {role === 'admin' && (
            <>
              <Link href="/users/manage" asChild>
                <TouchableOpacity style={styles.actionCard}>
                  <Users color="#007AFF" size={24} />
                  <Text style={styles.actionText}>Manage Users</Text>
                </TouchableOpacity>
              </Link>
              <Link href="/courses/manage" asChild>
                <TouchableOpacity style={styles.actionCard}>
                  <BookOpen color="#007AFF" size={24} />
                  <Text style={styles.actionText}>Manage Courses</Text>
                </TouchableOpacity>
              </Link>
            </>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 30,
  },
  greeting: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Inter_400Regular',
  },
  name: {
    fontSize: 24,
    color: '#fff',
    fontFamily: 'Inter_700Bold',
    marginTop: 4,
  },
  role: {
    fontSize: 14,
    color: '#007AFF',
    fontFamily: 'Inter_600SemiBold',
    marginTop: 4,
  },
  notificationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyStateText: {
    color: '#666',
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    marginBottom: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  quickActions: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#fff',
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 16,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  actionCard: {
    width: '46%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    margin: '2%',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Inter_600SemiBold',
    marginTop: 12,
    textAlign: 'center',
  },
});
