import { openDB } from "idb";

const DB_NAME = "avm-offline";
const STORE = "fotosPendentes";

function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      db.createObjectStore(STORE, { keyPath: "localId" });
    },
  });
}

export async function salvarPendente(item) {
  const db = await getDB();
  await db.put(STORE, item);
}

export async function listarPendentes() {
  const db = await getDB();
  return db.getAll(STORE);
}

export async function removerPendente(localId) {
  const db = await getDB();
  await db.delete(STORE, localId);
}
