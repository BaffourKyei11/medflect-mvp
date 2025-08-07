import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Typography, Paper, CircularProgress, TextField, Button, Box, Alert } from '@mui/material';
import * as Yup from 'yup';

const vitalsSchema = Yup.object().shape({
  systolic: Yup.number().required(),
  diastolic: Yup.number().required(),
  heartRate: Yup.number().required(),
  temperature: Yup.number().required(),
});

export default function PatientDetail() {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [observations, setObservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ systolic: '', diastolic: '', heartRate: '', temperature: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    import { getResource, createResource } from '../../../services/fhirService';
    import useAuth from './useAuth';
    const { logout } = useAuth();
    async function fetchData() {
      try {
        const patientData = await getResource('Patient', id, logout);
        const obsData = await getResource('Observation', `subject=Patient/${id}`, logout);
        setPatient(patientData);
        setObservations(obsData.entry ? obsData.entry.map(e => e.resource) : []);
      } catch (err) {
        setError('Failed to load patient data');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      await vitalsSchema.validate(form);
      const obs = {
        resourceType: 'Observation',
        status: 'final',
        code: { text: 'Vitals' },
        subject: { reference: `Patient/${id}` },
        component: [
          { code: { text: 'Systolic BP' }, valueQuantity: { value: Number(form.systolic), unit: 'mmHg' } },
          { code: { text: 'Diastolic BP' }, valueQuantity: { value: Number(form.diastolic), unit: 'mmHg' } },
          { code: { text: 'Heart Rate' }, valueQuantity: { value: Number(form.heartRate), unit: 'bpm' } },
          { code: { text: 'Temperature' }, valueQuantity: { value: Number(form.temperature), unit: 'C' } },
        ],
      };
      await createResource('Observation', obs, logout);
      setSuccess('Vitals submitted!');
      setForm({ systolic: '', diastolic: '', heartRate: '', temperature: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!patient) return <Typography>No patient found.</Typography>;

  return (
    <Paper sx={{ maxWidth: 600, margin: 'auto', mt: 4, p: 3 }}>
      <Typography variant="h5">{patient.name && patient.name[0] ? `${patient.name[0].given?.join(' ')} ${patient.name[0].family}` : 'Unnamed'}</Typography>
      <Typography>ID: {patient.id}</Typography>
      <Typography>Gender: {patient.gender || 'N/A'}</Typography>
      <Typography>DOB: {patient.birthDate || 'N/A'}</Typography>
      <Box mt={2}>
        <Typography variant="h6">Vitals</Typography>
        {observations.length ? observations.map((obs, i) => (
          <Box key={i} sx={{ mb: 1 }}>
            {obs.component && obs.component.map((comp, j) => (
              <Typography key={j} variant="body2">
                {comp.code.text}: {comp.valueQuantity.value} {comp.valueQuantity.unit}
              </Typography>
            ))}
          </Box>
        )) : <Typography>No vitals recorded.</Typography>}
      </Box>
      <Box mt={3} component="form" onSubmit={handleSubmit}>
        <Typography variant="h6">Add Vitals</Typography>
        <TextField label="Systolic BP" name="systolic" value={form.systolic} onChange={handleChange} type="number" sx={{ mr: 1, mb: 1 }} required />
        <TextField label="Diastolic BP" name="diastolic" value={form.diastolic} onChange={handleChange} type="number" sx={{ mr: 1, mb: 1 }} required />
        <TextField label="Heart Rate" name="heartRate" value={form.heartRate} onChange={handleChange} type="number" sx={{ mr: 1, mb: 1 }} required />
        <TextField label="Temperature (C)" name="temperature" value={form.temperature} onChange={handleChange} type="number" sx={{ mr: 1, mb: 1 }} required />
        <Box mt={2}>
          <Button type="submit" variant="contained" disabled={submitting}>Submit</Button>
        </Box>
        {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </Box>
    </Paper>
  );
}
