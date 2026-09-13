import React from "react";
import {
  Activity,
  ChevronRight,
  RefreshCw,
  Layers,
  ArrowRight,
  Radio,
  ExternalLink,
} from "lucide-react";
import type { EarthquakeEvent } from "../types";

interface LiveSeismicBannerProps {
  latestEarthquake: EarthquakeEvent | null;
  isLoading: boolean;
  onOpenRecentEarthquakes: () => void;
  onSelectEarthquakeForChat: (eq: EarthquakeEvent) => void;
}

export const LiveSeismicBanner: React.FC<LiveSeismicBannerProps> = ({
  latestEarthquake,
  isLoading,
  onOpenRecentEarthquakes,
  onSelectEarthquakeForChat,
}) => {
  if (isLoading && !latestEarthquake) {
    return (
      <div className="bg-stone-900 text-stone-300 px-4 py-2 text-xs flex items-center justify-between border-b border-stone-800">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
          <span>Sincronizando sismicidad reciente de Colombia (USGS / SGC)...</span>
        </div>
      </div>
    );
  }

  if (!latestEarthquake) return null;

  const mag = latestEarthquake.magnitude;
  const magColor =
    mag >= 6.0
      ? "bg-red-600 text-white"
      : mag >= 4.5
      ? "bg-amber-500 text-stone-950 font-bold"
      : mag >= 3.5
      ? "bg-amber-100 text-amber-900 border border-amber-300"
      : "bg-stone-800 text-stone-300";

  return (
    <div
      id="live-seismic-banner"
      className="bg-stone-950 text-white px-3 sm:px-4 py-2 sm:py-2.5 border-b border-stone-800/80 shrink-0 select-none shadow-xs"
    >
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        {/* Left: Indicator & Last quake details */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-stone-900 rounded-md border border-stone-700/60 shrink-0">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-mono font-bold tracking-wider text-emerald-400 uppercase">
              EN VIVO
            </span>
          </div>

          <div className="flex items-center gap-2 truncate">
            <span
              className={`px-2 py-0.5 rounded-md font-mono text-[11px] font-extrabold shrink-0 ${magColor}`}
            >
              M {mag.toFixed(1)}
            </span>

            <span className="text-stone-200 font-medium truncate">
              {latestEarthquake.place}
            </span>

            <span className="text-stone-400 text-[11px] hidden md:inline shrink-0">
              • Prof. {latestEarthquake.depthKm} km ({latestEarthquake.depthCategory})
            </span>

            <span className="text-amber-400/90 font-mono text-[11px] shrink-0">
              • {latestEarthquake.relativeTime}
            </span>
          </div>
        </div>

        {/* Right: Quick actions */}
        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
          <button
            id="banner-eval-quake-btn"
            type="button"
            onClick={() => onSelectEarthquakeForChat(latestEarthquake)}
            className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg text-[11px] transition-colors flex items-center gap-1"
            title="Evaluar afectaciones tras este sismo"
          >
            <span>Evaluar este sismo</span>
            <ArrowRight className="w-3 h-3" />
          </button>

          <button
            id="banner-view-all-quakes-btn"
            type="button"
            onClick={onOpenRecentEarthquakes}
            className="px-2 py-1 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white rounded-lg text-[11px] font-medium transition-colors flex items-center gap-1"
          >
            <Activity className="w-3 h-3 text-stone-400" />
            <span className="hidden sm:inline">Historial</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
