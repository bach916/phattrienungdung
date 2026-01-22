// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBQsh2KAXZP_7WfSC_YUJnrUTgL_qKJmdc",
  authDomain: "phamngocbach-10a0c.firebaseapp.com",
  projectId: "phamngocbach-10a0c",
  storageBucket: "phamngocbach-10a0c.firebasestorage.app",
  messagingSenderId: "554907446263",
  appId: "1:554907446263:web:839299a8b2b500dc3c9cf2",
  measurementId: "G-0H222HXRCN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);