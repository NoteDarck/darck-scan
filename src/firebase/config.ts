// src/firebase/config.ts
// Este arquivo não é mais usado diretamente para autenticação ou banco de dados,
// pois estamos migrando para o Supabase.
// As importações existentes em outros arquivos que usavam 'auth' ou 'db'
// precisarão ser atualizadas para apontar para o Supabase.

// Exportações vazias para evitar erros de importação em arquivos que ainda não foram atualizados.
export const app = null;
export const auth = null;
export const db = null;
export const createUserWithEmailAndPassword = null;
export const signInWithEmailAndPassword = null;
export const signOut = null;
export const onAuthStateChanged = null;
export const updateProfile = null;
export const sendPasswordResetEmail = null;
export const GoogleAuthProvider = null;
export const signInWithPopup = null;
export const collection = null;
export const addDoc = null;
export const getDocs = null;
export const query = null;
export const where = null;
export type User = any;