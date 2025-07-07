// firebaseConfig.js
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { initializeAuth, getAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyBoUluartwGZRiThO_yfODRRvxA-Hg-ofk",
  authDomain: "e-parking-76cf6.firebaseapp.com",
  projectId: "e-parking-76cf6",
  storageBucket: "e-parking-76cf6.firebasestorage.app",
  messagingSenderId: "306915791279",
  appId: "1:306915791279:web:e076d34d299bba9fb21f5a",
  measurementId: "G-CFWFGRWP4J"
};

let app;
let auth;
let db;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
  db = getFirestore(app);
} else {
  app = getApps()[0];
  auth = getAuth(app);
  db = getFirestore(app);
}

export { auth, db };
