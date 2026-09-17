// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAH0tQqsZKajVytiIHFKN3gAW93ARj4Hvo",
  authDomain: "schedule-project-f053a.firebaseapp.com",
  projectId: "schedule-project-f053a",
  storageBucket: "schedule-project-f053a.firebasestorage.app",
  messagingSenderId: "83100657046",
  appId: "1:83100657046:web:630bf0019435e657cfe9b7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = firebase.firestore();