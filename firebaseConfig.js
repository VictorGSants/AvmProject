import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

import { ENV } from "./firebaseEnv";
import { firebaseConfigDev } from "./firebaseConfig.dev";
import { firebaseConfigProd } from "./firebaseConfig.prod";

const config = ENV === "dev" ? firebaseConfigDev : firebaseConfigProd;

const app = initializeApp(config);

export const auth = getAuth(app);
export const db = getFirestore(app);
