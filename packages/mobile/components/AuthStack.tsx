import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from './Login';
import PatientList from './PatientList';
import PatientDetail from './PatientDetail';
import useAuth from './useAuth';
import { ActivityIndicator, View } from 'react-native';

type RootStackParamList = {
  PatientList: undefined;
  PatientDetail: { id: string } | undefined;
  Login: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function AuthenticatedStack() {
  return (
    <Stack.Navigator id={undefined} initialRouteName="PatientList">
      <Stack.Screen
        name="PatientList"
        component={PatientList}
        options={{ title: 'Patients' }}
      />
      <Stack.Screen
        name="PatientDetail"
        component={PatientDetail}
        options={{ title: 'Patient Detail' }}
      />
    </Stack.Navigator>
  );
}

function UnauthenticatedStack() {
  return (
    <Stack.Navigator id={undefined} initialRouteName="Login">
      <Stack.Screen
        name="Login"
        component={Login}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

export default function AuthStack() {
  const { user, loading } = useAuth(); // Assume useAuth provides loading state

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return user ? <AuthenticatedStack /> : <UnauthenticatedStack />;
}
