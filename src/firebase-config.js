import { initializeApp } from "firebase/app";
import {getFirestore} from "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyD9Mvk6kXR23wpHg8HKl7GrFyoOrpOCR7g",
  authDomain: "kill-b2c83.firebaseapp.com",
  projectId: "kill-b2c83",
  storageBucket: "kill-b2c83.firebasestorage.app",
  messagingSenderId: "396968051791",
  appId: "1:396968051791:web:68f8757f67c43b2edc963a"
};

const app = initializeApp(firebaseConfig);
export const db=getFirestore(app);