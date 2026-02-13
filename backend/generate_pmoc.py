import os
import io
from datetime import datetime
from dotenv import load_dotenv
from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
import firebase_admin
from firebase_admin import credentials, firestore
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate,
    Table,
    TableStyle,
    Paragraph,
    Spacer
)
from reportlab.platypus import PageBreak



from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle 


# ----------------- CONFIG -----------------
load_dotenv()
SERVICE_ACCOUNT = os.getenv("FIREBASE_SERVICE_ACCOUNT", "serviceAccountKey.json")
HOSPITAL_NAME = os.getenv("PMOC_CLIENT", "Hospital (sem nome)")
EMPRESA = os.getenv("PMOC_EMPRESA", "AVM AR CAMPINAS")
TECNICO_PADRAO = os.getenv("PMOC_TECNICO", "André")
PERIODO_INICIAL = os.getenv("PMOC_START", "Novembro")
ANOS = os.getenv("PMOC_ANOS", "2025/2026")
LOGO_EMPRESA = os.getenv("LOGO_EMPRESA", "")
LOGO_CLIENTE = os.getenv("LOGO_CLIENTE", "")
RESPONSAVEL_CONTRATO = os.getenv("PMOC_RESPONSAVEL_CONTRATO", "Responsável do Cliente")
from fastapi import HTTPException
from reportlab.lib.enums import TA_CENTER


# Caminho para o arquivo PDF estático (Capa, TRT, etc.)
STATIC_TRT_PATH = os.path.join(os.path.dirname(__file__), "capa_e_trt_estatico.pdf")




def gerar_capa(elements, contrato):

    styles = getSampleStyleSheet()

    centered = ParagraphStyle(
        "center",
        parent=styles["Title"],
        alignment=TA_CENTER
    )

    elements.append(Spacer(1, 120))

    elements.append(Paragraph(
        "<b>PLANO DE MANUTENÇÃO, OPERAÇÃO E CONTROLE</b>",
        centered
    ))

    elements.append(Spacer(1, 40))

    elements.append(Paragraph(
        f"<b>Empresa:</b> {contrato.get('empresa_nome','-')}",
        styles["Normal"]
    ))

    elements.append(Paragraph(
        f"<b>CNPJ:</b> {contrato.get('cnpj','-')}",
        styles["Normal"]
    ))

    elements.append(Paragraph(
        f"<b>Endereço:</b> {contrato.get('endereco','-')}",
        styles["Normal"]
    ))

    elements.append(Spacer(1, 60))

    elements.append(Paragraph(
        f"<b>Contrato Nº:</b> {contrato.get('numero','-')}",
        styles["Heading2"]
    ))

    elements.append(Spacer(1, 200))

    elements.append(Paragraph(
        "Responsável Técnico",
        centered
    ))

    elements.append(PageBreak())

def gerar_crt(elements, contrato):

    styles = getSampleStyleSheet()

    elements.append(Paragraph(
        "<b>CERTIFICADO DE RESPONSABILIDADE TÉCNICA</b>",
        styles["Title"]
    ))

    elements.append(Spacer(1, 30))

    texto = f"""
    Declaramos que o engenheiro <b>{contrato.get('engenheiro')}</b>,
    registro <b>{contrato.get('crea')}</b>, é o responsável técnico
    pelo PMOC desta instalação.
    """

    elements.append(Paragraph(texto, styles["Normal"]))

    elements.append(Spacer(1, 100))

    elements.append(Paragraph(
        "_____________________________________<br/>Assinatura do Responsável",
        styles["Normal"]
    ))

    elements.append(PageBreak())




# ----------------- FIREBASE ADMIN -----------------
if not firebase_admin._apps:
    if os.path.exists(SERVICE_ACCOUNT):
        try:
            cred = credentials.Certificate(SERVICE_ACCOUNT)
            firebase_admin.initialize_app(cred)
            db = firestore.client()
        except Exception as e:

            print(f"Erro ao inicializar o Firebase: {e}")
            db = None # Garante que db seja None em caso de falha
    else:
        print(f"Arquivo de conta de serviço não encontrado em: {SERVICE_ACCOUNT}")
        db = None
else:
    db = firestore.client()

print(firebase_admin.get_app().project_id)


# ----------------- FASTAPI -----------------
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- CHECKLISTS E PERIODOS -----------------
# Formato: ("Item", "Período/Frequência (M, T, S, A)")
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

DEFAULT_CHECKLIST = [("Inspeção geral", "M"), ("Limpeza / Verificação", "M")]

# ----------------- HELPERS -----------------
def month_headers_starting_nov():
    # Novembro 2025 a Outubro 2026 (12 meses)
    return ["Nov", "Dez", "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out"]

def get_checklist_for_equipment(equip):
    nome = (equip.get("nome") or "").upper()
    modelo = (equip.get("modelo") or "").upper()
    tipo = (equip.get("tipo") or "").upper()
    texto = nome + modelo + tipo

    if "SPLITAO" in texto:
        return CHECKLISTS["SPLITAO"]
    
    if "CASSETE" in texto or "K7" in texto:
        return CHECKLISTS["CASSETE/K7"]
    
    if "SPLIT" in texto:
        return CHECKLISTS["SPLIT"]

    for key in CHECKLISTS:
        if key in ["SPLIT", "SPLITAO", "CASSETE/K7", "DUTO", "VENTILADOR", "EXAUSTOR"]:
            continue
        if key in texto:
            return CHECKLISTS[key]

    if "EXAUSTOR" in texto or "EXAUST" in texto:
        return CHECKLISTS["EXAUSTOR"]
    
    if "VENTILADOR" in texto or "VENTIL" in texto:
        return CHECKLISTS["VENTILADOR"]
    
    if "DUTO" in texto:
        return DEFAULT_CHECKLIST

    return DEFAULT_CHECKLIST

def safe_text(s): return "" if s is None else str(s)


    # ----------------- GERAR MIOLO DO PDF -----------------

def gerar_miolo(elements, equipamentos):

    styles = getSampleStyleSheet()

    elements.append(Paragraph(
        "<b>LISTAGEM DE EQUIPAMENTOS</b>",
        styles["Title"]
    ))

    elements.append(Spacer(1, 20))

    header = ["Código", "Nome", "Local"]

    data = [header]

    for e in equipamentos:
        data.append([
            safe_text(e.get("codigo")),
            safe_text(e.get("nome")),
            safe_text(e.get("local")),
        ])

    tabela = Table(data, colWidths=[80, 200, 200])

    tabela.setStyle(TableStyle([
        ("GRID", (0,0), (-1,-1), 0.8, colors.black),
        ("BACKGROUND", (0,0), (-1,0), colors.lightgrey),
        ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"),
    ]))

    elements.append(tabela)


# ----------------- PDF generation (MIOLO) -----------------


def buscar_contrato(empresa_id, contrato_id):
    print("Empresa:", empresa_id)
    print("Contrato:", contrato_id)


    doc = (
        db.collection("empresas")
        .document(empresa_id)
        .collection("contratos")
        .document(contrato_id)
        .get()
    )

    if not doc.exists:
        raise HTTPException(
            status_code=404,
            detail="Contrato não encontrado"
)

    return doc.to_dict()


# ----------------- FUNÇÃO DE BUSCA DE DADOS COM TRATAMENTO DE SUB-COLEÇÃO (CORRIGIDO) -----------------

async def buscar_equipamentos_contrato(empresa_id, contrato_id):

    if db is None:
        raise ConnectionError("Erro na conexão com Firestore")

    # 👉 PRIMEIRO pegue a COLLECTION (SEM order_by)
    equipamentos_ref = (
        db.collection("empresas")
        .document(empresa_id)
        .collection("contratos")
        .document(contrato_id)
        .collection("equipamentos")
    )

    # 👉 AQUI você cria a query ordenada
    query = equipamentos_ref.order_by("bloco").order_by("codigo")

    equipamentos = []

    for doc in query.stream():

        equip = doc.to_dict()
        equip["id_documento"] = doc.id

        # 🔥 AGORA FUNCIONA — porque estamos usando a COLLECTION
        manut_stream = (
            equipamentos_ref
            .document(doc.id)
            .collection("manutencoes")
            .stream()
        )

        equip["manutencoes"] = [
            {**m.to_dict(), "id": m.id}
            for m in manut_stream
        ]

        equipamentos.append(equip)

    return equipamentos


    # ----------------- GERAR PMOC COMPLETO -----------------

def gerar_pmoc_bytes(contrato, equipamentos):

    buffer = io.BytesIO()

    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=30,
        leftMargin=30,
        topMargin=30,
        bottomMargin=30
    )

    elements = []

    # CAPA
    gerar_capa(elements, contrato)

    # CRT
    gerar_crt(elements, contrato)

    # MIOLO
    gerar_miolo(elements, equipamentos)

    doc.build(elements)

    pdf = buffer.getvalue()
    buffer.close()

    return pdf

async def gerar_pmoc_contrato(empresa_id, contrato_id):

    contrato = buscar_contrato(empresa_id, contrato_id)

    equipamentos = await buscar_equipamentos_contrato(
        empresa_id,
        contrato_id
    )

    return gerar_pmoc_bytes(
        contrato,
        equipamentos
    )



@app.get("/pmoc/{empresa_id}/{contrato_id}")
async def gerar_pmoc_profissional(
    empresa_id: str,
    contrato_id: str
):

    try:

        pdf_bytes = await gerar_pmoc_contrato(
            empresa_id,
            contrato_id
        )

        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition":
                f'attachment; filename=PMOC_{contrato_id}.pdf'
            }
        )

    except Exception as e:

        print("ERRO PMOC:", e)

        return Response(
            content="Erro ao gerar PMOC",
            status_code=500
        )
