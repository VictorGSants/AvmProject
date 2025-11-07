import { initializeApp } from "firebase/app"   
import { getAuth } from "firebase/auth" 
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBgjmncI7-PoF-DLp5kEaapH4UvTy33W6Y",
    authDomain: "avmproject-6e6b1.firebaseapp.com",
    projectId: "avmproject-6e6b1",
    storageBucket: "avmproject-6e6b1.firebasestorage.app",
    messagingSenderId: "237548878793",
    appId: "1:237548878793:web:41e3af9fdd898caa51c618"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app)
export const db = getFirestore(app)
