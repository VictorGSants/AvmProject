import { collection, doc, setDoc, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";

/**
 * RESET DO PMOC
 * - Não apaga manutenções antigas
 * - Cria um novo ciclo mensal
 * - Marca o mês como “pendente”
 * - Cada equipamento recebe:
 *    equipamentos/{id}/pmocStatus/{anoMes}
 */
export async function resetPMOC(novoMes, novoAno) {
  try {
    if (!novoMes || !novoAno) {
      throw new Error("É necessário informar mês e ano para resetar o PMOC.");
    }

    const formatado = `${String(novoMes).padStart(2, "0")}-${novoAno}`;

    // busca todos os equipamentos
    const snap = await getDocs(collection(db, "equipamentos"));

    const promessas = [];

    snap.forEach((docSnap) => {
      const eqID = docSnap.id;

      // caminho da subcoleção pmocStatus
      const ref = doc(
        db,
        "equipamentos",
        eqID,
        "pmocStatus",
        formatado // exemplo: "11-2024"
      );

      // cria documento novo sem apagar nada antigo
      promessas.push(
        setDoc(
          ref,
          {
            mes: novoMes,
            ano: novoAno,
            status: "pendente",
            criadoEm: new Date(),
          },
          { merge: true }
        )
      );
    });

    await Promise.all(promessas);

    return { ok: true, message: `PMOC reiniciado para ${formatado}` };
  } catch (error) {
    console.error("Erro ao resetar PMOC:", error);
    return { ok: false, error };
  }
}
