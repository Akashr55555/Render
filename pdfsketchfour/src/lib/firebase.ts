import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  FacebookAuthProvider, 
  OAuthProvider,
  signInWithPopup as fbSignInWithPopup,
  signInWithEmailAndPassword as fbSignInWithEmailAndPassword,
  createUserWithEmailAndPassword as fbCreateUserWithEmailAndPassword,
  sendPasswordResetEmail as fbSendPasswordResetEmail,
  signOut as fbSignOut,
  onAuthStateChanged as fbOnAuthStateChanged,
  User as FirebaseUser,
  Auth
} from 'firebase/auth';

const env = (import.meta as any).env || {};

export const isFirebaseConfigured = Boolean(
  env.VITE_FIREBASE_API_KEY &&
  env.VITE_FIREBASE_AUTH_DOMAIN &&
  env.VITE_FIREBASE_PROJECT_ID
);

let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;

if (isFirebaseConfigured) {
  try {
    const firebaseConfig = {
      apiKey: env.VITE_FIREBASE_API_KEY,
      authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || '',
      messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: env.VITE_FIREBASE_APP_ID || '',
    };
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    authInstance = getAuth(app);
  } catch (err) {
    console.warn('[Firebase] Initialization warning:', err);
  }
} else {
  console.info('[Firebase] VITE_FIREBASE_* environment variables not detected. Auth will run in offline demo mode.');
}

export const auth = authInstance as unknown as Auth;
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();
export const microsoftProvider = new OAuthProvider('microsoft.com');

export type { FirebaseUser };

export async function signInWithPopup(authObj: any, provider: any) {
  if (!isFirebaseConfigured || !authInstance) {
    throw new Error('Firebase authentication is not configured yet. Please add your VITE_FIREBASE_* keys in your deployment environment.');
  }
  return fbSignInWithPopup(authInstance, provider);
}

export async function signInWithEmailAndPassword(authObj: any, email: string, pass: string) {
  if (!isFirebaseConfigured || !authInstance) {
    throw new Error('Firebase authentication is not configured yet. Please add your VITE_FIREBASE_* keys in your deployment environment.');
  }
  return fbSignInWithEmailAndPassword(authInstance, email, pass);
}

export async function createUserWithEmailAndPassword(authObj: any, email: string, pass: string) {
  if (!isFirebaseConfigured || !authInstance) {
    throw new Error('Firebase authentication is not configured yet. Please add your VITE_FIREBASE_* keys in your deployment environment.');
  }
  return fbCreateUserWithEmailAndPassword(authInstance, email, pass);
}

export async function sendPasswordResetEmail(authObj: any, email: string) {
  if (!isFirebaseConfigured || !authInstance) {
    throw new Error('Firebase authentication is not configured yet. Please add your VITE_FIREBASE_* keys in your deployment environment.');
  }
  return fbSendPasswordResetEmail(authInstance, email);
}

export async function signOut(authObj: any) {
  if (!isFirebaseConfigured || !authInstance) {
    return Promise.resolve();
  }
  return fbSignOut(authInstance);
}

export function onAuthStateChanged(authObj: any, callback: (user: FirebaseUser | null) => void) {
  if (!isFirebaseConfigured || !authInstance) {
    // If not configured, immediately notify that user is logged out (null)
    callback(null);
    return () => {};
  }
  return fbOnAuthStateChanged(authInstance, callback);
}
