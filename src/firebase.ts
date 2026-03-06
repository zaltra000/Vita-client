import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBMVil6PMKVb5fy9TEZ_otnQWiKUoykU5I",
  authDomain: "vita-e5e4f.firebaseapp.com",
  databaseURL: "https://vita-e5e4f-default-rtdb.firebaseio.com",
  projectId: "vita-e5e4f",
  storageBucket: "vita-e5e4f.firebasestorage.app",
  messagingSenderId: "843718426446",
  appId: "1:843718426446:web:adcee38f4fa8ec6ab7a81f"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);
