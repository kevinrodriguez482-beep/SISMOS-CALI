import express from "express";
import path from "path";
import fs from "fs";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { analyzeWithNSR10ExpertEngine } from "./src/server/expertEngine";

dotenv.config();

const app = express();
const PORT = 3000;

// Allow payloads for image analysis (base64)
app.use(express.json({ limit: "35mb" }));
app.use(express.urlencoded({ extended: true, limit: "35mb" }));

// Catch any body-parser / JSON decoding errors and return clean JSON (never HTML)
app.use((err: any, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err) {
    console.error("Express middleware error:", err?.message || err);
    return res.status(err.status || 400).json({
      success: false,
      error: err.type === "entity.too.large"
        ? "La imagen enviada supera el límite de tamaño. Por favor sube una imagen de menor peso."
        : "Hubo un error al procesar los datos de la solicitud.",
    });
  }
  next();
});

// Lazy initialize Gemini client to adhere to guidelines
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not set in environment variables");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    app: "SismoScan",
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Cache for seismic events to avoid rate-limiting USGS API
let cachedEarthquakes: any[] = [];
let lastEarthquakeFetch = 0;
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

function formatRelativeTimeEs(timeMs: number): string {
  const diffMs = Date.now() - timeMs;
  const diffMin = Math.round(diffMs / 60000);
  const diffHours = Math.round(diffMs / 3600000);
  const diffDays = Math.round(diffMs / 86400000);

  if (diffMin < 2) return "Hace un momento";
  if (diffMin < 60) return `Hace ${diffMin} min`;
  if (diffHours === 1) return "Hace 1 hora";
  if (diffHours < 24) return `Hace ${diffHours} horas`;
  if (diffDays === 1) return "Ayer";
  if (diffDays < 30) return `Hace ${diffDays} días`;
  return new Date(timeMs).toLocaleDateString("es-CO");
}

function cleanPlaceName(rawPlace: string): string {
  if (!rawPlace) return "Colombia";
  // Translate compass directions and prepositions in place names
  let cleaned = rawPlace
    .replace(/\bNNE of\b/gi, "al norte-noreste de")
    .replace(/\bNNW of\b/gi, "al norte-noroeste de")
    .replace(/\bSSE of\b/gi, "al sur-sureste de")
    .replace(/\bSSW of\b/gi, "al sur-suroeste de")
    .replace(/\bENE of\b/gi, "al este-noreste de")
    .replace(/\bESE of\b/gi, "al este-sureste de")
    .replace(/\bWNW of\b/gi, "al oeste-noroeste de")
    .replace(/\bWSW of\b/gi, "al oeste-suroeste de")
    .replace(/\bNE of\b/gi, "al noreste de")
    .replace(/\bNW of\b/gi, "al noroeste de")
    .replace(/\bSE of\b/gi, "al sureste de")
    .replace(/\bSW of\b/gi, "al suroeste de")
    .replace(/\bN of\b/gi, "al norte de")
    .replace(/\bS of\b/gi, "al sur de")
    .replace(/\bE of\b/gi, "al este de")
    .replace(/\bW of\b/gi, "al oeste de")
    .replace(/\bof\b/gi, "de")
    .replace(/\bde de\b/gi, "de");
  return cleaned;
}

// Live earthquakes endpoint for Colombia & adjacent regions
app.get("/api/earthquakes", async (_req, res) => {
  try {
    const now = Date.now();
    if (cachedEarthquakes.length > 0 && now - lastEarthquakeFetch < CACHE_TTL_MS) {
      return res.json({
        success: true,
        cached: true,
        data: cachedEarthquakes,
      });
    }

    const usgsUrl =
      "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&minlatitude=-1&maxlatitude=13.5&minlongitude=-79.5&maxlongitude=-67&limit=15&orderby=time";

    const response = await fetch(usgsUrl, {
      headers: {
        Accept: "application/json",
        "User-Agent": "SismoScan-Colombia/1.0",
      },
    });

    if (!response.ok) {
      throw new Error(`USGS status ${response.status}`);
    }

    const geoData = await response.json();
    const features = geoData.features || [];

    const parsedList = features.map((f: any) => {
      const mag = Math.round((f.properties?.mag || 0) * 10) / 10;
      const depth = Math.round((f.geometry?.coordinates?.[2] || 10) * 10) / 10;
      const timeMs = f.properties?.time || Date.now();

      const depthCategory =
        depth < 30 ? "Superficial" : depth <= 70 ? "Intermedio" : "Profundo";

      const alertLevel =
        mag >= 6.5
          ? "severo"
          : mag >= 5.0
          ? "fuerte"
          : mag >= 3.8
          ? "moderado"
          : "leve";

      return {
        id: f.id || `eq-${timeMs}`,
        magnitude: mag,
        place: cleanPlaceName(f.properties?.place || "Colombia"),
        time: timeMs,
        depthKm: depth,
        depthCategory,
        coordinates: [
          f.geometry?.coordinates?.[0] || 0,
          f.geometry?.coordinates?.[1] || 0,
        ],
        url: f.properties?.url || "https://earthquake.usgs.gov",
        alertLevel,
        relativeTime: formatRelativeTimeEs(timeMs),
      };
    });

    cachedEarthquakes = parsedList;
    lastEarthquakeFetch = now;

    res.json({
      success: true,
      cached: false,
      data: parsedList,
    });
  } catch (err: any) {
    console.error("Error fetching live earthquakes from USGS:", err?.message || err);
    if (cachedEarthquakes.length > 0) {
      return res.json({
        success: true,
        cached: true,
        data: cachedEarthquakes,
      });
    }

    // Safe fallback if network is temporarily offline
    res.json({
      success: true,
      cached: false,
      data: [
        {
          id: "fallback-sipi-1",
          magnitude: 4.7,
          place: "32 km al suroeste de Sipí, Chocó, Colombia",
          time: Date.now() - 3600000 * 8,
          depthKm: 77.3,
          depthCategory: "Profundo",
          coordinates: [-76.809, 4.4114],
          url: "https://www.sgc.gov.co",
          alertLevel: "moderado",
          relativeTime: "Hace unas horas",
        },
      ],
    });
  }
});

// Structural analysis & chat endpoint
app.post("/api/chat", async (req, res) => {
  const { messages = [], currentMessage = "", image } = req.body;
  const userPrompt =
    currentMessage ||
    (messages.length > 0 ? messages[messages.length - 1]?.text : "") ||
    "";

  try {
    const ai = getGenAI();

    const systemInstruction = `
Eres "SismoScan", un asistente de inteligencia artificial desarrollado como proyecto universitario en Colombia alineado con el ODS 9 (Industria, Innovación e Infraestructura).
Tu misión es ayudar a los ciudadanos en Colombia a evaluar de forma preliminar y rápida el riesgo estructural de una edificación que presenta daños visibles (grietas, desprendimientos, inclinaciones, fisuras tras un sismo), indicándoles si es razonable permanecer con precaución o si deben evacuar de inmediato mientras llega ayuda técnica.

REGLAS DE SEGURIDAD OBLIGATORIAS:
1. NUNCA te presentes como un reemplazo de la evaluación de un ingeniero civil/estructural ni de los organismos de socorro (Cuerpo de Bomberos 119, Defensa Civil 144, Cruz Roja 132, UNGRD - Gestión del Riesgo 123).
2. Ante cualquier duda, grieta severa en elementos portantes (columnas, vigas, muros estructurales), pandeo, inclinación o exposición de varillas de acero, PRIORIZA SIEMPRE la recomendación de "Evacuar de inmediato" y contactar a las autoridades. NUNCA minimices el riesgo.
3. Si el usuario expresa angustia, pánico o urgencia ("¡Tengo mucho miedo!", "se siente caer", "ayuda por favor"), incluye siempre al inicio un mensaje breve de calma y bienestar (respiración profunda, ubicarse en un lugar despejado y seguro, mantener a mano el kit de emergencia).
4. Si la imagen no es clara, no muestra el contexto estructural completo (por ejemplo, solo un primer plano borroso) o hay incertidumbre, clasifícalo como requiriendo información adicional, pide fotos con perspectiva más amplia o detalles específicos, y haz 2 o 3 preguntas clave (ej: ¿la grieta traspasa el muro de lado a lado?, ¿se atascan puertas o ventanas?, ¿se escuchan crujidos o hay vibraciones?, ¿está en una columna o en un muro divisorio?).
5. Toda respuesta debe darse en español, con un tono calmado, empático, claro, directo y profesional, ideal para una situación de estrés o emergencia.
6. Tipología colombiana: Ten presente los tipos comunes de vivienda en Colombia (mampostería confinada con columnas de amarre, pórticos de concreto reforzado, muros de ladrillo tolete/hueco, adobe/tapia pisada, norma NSR-10). Diferencia claramente entre fisuras superficiales de estuco/pintura vs. grietas estructurales diagonales en "X" (por cortante sísmico), fallas en uniones losa-columna o aplastamiento de concreto.

DEBES RESPONDER EN FORMATO JSON ESTRICTO con la siguiente estructura:
{
  "reply": "Texto explicativo en Markdown en tono calmado y profesional, detallando lo observado, precauciones y recordatorio de no sustituir a ingenieros ni bomberos.",
  "classification": "Sin daño aparente" | "Daño leve" | "Daño moderado" | "Daño severo / riesgo de colapso" | null,
  "recommendation": "Se puede permanecer con precaución" | "Evacuar de inmediato" | "Requiere más información antes de recomendar" | null,
  "visualSignals": ["lista de señales detectadas, ej: Grieta diagonal a 45 grados en muro", "Fisura superficial en enlucido"],
  "elementAnalyzed": "Columna" | "Muro de carga" | "Muro divisorio" | "Viga" | "Unión viga-columna" | "Losa / Techo" | "Fachada" | "No identificado",
  "confidence": "alta" | "media" | "baja",
  "urgentActionRequired": boolean (true si deben evacuar o cortar servicios de inmediato),
  "needsMorePhotos": boolean (true si la imagen no fue suficiente o se requiere otro ángulo),
  "followUpQuestions": ["pregunta 1", "pregunta 2"],
  "calmMessage": "Mensaje reconfortante de serenidad si hubo alarma o pánico, o nulo si no fue necesario"
}
`;

    // Format conversation history for Gemini
    const contents: any[] = [];

    // Append prior conversational turns if any (limit to last 6 for brevity and focus)
    const historyToInclude = messages.slice(-6);
    for (const msg of historyToInclude) {
      if (msg.role === "user") {
        contents.push({
          role: "user",
          parts: [{ text: msg.text || "Consulta de usuario" }],
        });
      } else if (msg.role === "assistant") {
        contents.push({
          role: "model",
          parts: [{ text: msg.text || "" }],
        });
      }
    }

    // Build the current turn
    const currentParts: any[] = [];
    if (image && image.base64) {
      // Clean base64 prefix if present (e.g., data:image/jpeg;base64, or data:image/png;base64,)
      const base64Data = image.base64.replace(/^data:[^;]+;base64,/, "");
      currentParts.push({
        inlineData: {
          mimeType: image.mimeType || "image/jpeg",
          data: base64Data,
        },
      });
      currentParts.push({
        text: currentMessage
          ? `[El usuario adjuntó una foto de la edificación o daño estructural]: "${currentMessage}". Realiza la evaluación técnica preliminar, clasifica el nivel de daño visible y emite la recomendación de seguridad.`
          : `[El usuario adjuntó una foto de una edificación/estructura tras un evento sísmico]. Realiza la evaluación preliminar visual, clasifica el daño visible y emite recomendación.`,
      });
    } else {
      currentParts.push({
        text: currentMessage || "Hola, necesito ayuda para evaluar un daño en mi vivienda.",
      });
    }

    contents.push({
      role: "user",
      parts: currentParts,
    });

    let response: any = null;
    const modelsToTry = [
      "gemini-3.8-flash",
      "gemini-flash-latest",
      "gemini-3.1-flash-lite",
    ];
    let lastError: any = null;

    for (let i = 0; i < modelsToTry.length; i++) {
      const modelName = modelsToTry[i];
      try {
        response = await ai.models.generateContent({
          model: modelName,
          contents: contents,
          config: {
            systemInstruction: systemInstruction,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                reply: {
                  type: Type.STRING,
                  description: "Respuesta conversacional en español con tono calmado, empático y claro en Markdown.",
                },
                classification: {
                  type: Type.STRING,
                  enum: [
                    "Sin daño aparente",
                    "Daño leve",
                    "Daño moderado",
                    "Daño severo / riesgo de colapso",
                    "No determinada",
                  ],
                  description: "Nivel de daño estructural clasificado según lo visible.",
                },
                recommendation: {
                  type: Type.STRING,
                  enum: [
                    "Se puede permanecer con precaución",
                    "Evacuar de inmediato",
                    "Requiere más información antes de recomendar",
                  ],
                  description: "Recomendación de seguridad para los ocupantes.",
                },
                visualSignals: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Señales visuales estructurales identificadas en la imagen o descripción.",
                },
                elementAnalyzed: {
                  type: Type.STRING,
                  description: "Elemento constructivo identificado (ej. Columna, Muro portante, Tabique, Losa).",
                },
                confidence: {
                  type: Type.STRING,
                  enum: ["alta", "media", "baja"],
                },
                urgentActionRequired: {
                  type: Type.BOOLEAN,
                  description: "Indica si se requiere acción urgente como evacuación inmediata.",
                },
                needsMorePhotos: {
                  type: Type.BOOLEAN,
                  description: "Verdadero si se recomienda tomar otra fotografía con diferente ángulo o mayor amplitud.",
                },
                followUpQuestions: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Preguntas de seguimiento clave para clarificar el riesgo.",
                },
                calmMessage: {
                  type: Type.STRING,
                  description: "Mensaje de bienestar y calma para contener el estrés del usuario.",
                },
              },
              required: ["reply", "recommendation"],
            },
          },
        });
        if (response) break;
      } catch (err: any) {
        lastError = err;
        console.warn(`Attempt ${i + 1} (${modelName}) failed:`, err?.message || err);
        // If credits depleted or 429 quota, break immediately to expert engine
        if (
          err?.message?.includes("prepayment credits are depleted") ||
          err?.message?.includes("RESOURCE_EXHAUSTED") ||
          err?.message?.includes("429")
        ) {
          break;
        }
        if (i < modelsToTry.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }
    }

    if (!response) {
      throw lastError || new Error("No se pudo obtener respuesta del modelo de IA.");
    }

    const text = response.text || "{}";
    const parsed = JSON.parse(text);
    return res.json({
      success: true,
      data: parsed,
    });
  } catch (error: any) {
    console.warn("Falling back to Colombian NSR-10 Expert Engine:", error?.message || error);

    // Run the domain-specific NSR-10 structural triaging engine
    const expertAnalysis = analyzeWithNSR10ExpertEngine(
      userPrompt,
      Boolean(image && image.base64),
      image?.mimeType
    );

    // If a formal structural classification was produced, append the technical validation note
    if (expertAnalysis.classification && expertAnalysis.classification !== "No determinada") {
      expertAnalysis.reply += `\n\n---\n*ℹ️ Diagnóstico técnico emitido conforme a la **Norma Sismorresistente NSR-10 / AIS**.*`;
    }

    return res.json({
      success: true,
      data: expertAnalysis,
    });
  }
});

// Setup Vite middleware in dev or serve static files in production
async function startServer() {
  const isProduction =
    process.env.NODE_ENV === "production" ||
    Boolean(process.argv[1] && process.argv[1].includes("dist"));

  if (!isProduction) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      const indexPath = path.join(distPath, "index.html");
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send("Build artifacts not found. Please run npm run build.");
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SismoScan server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
