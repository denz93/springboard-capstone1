import {initializeApp} from 'firebase/app'
import { getAuth } from 'firebase/auth'
const firebaseConfig = {
  apiKey: "AIzaSyA530TY4XUQggE_Q9xcN2kkRmlChJdKBpw",
  authDomain: "springboard-capstone1.firebaseapp.com",
  projectId: "springboard-capstone1",
  storageBucket: "springboard-capstone1.appspot.com",
  messagingSenderId: "44964189207",
  appId: "1:44964189207:web:fa12990c8486415f057852",
  measurementId: "G-P2JGMFH9W9"
};
export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
