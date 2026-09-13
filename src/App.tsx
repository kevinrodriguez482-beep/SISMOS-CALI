import React, { useState, useEffect, useRef } from "react";
import {
  Activity,
  Camera,
  Upload,
  AlertTriangle,
  HeartHandshake,
  CheckCircle2,
  PhoneCall,
  Sparkles,
  Info,
} from "lucide-react";
import { Header } from "./components/Header";
import { ChatMessageItem } from "./components/ChatMessageItem";
import { ChatInput } from "./components/ChatInput";
import { EmergencyModal } from "./components/EmergencyModal";
import { PhotoGuideModal } from "./components/PhotoGuideModal";
import { AboutModal } from "./components/AboutModal";
import { TechnicalReportModal } from "./components/TechnicalReportModal";
import { EmergencyKitModal } from "./components/EmergencyKitModal";
import { LiveSeismicBanner } from "./components/LiveSeismicBanner";
import { RecentEarthquakesModal } from "./components/RecentEarthquakesModal";
import type { ChatMessage, StructuralEvaluation, EarthquakeEvent } from "./types";

const INITIAL_MESSAGE: ChatMessage = {
  id: "initial-welcome",
  role: "assistant",
  text: `¡Hola! Te doy la bienvenida a **SismoScan**, tu asistente inteligente para la evaluación preliminar de riesgo estructural en edificaciones post-sismo en Colombia (proyecto universitario alineado con el **ODS 9: Industria, Innovación e Infraestructura**).

> ⚠️ **Aviso de seguridad:**
> SismoScan **no reemplaza** el peritaje técnico in situ de un ingeniero civil/estructural ni el dictamen oficial del **Cuerpo de Bomberos (119)**, **Defensa Civil (144)** ni **Gestión del Riesgo (UNGRD / 123)**.

Mi objetivo es orientarte de forma ágil y con serenidad si los daños visibles (grietas en columnas, muros en 'X', vigas deformadas, hundimientos) permiten **permanecer con precaución** o si existe **riesgo de colapso y debes evacuar de inmediato**.

---
**¿Cómo realizar tu primera evaluación?**
1. **Sube o toma una fotografía clara** del elemento afectado (muro, columna, unión o techo) con los botones inferiores.
2. O escribe una **descripción del daño** o de ruidos inusuales que percibas.`,
  timestamp: Date.now(),
  isInitialGreeting: true,
};

const playUrgentAlertSound = () => {
  try {
    const AudioContextClass =
      window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === "suspended") {
      ctx.resume();
    }
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.18); // A5
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.45);
  } catch {
    // Silent fail if browser restricts audio
  }
};

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [INITIAL_MESSAGE];
  });
  const [isLoading, setIsLoading] = useState(false);
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);
  const [photoGuideOpen, setPhotoGuideOpen] = useState(false);
  const [aboutModalOpen, setAboutModalOpen] = useState(false);
  const [emergencyKitOpen, setEmergencyKitOpen] = useState(false);
  const [technicalReportOpen, setTechnicalReportOpen] = useState(false);
  const [recentEarthquakesOpen, setRecentEarthquakesOpen] = useState(false);
  const [earthquakes, setEarthquakes] = useState<EarthquakeEvent[]>([]);
  const [isSeismicLoading, setIsSeismicLoading] = useState(true);
  const [activeReportData, setActiveReportData] = useState<{
    evaluation: StructuralEvaluation;
    imageSrc?: string;
    date: Date;
  } | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Fetch live earthquakes for Colombia
  const fetchEarthquakes = async () => {
    try {
      setIsSeismicLoading(true);
      const res = await fetch("/api/earthquakes");
      if (!res.ok) throw new Error("Error fetching earthquakes");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setEarthquakes(json.data);
      }
    } catch (err) {
      console.warn("Could not load earthquakes:", err);
    } finally {
      setIsSeismicLoading(false);
    }
  };

  useEffect(() => {
    fetchEarthquakes();
    // Poll updates every 2 minutes
    const interval = setInterval(fetchEarthquakes, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleOpenTechnicalReport = (
    evaluation: StructuralEvaluation,
    imageSrc?: string
  ) => {
    setActiveReportData({
      evaluation,
      imageSrc,
      date: new Date(),
    });
    setTechnicalReportOpen(true);
  };

  const handleSendMessage = async (
    text: string,
    image?: { dataUrl: string; name?: string; mimeType: string }
  ) => {
    if (!text.trim() && !image) return;

    const userMessageId = `user-${Date.now()}`;
    const newUserMessage: ChatMessage = {
      id: userMessageId,
      role: "user",
      text: text.trim(),
      timestamp: Date.now(),
      image,
    };

    // Update state with user message
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const payload: any = {
        messages: updatedMessages.map((m) => ({
          role: m.role,
          text: m.text,
        })),
        currentMessage: text,
      };

      if (image) {
        payload.image = {
          mimeType: image.mimeType,
          base64: image.dataUrl,
        };
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      // Defensive reading to prevent Safari/WebKit "The string did not match the expected pattern" errors
      const rawText = await response.text();
      let resData: any = null;

      if (rawText && rawText.trim()) {
        try {
          resData = JSON.parse(rawText);
        } catch (jsonErr) {
          console.warn("Non-JSON response received from server:", rawText.slice(0, 200));
        }
      }

      if (!response.ok) {
        const serverError =
          resData?.error ||
          (response.status === 504
            ? "Tiempo de espera agotado al analizar la imagen. Por favor reintenta con otra foto."
            : `Error de comunicación con el servidor (${response.status})`);
        throw new Error(serverError);
      }

      if (!resData || !resData.success || !resData.data) {
        throw new Error(
          resData?.error ||
            "No se pudo completar la evaluación estructural. Por favor intenta de nuevo."
        );
      }

      const analysis = resData.data;

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        text: analysis.reply || "He procesado la información disponible.",
        timestamp: Date.now(),
        evaluation: {
          classification: analysis.classification,
          recommendation: analysis.recommendation,
          visualSignals: analysis.visualSignals || [],
          elementAnalyzed: analysis.elementAnalyzed,
          confidence: analysis.confidence,
          urgentActionRequired: analysis.urgentActionRequired,
          needsMorePhotos: analysis.needsMorePhotos,
          followUpQuestions: analysis.followUpQuestions || [],
          calmMessage: analysis.calmMessage,
        },
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (
        analysis.recommendation === "Evacuar de inmediato" ||
        analysis.urgentActionRequired
      ) {
        playUrgentAlertSound();
      }
    } catch (err: any) {
      console.error("Chat error:", err);
      let userFriendlyError = err?.message || "Error de comunicación temporal";
      if (
        userFriendlyError.includes("pattern") ||
        userFriendlyError.includes("SyntaxError") ||
        userFriendlyError.includes("Unexpected") ||
        userFriendlyError.includes("JSON")
      ) {
        userFriendlyError =
          "Hubo una interrupción breve en la conexión con el motor de análisis. Por favor reintenta con tu mensaje o imagen.";
      }

      const errorMessage: ChatMessage = {
        id: `assistant-err-${Date.now()}`,
        role: "assistant",
        text: `Lo siento, tuvimos una dificultad momentánea: *${userFriendlyError}*.

⚠️ **Prioridad de seguridad:** Si notas daños severos, inclinaciones pronunciadas o crujidos en la edificación, por favor **evacúa de inmediato** hacia un área despejada y comunícate con la **Línea de Emergencias 123** o al **Cuerpo de Bomberos 119** en Colombia.`,
        timestamp: Date.now(),
        evaluation: {
          recommendation: "Evacuar de inmediato",
          classification: "Daño severo / riesgo de colapso",
          visualSignals: ["Incertidumbre técnica momentánea - Precaución preventiva"],
          urgentActionRequired: true,
        },
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    if (
      window.confirm(
        "¿Deseas reiniciar la conversación e iniciar una nueva evaluación?"
      )
    ) {
      setMessages([{ ...INITIAL_MESSAGE, timestamp: Date.now() }]);
    }
  };

  const handleFollowUpAnswer = (suggestedText: string) => {
    handleSendMessage(suggestedText);
  };

  const handleSelectEarthquakeForChat = (eq: EarthquakeEvent) => {
    handleSendMessage(
      `Sentí el temblor de Magnitud ${eq.magnitude.toFixed(1)} ocurrido en ${eq.place} (${eq.relativeTime}, prof. ${eq.depthKm} km). Noté grietas en mi vivienda y quiero evaluar si hay riesgo estructural.`
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fa] text-stone-900 font-sans">
      {/* Top Header */}
      <Header
        onOpenEmergencyModal={() => setEmergencyModalOpen(true)}
        onOpenPhotoGuide={() => setPhotoGuideOpen(true)}
        onOpenEmergencyKit={() => setEmergencyKitOpen(true)}
        onOpenRecentEarthquakes={() => setRecentEarthquakesOpen(true)}
        latestEarthquakeMagnitude={earthquakes[0]?.magnitude}
        onResetChat={handleResetChat}
        onOpenAboutModal={() => setAboutModalOpen(true)}
      />

      {/* Live Seismic Feed Ticker */}
      <LiveSeismicBanner
        latestEarthquake={earthquakes[0] || null}
        isLoading={isSeismicLoading}
        onOpenRecentEarthquakes={() => setRecentEarthquakesOpen(true)}
        onSelectEarthquakeForChat={handleSelectEarthquakeForChat}
      />

      {/* Safety Alert Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-stone-950 px-4 py-2 text-xs font-semibold flex items-center justify-center gap-2 text-center shadow-xs border-b border-amber-500/40">
        <AlertTriangle className="w-4 h-4 shrink-0 text-stone-900 animate-pulse" />
        <span>
          En caso de réplicas, ruidos estructurales o desplome: <strong>EVACUA DE INMEDIATO</strong> y llama al <strong>123 / 119</strong> en Colombia.
        </span>
        <button
          type="button"
          onClick={() => setEmergencyModalOpen(true)}
          className="hidden sm:inline-flex items-center gap-1 ml-2 px-2 py-0.5 bg-stone-900 text-white rounded text-[10px] font-bold uppercase tracking-wider hover:bg-stone-800 transition-colors"
        >
          <PhoneCall className="w-2.5 h-2.5" />
          Líneas 123
        </button>
      </div>

      {/* Chat Messages Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-3.5 sm:p-5 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((msg) => (
            <ChatMessageItem
              key={msg.id}
              message={msg}
              onSendFollowUpAnswer={handleFollowUpAnswer}
              onOpenEmergencyModal={() => setEmergencyModalOpen(true)}
              onOpenTechnicalReport={handleOpenTechnicalReport}
            />
          ))}

          {/* Typing / Loading indicator */}
          {isLoading && (
            <div className="flex items-start gap-3 my-4 max-w-[88%] sm:max-w-[80%]">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center shrink-0 shadow-sm border border-amber-400/40">
                <Activity className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-sm space-y-2">
                <div className="flex items-center gap-2.5 text-xs font-semibold text-stone-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping shrink-0" />
                  <span className="font-display">SismoScan está evaluando los elementos estructurales...</span>
                </div>
                <div className="space-y-1 text-[11px] text-stone-500">
                  <p className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0"></span>
                    Examinando geometría de fisuras, elementos portantes y desprendimientos.
                  </p>
                  <p className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-stone-300 shrink-0"></span>
                    Determinando nivel de riesgo preliminar y directriz de habitabilidad.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>
      </main>

      {/* Bottom Sticky Input Component */}
      <ChatInput
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        onOpenPhotoGuide={() => setPhotoGuideOpen(true)}
        latestEarthquake={earthquakes[0] || null}
      />

      {/* Modals */}
      <EmergencyModal
        isOpen={emergencyModalOpen}
        onClose={() => setEmergencyModalOpen(false)}
      />
      <RecentEarthquakesModal
        isOpen={recentEarthquakesOpen}
        onClose={() => setRecentEarthquakesOpen(false)}
        earthquakes={earthquakes}
        isLoading={isSeismicLoading}
        onRefresh={fetchEarthquakes}
        onSelectForChat={handleSelectEarthquakeForChat}
      />
      <PhotoGuideModal
        isOpen={photoGuideOpen}
        onClose={() => setPhotoGuideOpen(false)}
      />
      <AboutModal
        isOpen={aboutModalOpen}
        onClose={() => setAboutModalOpen(false)}
      />
      <EmergencyKitModal
        isOpen={emergencyKitOpen}
        onClose={() => setEmergencyKitOpen(false)}
      />
      <TechnicalReportModal
        isOpen={technicalReportOpen}
        onClose={() => setTechnicalReportOpen(false)}
        evaluation={activeReportData?.evaluation}
        imageSrc={activeReportData?.imageSrc}
        reportDate={activeReportData?.date}
      />
    </div>
  );
}
