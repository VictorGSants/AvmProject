import { useParams } from "react-router-dom";
import { useContrato } from "../context/ContratoContext";

export default function useContratoAtual() {

    const { contratoId: contratoContext } = useContrato();
    const { contratoId: contratoParam } = useParams();

    const contratoFinal = contratoParam || contratoContext;

    // ⚠️ valida DEPOIS de criar
    if (!contratoFinal) {
        console.error("Contrato não encontrado!");
        return null; // NÃO joga erro ainda
    }

    return contratoFinal;
}
