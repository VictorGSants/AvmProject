"""
Exclui manutencoes de uma data especifica, em todos os equipamentos
do contrato empresas/A.V.M-AR-CAMPINAS/contratos/PhotoUnicamp/equipamentos/*/manutencoes.

Uso:
    python excluir_manutencoes_por_data.py 09/04/2026            # dry-run: so lista o que seria apagado
    python excluir_manutencoes_por_data.py 09/04/2026 --confirmar  # apaga de verdade

Pode passar mais de uma data separadas por virgula:
    python excluir_manutencoes_por_data.py 09/04/2026,10/04/2026 --confirmar
"""

import sys
from datetime import datetime

import firebase_admin
from firebase_admin import credentials, firestore

EMPRESA_ID = "A.V.M-AR-CAMPINAS"
CONTRATO_ID = "PhotoUnicamp"


def parse_datas(arg: str) -> set[str]:
    datas = set()
    for parte in arg.split(","):
        parte = parte.strip()
        if not parte:
            continue
        try:
            d = datetime.strptime(parte, "%d/%m/%Y").date()
        except ValueError:
            raise SystemExit(f"Data invalida: '{parte}'. Use o formato dd/mm/aaaa.")
        datas.add(d)
    if not datas:
        raise SystemExit("Nenhuma data informada.")
    return datas


def data_do_documento(dados: dict):
    raw = dados.get("data")
    if raw is None:
        return None
    if hasattr(raw, "date"):
        return raw.date()
    if isinstance(raw, str):
        try:
            return datetime.fromisoformat(raw.replace("Z", "")).date()
        except ValueError:
            return None
    return None


def main():
    if len(sys.argv) < 2:
        raise SystemExit(__doc__)

    datas_alvo = parse_datas(sys.argv[1])
    confirmar = "--confirmar" in sys.argv[2:]

    cred = credentials.Certificate("serviceAccountKey.json")
    firebase_admin.initialize_app(cred)
    db = firestore.client()

    contrato_ref = (
        db.collection("empresas")
        .document(EMPRESA_ID)
        .collection("contratos")
        .document(CONTRATO_ID)
    )

    equipamentos = list(contrato_ref.collection("equipamentos").stream())
    print(f"Encontrados {len(equipamentos)} equipamentos em {CONTRATO_ID}.")

    encontrados = []
    for equip in equipamentos:
        manutencoes_ref = equip.reference.collection("manutencoes")
        for manut in manutencoes_ref.stream():
            dados = manut.to_dict()
            data_doc = data_do_documento(dados)
            if data_doc in datas_alvo:
                encontrados.append((equip, manut, data_doc))

    if not encontrados:
        print("Nenhuma manutencao encontrada para a(s) data(s) informada(s).")
        return

    print(f"\n{len(encontrados)} manutencao(oes) encontrada(s) para {sorted(d.strftime('%d/%m/%Y') for d in datas_alvo)}:\n")
    for equip, manut, data_doc in encontrados:
        equip_dados = equip.to_dict()
        nome_equip = equip_dados.get("codigo") or equip_dados.get("nome") or equip.id
        print(f"  equipamento={nome_equip} ({equip.id})  manutencao={manut.id}  data={data_doc.strftime('%d/%m/%Y')}")

    if not confirmar:
        print("\nModo simulacao (dry-run). Nada foi apagado.")
        print("Revise a lista acima e rode novamente com --confirmar para excluir de verdade.")
        return

    print("\nExcluindo...")
    apagados = 0
    for equip, manut, _ in encontrados:
        manut.reference.delete()
        apagados += 1
    print(f"{apagados} manutencao(oes) excluida(s) com sucesso.")


if __name__ == "__main__":
    main()
