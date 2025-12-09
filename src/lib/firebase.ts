import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// TODO: Replace with your Firebase project configuration
// Get these from Firebase Console > Project Settings
const firebaseConfig = {
    apiKey: "AIzaSyC9hyMxdwKKpmBPOh0kT6Q_YYS4YGisQT0",
    authDomain: "finanzas-personales-ac618.firebaseapp.com",
    projectId: "finanzas-personales-ac618",
    storageBucket: "finanzas-personales-ac618.firebasestorage.app",
    messagingSenderId: "887773464252",
    appId: "1:887773464252:web:d45e740ee757124dfcb2b9",
    measurementId: "G-C4649W27J1"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
