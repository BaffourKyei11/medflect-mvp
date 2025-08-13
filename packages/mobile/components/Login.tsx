import React, { useState } from 'react';
import { View } from 'react-native';
import { TextInput, Button, Text, Snackbar, ActivityIndicator } from 'react-native-paper';
import useAuth from './useAuth';

export default function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (name: string, value: string) => {
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      await login(form.username, form.password);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 24 }}>
      <Text variant="titleLarge">Login</Text>
      <TextInput
        label="Username"
        value={form.username}
        onChangeText={v => handleChange('username', v)}
        style={{ marginBottom: 12 }}
        autoCapitalize="none"
      />
      <TextInput
        label="Password"
        value={form.password}
        onChangeText={v => handleChange('password', v)}
        secureTextEntry
        style={{ marginBottom: 12 }}
      />
      <Button mode="contained" onPress={handleSubmit} loading={loading} style={{ marginBottom: 12 }}>Login</Button>
      {error && <Snackbar visible onDismiss={() => setError(null)}>{error}</Snackbar>}
      {loading && <ActivityIndicator animating />}
    </View>
  );
}
