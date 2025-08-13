import React,{useEffect,useState} from 'react'; import { SafeAreaView,Text,Button,View,ScrollView,RefreshControl } from 'react-native'; import axios from 'axios';
const API='http://localhost:3001'; const replicateOnce=()=>new Promise<void>(r=>setTimeout(r,300));
export default function App(){ const [token,setToken]=useState(''); const [patient,setPatient]=useState<any>(null); const [refreshing,setRefreshing]=useState(false);
useEffect(()=>{(async()=>{ const {data}=await axios.post(`${API}/auth/login`,{username:'patient1'}); setToken(data.token); })();},[]);
const load=async()=>{ const {data}=await axios.post(`${API}/fhir/Patient`,{resourceType:'Patient',name:[{family:'Mobile'}]},{headers:{Authorization:`Bearer ${token}`}}); setPatient(data); };
const onRefresh=async()=>{ setRefreshing(true); await replicateOnce(); setRefreshing(false); };
return (<SafeAreaView><ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>}> <View style={{padding:16}}><Text style={{fontSize:20,fontWeight:'bold'}}>Medflect Mobile</Text><Button title="Load My Patient" onPress={load}/>{patient&&<Text style={{marginTop:12}}>Patient ID: {patient.id}</Text>}<Text style={{marginTop:12}}>Pull-to-refresh triggers Couchbase Lite sync (mock in dev).</Text></View></ScrollView></SafeAreaView>); }
