import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAt266qo1jRybwgsCOnyOTvwIS3J8eYkAo",
  authDomain: "vita-f39ba.firebaseapp.com",
  databaseURL: "https://vita-f39ba-default-rtdb.firebaseio.com",
  projectId: "vita-f39ba",
  storageBucket: "vita-f39ba.firebasestorage.app",
  messagingSenderId: "709057596489",
  appId: "1:709057596489:web:47f0dabd27b656980b0398",
  measurementId: "G-XQCFP2P04T"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);
