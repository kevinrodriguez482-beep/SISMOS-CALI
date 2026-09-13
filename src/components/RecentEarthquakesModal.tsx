import React from "react";
import {
  X,
  Activity,
  RefreshCw,
  ExternalLink,
  MapPin,
  Layers,
  Clock,
  ArrowRight,
  AlertTriangle,
  Info,
  ShieldAlert,
} from "lucide-react";
import type { EarthquakeEvent } from "../types";

interface RecentEarthquakesModalProps {
  isOpen: boolean;
  onClose: () => void;
  earthquakes: EarthquakeEvent[];
  isLoading: boolean;
  onRefresh: () => void;
  onSelectForChat: (eq: EarthquakeEvent) => void;
}

export const RecentEarthquakesModal: React.FC<RecentEarthquakesModalProps> = ({
  isOpen,
  onClose,
  earthquakes,
  isLoading,
  onRefresh,
  onSelectForChat,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="recent-earthquakes-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="recent-earthquakes-container"
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-stone-950 px-5 sm:px-6 py-4 text-white flex items-center justify-between border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-stone-900 rounded-2xl border border-amber-500/30 text-amber-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-display font-bold">
                  Sismicidad Reciente en Colombia
                </h2>
                <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 text-[10px] font-mono font-bold rounded border border-emerald-500/40 uppercase">
                  En Vivo
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-stone-400">
                Monitoreo sismológico en tiempo real • Red USGS & SGC
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="refresh-earthquakes-btn"
              type="button"
              onClick={onRefresh}
              disabled={isLoading}
              className="p-2 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white rounded-xl transition-colors disabled:opacity-50"
              title="Actualizar datos sísmicos"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-amber-400" : ""}`} />
            </button>
            <button
              id="close-earthquakes-modal-btn"
              onClick={onClose}
              className="p-2 hover:bg-stone-800 text-stone-400 hover:text-white rounded-xl transition-colors"
              aria-label="Cerrar ventana"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Informative banner on Colombian seismology */}
        <div className="bg-stone-100 p-3.5 border-b border-stone-200 text-xs text-stone-700 flex items-start gap-2.5 shrink-0">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-snug text-[11px]">
            Colombia es un país con alta amenaza sísmica debido a la interacción de tres placas tectónicas (Nazca, Suramericana y Caribe) y sistemas de fallas como Romeral y Boconó. Un sismo <strong>superficial (&lt; 30 km)</strong> libera su energía muy cerca de la superficie causando mayor aceleración en edificaciones.
          </p>
        </div>

        {/* List of Earthquakes */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3">
          {earthquakes.length === 0 ? (
            <div className="text-center py-10 text-stone-500 text-xs space-y-2">
              <Activity className="w-8 h-8 mx-auto text-stone-300 animate-pulse" />
              <p>Consultando la red sismológica...</p>
            </div>
          ) : (
            earthquakes.map((eq) => {
              const mag = eq.magnitude;
              const isMajor = mag >= 5.5;
              const isModerate = mag >= 4.0;

              const badgeClass = isMajor
                ? "bg-red-600 text-white shadow-xs"
                : isModerate
                ? "bg-amber-500 text-stone-950 font-bold"
                : "bg-stone-200 text-stone-800";

              const depthBadge =
                eq.depthCategory === "Superficial"
                  ? "bg-red-50 text-red-700 border-red-200"
                  : eq.depthCategory === "Intermedio"
                  ? "bg-amber-50 text-amber-800 border-amber-200"
                  : "bg-stone-100 text-stone-600 border-stone-200";

              return (
                <div
                  key={eq.id}
                  className="p-3.5 sm:p-4 rounded-2xl border border-stone-200 bg-white hover:border-amber-300 hover:shadow-xs transition-all space-y-2.5 group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-mono shrink-0 ${badgeClass}`}
                      >
                        <span className="text-[10px] font-bold leading-none opacity-80">MAG</span>
                        <span className="text-base font-extrabold leading-none mt-0.5">
                          {mag.toFixed(1)}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-xs sm:text-sm font-display font-bold text-stone-900 group-hover:text-amber-900 transition-colors">
                          {eq.place}
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-stone-500 font-mono">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-stone-400" />
                            {eq.relativeTime}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Layers className="w-3 h-3 text-stone-400" />
                            Prof. {eq.depthKm} km
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${depthBadge}`}
                          >
                            {eq.depthCategory}
                          </span>
                        </div>
                      </div>
                    </div>

                    <a
                      href={eq.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors shrink-0"
                      title="Ver ficha técnica en USGS"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  {/* Action row */}
                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-[11px] text-stone-400 font-mono">
                      Coord: {eq.coordinates[1].toFixed(2)}°, {eq.coordinates[0].toFixed(2)}°
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        onSelectForChat(eq);
                        onClose();
                      }}
                      className="px-3 py-1.5 bg-stone-900 hover:bg-amber-600 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shadow-2xs"
                    >
                      <span>Evaluar daños de este sismo</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between shrink-0 text-xs text-stone-500">
          <span>Fuente: Red Sísmica Global USGS / SGC Colombia</span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-stone-900 hover:bg-stone-950 text-white font-semibold text-xs rounded-xl transition-all shadow-xs"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
