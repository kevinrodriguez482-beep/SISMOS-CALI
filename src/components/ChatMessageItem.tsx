import React, { useState } from "react";
import Markdown from "react-markdown";
import {
  Activity,
  User,
  HeartHandshake,
  HelpCircle,
  Clock,
  Maximize2,
  X,
  Send,
  Camera,
  CheckCircle2,
  Ruler,
} from "lucide-react";
import type { ChatMessage, StructuralEvaluation } from "../types";
import { RiskCard } from "./RiskCard";
import { ImageInspectorModal } from "./ImageInspectorModal";

interface ChatMessageItemProps {
  message: ChatMessage;
  onSendFollowUpAnswer?: (answer: string) => void;
  onOpenEmergencyModal?: () => void;
  onOpenTechnicalReport?: (evaluation: StructuralEvaluation, imageSrc?: string) => void;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
  onSendFollowUpAnswer,
  onOpenEmergencyModal,
  onOpenTechnicalReport,
}) => {
  const isAssistant = message.role === "assistant";
  const [imageModalOpen, setImageModalOpen] = useState(false);

  return (
    <div
      id={`chat-msg-${message.id}`}
      className={`flex flex-col gap-1.5 w-full my-3.5 ${
        isAssistant ? "items-start" : "items-end"
      }`}
    >
      <div
        className={`flex items-start gap-3 max-w-[96%] sm:max-w-[88%] ${
          isAssistant ? "flex-row" : "flex-row-reverse"
        }`}
      >
        {/* Avatar */}
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-transform ${
            isAssistant
              ? "bg-gradient-to-br from-amber-500 to-amber-700 text-white font-bold border border-amber-400/40"
              : "bg-stone-800 text-stone-200 border border-stone-700"
          }`}
        >
          {isAssistant ? (
            <Activity className="w-4 h-4" />
          ) : (
            <User className="w-4 h-4" />
          )}
        </div>

        {/* Message Bubble Container */}
        <div className="flex flex-col space-y-1.5 min-w-0 flex-1">
          {/* Main Bubble */}
          <div
            className={`rounded-2xl p-4 sm:p-5 text-sm leading-relaxed shadow-sm transition-all ${
              isAssistant
                ? "bg-white text-stone-800 border border-stone-200/90 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.04)]"
                : "bg-stone-900 text-white border border-stone-800"
            }`}
          >
            {/* If user or assistant uploaded/attached an image */}
            {message.image && (
              <div className="mb-3.5">
                <div className="relative group rounded-xl overflow-hidden border border-stone-300 max-w-sm bg-stone-950 shadow-sm cursor-pointer">
                  <div className="absolute top-2 left-2 z-10 bg-black/60 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Camera className="w-3 h-3 text-amber-400" />
                    <span>Registro Fotográfico</span>
                  </div>
                  <img
                    src={message.image.dataUrl}
                    alt="Elemento estructural fotografiado"
                    className="w-full max-h-72 object-cover group-hover:scale-103 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                    onClick={() => setImageModalOpen(true)}
                  />
                  <button
                    type="button"
                    onClick={() => setImageModalOpen(true)}
                    className="absolute bottom-2.5 right-2.5 px-2.5 py-1 bg-black/80 hover:bg-black text-white rounded-lg text-xs flex items-center gap-1.5 shadow-md opacity-90 group-hover:opacity-100 transition-opacity border border-white/20"
                    title="Ampliar fotografía e inspeccionar con fisurómetro"
                  >
                    <Ruler className="w-3.5 h-3.5 text-amber-400" />
                    <span>Inspeccionar / Fisurómetro</span>
                  </button>
                </div>
              </div>
            )}

            {/* Calming reassurance banner if stress/panic detected */}
            {message.evaluation?.calmMessage && (
              <div className="mb-3.5 p-3.5 bg-gradient-to-r from-teal-50 to-emerald-50/60 border border-teal-200/80 text-teal-950 rounded-xl flex items-start gap-3 text-xs shadow-2xs">
                <div className="p-1.5 bg-teal-600 text-white rounded-lg shrink-0 mt-0.5 shadow-2xs">
                  <HeartHandshake className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold block text-teal-950 font-display text-[13px]">
                    Mensaje de calma y serenidad:
                  </span>
                  <p className="mt-0.5 text-teal-900 leading-relaxed">
                    {message.evaluation.calmMessage}
                  </p>
                </div>
              </div>
            )}

            {/* Markdown Text Body */}
            <div
              className={`prose prose-sm max-w-none break-words ${
                isAssistant
                  ? "prose-stone prose-p:my-2 prose-headings:font-display prose-headings:font-bold prose-headings:text-stone-900 prose-ul:my-2 prose-li:my-0.5 prose-strong:text-stone-950"
                  : "prose-invert text-white prose-p:my-1 text-stone-100 prose-strong:text-white"
              }`}
            >
              <Markdown>{message.text}</Markdown>
            </div>

            {/* Prominent Risk Card if classification is present */}
            {message.evaluation &&
              (message.evaluation.classification ||
                message.evaluation.recommendation) && (
                <RiskCard
                  evaluation={message.evaluation}
                  onOpenEmergencyModal={onOpenEmergencyModal}
                  onOpenTechnicalReport={
                    onOpenTechnicalReport
                      ? () =>
                          onOpenTechnicalReport(
                            message.evaluation!,
                            message.image?.dataUrl
                          )
                      : undefined
                  }
                />
              )}

            {/* Follow-up questions interactive chips */}
            {message.evaluation?.followUpQuestions &&
              message.evaluation.followUpQuestions.length > 0 && (
                <div className="mt-4 pt-3.5 border-t border-stone-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                      Preguntas sugeridas para precisar el riesgo:
                    </span>
                    <span className="text-[10px] text-stone-400 font-medium">Toca para responder</span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {message.evaluation.followUpQuestions.map((q, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() =>
                          onSendFollowUpAnswer &&
                          onSendFollowUpAnswer(`Sobre "${q}": `)
                        }
                        className="text-left text-xs bg-amber-50/70 hover:bg-amber-100/90 text-amber-950 border border-amber-200/80 px-3.5 py-2 rounded-xl transition-all flex items-center justify-between group active:scale-99"
                      >
                        <span className="font-medium">{q}</span>
                        <Send className="w-3.5 h-3.5 text-amber-700 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity ml-2" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
          </div>

          {/* Message Footer Info */}
          <div
            className={`flex items-center gap-2 text-[11px] text-stone-400 px-1 ${
              isAssistant ? "justify-start" : "justify-end"
            }`}
          >
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            {isAssistant && (
              <>
                <span>•</span>
                <span className="font-medium text-stone-500">SismoScan IA</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Technical Image Inspector with Crack Caliper */}
      {imageModalOpen && message.image && (
        <ImageInspectorModal
          isOpen={imageModalOpen}
          onClose={() => setImageModalOpen(false)}
          imageUrl={message.image.dataUrl}
          imageName={message.image.name || "Fotografía de elemento analizado"}
        />
      )}
    </div>
  );
};
