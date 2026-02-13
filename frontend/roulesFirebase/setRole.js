import admin from "firebase-admin";
import { readFileSync } from "fs";

// Caminho para o seu arquivo de chave privada do Firebase Admin SDK
const serviceAccount = JSON.parse(
  readFileSync(new URL("./serviceAccountKey.json", import.meta.url), "utf8")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Defina aqui o UID e o role que deseja aplicar
const uid = "Roq8gKtJv1P5aWgdBBpKVk4X3Gv2";
const role = "gestor"; // ou "tecnico"

async function setUserRole() {
  try {
    await admin.auth().setCustomUserClaims(uid, { role });
    console.log(`Role '${role}' atribuído ao usuário: ${uid}`);
  } catch (error) {
    console.error("Erro ao definir role:", error);
  }
}

setUserRole();
