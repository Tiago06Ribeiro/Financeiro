// 🔧 Cole aqui as credenciais do seu projeto Firebase
// Firebase Console → Configurações do projeto → Seus apps → Web

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
 apiKey: "AIzaSyAP1mF0x2W921oHxKOi39sVjDymuAdFtdI",
  authDomain: "financas-31196.firebaseapp.com",
  projectId: "financas-31196",
  storageBucket: "financas-31196.firebasestorage.app",
  messagingSenderId: "768832957740",
  appId: "1:768832957740:web:10534a660a202f97951089"
};

const app = initializeApp(firebaseConfig);
export const auth    = getAuth(app);
export const db      = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// ✅ Só esses emails conseguem entrar
export const ALLOWED_EMAILS = [
  "tiagoribeiromartins.c@gmail.com",
  "warianaabreu@gmail.com",
];