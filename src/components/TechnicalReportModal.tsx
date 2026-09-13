import React, { useState } from "react";
import {
  X,
  Printer,
  Copy,
  Check,
  Building,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  ShieldCheck,
  Calendar,
  Layers,
  PhoneCall,
  Download,
  Share2,
} from "lucide-react";
import type { StructuralEvaluation } from "../types";

interface TechnicalReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  evaluation?: StructuralEvaluation;
  imageSrc?: string;
  reportDate?: Date;
}

export const TechnicalReportModal: React.FC<TechnicalReportModalProps> = ({
  isOpen,
  onClose,
  evaluation,
  imageSrc,
  reportDate = new Date(),
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !evaluation) return null;

  const {
    classification = "No determinada",
    recommendation = "Requiere más información",
    elementAnalyzed = "No identificado",
    confidence = "media",
    visualSignals = [],
    urgentActionRequired,
  } = evaluation;

  const isEvacuate =
    recommendation === "Evacuar de inmediato" || urgentActionRequired;
  const isStay = recommendation === "Se puede permanecer con precaución";

  const statusColor = isEvacuate
    ? {
        bg: "bg-red-50",
        border: "border-red-400",
        text: "text-red-900",
        badge: "bg-red-600 text-white",
        icon: <AlertOctagon className="w-5 h-5 text-red-600" />,
      }
    : isStay
    ? {
        bg: "bg-emerald-50",
        border: "border-emerald-400",
        text: "text-emerald-900",
        badge: "bg-emerald-600 text-white",
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
      }
    : {
        bg: "bg-amber-50",
        border: "border-amber-400",
        text: "text-amber-900",
        badge: "bg-amber-600 text-white",
        icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
      };

  const handlePrint = () => {
    window.print();
  };

  const handleCopySummary = async () => {
    const textToCopy = `📋 *FICHA DE TRIAJE PRELIMINAR - SISMOSCAN COLOMBIA*
Fecha: ${reportDate.toLocaleDateString("es-CO")} ${reportDate.toLocaleTimeString("es-CO")}
Nivel de Daño: ${classification.toUpperCase()}
Directriz: ${recommendation.toUpperCase()}
Elemento: ${elementAnalyzed}
Nivel de Confianza: ${confidence.toUpperCase()}

🔍 Señales Observadas:
${visualSignals.map((s) => `• ${s}`).join("\n") || "• Ninguna reportada"}

📞 En caso de emergencia en Colombia:
- Bomberos: 119
- Línea Única: 123
- Defensa Civil: 144
- Cruz Roja: 132

⚠️ *Aviso Legal:* Evaluación preliminar orientativa de triaje basada en IA. No reemplaza el peritaje técnico de un ingeniero civil matriculado ni el concepto oficial de Bomberos o UNGRD.`;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Error copying report text:", err);
    }
  };

  return (
    <div
      id="technical-report-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="technical-report-container"
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-6 flex flex-col max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar (Actions) */}
        <div className="bg-stone-950 px-5 py-4 text-white flex items-center justify-between border-b border-stone-800 print:hidden shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-stone-900 rounded-xl border border-amber-500/30">
              <Building className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-display font-bold">Ficha de Triaje Post-Sismo</h3>
              <p className="text-[11px] text-stone-400">Documento técnico preliminar para autoridades y ocupantes</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="copy-report-btn"
              type="button"
              onClick={handleCopySummary}
              className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
              title="Copiar texto para WhatsApp o correo"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">Copiado</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-stone-300" />
                  <span className="hidden sm:inline">Copiar texto</span>
                </>
              )}
            </button>

            <button
              id="print-report-btn"
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
              title="Imprimir o exportar como PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / PDF</span>
            </button>

            <button
              id="close-report-btn"
              type="button"
              onClick={onClose}
              className="p-1.5 hover:bg-stone-800 text-stone-400 hover:text-white rounded-xl transition-colors ml-1"
              aria-label="Cerrar ventana"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Body */}
        <div id="printable-report-content" className="p-6 sm:p-8 overflow-y-auto space-y-6 text-stone-800 bg-white">
          {/* Institutional Document Header */}
          <div className="border-b-2 border-stone-900 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-stone-900 text-white text-[10px] font-mono font-extrabold rounded">
                  SISMOSCAN
                </span>
                <span className="text-xs font-bold text-amber-700 uppercase tracking-widest font-mono">
                  COLOMBIA • ODS 9
                </span>
              </div>
              <h2 className="text-xl font-display font-extrabold text-stone-950 mt-1">
                FICHA DE EVALUACIÓN PRELIMINAR DE RIESGO ESTRUCTURAL
              </h2>
              <p className="text-xs text-stone-500 font-mono">
                Protocolo de Triaje Rápido en Edificaciones Post-Sismo (NSR-10 / AIS)
              </p>
            </div>

            <div className="text-left sm:text-right text-xs text-stone-500 space-y-0.5 shrink-0">
              <div className="flex items-center sm:justify-end gap-1.5 font-mono">
                <Calendar className="w-3.5 h-3.5 text-stone-400" />
                <span>{reportDate.toLocaleDateString("es-CO", { dateStyle: "long" })}</span>
              </div>
              <div className="font-mono text-[11px] text-stone-400">
                Hora: {reportDate.toLocaleTimeString("es-CO", { timeStyle: "short" })}
              </div>
            </div>
          </div>

          {/* Verdict Banner */}
          <div className={`p-4 rounded-2xl border-2 ${statusColor.border} ${statusColor.bg} space-y-2`}>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-600 font-mono flex items-center gap-1.5">
                {statusColor.icon}
                Dictamen de Habitabilidad Inmediata
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider font-mono ${statusColor.badge}`}>
                {classification}
              </span>
            </div>

            <div className="pt-1">
              <h3 className={`text-2xl font-display font-extrabold uppercase leading-tight ${statusColor.text}`}>
                {recommendation}
              </h3>
              <p className="text-xs text-stone-700 mt-1 font-medium">
                {isEvacuate
                  ? "Se recomienda evacuar de forma inmediata la edificación por riesgo de colapso o daño en elementos portantes. Diríjase a un punto de encuentro seguro."
                  : isStay
                  ? "La estructura presenta condiciones preliminares para permanecer con precaución activa. Realice monitoreo periódico de fisuras ante réplicas."
                  : "Se requieren inspecciones o fotografías complementarias para determinar con certeza el grado de vulnerabilidad."}
              </p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50 space-y-1">
              <span className="text-[11px] text-stone-500 font-mono uppercase font-semibold">Elemento Constructivo</span>
              <p className="font-bold text-sm text-stone-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-600" />
                {elementAnalyzed}
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50 space-y-1">
              <span className="text-[11px] text-stone-500 font-mono uppercase font-semibold">Nivel de Confianza Técnico</span>
              <p className="font-bold text-sm text-stone-900 capitalize flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                {confidence} ({confidence === "alta" ? "Alta nitidez / patrón claro" : confidence === "media" ? "Estimación visual estándar" : "Baja resolución / requiere más tomas"})
              </p>
            </div>
          </div>

          {/* Photo attachment if available */}
          {imageSrc && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-stone-700 uppercase tracking-wider font-mono">
                Registro Fotográfico Adjunto:
              </span>
              <div className="rounded-xl overflow-hidden border border-stone-300 max-w-sm bg-stone-100">
                <img
                  src={imageSrc}
                  alt="Elemento estructural fotografiado"
                  className="w-full max-h-56 object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          )}

          {/* Signals Identified */}
          {visualSignals.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-stone-700 uppercase tracking-wider font-mono">
                Patrones y Señales Críticas Detectadas:
              </span>
              <ul className="space-y-1.5 pl-1">
                {visualSignals.map((sig, i) => (
                  <li key={i} className="text-xs flex items-start gap-2 text-stone-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <span>{sig}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Official emergency numbers in Colombia */}
          <div className="p-4 bg-stone-900 text-white rounded-2xl space-y-2 text-xs">
            <span className="font-bold text-amber-400 flex items-center gap-1.5">
              <PhoneCall className="w-4 h-4" />
              Líneas Oficiales de Emergencia en Colombia:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-center">
              <div className="p-2 bg-stone-800 rounded-lg border border-stone-700">
                <span className="text-stone-400 text-[10px] block">Línea Única</span>
                <strong className="text-white text-base">123</strong>
              </div>
              <div className="p-2 bg-stone-800 rounded-lg border border-stone-700">
                <span className="text-stone-400 text-[10px] block">Bomberos</span>
                <strong className="text-red-400 text-base">119</strong>
              </div>
              <div className="p-2 bg-stone-800 rounded-lg border border-stone-700">
                <span className="text-stone-400 text-[10px] block">Defensa Civil</span>
                <strong className="text-amber-400 text-base">144</strong>
              </div>
              <div className="p-2 bg-stone-800 rounded-lg border border-stone-700">
                <span className="text-stone-400 text-[10px] block">Cruz Roja</span>
                <strong className="text-emerald-400 text-base">132</strong>
              </div>
            </div>
          </div>

          {/* Mandatory Legal Disclaimer */}
          <div className="p-3.5 rounded-xl bg-stone-100 border border-stone-200 text-[11px] text-stone-600 leading-relaxed space-y-1">
            <strong className="text-stone-900 block font-bold">Validez y Límite Técnico:</strong>
            <p>
              Esta ficha corresponde a una evaluación visual orientativa de triaje rápido generada por SismoScan (proyecto universitario enfocado en ODS 9).
              <strong> No constituye un dictamen estructural pericial vinculante</strong> ni reemplaza la visita presencial de un profesional de la ingeniería civil matriculado (Ley 400 de 1997 / NSR-10) o de las entidades operativas del Sistema Nacional de Gestión del Riesgo de Desastres (UNGRD).
            </p>
          </div>
        </div>

        {/* Modal Bottom Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between print:hidden">
          <button
            type="button"
            onClick={handleCopySummary}
            className="text-xs text-stone-600 hover:text-stone-900 font-semibold flex items-center gap-1.5"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Compartir con copropiedad o bomberos</span>
          </button>

          <button
            id="close-technical-report-footer-btn"
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-stone-900 hover:bg-stone-950 text-white font-semibold text-xs rounded-xl transition-all shadow-xs"
          >
            Cerrar Ficha
          </button>
        </div>
      </div>
    </div>
  );
};
