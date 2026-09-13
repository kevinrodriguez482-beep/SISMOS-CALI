import React from "react";
import {
  Activity,
  PhoneCall,
  Camera,
  RotateCcw,
  ShieldCheck,
  Building2,
  Info,
  Radio,
  Sparkles,
  Briefcase,
} from "lucide-react";

interface HeaderProps {
  onOpenEmergencyModal: () => void;
  onOpenPhotoGuide: () => void;
  onOpenEmergencyKit: () => void;
  onOpenRecentEarthquakes: () => void;
  latestEarthquakeMagnitude?: number;
  onResetChat: () => void;
  onOpenAboutModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenEmergencyModal,
  onOpenPhotoGuide,
  onOpenEmergencyKit,
  onOpenRecentEarthquakes,
  latestEarthquakeMagnitude,
  onResetChat,
  onOpenAboutModal,
}) => {
  return (
    <header
      id="sismoscan-header"
      className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-stone-200/80 px-3 sm:px-5 py-2.5 transition-all shadow-xs"
    >
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3">
          <div className="relative group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-white flex items-center justify-center shadow-md shadow-amber-600/20 shrink-0 border border-amber-400/40">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            {/* Live radar dot */}
            <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-display font-extrabold tracking-tight text-stone-900 leading-none">
                SismoScan
              </h1>
              <span className="text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300/80 px-1.5 py-0.5 rounded-md uppercase tracking-wider font-mono">
                Colombia
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded-md">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                NSR-10
              </span>
            </div>
            <p className="text-[11px] text-stone-500 flex items-center gap-1.5 font-medium mt-0.5">
              <Building2 className="w-3 h-3 text-stone-400" />
              <span>Triaje Estructural Post-Sismo</span>
              <span className="text-stone-300">•</span>
              <button
                type="button"
                onClick={onOpenAboutModal}
                className="text-amber-700 hover:text-amber-800 font-semibold hover:underline"
              >
                ODS 9
              </button>
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Emergency call shortcut */}
          <button
            id="header-emergency-btn"
            type="button"
            onClick={onOpenEmergencyModal}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs hover:shadow-red-600/30 transition-all active:scale-95 shrink-0 border border-red-500"
            title="Líneas de emergencia Colombia (123 / 119)"
          >
            <PhoneCall className="w-3.5 h-3.5 animate-bounce" />
            <span>Emergencias</span>
            <span className="hidden xs:inline bg-red-800/80 text-[10px] px-1.5 py-0.5 rounded-md font-mono">
              123
            </span>
          </button>

          {/* Emergency Kit 72h button */}
          <button
            id="header-emergency-kit-btn"
            type="button"
            onClick={onOpenEmergencyKit}
            className="px-2.5 py-1.5 sm:px-3 sm:py-2 bg-amber-50 hover:bg-amber-100/80 text-amber-950 text-xs font-semibold rounded-xl border border-amber-200 transition-all flex items-center gap-1.5 active:scale-95"
            title="Mochila de 72 Horas y Protocolo Post-Sismo"
          >
            <Briefcase className="w-4 h-4 text-amber-700" />
            <span className="hidden sm:inline">Kit 72h</span>
          </button>

          {/* Sismicidad button */}
          <button
            id="header-sismicidad-btn"
            type="button"
            onClick={onOpenRecentEarthquakes}
            className="px-2.5 py-1.5 sm:px-3 sm:py-2 bg-stone-100 hover:bg-stone-200/80 text-stone-800 text-xs font-semibold rounded-xl border border-stone-200 transition-all flex items-center gap-1.5 active:scale-95"
            title="Monitor sísmico de Colombia en vivo"
          >
            <Activity className="w-4 h-4 text-amber-600 animate-pulse" />
            <span className="hidden sm:inline">Sismos</span>
            {latestEarthquakeMagnitude !== undefined && (
              <span className="bg-amber-200 text-amber-900 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md">
                M {latestEarthquakeMagnitude.toFixed(1)}
              </span>
            )}
          </button>

          {/* Photo guide button */}
          <button
            id="header-photo-guide-btn"
            type="button"
            onClick={onOpenPhotoGuide}
            className="px-2.5 py-1.5 sm:px-3 sm:py-2 bg-stone-100 hover:bg-stone-200/80 text-stone-700 text-xs font-semibold rounded-xl border border-stone-200 transition-all flex items-center gap-1.5 active:scale-95"
            title="Guía de toma de fotos"
          >
            <Camera className="w-4 h-4 text-stone-600" />
            <span className="hidden md:inline">Guía de fotos</span>
          </button>

          {/* About / ODS 9 info */}
          <button
            id="header-about-btn"
            type="button"
            onClick={onOpenAboutModal}
            className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors border border-transparent hover:border-stone-200"
            title="Sobre SismoScan y ODS 9"
            aria-label="Información del proyecto"
          >
            <Info className="w-4 h-4" />
          </button>

          {/* Reset chat */}
          <button
            id="header-reset-chat-btn"
            type="button"
            onClick={onResetChat}
            className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors border border-transparent hover:border-stone-200"
            title="Reiniciar evaluación"
            aria-label="Reiniciar evaluación"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
