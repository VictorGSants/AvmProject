import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const serviceAccount = require("./serviceAccountKey.json");

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

const EMPRESA_ID = "A.V.M-AR-CAMPINAS";

const fornecedor = {
  nome:     "Refrigeração Dufrio Comércio e Importação S.A.",
  cnpj:     "01.754.239/0018-68",
  ie:       "083068252",
  endereco: "Rodovia Darly Santos, 800 – Lote 1-B – Jardim Asteca – Vila Velha/ES",
  vendedor: "Matheus Henrique de Oliveira",
};

const ref = db.collection("empresas").doc(EMPRESA_ID).collection("fornecedores");
const doc = await ref.add(fornecedor);
console.log("Fornecedor cadastrado! ID:", doc.id);
process.exit(0);
