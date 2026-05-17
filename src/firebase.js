// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  getAuth,
} from "firebase/auth";

import {
  getFirestore,
} from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDpESoYy3czVP0G78WEL6fkjc8oIDicMW0",
  authDomain: "goalpulseai-73975.firebaseapp.com",
  projectId: "goalpulseai-73975",
  storageBucket: "goalpulseai-73975.firebasestorage.app",
  messagingSenderId: "43385788739",
  appId: "1:43385788739:web:435117f502f3eec70c37f6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// AUTH
export const auth =
  getAuth(app);

// FIRESTORE
export const db =
  getFirestore(app);