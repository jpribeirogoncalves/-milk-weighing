// /src/firebase.js
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: "AIzaSyDdOVmNB3NJJly7DPOdVCI7myFHgfzHKZU",
  authDomain: "milk-weighing.firebaseapp.com",
  projectId: "milk-weighing",
  storageBucket: "milk-weighing.appspot.com",
  messagingSenderId: "16361349519",
  appId: "1:16361349519:web:3ec2a0cc4804db1d67ebfa"
};

const app = initializeApp(firebaseConfig);
export default app;