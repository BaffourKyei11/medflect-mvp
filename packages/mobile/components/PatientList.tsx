import React, { useEffect, useState } from 'react';
import { ScrollView, TouchableOpacity } from 'react-native';
import { ActivityIndicator, Text, Card } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import useAuth from './useAuth';
// If you see a type error for react-native-paper, run:
// npm install react-native-paper
// npm install --save-dev @types/react-native-paper
import * as fhirService from '../../../services/fhirService';

export default function PatientList() {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const { logout } = useAuth();
  useEffect(() => {
    fhirService.getResource('Patient', '_sort=-meta.lastUpdated', logout)
      .then(data => setPatients(data.entry ? data.entry.map((e: any) => e.resource) : []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator animating />;
  if (error) return <Text style={{ color: 'red' }}>{error}</Text>;
  if (!patients.length) return <Text>No patients found.</Text>;

  return (
    <ScrollView>
      {patients.map((patient) => (
        <TouchableOpacity
          key={patient.id}
          onPress={() => navigation.navigate('PatientDetail', { id: patient.id })}
        >
          <Card style={{ margin: 8 }}>
            <Card.Title
              title={patient.name && patient.name[0] ? `${patient.name[0].given?.join(' ')} ${patient.name[0].family}` : 'Unnamed'}
              subtitle={`ID: ${patient.id} | Last Updated: ${patient.meta?.lastUpdated || 'N/A'}`}
            />
          </Card>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
