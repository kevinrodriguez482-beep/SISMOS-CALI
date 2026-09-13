import React, { useState } from "react";
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Grid,
  Ruler,
  Camera,
  Info,
  Maximize2,
} from "lucide-react";

interface ImageInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  imageName?: string;
}

const CRACK_CALIBRATION_STEPS = [
  { widthMm: "0.2 mm", label: "Fisura capilar / pintura", comparison: "Grosor de un cabello", color: "bg-emerald-500", hClass: "h-[1px]" },
  { widthMm: "0.5 mm", label: "Fisura en pañete/revoque", comparison: "Borde de una hoja de papel doblada", color: "bg-yellow-500", hClass: "h-[2px]" },
  { widthMm: "1.0 mm", label: "Grieta menor", comparison: "Grosor de una tarjeta de crédito o débito", color: "bg-amber-500", hClass: "h-[3px]" },
  { widthMm: "2.0 mm", label: "Grieta moderada (revisar)", comparison: "Grosor de una moneda de $500 COP", color: "bg-orange-500", hClass: "h-[5px]" },
  { widthMm: "5.0 mm", label: "Grieta severa (peligro)", comparison: "Grosor de un lápiz o llave común", color: "bg-red-500", hClass: "h-[8px]" },
  { widthMm: "> 10 mm", label: "Falla crítica / separación", comparison: "Grosor de un dedo (evacuación obligatoria)", color: "bg-red-700", hClass: "h-[14px]" },
];

export const ImageInspectorModal: React.FC<ImageInspectorModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  imageName,
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showGrid, setShowGrid] = useState(false);
  const [showCaliper, setShowCaliper] = useState(true);

  if (!isOpen) return null;

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.3, 3.5));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.3, 0.7));
  const handleResetZoom = () => setZoomLevel(1);

  return (
    <div
      id="image-inspector-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-stone-950/90 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="image-inspector-container"
        className="relative w-full max-w-5xl h-[92vh] bg-stone-950 rounded-3xl shadow-2xl border border-stone-800 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar */}
        <div className="bg-stone-900/95 border-b border-stone-800 px-4 py-3 flex items-center justify-between text-white shrink-0 z-20">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 bg-stone-800 rounded-lg text-amber-400">
              <Camera className="w-4 h-4" />
            </div>
            <div className="truncate">
              <h3 className="text-xs sm:text-sm font-display font-bold truncate">
                {imageName || "Inspección Fotográfica Detallada"}
              </h3>
              <p className="text-[10px] sm:text-[11px] text-stone-400">
                Visor técnico con calibrador de fisuras y cuadrícula de aplome
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Grid Toggle */}
            <button
              type="button"
              onClick={() => setShowGrid(!showGrid)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                showGrid
                  ? "bg-amber-500 text-stone-950 font-bold"
                  : "bg-stone-800 hover:bg-stone-700 text-stone-300"
              }`}
              title="Alternar cuadrícula de nivel/plomada"
            >
              <Grid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cuadrícula</span>
            </button>

            {/* Caliper Toggle */}
            <button
              type="button"
              onClick={() => setShowCaliper(!showCaliper)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                showCaliper
                  ? "bg-amber-500 text-stone-950 font-bold"
                  : "bg-stone-800 hover:bg-stone-700 text-stone-300"
              }`}
              title="Alternar calibrador de fisuras"
            >
              <Ruler className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Fisurómetro</span>
            </button>

            {/* Zoom controls */}
            <div className="flex items-center bg-stone-800 rounded-xl border border-stone-700 p-0.5">
              <button
                type="button"
                onClick={handleZoomOut}
                className="p-1.5 hover:bg-stone-700 text-stone-300 rounded-lg transition-colors"
                title="Alejar"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] font-mono font-bold px-1.5 text-stone-300">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                type="button"
                onClick={handleZoomIn}
                className="p-1.5 hover:bg-stone-700 text-stone-300 rounded-lg transition-colors"
                title="Acercar"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleResetZoom}
                className="p-1.5 hover:bg-stone-700 text-stone-400 hover:text-white rounded-lg transition-colors border-l border-stone-700"
                title="Reiniciar tamaño"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-stone-800 text-stone-400 hover:text-white rounded-xl transition-colors ml-1"
              aria-label="Cerrar visor"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewport Area */}
        <div className="relative flex-1 bg-stone-950 overflow-hidden flex items-center justify-center select-none">
          {/* Optional Grid Overlay */}
          {showGrid && (
            <div
              className="absolute inset-0 pointer-events-none z-10 opacity-30"
              style={{
                backgroundImage:
                  "linear-gradient(to right, rgba(245, 158, 11, 0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(245, 158, 11, 0.4) 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />
          )}

          {/* Scaled Image Container */}
          <div
            className="transition-transform duration-150 ease-out flex items-center justify-center p-4 max-w-full max-h-full"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            <img
              src={imageUrl}
              alt="Inspección de daño estructural"
              className="max-h-[78vh] max-w-full object-contain rounded-lg shadow-2xl pointer-events-none"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Floating Crack Caliper Tool (Fisurómetro) */}
          {showCaliper && (
            <div className="absolute bottom-4 right-4 z-20 max-w-xs sm:max-w-sm bg-stone-900/95 backdrop-blur-md border border-stone-700/80 rounded-2xl p-3.5 text-white shadow-2xl space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 font-display">
                  <Ruler className="w-3.5 h-3.5" />
                  <span>Fisurómetro de Comparación</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCaliper(false)}
                  className="text-stone-400 hover:text-white p-1"
                  title="Ocultar comparador"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-[11px] text-stone-400 leading-snug">
                Compara el ancho visible de la fisura con estas referencias físicas comunes:
              </p>

              <div className="space-y-1.5 pt-1">
                {CRACK_CALIBRATION_STEPS.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-1.5 rounded-lg bg-stone-800/80 border border-stone-700/60 flex items-center justify-between text-[11px] gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-2.5 ${step.color} rounded-full shrink-0 h-2.5`} />
                      <div className="truncate">
                        <span className="font-bold text-stone-200 block truncate">{step.label}</span>
                        <span className="text-[10px] text-stone-400 block truncate">{step.comparison}</span>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-amber-400 shrink-0 text-[11px] px-1.5 py-0.5 bg-stone-900 rounded border border-stone-700">
                      {step.widthMm}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Viewport Bottom Status */}
        <div className="bg-stone-900 border-t border-stone-800 px-4 py-2 text-stone-400 text-[11px] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-amber-500" />
            <span>
              Tip: Si la fisura supera <strong>1.5 mm</strong> o atraviesa una columna, la estructura debe ser evacuada e inspeccionada de inmediato.
            </span>
          </div>
          <span className="font-mono text-stone-500 hidden sm:inline">NSR-10 / AIS</span>
        </div>
      </div>
    </div>
  );
};
