// Firebase Configuration and Initialization
import { initializeApp } from 'firebase/app'
import { getStorage } from 'firebase/storage'

// Firebase configuration for Shortsy
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDY5YourApiKeyHere",
  authDomain: "shortsy-7c19f.firebaseapp.com",
  projectId: "shortsy-7c19f",
  storageBucket: "shortsy-7c19f.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abc123"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase Storage
const storage = getStorage(app)

export { storage }
export default app
