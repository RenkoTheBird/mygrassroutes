// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, CACHE_SIZE_UNLIMITED, initializeFirestore, persistentLocalCache } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCwGaykPonX4Ihjh3q3bC2zOCkV8i82nrU",
  authDomain: "mygrassroutes-com.firebaseapp.com",
  projectId: "mygrassroutes-com",
  storageBucket: "mygrassroutes-com.firebasestorage.app",
  messagingSenderId: "116316771347",
  appId: "1:116316771347:web:7ee1a4920291a3c218dbe6",
  measurementId: "G-58Q36BCPTW",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Initialize Firestore with persistence and unlimited cache
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ cacheSizeBytes: CACHE_SIZE_UNLIMITED })
});
