

CHECKLISTS = {
    "SPLIT": [
        ("Verificar, limpar filtros", "M"),
        ("Verificar e reapertar parafusos dos bornes eletricos", "M"),
        ("Verificar , limpar carenagem", "M"),
        ("Verificar, limpar bandeja de condensado e tubo de drenagem", "M"),
        ("Verificar ruido, vibração ou aquecimento excessivo", "M"),
        ("Aplicar agente bactericida", "M"),
        ("Verificar temp. Insulflamento", "M"),
        ("Verificar temperatura Retorno", "M"),
        ("Verificar se há vazamentos de gas ", "M"),
        ("Medir corrente em carga", "M"),
        ("Medir Voltagem ", "M"),
        ("Verificar estado dos disjuntores instaladoss", "M"),
        ("Efetuar testes de funcionamento", "M"),
        ("Verificar , limpar turbina", "S"),
        ("Verificar, limpar serpentina", "S"),
        ("Verificar isolamentos térmicos ", "S"),
        ("Verificar, limpar unidade condensadora externa", "S")
        
    ],
    "CASSETE/K7": [
        ("Verificar, limpar filtros", "M"),
        ("Verificar e reapertar parafusos dos bornes eletricos", "M"),
        ("Verificar , limpar carenagem", "M"),
        ("Verificar, limpar bandeja de condensado e tubo de drenagem", "M"),
        ("Verificar ruido, vibração ou aquecimento excessivo", "M"),
        ("Aplicar agente bactericida", "M"),
        ("Verificar temp. Insulflamento", "M"),
        ("Verificar temperatura Retorno", "M"),
        ("Verificar se há vazamentos de gas ", "M"),
        ("Medir corrente em carga", "M"),
        ("Medir Voltagem ", "M"),
        ("Verificar estado dos disjuntores instaladoss", "M"),
        ("Efetuar testes de funcionamento", "M"),
        ("Verificar , limpar turbina", "S"),
        ("Verificar, limpar serpentina", "S"),
        ("Verificar isolamentos térmicos ", "S"),
        ("Verificar funcionamento da bomba de drenagem ", "S"),
        ("Verificar, limpar unidade condensadora externa", "S"),
    ],
    "PISO-TETO": [
        ("Verificar, limpar filtros", "M"),
        ("Verificar e reapertar parafusos dos bornes eletricos", "M"),
        ("Verificar , limpar carenagem", "M"),
        ("Verificar, limpar bandeja de condensado e tubo de drenagem", "M"),
        ("Verificar ruido, vibração ou aquecimento excessivo", "M"),
        ("Aplicar agente bactericida", "M"),
        ("Verificar temp. Insulflamento", "M"),
        ("Verificar temperatura Retorno", "M"),
        ("Verificar se há vazamentos de gas ", "M"),
        ("Medir corrente em carga", "M"),
        ("Medir Voltagem ", "M"),
        ("Verificar estado dos disjuntores instaladoss", "M"),
        ("Efetuar testes de funcionamento", "M"),
        ("Verificar , limpar turbina", "A"),
        ("Verificar, limpar serpentina", "A"),
        ("Verificar isolamentos térmicos ", "A"),
        ("Verificar, limpar unidade condensadora externa", "A"),
    ],

    "SPLITAO": [
        # Atividades Mensais (M)
        ("Verificar estado dos filtros de ar. Substituir se necessário", "M"),
        ("Limpar o filtro de ar", "M"),
        ("Verificar Tensão elétrica", "M"),
        ("Verificar Corrente elétrica", "M"),
        ("Verificar acionamento do termostato", "M"),
        ("Verificar se todas as funções estão operando", "M"),
        ("Limpeza da bandeja de dreno e funcionamento do sistema", "M"),
        ("Verificar Correias do ventilador e substituir caso necessario","M"),

        # Atividades Trimestrais (T) ou Inspeções Aprofundadas

        ("Verificar o funcionamento dos dispositivos de proteção", "T"),
        ("Efetuar reaperto dos conectores elétricos", "T"),
        ("Verificar e corrigir, o isolamento das linhas frigorígenas", "T"),
        ("Verificar circuitos para localização e eliminação de vazamentos", "T"),
        ("Verificar pressões de funcionamento (Alta)", "T"),
        ("Verificar pressões de funcionamento (Baixa)", "T"),
        
        # Atividades Semestrais (S) - Limpeza/Tratamento
        ("Lavar a serpentina da unidade evaporadora", "S"),
        ("Lavar a Unidade Condensadora (Externa)", "S"), 
        ("Verificar motor, rotor e polias", "S"),
        ("Verificação isolamentos eletricos motores e compressores", "A"),
    ],
    "FANCOIL": [
        ("Verificar a temperatura de entrada e saida de rede de água","M"),
        ("Verificar temperatura de insuflamento, retorno e do ambiente.","M"),
        ("Verificar pressão de entrada e saida de água gelada","M"),
        ("Limpeza da bandeja de dreno e funcionamento do sistema", "M"),
        ("Checar serpentina (limpeza superficial)", "M"),
        ("Verificar ruídos e vibrações anormais do equipamento","M"),
        ("Realizar Limpeza da casa de maquinas", "M"),
        ("Revisar Correias do ventilador e substituir caso necessario","M"),
        ("Verificar motor, rotor e polias", "M"),
        ("Substituição do filtro de ar ou limpeza do mesmo", "M"),
        ("Substituição do filtro plissado", "M"),
        ("Limpeza grelhas e difusores.", "T"),
        ("Realizar Limpeza da serpentina", "T"),
        ("Realizar Limpeza do rotor", "T"),
        ("Verificar funcionamento de atuadores, valvulas e registros","T"),
        ("Inspeção elétrica e automação", "T"),
        ("Verificar isolamento mecânico e vazamentos de água", "T"),
        ("Realizar limpeza do filtro Y da tubulação de água gelada.","S"),
        ("Substituição do filtro bolsa", "S"),
        ("Substituição do filtro HEPA", "A"),
        ("Verificação isolamentos eletricos motores e compressores", "A"),
    ],
    "FANCOLETE": [
        ("Verificar temperatura de insuflamento, retorno e do ambiente.","M"),
        ("Limpeza da bandeja de dreno e funcionamento do sistema", "M"),
        ("Checar serpentina (limpeza superficial)", "M"),
        ("Verificar ruídos e vibrações anormais do equipamento","M"),
        ("Substituição do filtro de ar ou limpeza do mesmo", "M"),
        ("Limpeza grelhas e difusores.", "S"),
        ("Realizar Limpeza da serpentina", "S"),
        ("Verificar funcionamento de atuadores, valvulas e registros","S"),
        ("Inspeção elétrica e automação", "S"),
        ("Verificar isolamento mecânico e vazamentos de água", "S"),
        ("Realizar limpeza do filtro Y da tubulação de água gelada.","S"),
    ],
    "CHILLER": [
    # Mensal (M) - 12x ao ano
        
        ("Limpar o filtro de ar", "M"),
        ("Análise de vibração e ruído", "M"),
        ("Verificar se todas as funções estão operando", "M"),
        # Trimestral (T) - 4x ao ano
        ("Lavar a serpentina da unidade condensadora", "S"),
        ("Checar óleo, rolamentos e vazamentos de refrigerante", "A"),
        ("Verificar o funcionamento dos dispositivos de proteção", "A"),
        ("Efetuar reaperto dos conectores elétricos", "A"),
        ("Vistoriar e corrigir, o isolamento das linhas frigorígenas", "A"),
        ("Vistoriar circuitos para localização e eliminação de vazamentos", "A"),
        ("Inspeção das bombas, selos e acoplamentos", "A"),
        ("Inspeção elétrica/automação e painel de comando", "A"),
        ("Verificar Tensão elétrica", "A"),
        ("Verificar Corrente elétrica", "A"),
        # Anual (A) - 1x ao ano 
        ("Verificar se existe superaquecimento de cabos ou conectores.", "A"),
        ("Verificar a isolação elétrica de motores e compressores", "A"),
    ],
    "CAMARA FRIA": [
        ("Verificar vedação das portas e isolamento", "A"),
        ("Checar sensores/temperatura e controle", "A"),
        ("Limpeza das serpentinas e bandejas", "A"),
        ("Verificar isolamento e iluminação interna", "A"),
        ("Inspeção elétrica e degelo", "A"),
        ("Revisão sistema elétrico", "A"),
        ("Testar e regular ponto de ação do termostato de comando", "A"),
        ("Observar e corrigir ruidos anormais", "A"),
        ("Inspeção elétrica", "A"),
    ],
    "EXAUSTOR": [
        ("Verificação e troca da correira", "M"),
        ("Limpeza do rotor e motor", "S"),
        ("Inspeção elétrica", "S"),
        ("Verificar rolamentos, buchas e eixos", "S"),
        ("Checar balanceamento e fixação", "S"),
        ("Lubrificação do rolamento", "S"),
    ],
    "VENTILADOR": [
        ("Troca do filtro manta", "M"),
        ("Verificação e troca da correira", "M"),
        ("Verificar rolamentos, buchas e eixos", "S"),
        ("Checar balanceamento e fixação", "S"),
        ("Limpeza do rotor e motor", "S"),
        ("Lubrificação do rolamento", "S"),
        ("Inspeção elétrica", "S"),
        ("Troca do filtro HEPA", "A"),
        ],
    
    "LAVADORA DA COIFA": [
        ("Verificação e troca da correia","M"),
        ("Verificar bombas, filtros e dreno", "M"),
        ("Checar drenagem, boias e nível de água", "M"),
        ("Substituição do filtro bolsa", "S"),
        ("Substituição do filtro HEPA", "S"),
        ("Limpeza módulos de lavagem, bicos e eliminadores de gotas", "S"),
        ("Verificar motor, rotor e polias", "S"),
    ],
}

import os
import io
from datetime import datetime
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
import firebase_admin
from firebase_admin import credentials, firestore
from jinja2 import Environment, FileSystemLoader
from weasyprint import HTML
# IMPORTANTE: Instale com pip install PyPDF2
from PyPDF2 import PdfMerger, PdfReader 

# ----------------- CONFIGURAÇÃO -----------------
load_dotenv()

# Inicializa Firebase
SERVICE_ACCOUNT = os.getenv("FIREBASE_SERVICE_ACCOUNT", "serviceAccountKey.json")
if not firebase_admin._apps:
    cred = credentials.Certificate(SERVICE_ACCOUNT)
    firebase_admin.initialize_app(cred)
db = firestore.client()

app = FastAPI()
app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"],
)

# Configuração do Template (Jinja2)
env = Environment(loader=FileSystemLoader('templates'))

# --- SEU DICIONÁRIO CHECKLISTS AQUI ---
CHECKLISTS = {                
    "SPLIT": [("Limpar filtros", "M"), ("Verificar dreno", "M")],
    # ... cole o restante do seu dicionário aqui
}
def get_checklist_for_equipment(equip_dict):
    """Retorna a lista de tarefas baseada no nome/tipo do equipamento"""
    tipo = str(equip_dict.get("tipo", "")).upper()
    nome = str(equip_dict.get("nome", "")).upper()
    texto_busca = f"{tipo} {nome}"
    for key, tasks in CHECKLISTS.items():
        if key in texto_busca:
            return tasks
    return [("Inspeção Geral", "M")] # Fallback

# ----------------- LÓGICA DE DADOS -----------------

def get_meses_header():
    return ["Nov", "Dez", "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out"]

def processar_dados_pmoc(empresa_id, contrato_id):
    """
    Busca dados no Firestore e prepara estrutura para o HTML
    """
    # 1. Buscar Contrato com a sua estrutura de caminho
    # empresa_id será "A.V.M-AR-CAMPINAS"
    # contrato_id será "piracicaba"
    contrato_ref = db.collection("empresas").document(empresa_id)\
                     .collection("contratos").document(contrato_id)
    contrato_doc = contrato_ref.get()
    
    if not contrato_doc.exists:
        raise HTTPException(404, "Contrato não encontrado")
    
    contrato_data = contrato_doc.to_dict()
    
    # Adicione campos fallback caso não existam no banco
    contrato_data.setdefault('cliente_nome', 'Cliente Sem Nome')
    contrato_data.setdefault('endereco', 'Endereço não cadastrado')

    # 2. Buscar Equipamentos (subcoleção dentro do contrato)
    equipamentos = []
    equips_ref = contrato_ref.collection("equipamentos").order_by("codigo").stream()

    meses_map = {
        1: "Jan", 2: "Fev", 3: "Mar", 4: "Abr", 5: "Mai", 6: "Jun",
        7: "Jul", 8: "Ago", 9: "Set", 10: "Out", 11: "Nov", 12: "Dez"
    }

    for doc in equips_ref:
        eq = doc.to_dict()
        eq['id'] = doc.id
        
        # Buscar Logs de Manutenção (Subcoleção dentro de cada equipamento)
        logs_ref = contrato_ref.collection("equipamentos").document(doc.id)\
                               .collection("manutencoes").order_by("data", direction=firestore.Query.DESCENDING)
        
        lista_logs = []
        meses_com_manutencao = set()

        for log in logs_ref.stream():
            d = log.to_dict()
            data_obj = d.get('data') 
            if data_obj:
                d['data_formatada'] = data_obj.strftime("%d/%m/%Y")
                mes_sigla = meses_map.get(data_obj.month)
                if mes_sigla:
                    meses_com_manutencao.add(mes_sigla)
            
            lista_logs.append(d)

        eq['manutencoes'] = lista_logs

        # PROCESSAR CHECKLIST
        checklist_padrao = get_checklist_for_equipment(eq)
        
        tasks_processadas = []
        for descricao, freq in checklist_padrao:
            task_info = {
                "desc": descricao,
                "freq": freq,
                "meses_feitos": [] 
            }
            
            for mes in get_meses_header():
                if mes in meses_com_manutencao:
                    task_info["meses_feitos"].append(mes)
            
            tasks_processadas.append(task_info)
        
        eq['tasks_processadas'] = tasks_processadas
        equipamentos.append(eq)

    return contrato_data, equipamentos

# ----------------- FUSÃO DE PDFS (NOVO) -----------------
def mesclar_pdfs(miolo_pdf_bytes, caminho_capa_trt):
    merger = PdfMerger()
    
    # 1. Adiciona a capa estática se o arquivo existir
    if caminho_capa_trt and os.path.exists(caminho_capa_trt):
        merger.append(PdfReader(open(caminho_capa_trt, 'rb')))
    
    # 2. Adiciona o miolo gerado dinamicamente
    merger.append(io.BytesIO(miolo_pdf_bytes))
    
    output = io.BytesIO()
    merger.write(output)
    merger.close()
    return output.getvalue()

# ----------------- ENDPOINT -----------------

@app.get("/pmoc-pdf/{empresa_id}/{contrato_id}")
def gerar_pdf(empresa_id: str, contrato_id: str):
    try:
        # 1. Busca e Processa Dados do Firestore
        contrato, equipamentos = processar_dados_pmoc(empresa_id, contrato_id)
        
        # 2. Renderiza HTML do Miolo com Jinja2
        template = env.get_template('pmoc.html')
        html_content = template.render(
            contrato=contrato,
            equipamentos=equipamentos,
            meses_header=get_meses_header(),
            tecnico=os.getenv("PMOC_TECNICO", "André Técnico"),
            empresa_nome=os.getenv("PMOC_EMPRESA", "AVM AR CAMPINAS"),
            anos="2025/2026",
            logo_cliente=os.getenv("LOGO_CLIENTE", "")
        )
        
        # 3. Converte HTML para PDF (Miolo)
        miolo_bytes = HTML(string=html_content).write_pdf()
        
        # 4. Mescla com a Capa/TRT específica do contrato
        # O caminho do PDF da capa deve estar salvo no Firestore no documento do contrato
        caminho_capa = contrato.get('caminho_capa_trt') 
        pdf_final_bytes = mesclar_pdfs(miolo_bytes, caminho_capa)
        
        return Response(
            content=pdf_final_bytes, 
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=PMOC_{contrato_id}.pdf"}
        )

    except Exception as e:
        print(f"Erro: {e}")
        return Response(content=f"Erro interno: {str(e)}", status_code=500)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)