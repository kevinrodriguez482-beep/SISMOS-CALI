import React from "react";
import { X, Camera, CheckCircle2, AlertOctagon, HelpCircle, Eye, Sparkles } from "lucide-react";

interface PhotoGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PhotoGuideModal: React.FC<PhotoGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      id="photo-guide-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="photo-guide-content"
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 px-6 py-5 text-white flex items-center justify-between border-b border-amber-700">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-700/80 rounded-2xl border border-amber-400/40 shadow-xs">
              <Camera className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-display font-bold">Guía para Capturar Daños</h2>
              <p className="text-xs text-amber-100 font-medium">Recomendaciones técnicas para una evaluación certera</p>
            </div>
          </div>
          <button
            id="close-photo-guide-btn"
            onClick={onClose}
            className="p-2 hover:bg-amber-700 rounded-xl text-white/90 hover:text-white transition-colors"
            aria-label="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-sm text-stone-700">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2 shadow-2xs">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs font-display">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>1. Perspectiva amplia</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                Toma la foto a 2 o 3 metros de distancia. Es fundamental ver si el daño está en una <strong>columna, viga o muro</strong> y su unión con el techo.
              </p>
            </div>

            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2 shadow-2xs">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs font-display">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>2. Primer plano con escala</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                Acércate a la fisura con buena iluminación. Coloca una moneda, tarjeta o bolígrafo junto a la grieta como referencia de grosor.
              </p>
            </div>
          </div>

          <div className="border border-stone-200 rounded-2xl p-4 bg-stone-50/80 space-y-3 shadow-2xs">
            <h4 className="font-bold text-stone-900 text-xs flex items-center gap-1.5 font-display">
              <Eye className="w-4 h-4 text-amber-600" />
              Puntos críticos a inspeccionar con atención:
            </h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-start gap-2.5">
                <span className="font-bold text-stone-900 shrink-0 bg-stone-200 px-1.5 py-0.5 rounded text-[11px]">Columnas:</span>
                <span className="text-stone-600 leading-relaxed">Aplastamiento de concreto en extremos superior/inferior, o varillas de acero torcidas.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="font-bold text-stone-900 shrink-0 bg-stone-200 px-1.5 py-0.5 rounded text-[11px]">Muros en 'X':</span>
                <span className="text-stone-600 leading-relaxed">Grietas cruzadas a 45° en muros de mampostería provocadas por esfuerzo cortante.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="font-bold text-stone-900 shrink-0 bg-stone-200 px-1.5 py-0.5 rounded text-[11px]">Uniones viga-columna:</span>
                <span className="text-stone-600 leading-relaxed">Separaciones, caída de recubrimiento o desprendimiento entre muro y placa de techo.</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-xs text-red-950 shadow-2xs">
            <AlertOctagon className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="font-bold block">Seguridad ante todo:</strong>
              Nunca entres a una edificación visiblemente inclinada ni permanezcas bajo losas con peligro inminente solo para tomar una fotografía.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex justify-end">
          <button
            id="close-photo-guide-footer-btn"
            onClick={onClose}
            className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-xl transition-all active:scale-95 shadow-xs"
          >
            Entendido, volver a la cámara
          </button>
        </div>
      </div>
    </div>
  );
};
