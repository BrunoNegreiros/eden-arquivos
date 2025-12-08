// src/config/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Agora as chaves estão seguras nas variáveis de ambiente
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// 1. Inicializa a conexão base
const app = initializeApp(firebaseConfig);

// 2. Prepara o sistema de Login (Google/Email)
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// 3. Prepara o Banco de Dados (Firestore)
export const db = getFirestore(app);

export default app;