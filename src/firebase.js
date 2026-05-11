// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAcaE9APBk8SVp8WfCKl6-Vr-Ekl1orM6w",
  authDomain: "wapexpportal.firebaseapp.com",
  projectId: "wapexpportal",
  storageBucket: "wapexpportal.firebasestorage.app",
  messagingSenderId: "938036115925",
  appId: "1:938036115925:web:4bd28d2886dd945844655c",
  measurementId: "G-70L5SN8Q2P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const auth = getAuth(app);