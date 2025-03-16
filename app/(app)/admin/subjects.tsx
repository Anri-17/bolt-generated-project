import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Plus, Trash2 } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';

type SubjectType = {
  id: string;
  name: string;
  description: string;
};

export default function SubjectsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<SubjectType[]>([]);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectDescription, setNewSubjectDescription] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.replace('/home');
    }
  }, [user, router]);

  useEffect(() => {
    const fetchSubjects = async () => {
      if (user?.school?.id) {
        const { data, error } = await supabase
          .from('subjects')
          .select('*')
          .eq('school_id', user.school.id);

        if (error) {
          console.error('Error fetching subjects:', error);
        } else {
          setSubjects(data || []);
        }
      }
    };

    if (user?.school?.id) {
      fetchSubjects();
    }
  }, [user]);

  const addSubject = async () => {
    if (!newSubjectName) return;

    const { data, error } = await supabase
      .from('subjects')
      .insert([
        {
          school_id: user?.school?.id,
          name: newSubjectName,
          description: newSubjectDescription,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error adding subject:', error);
    } else {
      setSubjects([...subjects, data]);
      setNewSubjectName('');
      setNewSubjectDescription('');
    }
  };

  const deleteSubject = async (id: string) => {
    const { error } = await supabase.from('subjects').delete().eq('id', id);

    if (error) {
      console.error('Error deleting subject:', error);
    } else {
      setSubjects(subjects.filter((subject) => subject.id !== id));
    }
  };

  if (!user || user.role !== 'admin') {
    return null; // Or a loading indicator
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft color="#fff" size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Manage Subjects</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.addSubjectContainer}>
          <Text style={styles.label}>Add New Subject</Text>
          <TextInput
            style={styles.input}
            placeholder="Subject Name"
            placeholderTextColor="#666"
            value={newSubjectName}
            onChangeText={setNewSubjectName}
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Description"
            placeholderTextColor="#666"
            value={newSubjectDescription}
            onChangeText={setNewSubjectDescription}
            multiline
            numberOfLines={3}
          />
          <TouchableOpacity style={styles.addButton} onPress={addSubject}>
            <Plus color="#fff" size={20} />
            <Text style={styles.addButtonText}>Add Subject</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.subjectsList}>
          <Text style={styles.label}>Existing Subjects</Text>
          {subjects.map((subject) => (
            <View key={subject.id} style={styles.subjectCard}>
              <Text style={styles.subjectName}>{subject.name}</Text>
              <Text style={styles.subjectDescription}>{subject.description}</Text>
              <TouchableOpacity onPress={() => deleteSubject(subject.id)} style={styles.deleteButton}>
                <Trash2 color="#ff4444" size={20} />
              </TouchableOpacity>
            </View>
          ))}
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
  content: {
    flex: 1,
    padding: 20,
  },
  addSubjectContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    marginBottom: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
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
  subjectsList: {
    marginTop: 20,
  },
  subjectCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  subjectName: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 8,
  },
  subjectDescription: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Inter_400Regular',
  },
  deleteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 8,
  },
});
