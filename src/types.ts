export type RiskLevel =
  | "Sin daño aparente"
  | "Daño leve"
  | "Daño moderado"
  | "Daño severo / riesgo de colapso"
  | "No determinada";

export type RecommendationType =
  | "Se puede permanecer con precaución"
  | "Evacuar de inmediato"
  | "Requiere más información antes de recomendar";

export interface StructuralEvaluation {
  classification?: RiskLevel;
  recommendation?: RecommendationType;
  visualSignals?: string[];
  elementAnalyzed?: string;
  confidence?: "alta" | "media" | "baja";
  urgentActionRequired?: boolean;
  needsMorePhotos?: boolean;
  followUpQuestions?: string[];
  calmMessage?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: number;
  image?: {
    dataUrl: string;
    name?: string;
    mimeType: string;
  };
  evaluation?: StructuralEvaluation;
  isInitialGreeting?: boolean;
}

export interface EmergencyContact {
  name: string;
  number: string;
  description: string;
  badge: string;
}

export interface EarthquakeEvent {
  id: string;
  magnitude: number;
  place: string;
  time: number;
  depthKm: number;
  depthCategory: "Superficial" | "Intermedio" | "Profundo";
  coordinates: [number, number];
  url: string;
  alertLevel: "leve" | "moderado" | "fuerte" | "severo";
  relativeTime: string;
}
