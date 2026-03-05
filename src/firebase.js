// 🔧 Cole aqui as credenciais do seu projeto Firebase
// Firebase Console → Configurações do projeto → Seus apps → Web

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey:            "COLE_AQUI",
  authDomain:        "COLE_AQUI",
  projectId:         "COLE_AQUI",
  storageBucket:     "COLE_AQUI",
  messagingSenderId: "COLE_AQUI",
  appId:             "COLE_AQUI",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// ✅ Só esses emails conseguem entrar
export const ALLOWED_EMAILS = [
  "seu-email@gmail.com",
  "email-da-mariana@gmail.com",
];
