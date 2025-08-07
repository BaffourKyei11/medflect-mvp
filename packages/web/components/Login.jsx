import React, { useState } from 'react';
import { TextField, Button, Paper, Typography, Alert, Box } from '@mui/material';
import useAuth from './useAuth';

export default function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(form.username, form.password);
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ maxWidth: 400, margin: 'auto', mt: 8, p: 3 }}>
      <Typography variant="h6">Login</Typography>
      <Box component="form" onSubmit={handleSubmit} mt={2}>
        <TextField label="Username" name="username" value={form.username} onChange={handleChange} fullWidth margin="normal" required />
        <TextField label="Password" name="password" value={form.password} onChange={handleChange} type="password" fullWidth margin="normal" required />
        <Button type="submit" variant="contained" fullWidth disabled={loading} sx={{ mt: 2 }}>Login</Button>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </Box>
    </Paper>
  );
}
