import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Building2, Mail, Lock, User } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';

export default function Register() {
  const { signUp } = useAuth();
  const [schoolName, setSchoolName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!schoolName || !email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setError('');
      setIsLoading(true);
      await signUp(email, password, schoolName);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#000000', '#1a1a1a']}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.title}>Register Your School</Text>
          <Text style={styles.subtitle}>Create an account to manage your educational institution</Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Building2 color="#fff" size={20} />
              <TextInput
                placeholder="School Name"
                placeholderTextColor="#666"
                style={styles.input}
                value={schoolName}
                onChangeText={setSchoolName}
              />
            </View>

            <View style={styles.inputContainer}>
              <Mail color="#fff" size={20} />
              <TextInput
                placeholder="Email"
                placeholderTextColor="#666"
                style={styles.input}
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.inputContainer}>
              <Lock color="#fff" size={20} />
              <TextInput
                placeholder="Password"
                placeholderTextColor="#666"
                style={styles.input}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <TouchableOpacity 
              style={[styles.registerButton, isLoading && styles.registerButtonDisabled]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.registerButtonText}>Register School</Text>
              )}
            </TouchableOpacity>

            <Link href="/login" style={styles.loginLink}>
              <Text style={styles.loginText}>Already have an account? Login</Text>
            </Link>

            <Text style={styles.notice}>
              Note: Your registration will be reviewed by the platform administrator before approval.
            </Text>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter_700Bold',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Inter_400Regular',
    marginBottom: 40,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    marginBottom: 20,
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  input: {
    flex: 1,
    color: '#fff',
    marginLeft: 12,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
  },
  registerButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  registerButtonDisabled: {
    backgroundColor: '#004999',
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  loginLink: {
    marginTop: 20,
    alignSelf: 'center',
  },
  loginText: {
    color: '#666',
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  notice: {
    color: '#666',
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    marginTop: 24,
    paddingHorizontal: 20,
  },
});
