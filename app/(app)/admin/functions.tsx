import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Plus, Trash2 } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';

type FunctionType = {
  id: string;
  name: string;
  description: string;
};

export default function FunctionsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [functions, setFunctions] = useState<FunctionType[]>([]);
  const [newFunctionName, setNewFunctionName] = useState('');
  const [newFunctionDescription, setNewFunctionDescription] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.replace('/home');
    }
  }, [user, router]);

  useEffect(() => {
    const fetchFunctions = async () => {
      if (user?.school?.id) {
        const { data, error } = await supabase
          .from('functions')
          .select('*')
          .eq('school_id', user.school.id);

        if (error) {
          console.error('Error fetching functions:', error);
        } else {
          setFunctions(data || []);
        }
      }
    };

    if (user?.school?.id) {
      fetchFunctions();
    }
  }, [user]);

  const addFunction = async () => {
    if (!newFunctionName) return;

    const { data, error } = await supabase
      .from('functions')
      .insert([
        {
          school_id: user?.school?.id,
          name: newFunctionName,
          description: newFunctionDescription,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error adding function:', error);
    } else {
      setFunctions([...functions, data]);
      setNewFunctionName('');
      setNewFunctionDescription('');
    }
  };

  const deleteFunction = async (id: string) => {
    const { error } = await supabase.from('functions').delete().eq('id', id);

    if (error) {
      console.error('Error deleting function:', error);
    } else {
      setFunctions(functions.filter((func) => func.id !== id));
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
        <Text style={styles.title}>Manage Functions</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.addFunctionContainer}>
          <Text style={styles.label}>Add New Function</Text>
          <TextInput
            style={styles.input}
            placeholder="Function Name"
            placeholderTextColor="#666"
            value={newFunctionName}
            onChangeText={setNewFunctionName}
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Description"
            placeholderTextColor="#666"
            value={newFunctionDescription}
            onChangeText={setNewFunctionDescription}
            multiline
            numberOfLines={3}
          />
          <TouchableOpacity style={styles.addButton} onPress={addFunction}>
            <Plus color="#fff" size={20} />
            <Text style={styles.addButtonText}>Add Function</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.functionsList}>
          <Text style={styles.label}>Existing Functions</Text>
          {functions.map((func) => (
            <View key={func.id} style={styles.functionCard}>
              <Text style={styles.functionName}>{func.name}</Text>
              <Text style={styles.functionDescription}>{func.description}</Text>
              <TouchableOpacity onPress={() => deleteFunction(func.id)} style={styles.deleteButton}>
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
  addFunctionContainer: {
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
  functionsList: {
    marginTop: 20,
  },
  functionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  functionName: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 8,
  },
  functionDescription: {
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
