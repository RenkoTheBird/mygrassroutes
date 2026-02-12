// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, CACHE_SIZE_UNLIMITED, initializeFirestore, persistentLocalCache } from "firebase/firestore";

// Use environment variables for Firebase config 
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Validate Firebase config
const requiredKeys = ['apiKey', 'authDomain', 'projectId'];
const missingKeys = requiredKeys.filter(key => !firebaseConfig[key]);

if (missingKeys.length > 0) {
  console.error('[FIREBASE] Missing required configuration:', missingKeys);
  console.error('[FIREBASE] Please set the following environment variables in Railway:');
  // Map camelCase keys to their actual env var names
  const envVarMap = {
    apiKey: 'VITE_FIREBASE_API_KEY',
    authDomain: 'VITE_FIREBASE_AUTH_DOMAIN',
    projectId: 'VITE_FIREBASE_PROJECT_ID',
    storageBucket: 'VITE_FIREBASE_STORAGE_BUCKET',
    messagingSenderId: 'VITE_FIREBASE_MESSAGING_SENDER_ID',
    appId: 'VITE_FIREBASE_APP_ID',
    measurementId: 'VITE_FIREBASE_MEASUREMENT_ID',
  };
  missingKeys.forEach(key => {
    console.error(`[FIREBASE]   - ${envVarMap[key] || `VITE_FIREBASE_${key.toUpperCase()}`}`);
  });
}

let app, auth, db;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);

  // Initialize Firestore with persistence and unlimited cache
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({ cacheSizeBytes: CACHE_SIZE_UNLIMITED })
  });
} catch (error) {
  console.error('[FIREBASE] Failed to initialize Firebase:', error);
  // Set to null so the app can handle the error gracefully
  app = null;
  auth = null;
  db = null;
}

export { app, auth, db };
