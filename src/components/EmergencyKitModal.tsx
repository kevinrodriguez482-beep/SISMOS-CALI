import React, { useState, useEffect } from "react";
import {
  X,
  Briefcase,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Zap,
  Droplet,
  PhoneCall,
  Shield,
  Clock,
  Sparkles,
  RotateCcw,
} from "lucide-react";

interface EmergencyKitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface KitItem {
  id: string;
  category: "vital" | "salud" | "comunicacion" | "documentos";
  title: string;
  desc: string;
}

const DEFAULT_KIT_ITEMS: KitItem[] = [
  { id: "agua", category: "vital", title: "Agua potable", desc: "Mínimo 2 litros por persona por día (para 3 días)." },
  { id: "comida", category: "vital", title: "Alimentos no perecederos", desc: "Enlatados con abre fácil, barras energéticas, frutos secos." },
  { id: "pito", category: "comunicacion", title: "Silbato / Pito de emergencia", desc: "Vital para emitir señales sonoras si quedas atrapado o en penumbra." },
  { id: "linterna", category: "comunicacion", title: "Linterna y pilas de repuesto", desc: "Evita encender velas o fósforos ante fugas invisibles de gas." },
  { id: "radio", category: "comunicacion", title: "Radio portátil AM/FM", desc: "Para escuchar boletines oficiales de la UNGRD sin depender de internet." },
  { id: "botiquin", category: "salud", title: "Botiquín de primeros auxilios", desc: "Gasas, vendajes, antiséptico, tijeras, guantes y medicamentos vitales." },
  { id: "documentos", category: "documentos", title: "Documentos de identidad protegidos", desc: "Copias de cédulas, registros, escrituras y pólizas en bolsa hermética." },
  { id: "dinero", category: "documentos", title: "Dinero en efectivo de baja denominación", desc: "Los cajeros y datáfonos colapsan tras un apagón prolongado." },
  { id: "abrigo", category: "vital", title: "Manta térmica o ropa abrigada", desc: "Protección térmica para pasar la noche a la intemperie en punto de encuentro." },
];

const PROTOCOLS = [
  {
    step: "1",
    icon: <Flame className="w-4 h-4 text-orange-500" />,
    title: "Cierra la llave de paso de gas",
    desc: "El sismo suele fracturar tuberías flexibles. El gas acumulado causa incendios secundarios.",
  },
  {
    step: "2",
    icon: <Zap className="w-4 h-4 text-amber-500" />,
    title: "Baja los interruptores (breakers) de electricidad",
    desc: "Previene chispazos o cortocircuitos si hay desprendimientos o tuberías de agua rotas.",
  },
  {
    step: "3",
    icon: <Droplet className="w-4 h-4 text-blue-500" />,
    title: "Cierra el registro general de agua",
    desc: "Evita inundaciones que debiliten el suelo o saturen falsos techos fracturados.",
  },
  {
    step: "4",
    icon: <AlertTriangle className="w-4 h-4 text-red-500" />,
    title: "No enciendas fósforos ni velas",
    desc: "Usa exclusivamente linternas LED para iluminar las vías de evacuación.",
  },
  {
    step: "5",
    icon: <Shield className="w-4 h-4 text-emerald-500" />,
    title: "Usa calzado resistente cerrado",
    desc: "Protege tus pies de vidrios despedazados, clavos y escombros en el piso.",
  },
  {
    step: "6",
    icon: <CheckCircle2 className="w-4 h-4 text-amber-600" />,
    title: "Evacua por escaleras al punto de encuentro",
    desc: "Nunca tomes el ascensor; puede quedar bloqueado entre pisos sin fluido eléctrico.",
  },
];

export const EmergencyKitModal: React.FC<EmergencyKitModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<"mochila" | "protocolo">("mochila");
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem("sismoscan_emergency_kit");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("sismoscan_emergency_kit", JSON.stringify(checkedItems));
    } catch (e) {
      console.warn("Could not save to localStorage", e);
    }
  }, [checkedItems]);

  if (!isOpen) return null;

  const toggleItem = (id: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleResetChecklist = () => {
    if (window.confirm("¿Deseas restablecer los elementos marcados de tu mochila?")) {
      setCheckedItems({});
    }
  };

  const completedCount = Object.values(checkedItems).filter(Boolean).length;
  const totalItems = DEFAULT_KIT_ITEMS.length;
  const progressPercent = Math.round((completedCount / totalItems) * 100);

  return (
    <div
      id="emergency-kit-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="emergency-kit-container"
        className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="bg-stone-950 px-5 sm:px-6 py-4 text-white flex items-center justify-between border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-stone-900 rounded-2xl border border-amber-500/30 text-amber-400">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-display font-bold">Mochila 72 Horas & Protocolo</h2>
              <p className="text-[11px] sm:text-xs text-stone-400">Guía de preparación comunitaria • UNGRD / Cruz Roja</p>
            </div>
          </div>

          <button
            id="close-kit-modal-btn"
            onClick={onClose}
            className="p-1.5 hover:bg-stone-800 text-stone-400 hover:text-white rounded-xl transition-colors"
            aria-label="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="bg-stone-100 p-2 border-b border-stone-200 flex gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("mochila")}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === "mochila"
                ? "bg-white text-stone-900 shadow-xs border border-stone-200"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <Briefcase className="w-3.5 h-3.5 text-amber-600" />
            <span>Mochila de las 72 Horas</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded-full font-extrabold">
              {completedCount}/{totalItems}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("protocolo")}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === "protocolo"
                ? "bg-white text-stone-900 shadow-xs border border-stone-200"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-red-600" />
            <span>Protocolo de los Primeros 10 Minutos</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-stone-800">
          {activeTab === "mochila" ? (
            <div className="space-y-4">
              {/* Progress Indicator */}
              <div className="p-4 bg-gradient-to-br from-amber-50 to-stone-50 border border-amber-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-stone-800 font-display flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    Nivel de preparación de tu hogar:
                  </span>
                  <span className="font-mono font-bold text-amber-900">{progressPercent}% preparado</span>
                </div>
                <div className="w-full h-2.5 bg-stone-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="text-[11px] text-stone-500">
                  {progressPercent === 100
                    ? "¡Excelente! Tu mochila cuenta con todos los elementos esenciales para subsistir 72 horas."
                    : "Completa los suministros prioritarios para responder ante cortes de agua, luz o evacuación."}
                </p>
              </div>

              {/* Checklist list */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-stone-500 px-1">
                  <span>Marca los elementos que ya tienes listos:</span>
                  <button
                    type="button"
                    onClick={handleResetChecklist}
                    className="text-[11px] text-stone-400 hover:text-stone-700 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reiniciar lista</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {DEFAULT_KIT_ITEMS.map((item) => {
                    const isChecked = !!checkedItems[item.id];
                    return (
                      <div
                        key={item.id}
                        onClick={() => toggleItem(item.id)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                          isChecked
                            ? "bg-emerald-50/70 border-emerald-300 text-stone-900"
                            : "bg-white border-stone-200 hover:border-stone-300 text-stone-700 shadow-2xs"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                            isChecked
                              ? "bg-emerald-600 border-emerald-600 text-white"
                              : "border-stone-300 bg-stone-50"
                          }`}
                        >
                          {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <strong className={`block text-xs font-bold ${isChecked ? "text-emerald-950 line-through opacity-80" : "text-stone-900"}`}>
                            {item.title}
                          </strong>
                          <p className="text-[11px] text-stone-500 mt-0.5 leading-snug">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3.5">
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-950 flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>¡Atención!</strong> Tras un sismo de magnitud, los segundos iniciales son determinantes para evitar explosiones, incendios y asfixia. Sigue este orden técnico:
                </p>
              </div>

              <div className="space-y-2 pt-1">
                {PROTOCOLS.map((p, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-stone-50 rounded-2xl border border-stone-200/90 flex items-start gap-3 text-xs"
                  >
                    <span className="w-6 h-6 rounded-full bg-stone-900 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0">
                      {p.step}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 font-bold text-stone-900 font-display">
                        {p.icon}
                        <span>{p.title}</span>
                      </div>
                      <p className="text-stone-600 text-[11px] mt-1 leading-snug">
                        {p.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-stone-500">
            Fuente: UNGRD & Cruz Roja Colombiana
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-stone-900 hover:bg-stone-950 text-white font-semibold text-xs rounded-xl transition-all shadow-xs"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
