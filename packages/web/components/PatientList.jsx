import React, { useEffect, useState } from 'react';
import { List, ListItem, ListItemText, CircularProgress, Typography, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const fetchPatients = async () => {
  const res = await fetch('/fhir/Patient?_sort=-meta.lastUpdated');
  if (!res.ok) throw new Error('Failed to fetch patients');
  return res.json();
};

export default function PatientList() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const { logout } = useAuth();
  useEffect(() => {
    getResource('Patient', '_sort=-meta.lastUpdated', logout)
      .then(data => setPatients(data.entry ? data.entry.map(e => e.resource) : []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!patients.length) return <Typography>No patients found.</Typography>;

  return (
    <Paper elevation={2} sx={{ maxWidth: 600, margin: 'auto', mt: 4 }}>
      <Typography variant="h6" sx={{ p: 2 }}>Patient List</Typography>
      <List>
        {patients.map((patient) => (
          <ListItem
            button
            key={patient.id}
            onClick={() => navigate(`/patient/${patient.id}`)}
          >
            <ListItemText
              primary={patient.name && patient.name[0] ? `${patient.name[0].given?.join(' ')} ${patient.name[0].family}` : 'Unnamed'}
              secondary={`ID: ${patient.id} | Last Updated: ${patient.meta?.lastUpdated || 'N/A'}`}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}
