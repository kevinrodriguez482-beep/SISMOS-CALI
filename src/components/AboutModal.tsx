import React from "react";
import { X, Building, ShieldCheck, HeartHandshake, Compass, AlertTriangle, Layers, Award } from "lucide-react";

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      id="about-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="about-modal-content"
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-stone-950 px-6 py-5 text-white flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-stone-900 rounded-2xl border border-amber-500/30 shadow-xs">
              <Building className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-display font-bold">Acerca de SismoScan</h2>
              <p className="text-xs text-stone-400 font-medium">Proyecto Universitario • ODS 9 Colombia</p>
            </div>
          </div>
          <button
            id="close-about-modal-btn"
            onClick={onClose}
            className="p-2 hover:bg-stone-800 rounded-xl text-stone-300 hover:text-white transition-colors"
            aria-label="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs text-stone-700 leading-relaxed">
          {/* ODS 9 Banner */}
          <div className="p-4 bg-gradient-to-br from-amber-50 to-amber-100/60 border border-amber-200/90 rounded-2xl flex items-start gap-3.5 shadow-2xs">
            <div className="px-2.5 py-1.5 bg-amber-600 text-white font-extrabold text-sm rounded-xl font-mono shadow-xs shrink-0">
              ODS 9
            </div>
            <div>
              <strong className="text-amber-950 block font-bold text-sm font-display">Industria, Innovación e Infraestructura</strong>
              <p className="text-stone-700 mt-1 leading-relaxed">
                Impulsa infraestructuras resilientes y sostenibles mediante el uso responsable de inteligencia artificial para la reducción del riesgo de desastres en ciudades y municipios de Colombia.
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            <h4 className="font-bold text-stone-900 text-xs font-display flex items-center gap-2">
              <Compass className="w-4 h-4 text-amber-600" />
              Metodología de Clasificación Estructural:
            </h4>
            <p className="text-stone-600">
              El sistema evalúa patrones visuales alineados con protocolos de evaluación post-sísmica rápida (AIS Colombia, UNGRD y ATC-20):
            </p>
            <div className="space-y-2 pt-1 font-sans">
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-emerald-50 text-emerald-950 border border-emerald-200">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                <span><strong>Sin daño aparente:</strong> Edificación íntegra o sin alteraciones perceptibles.</span>
              </div>
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-yellow-50 text-yellow-950 border border-yellow-200">
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 shrink-0" />
                <span><strong>Daño leve:</strong> Fisuras estéticas o capilares superficiales sin afectación portante.</span>
              </div>
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-amber-50 text-amber-950 border border-amber-200">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                <span><strong>Daño moderado:</strong> Grietas diagonales o separación de tabiques que ameritan inspección.</span>
              </div>
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-red-50 text-red-950 border border-red-200">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 shrink-0" />
                <span><strong>Daño severo / colapso:</strong> Falla en columnas, varillas pandeadas o desplome. <em>Evacuación inmediata.</em></span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-950 flex items-start gap-3 shadow-2xs">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="block font-bold">Límite de Responsabilidad Técnica:</strong>
              SismoScan es exclusivamente una herramienta de orientación y triaje preventivo. Jamás reemplaza el peritaje presencial de un profesional matriculado ni las directrices de los comités de emergencias.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex justify-end">
          <button
            id="close-about-modal-footer-btn"
            onClick={onClose}
            className="px-6 py-2.5 bg-stone-900 hover:bg-stone-950 text-white font-semibold text-xs rounded-xl transition-all active:scale-95 shadow-xs"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
