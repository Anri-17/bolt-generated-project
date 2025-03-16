import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Plus, Trash2 } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';

type ClassType = {
  id: string;
  class_number: string;
  name: string;
  description: string;
};

export default function ManageClassesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [classes, setClasses] = useState<ClassType[]>([]);
  const [newClassNumber, setNewClassNumber] = useState('');
  const [newClassName, setNewClassName] = useState('');
  const [newClassDescription, setNewClassDescription] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.replace('/home');
    }
  }, [user, router]);

  useEffect(() => {
    const fetchClasses = async () => {
      if (user?.school?.id) {
        const { data, error } = await supabase
          .from('classes')
          .select('*')
          .eq('school_id', user.school.id);

        if (error) {
          console.error('Error fetching classes:', error);
        } else {
          setClasses(data || []);
        }
      }
    };

    if (user?.school?.id) {
      fetchClasses();
    }
  }, [user]);

  const addClass = async () => {
    if (!newClassNumber || !newClassName) return;

    const { data, error } = await supabase
      .from('classes')
      .insert([
        {
          school_id: user?.school?.id,
          class_number: newClassNumber,
          name: newClassName,
          description: newClassDescription,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error adding class:', error);
    } else {
      setClasses([...classes, data]);
      setNewClassNumber('');
      setNewClassName('');
      setNewClassDescription('');
    }
  };

  const deleteClass = async (id: string) => {
    const { error } = await supabase.from('classes').delete().eq('id', id);

    if (error) {
      console.error('Error deleting class:', error);
    } else {
      setClasses(classes.filter((cls) => cls.id !== id));
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
        <Text style={styles.title}>Manage Classes</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.addClassContainer}>
          <Text style={styles.label}>Add New Class</Text>
          <TextInput
            style={styles.input}
            placeholder="Class Number (e.g., 10A)"
            placeholderTextColor="#666"
            value={newClassNumber}
            onChangeText={setNewClassNumber}
          />
          <TextInput
            style={styles.input}
            placeholder="Class Name"
            placeholderTextColor="#666"
            value={newClassName}
            onChangeText={setNewClassName}
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Description"
            placeholderTextColor="#666"
            value={newClassDescription}
            onChangeText={setNewClassDescription}
            multiline
            numberOfLines={3}
          />
          <TouchableOpacity style={styles.addButton} onPress={addClass}>
            <Plus color="#fff" size={20} />
            <Text style={styles.addButtonText}>Add Class</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.classesList}>
          <Text style={styles.label}>Existing Classes</Text>
          {classes.map((cls) => (
            <View key={cls.id} style={styles.classCard}>
              <Text style={styles.className}>{cls.class_number} - {cls.name}</Text>
              <Text style={styles.classDescription}>{cls.description}</Text>
              <TouchableOpacity onPress={() => deleteClass(cls.id)} style={styles.deleteButton}>
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
  addClassContainer: {
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
  classesList: {
    marginTop: 20,
  },
  classCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  className: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 8,
  },
  classDescription: {
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
