import React from "react";
import { PhoneCall, ShieldAlert, X, AlertTriangle, HeartPulse, Flame, Radio, LifeBuoy } from "lucide-react";
import type { EmergencyContact } from "../types";

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const emergencyContacts: (EmergencyContact & { icon: React.FC<{ className?: string }> })[] = [
  {
    name: "Línea Única de Emergencias Nacional",
    number: "123",
    description: "Atención centralizada de emergencias y despacho inmediato de cuadrillas en Colombia.",
    badge: "Prioridad 1",
    icon: PhoneCall,
  },
  {
    name: "Cuerpo Oficial de Bomberos",
    number: "119",
    description: "Rescate en colapsos, fugas de gas, incendios y dictamen de riesgo inminente.",
    badge: "Rescate",
    icon: Flame,
  },
  {
    name: "Defensa Civil Colombiana",
    number: "144",
    description: "Gestión comunitaria de desastres, búsqueda y salvamento en áreas colapsadas.",
    badge: "Socorro",
    icon: Radio,
  },
  {
    name: "Cruz Roja Colombiana",
    number: "132",
    description: "Atención prehospitalaria de heridos, primeros auxilios y apoyo humanitario.",
    badge: "Salud",
    icon: HeartPulse,
  },
];

export const EmergencyModal: React.FC<EmergencyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      id="emergency-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="emergency-modal-content"
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-red-700 via-red-600 to-red-700 px-6 py-5 text-white flex items-center justify-between border-b border-red-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-800/80 rounded-2xl border border-red-500/40 shadow-xs">
              <ShieldAlert className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-display font-bold">Líneas de Emergencia Oficiales</h2>
              <p className="text-xs text-red-100 font-medium">Colombia • Asistencia y Rescate Inmediato</p>
            </div>
          </div>
          <button
            id="close-emergency-modal-btn"
            onClick={onClose}
            className="p-2 hover:bg-red-800 rounded-xl text-white/90 hover:text-white transition-colors"
            aria-label="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contacts list */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-red-950 shadow-2xs">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="font-bold text-red-950 block text-sm">Criterio de Evacuación Preventiva:</strong>
              Si la edificación presenta crujidos, varillas de acero expuestas o grietas diagonales severas, evacúa hacia un punto de encuentro y llama de inmediato a estas líneas de ayuda.
            </div>
          </div>

          <div className="space-y-2.5 pt-1">
            {emergencyContacts.map((contact) => {
              const IconComponent = contact.icon;
              return (
                <div
                  key={contact.number}
                  className="flex items-center justify-between p-4 rounded-2xl border border-stone-200 hover:border-red-300 hover:bg-red-50/30 transition-all shadow-2xs group"
                >
                  <div className="space-y-1 flex-1 pr-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-stone-100 text-stone-700 group-hover:bg-red-100 group-hover:text-red-700 transition-colors">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-stone-900 text-sm font-display">{contact.name}</span>
                      <span className="text-[10px] font-mono font-semibold bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md border border-stone-200">
                        {contact.badge}
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 leading-relaxed pl-8">{contact.description}</p>
                  </div>
                  <a
                    id={`call-btn-${contact.number}`}
                    href={`tel:${contact.number}`}
                    className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm rounded-xl shrink-0 shadow-xs hover:shadow-red-600/30 transition-all active:scale-95 border border-red-500 font-mono"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>{contact.number}</span>
                  </a>
                </div>
              );
            })}
          </div>

          {/* Quick instructions */}
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-xs text-stone-700 space-y-2.5">
            <h4 className="font-bold text-stone-900 font-display flex items-center gap-2">
              <Radio className="w-4 h-4 text-amber-600" />
              Protocolo de seguridad post-sismo en Colombia:
            </h4>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-stone-600">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-stone-400 shrink-0"></span>
                No uses ascensores en ningún caso.
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-stone-400 shrink-0"></span>
                Corta suministro de gas y electricidad.
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-stone-400 shrink-0"></span>
                Usa calzado cerrado por vidrios rotos.
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-stone-400 shrink-0"></span>
                Permanece atento a réplicas sísmicas.
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex justify-end">
          <button
            id="close-emergency-modal-footer-btn"
            onClick={onClose}
            className="px-6 py-2.5 bg-stone-900 hover:bg-stone-950 text-white font-semibold text-xs rounded-xl transition-all active:scale-95 shadow-xs"
          >
            Entendido, volver al chat
          </button>
        </div>
      </div>
    </div>
  );
};
