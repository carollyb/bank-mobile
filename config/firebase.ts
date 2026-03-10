import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Configuração do Firebase (obtida do Firebase Console)
const firebaseConfig = {
  apiKey: 'AIzaSyCmvmnLjAs4SGLDiJDDCaGJE-IQm9L4C3E',
  authDomain: 'bank-mobile-df4ec.firebaseapp.com',
  projectId: 'bank-mobile-df4ec',
  storageBucket: 'bank-mobile-df4ec.firebasestorage.app',
  messagingSenderId: '420246894148',
  appId: '1:420246894148:web:7d2afa1dbfff6ed17aee11',
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Inicializa o serviço de autenticação
export const auth = getAuth(app);
