import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import Modal from "../components/Modal";
import { getOrdens } from "../services/os/osService";
import {
  ClipboardList, User, MapPin, Wrench, Package,
  Car, Calendar, CheckCircle, ChevronRight, Loader2,
} from "lucide-react";

function formatarData(ts) {
  if (!ts) return "—";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function InfoLinha({ Icone, label, children }) {
  return (
    <div className="flex gap-3">
      <Icone size={14} className="text-gray-400 flex-shrink-0 mt-0.5" />
      <div className="min-w-0">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
        {children}
      </div>
    </div>
  );
}

function OsCard({ os, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all active:scale-[0.98]"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <span className="text-xs font-bold text-[#7b8cd4] bg-[#f0f2ff] px-2 py-0.5 rounded-full">
            {os.numero}
          </span>
          <p className="text-sm font-semibold text-gray-800 mt-1.5">{os.tipoServico || "Serviço"}</p>
        </div>
        <div className="flex items-center gap-1 text-green-600 flex-shrink-0">
          <CheckCircle size={14} />
          <span className="text-xs font-medium">Concluída</span>
        </div>
      </div>

      <div className="space-y-1.5">
        {os.clienteNome && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User size={13} className="text-gray-400 flex-shrink-0" />
            {os.clienteNome}
          </div>
        )}
        {os.endereco && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <MapPin size={13} className="text-gray-400 flex-shrink-0" />
            <span className="truncate">{os.endereco}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Calendar size={12} className="flex-shrink-0" />
          {formatarData(os.dataServico)}
        </div>
      </div>

      <div className="flex justify-end mt-3">
        <ChevronRight size={16} className="text-gray-300" />
      </div>
    </div>
  );
}

function OsDetalheModal({ os, aberto, onFechar }) {
  if (!os) return null;
  return (
    <Modal aberto={aberto} onClose={onFechar} titulo={os.numero}>
      <div className="max-h-[75vh] overflow-y-auto pr-1 space-y-4">

        <div className="flex items-center gap-2 text-green-600 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
          <CheckCircle size={15} />
          <span className="text-sm font-semibold">Ordem de Serviço Concluída</span>
        </div>

        <InfoLinha Icone={User} label="Cliente">
          <p className="text-sm text-gray-700">{os.clienteNome || "—"}</p>
        </InfoLinha>

        {os.endereco && (
          <InfoLinha Icone={MapPin} label="Endereço">
            <p className="text-sm text-gray-700">{os.endereco}</p>
          </InfoLinha>
        )}

        <InfoLinha Icone={ClipboardList} label="Tipo de serviço">
          <p className="text-sm text-gray-700">{os.tipoServico || "—"}</p>
        </InfoLinha>

        {os.descricaoAgendamento && (
          <InfoLinha Icone={ClipboardList} label="Observações do agendamento">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{os.descricaoAgendamento}</p>
          </InfoLinha>
        )}

        <InfoLinha Icone={Wrench} label="Serviço executado">
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{os.servicoExecutado || "—"}</p>
        </InfoLinha>

        {os.materiaisUtilizados && (
          <InfoLinha Icone={Package} label="Materiais utilizados">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{os.materiaisUtilizados}</p>
          </InfoLinha>
        )}

        {os.veiculo && (
          <InfoLinha Icone={Car} label="Veículo">
            <p className="text-sm text-gray-700">{os.veiculo}</p>
          </InfoLinha>
        )}

        <InfoLinha Icone={Calendar} label="Data do serviço">
          <p className="text-sm text-gray-700">{formatarData(os.dataServico)}</p>
        </InfoLinha>

        {os.fotos?.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">
              Fotos do serviço
            </p>
            <div className="flex flex-wrap gap-2">
              {os.fotos.map((url, i) => (
                <img key={i} src={url} alt={`Foto ${i + 1}`}
                  className="w-20 h-20 object-cover rounded-xl border border-gray-200" />
              ))}
            </div>
          </div>
        )}

        {os.assinatura && (
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">
              Assinatura do cliente
            </p>
            <img src={os.assinatura} alt="Assinatura"
              className="w-full max-h-28 object-contain border border-gray-200 rounded-xl bg-gray-50" />
          </div>
        )}

      </div>
    </Modal>
  );
}

export default function VerOs() {
  const { empresaId } = useParams();
  const [ordens, setOrdens] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [osSelecionada, setOsSelecionada] = useState(null);

  useEffect(() => {
    if (!empresaId) return;
    setCarregando(true);
    getOrdens(empresaId)
      .then(setOrdens)
      .finally(() => setCarregando(false));
  }, [empresaId]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="p-4 md:p-6 max-w-xl mx-auto pb-10">

        <div className="flex items-center gap-2 mb-1">
          <ClipboardList size={22} className="text-[#7b8cd4]" />
          <h1 className="text-xl font-bold text-gray-800">Ordens de Serviço</h1>
        </div>
        <p className="text-sm text-gray-500 mb-5">
          OS geradas automaticamente ao finalizar agendamentos.
        </p>

        {carregando && (
          <div className="flex justify-center py-16">
            <Loader2 size={28} className="animate-spin text-[#7b8cd4]" />
          </div>
        )}

        {!carregando && ordens.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <ClipboardList size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Nenhuma OS gerada ainda.</p>
            <p className="text-xs mt-1">As OS aparecem aqui quando um técnico finaliza um agendamento.</p>
          </div>
        )}

        {!carregando && ordens.length > 0 && (
          <div className="space-y-3">
            {ordens.map(os => (
              <OsCard key={os.id} os={os} onClick={() => setOsSelecionada(os)} />
            ))}
          </div>
        )}

      </main>

      <OsDetalheModal
        os={osSelecionada}
        aberto={!!osSelecionada}
        onFechar={() => setOsSelecionada(null)}
      />
    </div>
  );
}
