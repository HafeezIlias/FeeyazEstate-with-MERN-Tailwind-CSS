// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY, //this is how to import env variables in vite
  authDomain: "feeyazestate.firebaseapp.com",
  projectId: "feeyazestate",
  storageBucket: "feeyazestate.firebasestorage.app",
  messagingSenderId: "325264036564",
  appId: "1:325264036564:web:13a958a8d71c645f896141"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);