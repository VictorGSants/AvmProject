from firebase_admin import credentials, firestore, initialize_app

cred = credentials.Certificate("serviceAccountKey.json")
initialize_app(cred)

db = firestore.client()

equipamentos_antigos = db.collection("equipamentos").stream()

empresa_id = "A.V.M-AR-CAMPINAS"
contrato_id = "piracicaba"

for equip in equipamentos_antigos:
    dados = equip.to_dict()

    db.collection("empresas")\
      .document(empresa_id)\
      .collection("contratos")\
      .document(contrato_id)\
      .collection("equipamentos")\
      .document(equip.id)\
      .set(dados)

print("Migração finalizada 🚀")
