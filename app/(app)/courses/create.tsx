import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Plus, Trash2 } from 'lucide-react-native';

type Module = {
  id: string;
  title: string;
  description: string;
};

export default function CreateCourse() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [modules, setModules] = useState<Module[]>([]);

  const addModule = () => {
    setModules([
      ...modules,
      {
        id: Date.now().toString(),
        title: '',
        description: '',
      },
    ]);
  };

  const updateModule = (id: string, field: keyof Module, value: string) => {
    setModules(
      modules.map((module) =>
        module.id === id ? { ...module, [field]: value } : module
      )
    );
  };

  const removeModule = (id: string) => {
    setModules(modules.filter((module) => module.id !== id));
  };

  const handleCreate = () => {
    // TODO: Implement course creation logic
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft color="#fff" size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Create Course</Text>
        <TouchableOpacity
          style={[styles.createButton, (!title || !description) && styles.createButtonDisabled]}
          onPress={handleCreate}
          disabled={!title || !description}
        >
          <Text style={styles.createButtonText}>Create</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.label}>Course Title</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter course title"
            placeholderTextColor="#666"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Enter course description"
            placeholderTextColor="#666"
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.label}>Modules</Text>
            <TouchableOpacity style={styles.addButton} onPress={addModule}>
              <Plus color="#fff" size={20} />
              <Text style={styles.addButtonText}>Add Module</Text>
            </TouchableOpacity>
          </View>

          {modules.map((module) => (
            <View key={module.id} style={styles.moduleCard}>
              <View style={styles.moduleHeader}>
                <Text style={styles.moduleLabel}>Module Title</Text>
                <TouchableOpacity
                  onPress={() => removeModule(module.id)}
                  style={styles.removeButton}
                >
                  <Trash2 color="#ff4444" size={20} />
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.input}
                value={module.title}
                onChangeText={(value) => updateModule(module.id, 'title', value)}
                placeholder="Enter module title"
                placeholderTextColor="#666"
              />
              <Text style={styles.moduleLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={module.description}
                onChangeText={(value) => updateModule(module.id, 'description', value)}
                placeholder="Enter module description"
                placeholderTextColor="#666"
                multiline
                numberOfLines={4}
              />
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
  createButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createButtonDisabled: {
    backgroundColor: '#333',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
  moduleCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  moduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  moduleLabel: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 8,
  },
  removeButton: {
    padding: 8,
  },
});
