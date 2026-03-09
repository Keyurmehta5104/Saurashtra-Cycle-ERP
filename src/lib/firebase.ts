import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCyly5Q5z8zhEhelbrDavA9c141zs2Pzz4",
  authDomain: "saurashtra-cycle.firebaseapp.com",
  projectId: "saurashtra-cycle",
  storageBucket: "saurashtra-cycle.firebasestorage.app",
  messagingSenderId: "1001502565056",
  appId: "1:1001502565056:web:f60356fc0b6f3e41950325",
  measurementId: "G-BFYYBX25L9"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
