
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  // Add your Firebase configuration here
  apiKey: "AIzaSyC2GHe8k-8ceL0ikWmkoUUILIyuQCBfWSk",
  authDomain: "wedding-f09cd.firebaseapp.com",
  projectId: "wedding-f09cd",
  storageBucket: "wedding-f09cd.firebasestorage.app",
  messagingSenderId: "1024579602427",
  appId: "1:1024579602427:web:eefb44a0779632ad88ed5e",
  measurementId: "G-N7Q3EF4796"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
