// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBDL75NLILmx37QK3akMLIy8OFsDVMB0WU",
  authDomain: "vinayaka-chavithi-org.firebaseapp.com",
  projectId: "vinayaka-chavithi-org",
  storageBucket: "vinayaka-chavithi-org.appspot.com",
  messagingSenderId: "268594487516",
  appId: "1:268594487516:web:f1b3f8859772185f91d419",
  measurementId: "G-R832HWP4QJ"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
