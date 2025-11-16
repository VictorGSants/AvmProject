import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "/firebaseConfig";
import { useParams } from "react-router-dom";

export default function VerOsGestor() {
  const { osId } = useParams(); // vem da URL, tipo /ver-os/123
  const [osData, setOsData] = useState(null);

  useEffect(() => {
    if (!osId) return; // evita erro enquanto o ID ainda não chegou

    const unsub = onSnapshot(doc(db, "ordensServico", osId), (snapshot) => {
      if (snapshot.exists()) {
        setOsData(snapshot.data());
      } else {
        console.log("OS não encontrada");
      }
    });

    return () => unsub();
  }, [osId]);

  if (!osData) return <p>Carregando OS...</p>;

  return (
    <div>
      <h2>Ordem de Serviço #{osId}</h2>
      <p><strong>Cliente:</strong> {osData.nomeCliente}</p>
      <p><strong>Endereço:</strong> {osData.enderecoCliente}</p>
      <p><strong>Técnico:</strong> {osData.tecnicoNome}</p>
      <p><strong>Status:</strong> {osData.status}</p>
    </div>
  );
}
