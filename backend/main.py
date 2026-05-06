import os
import io
import json
import uuid
import threading
from datetime import datetime
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse
import firebase_admin
from firebase_admin import credentials, firestore
from jinja2 import Environment, FileSystemLoader
from weasyprint import HTML
from PyPDF2 import PdfMerger, PdfReader

# ----------------- CONFIGURAÇÃO -----------------
load_dotenv()

if not firebase_admin._apps:
    sa_json = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON")
    if sa_json:
        cred = credentials.Certificate(json.loads(sa_json))
    else:
        cred = credentials.Certificate(os.getenv("FIREBASE_SERVICE_ACCOUNT", "serviceAccountKey.json"))
    firebase_admin.initialize_app(cred)
db = firestore.client()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_origin_regex=".*",
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=False,
)

env = Environment(loader=FileSystemLoader('templates'))

# ----------------- FILA DE JOBS -----------------
# { job_id: { "status": "pending"|"processing"|"done"|"error", "result": bytes, "error": str } }
jobs = {}
jobs_lock = threading.Lock()

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
    "PISO TETO": [
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
        ("Verificar estado dos filtros de ar. Substituir se necessário", "M"),
        ("Limpar o filtro de ar", "M"),
        ("Verificar Tensão elétrica", "M"),
        ("Verificar Corrente elétrica", "M"),
        ("Verificar acionamento do termostato", "M"),
        ("Verificar se todas as funções estão operando", "M"),
        ("Limpeza da bandeja de dreno e funcionamento do sistema", "M"),
        ("Verificar Correias do ventilador e substituir caso necessario","M"),
        ("Verificar o funcionamento dos dispositivos de proteção", "T"),
        ("Efetuar reaperto dos conectores elétricos", "T"),
        ("Verificar e corrigir, o isolamento das linhas frigorígenas", "T"),
        ("Verificar circuitos para localização e eliminação de vazamentos", "T"),
        ("Verificar pressões de funcionamento (Alta)", "T"),
        ("Verificar pressões de funcionamento (Baixa)", "T"),
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
        ("Limpar o filtro de ar", "M"),
        ("Análise de vibração e ruído", "M"),
        ("Verificar se todas as funções estão operando", "M"),
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
    tipo = str(equip_dict.get("tipo", "")).upper()
    nome = str(equip_dict.get("nome", "")).upper()
    texto_busca = f"{tipo} {nome}"
    for key, tasks in CHECKLISTS.items():
        if key in texto_busca:
            return tasks
    return [("Inspeção Geral", "M")]

def get_meses_nomes():
    return ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]

def gerar_header_dinamico(mes_inicio):
    nomes_base = get_meses_nomes()
    header_nomes = []
    header_nums = []
    for i in range(12):
        idx = (mes_inicio - 1 + i) % 12
        header_nomes.append(nomes_base[idx])
        header_nums.append(idx + 1)
    return header_nomes, header_nums

def calcular_marcao_automatica(freq, indice_coluna):
    if indice_coluna == 0: return True
    if freq == "M": return True
    if freq == "T": return indice_coluna % 3 == 0
    if freq == "S": return indice_coluna % 6 == 0
    if freq == "A": return indice_coluna % 12 == 0
    return False

import locale
try:
    locale.setlocale(locale.LC_TIME, 'pt_BR.UTF-8')
except:
    pass

def processar_dados_pmoc(empresa_id, contrato_id):
    contrato_ref = db.collection("empresas").document(empresa_id).collection("contratos").document(contrato_id)
    contrato_doc = contrato_ref.get()

    if not contrato_doc.exists:
        raise Exception("Contrato não encontrado")

    contrato_data = contrato_doc.to_dict()

    mes_inicio_num = int(contrato_data.get('mes_inicio', 1))
    ano_contrato = int(contrato_data.get('ano', datetime.now().year))

    if mes_inicio_num > 1:
        ano_inicio_ciclo = ano_contrato - 1
    else:
        ano_inicio_ciclo = ano_contrato

    header_nomes, header_nums = gerar_header_dinamico(mes_inicio_num)
    contrato_data['header_meses'] = header_nomes

    hoje = datetime.now()
    data_atual_referencia = hoje.year * 100 + hoje.month

    equipamentos = []
    equips_ref = contrato_ref.collection("equipamentos").order_by("codigo").stream()

    for doc in equips_ref:
        eq = doc.to_dict()
        eq_id = doc.id

        logs = contrato_ref.collection("equipamentos").document(eq_id).collection("manutencoes").order_by("data", direction=firestore.Query.DESCENDING).stream()
        lista_historico = []
        data_ultima_manutencao = 0

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
                ref = data_obj.year * 100 + data_obj.month
                if ref > data_ultima_manutencao:
                    data_ultima_manutencao = ref
                lista_historico.append({
                    "data_formatada": data_obj.strftime("%d/%m/%Y"),
                    "descricao": d.get("descricao", "Manutenção Preventiva"),
                    "tipo": d.get("tipo", "Rotina")
                })

        eq['manutencoes'] = lista_historico

        checklist_padrao = get_checklist_for_equipment(eq)
        tasks_processadas = []

        for desc, freq in checklist_padrao:
            task_info = {"desc": desc, "freq": freq, "meses_feitos": []}

            for i, mes_nome in enumerate(header_nomes):
                num_mes_coluna = header_nums[i]
                ano_da_coluna = ano_inicio_ciclo
                if num_mes_coluna < mes_inicio_num:
                    ano_da_coluna = ano_inicio_ciclo + 1

                data_coluna_ref = ano_da_coluna * 100 + num_mes_coluna
                is_ate_ultima_manutencao = data_ultima_manutencao > 0 and data_coluna_ref <= data_ultima_manutencao
                deve_pelo_plano = calcular_marcao_automatica(freq, i)

                if is_ate_ultima_manutencao and deve_pelo_plano:
                    task_info["meses_feitos"].append(mes_nome)

            tasks_processadas.append(task_info)

        eq['tasks_processadas'] = tasks_processadas
        equipamentos.append(eq)

    return contrato_data, equipamentos

def mesclar_pdfs(miolo_pdf_bytes, caminho_capa_trt):
    merger = PdfMerger()
    if caminho_capa_trt:
        if os.path.exists(caminho_capa_trt):
            merger.append(PdfReader(open(caminho_capa_trt, 'rb')))
        else:
            print(f"AVISO: Capa não encontrada em {caminho_capa_trt}")
    merger.append(io.BytesIO(miolo_pdf_bytes))
    output = io.BytesIO()
    merger.write(output)
    merger.close()
    return output.getvalue()

# ----------------- WORKER DA FILA -----------------
def _gerar_pdf_worker(job_id: str, empresa_id: str, contrato_id: str):
    """Roda em thread separada — gera o PDF sem matar o servidor."""
    try:
        with jobs_lock:
            jobs[job_id]["status"] = "processing"

        contrato_obj, lista_equipamentos = processar_dados_pmoc(empresa_id, contrato_id)

        template = env.get_template('pmoc.html')
        html_content = template.render(
            contrato_data=contrato_obj,
            equipamentos=lista_equipamentos,
            tecnico=os.getenv("PMOC_TECNICO", "André Técnico"),
            empresa_nome=os.getenv("PMOC_EMPRESA", "AVM AR CAMPINAS"),
            logo_cliente=""
        )

        miolo_bytes = HTML(string=html_content).write_pdf()

        caminho_capa = contrato_obj.get('caminho_capa_trt')
        pdf_final_bytes = mesclar_pdfs(miolo_bytes, caminho_capa)

        with jobs_lock:
            jobs[job_id]["status"] = "done"
            jobs[job_id]["result"] = pdf_final_bytes
            jobs[job_id]["filename"] = f"PMOC_{contrato_id}.pdf"

    except Exception as e:
        print(f"[PMOC Job {job_id}] Erro: {e}")
        with jobs_lock:
            jobs[job_id]["status"] = "error"
            jobs[job_id]["error"] = str(e)


# ----------------- ENDPOINTS -----------------

@app.post("/pmoc-pdf/iniciar/{empresa_id}/{contrato_id}")
def iniciar_geracao_pdf(empresa_id: str, contrato_id: str):
    """Inicia a geração em background e retorna um job_id."""
    job_id = str(uuid.uuid4())
    with jobs_lock:
        jobs[job_id] = {"status": "pending", "result": None, "error": None}

    t = threading.Thread(
        target=_gerar_pdf_worker,
        args=(job_id, empresa_id, contrato_id),
        daemon=True
    )
    t.start()
    return JSONResponse({"job_id": job_id})


@app.get("/pmoc-pdf/status/{job_id}")
def status_job(job_id: str):
    """Retorna o status atual do job."""
    with jobs_lock:
        job = jobs.get(job_id)
    if not job:
        raise HTTPException(404, "Job não encontrado")
    return JSONResponse({
        "status": job["status"],
        "error": job.get("error")
    })


@app.get("/pmoc-pdf/download/{job_id}")
def download_pdf(job_id: str):
    """Faz o download do PDF gerado."""
    with jobs_lock:
        job = jobs.get(job_id)
    if not job:
        raise HTTPException(404, "Job não encontrado")
    if job["status"] != "done":
        raise HTTPException(400, f"PDF ainda não pronto. Status: {job['status']}")

    pdf_bytes = job["result"]
    filename = job.get("filename", f"PMOC_{job_id}.pdf")

    # Limpa o job da memória após download
    with jobs_lock:
        del jobs[job_id]

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@app.get("/pmoc-loading/{empresa_id}/{contrato_id}", response_class=HTMLResponse)
def pagina_loading(empresa_id: str, contrato_id: str):
    """Página de loading que inicia a geração e faz polling."""
    return HTMLResponse(content=f"""<!DOCTYPE html>
<html lang="pt-br">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Gerando PMOC…</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&display=swap');

  *, *::before, *::after {{ box-sizing: border-box; margin: 0; padding: 0; }}

  :root {{
    --bg: #0a0e17;
    --surface: #111827;
    --border: #1f2937;
    --blue: #3b82f6;
    --blue-glow: rgba(59,130,246,0.35);
    --green: #10b981;
    --green-glow: rgba(16,185,129,0.35);
    --red: #ef4444;
    --text: #f9fafb;
    --muted: #6b7280;
  }}

  html, body {{
    height: 100%;
    background: var(--bg);
    color: var(--text);
    font-family: 'DM Sans', sans-serif;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }}

  /* Grade de fundo */
  body::before {{
    content: '';
    position: fixed;
    inset: 0;
    background-image:
      linear-gradient(rgba(59,130,246,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(59,130,246,0.04) 1px, transparent 1px);
    background-size: 48px 48px;
    pointer-events: none;
  }}

  .card {{
    position: relative;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 52px 48px 44px;
    width: min(480px, 92vw);
    text-align: center;
    box-shadow: 0 0 60px rgba(0,0,0,0.6), 0 0 0 1px var(--border);
  }}

  /* Anel giratório */
  .ring-wrap {{
    position: relative;
    width: 96px;
    height: 96px;
    margin: 0 auto 36px;
  }}

  .ring {{
    width: 96px;
    height: 96px;
    border-radius: 50%;
    border: 3px solid var(--border);
    border-top-color: var(--blue);
    animation: spin 1s linear infinite;
    position: absolute;
    inset: 0;
    filter: drop-shadow(0 0 8px var(--blue-glow));
  }}

  .ring-inner {{
    width: 72px;
    height: 72px;
    border-radius: 50%;
    border: 2px solid var(--border);
    border-bottom-color: var(--blue);
    animation: spin-reverse 1.5s linear infinite;
    position: absolute;
    top: 12px;
    left: 12px;
    opacity: 0.6;
  }}

  .ring-icon {{
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
  }}

  @keyframes spin {{ to {{ transform: rotate(360deg); }} }}
  @keyframes spin-reverse {{ to {{ transform: rotate(-360deg); }} }}

  /* Estado sucesso */
  .ring-wrap.success .ring {{
    border-color: var(--green);
    border-top-color: var(--green);
    animation: none;
    filter: drop-shadow(0 0 12px var(--green-glow));
  }}
  .ring-wrap.success .ring-inner {{ display: none; }}

  /* Estado erro */
  .ring-wrap.error .ring {{
    border-color: var(--red);
    border-top-color: var(--red);
    animation: none;
    filter: drop-shadow(0 0 12px rgba(239,68,68,0.4));
  }}
  .ring-wrap.error .ring-inner {{ display: none; }}

  h1 {{
    font-family: 'Bebas Neue', sans-serif;
    font-size: 2rem;
    letter-spacing: 0.06em;
    margin-bottom: 8px;
    color: var(--text);
  }}

  .subtitle {{
    font-size: 0.85rem;
    color: var(--muted);
    margin-bottom: 36px;
    line-height: 1.5;
  }}

  /* Barra de progresso */
  .progress-track {{
    background: var(--border);
    border-radius: 99px;
    height: 4px;
    overflow: hidden;
    margin-bottom: 14px;
  }}

  .progress-fill {{
    height: 100%;
    border-radius: 99px;
    background: linear-gradient(90deg, var(--blue), #60a5fa);
    box-shadow: 0 0 12px var(--blue-glow);
    width: 0%;
    transition: width 0.6s ease;
  }}

  .progress-fill.indeterminate {{
    width: 40%;
    animation: indeterminate 1.8s ease-in-out infinite;
  }}

  @keyframes indeterminate {{
    0%   {{ transform: translateX(-100%); }}
    100% {{ transform: translateX(300%); }}
  }}

  /* Etapas */
  .steps {{
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 32px;
    text-align: left;
  }}

  .step {{
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 14px;
    border-radius: 10px;
    font-size: 0.82rem;
    color: var(--muted);
    border: 1px solid transparent;
    transition: all 0.4s ease;
  }}

  .step.active {{
    color: var(--text);
    background: rgba(59,130,246,0.08);
    border-color: rgba(59,130,246,0.2);
  }}

  .step.done {{
    color: var(--green);
    background: rgba(16,185,129,0.06);
    border-color: rgba(16,185,129,0.15);
  }}

  .step-dot {{
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--border);
    flex-shrink: 0;
    transition: all 0.3s ease;
  }}

  .step.active .step-dot {{
    background: var(--blue);
    box-shadow: 0 0 8px var(--blue-glow);
    animation: pulse-dot 1.2s ease-in-out infinite;
  }}

  .step.done .step-dot {{
    background: var(--green);
    box-shadow: 0 0 6px var(--green-glow);
  }}

  @keyframes pulse-dot {{
    0%, 100% {{ transform: scale(1); opacity: 1; }}
    50%       {{ transform: scale(1.4); opacity: 0.7; }}
  }}

  /* Botão de download */
  .btn-download {{
    display: none;
    width: 100%;
    padding: 14px 24px;
    background: var(--green);
    color: #fff;
    border: none;
    border-radius: 12px;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.95rem;
    font-weight: 500;
    cursor: pointer;
    text-decoration: none;
    box-shadow: 0 0 24px var(--green-glow);
    transition: opacity 0.2s, transform 0.2s;
    animation: pop-in 0.4s cubic-bezier(.34,1.56,.64,1) forwards;
  }}

  .btn-download:hover {{ opacity: 0.9; transform: translateY(-1px); }}

  @keyframes pop-in {{
    from {{ transform: scale(0.85); opacity: 0; }}
    to   {{ transform: scale(1);    opacity: 1; }}
  }}

  /* Mensagem de erro */
  .error-msg {{
    display: none;
    background: rgba(239,68,68,0.1);
    border: 1px solid rgba(239,68,68,0.3);
    border-radius: 10px;
    padding: 14px 16px;
    font-size: 0.82rem;
    color: #fca5a5;
    text-align: left;
    line-height: 1.5;
  }}

  .footer-note {{
    margin-top: 24px;
    font-size: 0.72rem;
    color: var(--muted);
    opacity: 0.6;
  }}
</style>
</head>
<body>

<div class="card">
  <div class="ring-wrap" id="ringWrap">
    <div class="ring"></div>
    <div class="ring-inner"></div>
    <div class="ring-icon">🌬️</div>
  </div>

  <h1 id="title">Gerando PMOC</h1>
  <p class="subtitle" id="subtitle">
    Aguarde enquanto montamos o documento.<br>
    Isso pode levar até 2 minutos.
  </p>

  <div class="progress-track">
    <div class="progress-fill indeterminate" id="progressFill"></div>
  </div>

  <div class="steps">
    <div class="step active" id="step1">
      <div class="step-dot"></div>
      Buscando dados do contrato
    </div>
    <div class="step" id="step2">
      <div class="step-dot"></div>
      Processando equipamentos
    </div>
    <div class="step" id="step3">
      <div class="step-dot"></div>
      Montando tabelas do PMOC
    </div>
    <div class="step" id="step4">
      <div class="step-dot"></div>
      Renderizando PDF
    </div>
  </div>

  <a class="btn-download" id="btnDownload" href="#">
    ⬇ Baixar PMOC
  </a>

  <div class="error-msg" id="errorMsg"></div>

  <p class="footer-note">AVM Ar Campinas · Sistema de Gestão</p>
</div>

<script>
const EMPRESA_ID = "{empresa_id}";
const CONTRATO_ID = "{contrato_id}";
const BASE = window.location.origin;

let jobId = null;
let pollInterval = null;
let stepTimer = null;
let currentStep = 1;

// Simula progresso visual enquanto processa
const stepDelays = [0, 5000, 15000, 30000]; // ms

function activateStep(n) {{
  for (let i = 1; i <= 4; i++) {{
    const el = document.getElementById('step' + i);
    el.className = 'step' + (i < n ? ' done' : i === n ? ' active' : '');
  }}
  currentStep = n;
}}

function startStepSimulation() {{
  stepDelays.forEach((delay, idx) => {{
    setTimeout(() => {{
      if (jobId && currentStep <= idx + 1) activateStep(idx + 1);
    }}, delay);
  }});
}}

function setSuccess() {{
  clearInterval(pollInterval);
  clearTimeout(stepTimer);
  activateStep(5); // todas done

  const ringWrap = document.getElementById('ringWrap');
  ringWrap.className = 'ring-wrap success';
  ringWrap.querySelector('.ring-icon').textContent = '✅';

  document.getElementById('title').textContent = 'PMOC Pronto!';
  document.getElementById('subtitle').textContent = 'Seu documento foi gerado com sucesso.';

  const fill = document.getElementById('progressFill');
  fill.classList.remove('indeterminate');
  fill.style.width = '100%';
  fill.style.background = 'linear-gradient(90deg, #10b981, #34d399)';
  fill.style.boxShadow = '0 0 12px rgba(16,185,129,0.4)';

  const btn = document.getElementById('btnDownload');
  btn.href = BASE + '/pmoc-pdf/download/' + jobId;
  btn.style.display = 'block';

  // Dispara download automático
  setTimeout(() => {{ btn.click(); }}, 600);
}}

function setError(msg) {{
  clearInterval(pollInterval);

  const ringWrap = document.getElementById('ringWrap');
  ringWrap.className = 'ring-wrap error';
  ringWrap.querySelector('.ring-icon').textContent = '❌';

  document.getElementById('title').textContent = 'Erro na Geração';
  document.getElementById('subtitle').textContent = 'Não foi possível gerar o PMOC.';

  const fill = document.getElementById('progressFill');
  fill.classList.remove('indeterminate');
  fill.style.width = '100%';
  fill.style.background = '#ef4444';
  fill.style.boxShadow = 'none';

  const errEl = document.getElementById('errorMsg');
  errEl.textContent = '⚠ ' + (msg || 'Erro desconhecido');
  errEl.style.display = 'block';
}}

async function poll() {{
  try {{
    const res = await fetch(BASE + '/pmoc-pdf/status/' + jobId);
    const data = await res.json();

    if (data.status === 'done') {{
      setSuccess();
    }} else if (data.status === 'error') {{
      setError(data.error);
    }}
    // pending ou processing: continua polling
  }} catch(e) {{
    setError('Falha de conexão: ' + e.message);
  }}
}}

async function start() {{
  try {{
    const res = await fetch(BASE + '/pmoc-pdf/iniciar/{empresa_id}/{contrato_id}', {{
      method: 'POST'
    }});
    const data = await res.json();
    jobId = data.job_id;
    startStepSimulation();
    pollInterval = setInterval(poll, 3000);
  }} catch(e) {{
    setError('Não foi possível iniciar a geração: ' + e.message);
  }}
}}

start();
</script>
</body>
</html>""")


# ---- Rota legada (compatibilidade) — redireciona para loading ----
@app.get("/pmoc-pdf/{empresa_id}/{contrato_id}")
def gerar_pdf_legado(empresa_id: str, contrato_id: str):
    from fastapi.responses import RedirectResponse
    return RedirectResponse(url=f"/pmoc-loading/{empresa_id}/{contrato_id}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)