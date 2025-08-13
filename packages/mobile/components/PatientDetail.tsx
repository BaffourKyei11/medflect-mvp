import React, { useEffect, useState } from 'react';
import { View, ScrollView } from 'react-native';
import { Text, Card, Button, TextInput, ActivityIndicator, Snackbar } from 'react-native-paper';
import { useRoute } from '@react-navigation/native';
import * as Yup from 'yup';

const vitalsSchema = Yup.object().shape({
  systolic: Yup.number().required(),
  diastolic: Yup.number().required(),
  heartRate: Yup.number().required(),
  temperature: Yup.number().required(),
});

export default function PatientDetail() {
  const route = useRoute();
  const { id } = route.params as { id: string };
  const [patient, setPatient] = useState<any>(null);
  const [observations, setObservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ systolic: '', diastolic: '', heartRate: '', temperature: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const pRes = await fetch(`/fhir/Patient/${id}`);
        const oRes = await fetch(`/fhir/Observation?subject=Patient/${id}`);
        const patientData = await pRes.json();
        const obsData = await oRes.json();
        setPatient(patientData);
        setObservations(obsData.entry ? obsData.entry.map((e: any) => e.resource) : []);
      } catch (err) {
        setError('Failed to load patient data');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  const handleChange = (name: string, value: string) => {
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async () => {
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
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <ActivityIndicator animating />;
  if (error) return <Snackbar visible onDismiss={() => setError(null)}>{error}</Snackbar>;
  if (!patient) return <Text>No patient found.</Text>;

  return (
    <ScrollView style={{ padding: 16 }}>
      <Card style={{ marginBottom: 16 }}>
        <Card.Title
          title={patient.name && patient.name[0] ? `${patient.name[0].given?.join(' ')} ${patient.name[0].family}` : 'Unnamed'}
          subtitle={`ID: ${patient.id}`}
        />
        <Card.Content>
          <Text>Gender: {patient.gender || 'N/A'}</Text>
          <Text>DOB: {patient.birthDate || 'N/A'}</Text>
        </Card.Content>
      </Card>
      <Card style={{ marginBottom: 16 }}>
        <Card.Title title="Vitals" />
        <Card.Content>
          {observations.length ? observations.map((obs, i) => (
            <View key={i} style={{ marginBottom: 8 }}>
              {obs.component && obs.component.map((comp: any, j: number) => (
                <Text key={j}>{comp.code.text}: {comp.valueQuantity.value} {comp.valueQuantity.unit}</Text>
              ))}
            </View>
          )) : <Text>No vitals recorded.</Text>}
        </Card.Content>
      </Card>
      <Card>
        <Card.Title title="Add Vitals" />
        <Card.Content>
          <TextInput
            label="Systolic BP"
            value={form.systolic}
            onChangeText={v => handleChange('systolic', v)}
            keyboardType="numeric"
            style={{ marginBottom: 8 }}
          />
          <TextInput
            label="Diastolic BP"
            value={form.diastolic}
            onChangeText={v => handleChange('diastolic', v)}
            keyboardType="numeric"
            style={{ marginBottom: 8 }}
          />
          <TextInput
            label="Heart Rate"
            value={form.heartRate}
            onChangeText={v => handleChange('heartRate', v)}
            keyboardType="numeric"
            style={{ marginBottom: 8 }}
          />
          <TextInput
            label="Temperature (C)"
            value={form.temperature}
            onChangeText={v => handleChange('temperature', v)}
            keyboardType="numeric"
            style={{ marginBottom: 8 }}
          />
          <Button mode="contained" onPress={handleSubmit} loading={submitting} style={{ marginTop: 8 }}>
            Submit
          </Button>
          {success && <Snackbar visible onDismiss={() => setSuccess(null)}>{success}</Snackbar>}
        </Card.Content>
      </Card>
    </ScrollView>
  );
}
