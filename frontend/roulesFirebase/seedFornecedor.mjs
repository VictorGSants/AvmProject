import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const serviceAccount = require("./serviceAccountKey.json");

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

const EMPRESA_ID = "A.V.M-AR-CAMPINAS";

const fornecedor = {
  nome:  "Uniar Comércio de Eletro-Eletrônicos e Serviços LTDA",
  cnpj:  "18.928.807/0001-54",
  banco: "Itaú · Ag. 5589 · CC 12388-3",
};

const ref = db.collection("empresas").doc(EMPRESA_ID).collection("fornecedores");
const doc = await ref.add(fornecedor);
console.log("Fornecedor cadastrado! ID:", doc.id);
process.exit(0);
