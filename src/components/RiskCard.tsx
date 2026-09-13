import React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  ShieldAlert,
  Info,
  Layers,
  ArrowRightCircle,
  PhoneCall,
  Flame,
  Building,
  Gauge,
  HelpCircle,
  ExternalLink,
  FileText,
  Printer,
} from "lucide-react";
import type { StructuralEvaluation, RiskLevel, RecommendationType } from "../types";

interface RiskCardProps {
  evaluation: StructuralEvaluation;
  onOpenEmergencyModal?: () => void;
  onOpenTechnicalReport?: () => void;
}

const SEMAFORO_LEVELS: {
  level: RiskLevel;
  shortLabel: string;
  dotColor: string;
  activeBg: string;
  activeText: string;
  activeBorder: string;
}[] = [
  {
    level: "Sin daño aparente",
    shortLabel: "Sin Daño",
    dotColor: "bg-emerald-500",
    activeBg: "bg-emerald-600",
    activeText: "text-white",
    activeBorder: "border-emerald-600",
  },
  {
    level: "Daño leve",
    shortLabel: "Leve",
    dotColor: "bg-yellow-500",
    activeBg: "bg-yellow-500",
    activeText: "text-stone-950",
    activeBorder: "border-yellow-500",
  },
  {
    level: "Daño moderado",
    shortLabel: "Moderado",
    dotColor: "bg-amber-500",
    activeBg: "bg-amber-600",
    activeText: "text-white",
    activeBorder: "border-amber-600",
  },
  {
    level: "Daño severo / riesgo de colapso",
    shortLabel: "Severo / Colapso",
    dotColor: "bg-red-600",
    activeBg: "bg-red-600",
    activeText: "text-white",
    activeBorder: "border-red-600",
  },
];

export const RiskCard: React.FC<RiskCardProps> = ({
  evaluation,
  onOpenEmergencyModal,
  onOpenTechnicalReport,
}) => {
  const {
    classification,
    recommendation,
    visualSignals = [],
    elementAnalyzed,
    confidence,
    urgentActionRequired,
  } = evaluation;

  if (!classification && !recommendation) return null;

  const isEvacuate =
    recommendation === "Evacuar de inmediato" || urgentActionRequired;
  const isStayWithCaution =
    recommendation === "Se puede permanecer con precaución";

  // Card border and glow styling based on status
  const cardBorder = isEvacuate
    ? "border-red-500 ring-2 ring-red-500/20"
    : isStayWithCaution
    ? "border-emerald-500/80 ring-1 ring-emerald-500/10"
    : "border-stone-300";

  return (
    <div
      id="structural-risk-card"
      className={`my-3.5 rounded-2xl border-2 ${cardBorder} bg-white shadow-md overflow-hidden transition-all duration-300`}
    >
      {/* Top Semáforo Visual Gauge Bar */}
      <div className="bg-stone-900 px-4 py-3 text-white border-b border-stone-800">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
                isEvacuate ? "bg-red-400" : "bg-emerald-400"
              } opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                isEvacuate ? "bg-red-500" : "bg-emerald-500"
              }`}></span>
            </span>
            <span className="text-[11px] font-bold tracking-wider text-stone-300 uppercase font-mono">
              Semáforo Estructural de Riesgo
            </span>
          </div>

          {confidence && (
            <div className="flex items-center gap-1.5 text-[10px] font-mono bg-stone-800 px-2 py-0.5 rounded-md border border-stone-700">
              <Gauge className="w-3 h-3 text-stone-400" />
              <span className="text-stone-400">Confianza:</span>
              <span className={`font-bold capitalize ${
                confidence === "alta" ? "text-emerald-400" : confidence === "media" ? "text-amber-400" : "text-stone-300"
              }`}>{confidence}</span>
            </div>
          )}
        </div>

        {/* 4-Step Gauge Visual Indicator */}
        <div className="grid grid-cols-4 gap-1.5 pt-0.5">
          {SEMAFORO_LEVELS.map((item, idx) => {
            const isCurrent = classification === item.level;
            return (
              <div
                key={idx}
                className={`py-1.5 px-1 rounded-lg text-center transition-all flex flex-col items-center gap-1 ${
                  isCurrent
                    ? `${item.activeBg} ${item.activeText} font-bold shadow-sm scale-102 ring-2 ring-white/50`
                    : "bg-stone-800/80 text-stone-400 opacity-60"
                }`}
              >
                <div className="flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${item.dotColor}`}></span>
                  <span className="text-[10px] sm:text-[11px] leading-tight font-semibold line-clamp-1">
                    {item.shortLabel}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-4">
        {/* Prominent Recommendation Directive Banner */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-stone-500 font-mono">
              Directriz Inmediata para Ocupantes:
            </span>
            {isEvacuate && (
              <span className="text-[10px] font-extrabold bg-red-100 text-red-700 border border-red-300 px-2 py-0.5 rounded-full animate-pulse">
                ACCIÓN URGENTE
              </span>
            )}
          </div>

          <div
            id="prominent-recommendation"
            className={`p-4 rounded-xl border-2 transition-all ${
              isEvacuate
                ? "bg-gradient-to-r from-red-600 to-red-700 text-white border-red-800 shadow-md"
                : isStayWithCaution
                ? "bg-gradient-to-r from-emerald-700 to-emerald-800 text-white border-emerald-900 shadow-md"
                : "bg-gradient-to-r from-stone-800 to-stone-900 text-white border-stone-950"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white/10 backdrop-blur-xs rounded-xl shrink-0 mt-0.5">
                  {isEvacuate ? (
                    <AlertOctagon className="w-7 h-7 text-white animate-pulse" />
                  ) : isStayWithCaution ? (
                    <CheckCircle2 className="w-7 h-7 text-white" />
                  ) : (
                    <Info className="w-7 h-7 text-white" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-display font-extrabold tracking-tight leading-tight uppercase">
                    {recommendation || "Requiere más información"}
                  </h3>
                  <p className="text-xs sm:text-sm text-white/90 font-medium mt-1">
                    {isEvacuate
                      ? "Sal de la edificación con calma hacia un punto despejado al aire libre."
                      : isStayWithCaution
                      ? "Estructura habitable con precaución. Mantén vigilancia activa ante réplicas."
                      : "Comparte fotos complementarias o describe si la grieta aumenta."}
                  </p>
                </div>
              </div>

              {isEvacuate && onOpenEmergencyModal && (
                <button
                  id="evacuate-emergency-call-btn"
                  type="button"
                  onClick={onOpenEmergencyModal}
                  className="w-full sm:w-auto px-4 py-2.5 bg-white hover:bg-stone-100 text-red-700 font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 shrink-0 transition-all active:scale-95 border border-white"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Marcar Emergencias (123 / 119)</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Action Checkpoints for Users */}
        {isEvacuate ? (
          <div className="p-3 bg-red-50/80 border border-red-200 rounded-xl text-xs text-red-950 space-y-1.5">
            <span className="font-bold flex items-center gap-1.5 text-red-900">
              <ShieldAlert className="w-4 h-4 text-red-600" />
              Pasos inmediatos de evacuación segura:
            </span>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-red-900/90 pl-1 text-[11px]">
              <li className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-red-600"></span>
                Usa escaleras, <strong>nunca el ascensor</strong>.
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-red-600"></span>
                Cierra llaves de gas si están a tu paso.
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-red-600"></span>
                Aléjate de vidrios, postes y fachadas.
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-red-600"></span>
                Reporta a los Bomberos (119).
              </li>
            </ul>
          </div>
        ) : isStayWithCaution ? (
          <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs text-emerald-950 space-y-1">
            <span className="font-bold flex items-center gap-1.5 text-emerald-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Recomendaciones durante la permanencia:
            </span>
            <p className="text-[11px] text-emerald-900/90">
              Marca con un lápiz el extremo de las fisuras para vigilar si avanzan con réplicas. Mantén despejadas las salidas y ten listo un maletín de emergencia.
            </p>
          </div>
        ) : null}

        {/* Visual signals detected chips */}
        {visualSignals.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
              <ArrowRightCircle className="w-3.5 h-3.5 text-amber-600" />
              Señales visuales detectadas en la inspección:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {visualSignals.map((signal, idx) => (
                <span
                  key={idx}
                  className="text-xs font-medium bg-stone-100 border border-stone-200 text-stone-800 px-3 py-1 rounded-lg flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  {signal}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Structural Element details */}
        {elementAnalyzed && elementAnalyzed !== "No identificado" && (
          <div className="flex items-center justify-between text-xs text-stone-600 bg-stone-50 px-3.5 py-2 rounded-xl border border-stone-200">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-stone-500" />
              <span>Elemento constructivo identificado:</span>
            </div>
            <strong className="text-stone-900 bg-white px-2.5 py-0.5 rounded-md border border-stone-200">
              {elementAnalyzed}
            </strong>
          </div>
        )}

        {/* Technical Report / Certificate Button */}
        {onOpenTechnicalReport && (
          <div className="pt-1">
            <button
              id="card-open-technical-report-btn"
              type="button"
              onClick={onOpenTechnicalReport}
              className="w-full py-2.5 px-4 bg-stone-100 hover:bg-stone-200/90 text-stone-900 text-xs font-bold rounded-xl border border-stone-300 shadow-2xs flex items-center justify-center gap-2 transition-all active:scale-98 group"
            >
              <FileText className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
              <span>Generar Ficha Oficial de Triaje (PDF / Imprimir)</span>
            </button>
          </div>
        )}

        {/* Mandatory safety reminder note */}
        <div className="pt-2 border-t border-stone-200 text-[11px] text-stone-500 flex items-start gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-snug">
            <strong>Aviso de seguridad:</strong> Evaluación de triaje orientativo de SismoScan. <strong>No reemplaza</strong> la visita técnica presencial de un ingeniero civil matriculado ni el concepto oficial de Bomberos o Defensa Civil en Colombia.
          </p>
        </div>
      </div>
    </div>
  );
};
