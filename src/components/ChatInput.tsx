import React, { useRef, useState } from "react";
import {
  Camera,
  Upload,
  Send,
  X,
  Sparkles,
  AlertCircle,
  Building,
  Layers,
  Wrench,
  HelpCircle,
  Image as ImageIcon,
  Activity,
} from "lucide-react";
import type { EarthquakeEvent } from "../types";

interface ChatInputProps {
  onSendMessage: (
    text: string,
    image?: { dataUrl: string; name?: string; mimeType: string }
  ) => void;
  isLoading: boolean;
  onOpenPhotoGuide?: () => void;
  latestEarthquake?: EarthquakeEvent | null;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  onOpenPhotoGuide,
  latestEarthquake,
}) => {
  const [text, setText] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{
    dataUrl: string;
    name?: string;
    mimeType: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    // Check if it's an image
    const isImage = file.type.startsWith("image/") || /\.(jpe?g|png|webp|heic|heif|bmp)$/i.test(file.name);
    if (!isImage) {
      alert("Por favor sube un archivo de imagen válido (JPG, PNG, WEBP).");
      return;
    }

    // Read the file and compress it through an HTML5 canvas
    const reader = new FileReader();
    reader.onerror = () => {
      console.error("Error al leer el archivo de imagen");
      alert("No se pudo cargar la imagen seleccionada. Por favor reintenta.");
    };

    reader.onload = (event) => {
      const resultDataUrl = event.target?.result as string;
      if (!resultDataUrl) return;

      const img = new Image();
      img.onerror = () => {
        // Fallback: use the raw dataUrl if canvas fails
        setSelectedImage({
          dataUrl: resultDataUrl,
          name: file.name,
          mimeType: file.type || "image/jpeg",
        });
      };

      img.onload = () => {
        try {
          // Scale down to max 1400px while maintaining aspect ratio
          const maxDim = 1400;
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");

          if (!ctx) {
            setSelectedImage({
              dataUrl: resultDataUrl,
              name: file.name,
              mimeType: file.type || "image/jpeg",
            });
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.85);

          setSelectedImage({
            dataUrl: compressedDataUrl,
            name: file.name,
            mimeType: "image/jpeg",
          });
        } catch (canvasErr) {
          console.warn("Canvas compression fallback:", canvasErr);
          setSelectedImage({
            dataUrl: resultDataUrl,
            name: file.name,
            mimeType: file.type || "image/jpeg",
          });
        }
      };

      img.src = resultDataUrl;
    };

    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    e.target.value = "";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleSend = () => {
    if ((!text.trim() && !selectedImage) || isLoading) return;

    onSendMessage(
      text.trim() || (selectedImage ? "He subido una foto para evaluación de riesgo." : ""),
      selectedImage || undefined
    );
    setText("");
    setSelectedImage(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickScenarios = [
    {
      icon: Building,
      label: "Grieta en columna",
      query: "Tengo una grieta en una columna principal de concreto. ¿Qué debo revisar para saber si hay riesgo de colapso?",
    },
    {
      icon: Layers,
      label: "Muro en 'X' o separado",
      query: "Noto grietas diagonales en forma de X en el muro de ladrillo tras el sismo. ¿Es seguro quedarme?",
    },
    {
      icon: Wrench,
      label: "Varillas de hierro expuestas",
      query: "Se desprendió concreto y se observan varillas de acero expuestas o dobladas. ¿Qué debemos hacer?",
    },
    {
      icon: HelpCircle,
      label: "Fisuras leves en pintura",
      query: "Solo veo líneas muy finas superficiales en la masilla o pintura de la pared interior.",
    },
  ];

  return (
    <div
      id="chat-input-container"
      className="sticky bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-stone-200/90 p-3 sm:p-4 z-20 shadow-[0_-4px_20px_-2px_rgba(0,0,0,0.05)]"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="max-w-4xl mx-auto space-y-2.5">
        {/* Drag and Drop notice overlay */}
        {isDragging && (
          <div className="p-4 bg-amber-50 border-2 border-dashed border-amber-500 rounded-2xl text-center text-amber-900 font-semibold text-xs animate-pulse">
            Suelta aquí la foto del daño estructural para analizarla...
          </div>
        )}

        {/* Quick Suggestions Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          <span className="text-stone-400 text-[11px] font-bold uppercase tracking-wider shrink-0 flex items-center gap-1 font-mono">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Consultas comunes:
          </span>

          {/* Dynamic chip for the latest recorded earthquake */}
          {latestEarthquake && (
            <button
              id="quick-scenario-latest-quake-chip"
              type="button"
              onClick={() => {
                setText(
                  `Sentí el temblor de Magnitud ${latestEarthquake.magnitude.toFixed(1)} ocurrido en ${latestEarthquake.place} (${latestEarthquake.relativeTime}). Noté grietas en mi vivienda y quiero evaluar si hay riesgo de colapso.`
                );
              }}
              className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-950 font-semibold rounded-full shrink-0 border border-amber-300 transition-all flex items-center gap-1.5 active:scale-95 shadow-2xs"
            >
              <Activity className="w-3 h-3 text-amber-700 animate-pulse" />
              <span>
                Sismo M {latestEarthquake.magnitude.toFixed(1)} ({latestEarthquake.relativeTime})
              </span>
            </button>
          )}

          {quickScenarios.map((scenario, idx) => {
            const IconComp = scenario.icon;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setText(scenario.query);
                }}
                className="px-3 py-1.5 bg-stone-100/90 hover:bg-stone-200 text-stone-700 hover:text-stone-900 rounded-full shrink-0 border border-stone-200 transition-all flex items-center gap-1.5 active:scale-95"
              >
                <IconComp className="w-3 h-3 text-stone-500" />
                <span className="font-medium text-xs">{scenario.label}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Image Thumbnail Bar */}
        {selectedImage && (
          <div className="flex items-center justify-between p-2.5 bg-gradient-to-r from-amber-50 to-amber-100/50 border border-amber-300 rounded-2xl shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl overflow-hidden border border-amber-400 bg-stone-950 shrink-0 shadow-2xs">
                <img
                  src={selectedImage.dataUrl}
                  alt="Vista previa"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="text-xs text-amber-950">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold block truncate max-w-[200px] sm:max-w-xs">
                    {selectedImage.name || "Foto seleccionada"}
                  </span>
                  <span className="text-[10px] bg-amber-200/80 text-amber-900 font-mono px-1.5 py-0.2 rounded font-semibold">
                    Listo
                  </span>
                </div>
                <span className="text-amber-800 text-[11px]">
                  Puedes añadir una descripción o enviar directamente para análisis.
                </span>
              </div>
            </div>
            <button
              type="button"
              id="remove-selected-image-btn"
              onClick={() => setSelectedImage(null)}
              className="p-1.5 text-amber-800 hover:text-red-700 hover:bg-amber-200/60 rounded-xl transition-colors"
              title="Quitar imagen"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Hidden File Inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Main Input Control Bar */}
        <div className="flex items-end gap-2 bg-stone-50 border border-stone-300 focus-within:border-amber-500 focus-within:ring-3 focus-within:ring-amber-500/15 focus-within:bg-white rounded-2xl p-1.5 transition-all shadow-2xs">
          {/* Action buttons: Camera + Gallery */}
          <div className="flex items-center gap-1 shrink-0 pb-1 pl-1">
            <button
              type="button"
              id="camera-take-photo-btn"
              onClick={() => cameraInputRef.current?.click()}
              className="p-2.5 text-stone-700 hover:text-amber-700 hover:bg-stone-200/70 active:bg-amber-100 rounded-xl transition-all flex items-center justify-center group"
              title="Tomar foto con la cámara"
              aria-label="Tomar foto con la cámara del dispositivo"
            >
              <Camera className="w-5 h-5 text-amber-600 group-hover:scale-110 transition-transform" />
            </button>

            <button
              type="button"
              id="upload-photo-gallery-btn"
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 text-stone-700 hover:text-amber-700 hover:bg-stone-200/70 active:bg-amber-100 rounded-xl transition-all flex items-center justify-center group"
              title="Subir imagen desde galería o archivos"
              aria-label="Subir foto desde galería o archivos"
            >
              <Upload className="w-5 h-5 text-stone-600 group-hover:scale-110 transition-transform" />
            </button>
          </div>

          {/* Textarea */}
          <textarea
            id="chat-textarea-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              selectedImage
                ? "Describe qué observas (ej: grieta diagonal de 3mm, crujidos, etc.)..."
                : "Describe el daño o sube una foto (columna, viga, muro, techo)..."
            }
            rows={1}
            className="flex-1 max-h-32 min-h-[44px] py-2.5 px-2 bg-transparent text-stone-900 placeholder:text-stone-400 text-sm focus:outline-hidden resize-none leading-relaxed"
            style={{ minHeight: "44px" }}
          />

          {/* Send Button */}
          <button
            type="button"
            id="send-message-btn"
            disabled={(!text.trim() && !selectedImage) || isLoading}
            onClick={handleSend}
            className="p-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 disabled:from-stone-300 disabled:to-stone-300 text-white rounded-xl font-medium shrink-0 transition-all active:scale-95 disabled:pointer-events-none shadow-xs disabled:shadow-none"
            aria-label="Enviar mensaje"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Small tips footer */}
        <div className="flex items-center justify-between text-[11px] text-stone-500 px-1 pt-0.5">
          <span className="flex items-center gap-1.5 font-medium">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            Triaje preliminar post-sismo en Colombia • ODS 9
          </span>
          {onOpenPhotoGuide && (
            <button
              type="button"
              onClick={onOpenPhotoGuide}
              className="text-amber-700 hover:text-amber-800 font-semibold underline underline-offset-2 transition-colors flex items-center gap-1"
            >
              <Camera className="w-3 h-3" />
              <span>¿Cómo tomar la mejor foto?</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
