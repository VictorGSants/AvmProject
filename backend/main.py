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

def get_checklist_for_equipment(equip_dict):
    """Retorna a lista de tarefas baseada no nome/tipo do equipamento"""
    tipo = str(equip_dict.get("tipo", "")).upper()
    nome = str(equip_dict.get("nome", "")).upper()
    texto_busca = f"{tipo} {nome}"
    for key, tasks in CHECKLISTS.items():
        if key in texto_busca:
            return tasks
    return [("Inspeção Geral", "M")] # Fallback

from datetime import datetime
def get_meses_nomes():
    return ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]

def gerar_header_dinamico(mes_inicio):
    """Cria a lista de meses começando pelo mês de início do contrato."""
    nomes_base = get_meses_nomes()
    header_nomes = []
    header_nums = []
    for i in range(12):
        idx = (mes_inicio - 1 + i) % 12
        header_nomes.append(nomes_base[idx])
        header_nums.append(idx + 1)
    return header_nomes, header_nums

def calcular_marcao_automatica(freq, indice_coluna):
    # No primeiro mês (índice 0), marca tudo
    if indice_coluna == 0: return True
    
    if freq == "M": return True
    if freq == "T": return indice_coluna % 3 == 0
    if freq == "S": return indice_coluna % 6 == 0
    if freq == "A": return indice_coluna % 12 == 0
    return False
from datetime import datetime
import locale

try:
    locale.setlocale(locale.LC_TIME, 'pt_BR.UTF-8')
except:
    pass

def processar_dados_pmoc(empresa_id, contrato_id):
    contrato_ref = db.collection("empresas").document(empresa_id).collection("contratos").document(contrato_id)
    contrato_doc = contrato_ref.get()
    
    if not contrato_doc.exists:
        raise HTTPException(404, "Contrato não encontrado")
    
    contrato_data = contrato_doc.to_dict()
    
    # --- 1. DATAS ---
    mes_inicio_num = int(contrato_data.get('mes_inicio', 1)) 
    ano_contrato = int(contrato_data.get('ano', datetime.now().year))
    
    # Resolve ano de início
    if mes_inicio_num > 1: 
        ano_inicio_ciclo = ano_contrato - 1
    else:
        ano_inicio_ciclo = ano_contrato

    header_nomes, header_nums = gerar_header_dinamico(mes_inicio_num)
    contrato_data['header_meses'] = header_nomes 

    # Referência do momento atual
    hoje = datetime.now()
    data_atual_referencia = hoje.year * 100 + hoje.month # 202603 para Março de 2026

    equipamentos = []
    equips_ref = contrato_ref.collection("equipamentos").order_by("codigo").stream()

    for doc in equips_ref:
        eq = doc.to_dict()
        eq_id = doc.id
        
        # --- 2. HISTÓRICO (Mantém igual, só pra exibir lá em baixo) ---
        logs = contrato_ref.collection("equipamentos").document(eq_id).collection("manutencoes").order_by("data", direction=firestore.Query.DESCENDING).stream()
        lista_historico = []

        for l in logs:
            d = l.to_dict()
            raw_date = d.get('data')
            data_obj = None
            if raw_date:
                if hasattr(raw_date, 'date'):
                    data_obj = raw_date
                elif isinstance(raw_date, str):
                    try:
                        data_obj = datetime.fromisoformat(raw_date.replace('Z', ''))
                    except:
                        pass
            
            if data_obj:
                lista_historico.append({
                    "data_formatada": data_obj.strftime("%d/%m/%Y"),
                    "descricao": d.get("descricao", "Manutenção Preventiva"),
                    "tipo": d.get("tipo", "Rotina")
                })

        eq['manutencoes'] = lista_historico

        # --- 3. REGRA DO X (FORÇAR PASSADO E ATUAL) ---
        checklist_padrao = get_checklist_for_equipment(eq)
        tasks_processadas = []
        
        for desc, freq in checklist_padrao:
            task_info = {"desc": desc, "freq": freq, "meses_feitos": []}
            
            for i, mes_nome in enumerate(header_nomes):
                num_mes_coluna = header_nums[i]
                
                # Acha o ano desta coluna
                ano_da_coluna = ano_inicio_ciclo
                if num_mes_coluna < mes_inicio_num:
                    ano_da_coluna = ano_inicio_ciclo + 1
                
                data_coluna_ref = ano_da_coluna * 100 + num_mes_coluna
                
                # A COLUNA JÁ PASSOU OU É AGORA? (Ex: Nov/25 <= Mar/26 -> TRUE)
                is_passado_ou_atual = data_coluna_ref < data_atual_referencia
                
                # A FREQUÊNCIA PEDE NESTE MÊS? (0=Nov, 1=Dez, 2=Jan, 3=Fev...)
                deve_pelo_plano = calcular_marcao_automatica(freq, i)

                # SE O MÊS CHEGOU E O PLANO PEDE, MARCA O X! (Não olha pro BD)
                if is_passado_ou_atual and deve_pelo_plano:
                    task_info["meses_feitos"].append(mes_nome)
            
            tasks_processadas.append(task_info)
        
        eq['tasks_processadas'] = tasks_processadas
        equipamentos.append(eq)

    return contrato_data, equipamentos

# ----------------- FUSÃO DE PDFS -----------------
def mesclar_pdfs(miolo_pdf_bytes, caminho_capa_trt):
    merger = PdfMerger()
    
    # 1. Adiciona a capa se existir
    # Caminho ajustado para pasta static local ou absoluta
    if caminho_capa_trt:
         # Tenta achar o arquivo. Se estiver na mesma pasta ou caminho relativo
        if os.path.exists(caminho_capa_trt):
             merger.append(PdfReader(open(caminho_capa_trt, 'rb')))
        else:
            print(f"AVISO: Capa não encontrada em {caminho_capa_trt}")

    # 2. Adiciona o miolo
    merger.append(io.BytesIO(miolo_pdf_bytes))
    
    output = io.BytesIO()
    merger.write(output)
    merger.close()
    return output.getvalue()

# ----------------- ENDPOINT FINAL -----------------
@app.get("/pmoc-pdf/{empresa_id}/{contrato_id}")
def gerar_pdf(empresa_id: str, contrato_id: str):
    try:
        contrato_obj, lista_equipamentos = processar_dados_pmoc(empresa_id, contrato_id)
        
        template = env.get_template('pmoc.html')
        
        # AQUI ESTAVA O ERRO: O nome da variável deve ser 'contrato_data'
        html_content = template.render(
            contrato_data=contrato_obj,      # <--- CORRIGIDO AQUI
            equipamentos=lista_equipamentos,
            tecnico=os.getenv("PMOC_TECNICO", "André Técnico"),
            empresa_nome=os.getenv("PMOC_EMPRESA", "AVM AR CAMPINAS"),
            logo_cliente=""
        )
        
        miolo_bytes = HTML(string=html_content).write_pdf()
        
        caminho_capa = contrato_obj.get('caminho_capa_trt') 
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