
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBzMlvb0soGBAwrz1_f5VIfu5rQVvr6TMA",
  authDomain: "pitchcraft-dde50.firebaseapp.com",
  projectId: "pitchcraft-dde50",
  storageBucket: "pitchcraft-dde50.firebasestorage.app",
  messagingSenderId: "90307332127",
  appId: "1:90307332127:web:070fc5cc5e4f4a47f5ed2a",
  measurementId: "G-T0J2MG89WP"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider(); 
export const db = getFirestore(app);
export default app;

