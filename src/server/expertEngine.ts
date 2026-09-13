import type { StructuralEvaluation } from "../types";

export interface ExpertAnalysisResult {
  reply: string;
  classification:
    | "Sin daño aparente"
    | "Daño leve"
    | "Daño moderado"
    | "Daño severo / riesgo de colapso"
    | "No determinada";
  recommendation:
    | "Se puede permanecer con precaución"
    | "Evacuar de inmediato"
    | "Requiere más información antes de recomendar";
  visualSignals: string[];
  elementAnalyzed: string;
  confidence: "alta" | "media" | "baja";
  urgentActionRequired: boolean;
  needsMorePhotos: boolean;
  followUpQuestions: string[];
  calmMessage?: string;
  engineUsed: "gemini" | "expert_nsr10";
}

/**
 * Normalizes text for matching (lowercase, strips accents)
 */
function normalizeText(text: string): string {
  return (text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/**
 * Colombian Structural Expert Triaging Engine based on NSR-10 / AIS guidelines.
 * Evaluates damages when the AI model is experiencing quota limits or offline state,
 * guaranteeing instantaneous, accurate, technical guidance to the user.
 */
export function analyzeWithNSR10ExpertEngine(
  userText: string,
  hasImage: boolean,
  imageMimeType?: string
): ExpertAnalysisResult {
  const norm = normalizeText(userText);

  // 1. Check for Panic / Emergency / Alarm phrases
  const hasPanic =
    norm.includes("miedo") ||
    norm.includes("panico") ||
    norm.includes("asustado") ||
    norm.includes("asustada") ||
    norm.includes("se va a caer") ||
    norm.includes("se cayo") ||
    norm.includes("cruje") ||
    norm.includes("ruido fuerte") ||
    norm.includes("socorro") ||
    norm.includes("ayuda por favor");

  const calmMessage = hasPanic
    ? "Respira profundo y mantén la calma. Tu integridad física es lo primordial. Si sientes inseguridad o escuchas ruidos estructurales, sal con precaución hacia un punto de encuentro abierto y despejado."
    : undefined;

  // 2. Greetings or General Info
  const isGreeting =
    /^(hola|buenos dias|buenas tardes|buenas noches|que tal|saludos|como estas|que haces|quien eres)\b/.test(
      norm
    ) &&
    !norm.includes("grieta") &&
    !norm.includes("temblor") &&
    !norm.includes("dano") &&
    !norm.includes("pared") &&
    !norm.includes("columna");

  if (isGreeting) {
    return {
      reply: `¡Hola! Soy **SismoScan**, tu asistente preliminar de evaluación de riesgo estructural para edificaciones en Colombia, orientado bajo las directrices de la norma sismorresistente **NSR-10** y las guías de la Asociación Colombiana de Ingeniería Sísmica (AIS).

**¿Cómo te puedo ayudar hoy?**
- **Fotografía de la anomalía:** Puedes subir o tomar una foto de la grieta, muro, columna o fisura observada tras un sismo para clasificarla.
- **Descripción del daño:** Cuéntame dónde está el daño (ej. *¿está en una columna de concreto o en un muro divisorio?*).
- **Inspección con fisurómetro:** Puedes usar nuestra herramienta de calibración para estimar si el espesor es capilar (< 0.5 mm) o si supera 2 mm.
- **Sismicidad en vivo:** Consulta el cintillo superior para verificar el último sismo registrado en Colombia.

*Dime qué observas en tu vivienda o envía una fotografía para iniciar.*`,
      classification: "Sin daño aparente",
      recommendation: "Se puede permanecer con precaución",
      visualSignals: ["Consulta inicial / Inspección preventiva"],
      elementAnalyzed: "No identificado",
      confidence: "alta",
      urgentActionRequired: false,
      needsMorePhotos: false,
      followUpQuestions: [
        "¿Notaste grietas tras el sismo reciente?",
        "¿Las fisuras están en elementos verticales de concreto o en acabados de yeso/estuco?",
        "¿Hay puertas o ventanas atascadas en la edificación?",
      ],
      calmMessage,
      engineUsed: "expert_nsr10",
    };
  }

  // 3. Structural Elements Identification
  const mentionsColumn =
    norm.includes("columna") ||
    norm.includes("pilar") ||
    norm.includes("colunma") ||
    norm.includes("apoyo") ||
    norm.includes("poste de concreto");

  const mentionsBeam =
    norm.includes("viga") ||
    norm.includes("dintel") ||
    norm.includes("vigueta") ||
    norm.includes("amarre");

  const mentionsSlab =
    norm.includes("losa") ||
    norm.includes("techo") ||
    norm.includes("entrepiso") ||
    norm.includes("cielo raso") ||
    norm.includes("placa");

  const mentionsWall =
    norm.includes("pared") ||
    norm.includes("muro") ||
    norm.includes("tabique") ||
    norm.includes("fachada") ||
    norm.includes("ladrillo");

  const mentionsStairs =
    norm.includes("escalera") ||
    norm.includes("gradas") ||
    norm.includes("rampa");

  // 4. Critical Danger Flags (Severe)
  const mentionsRebar =
    norm.includes("varilla") ||
    norm.includes("acero") ||
    norm.includes("hierro") ||
    norm.includes("metal a la vista");

  const mentionsCrushing =
    norm.includes("desprendio concreto") ||
    norm.includes("concreto quebrado") ||
    norm.includes("pedazos de concreto") ||
    norm.includes("aplastamiento") ||
    norm.includes("cascote");

  const mentionsTilting =
    norm.includes("inclinada") ||
    norm.includes("inclinado") ||
    norm.includes("desplome") ||
    norm.includes("torcido") ||
    norm.includes("pandeo") ||
    norm.includes("abombado") ||
    norm.includes("abombada") ||
    norm.includes("guateado");

  const mentionsJammedDoors =
    norm.includes("puerta no abre") ||
    norm.includes("puerta atascada") ||
    norm.includes("ventana atascada") ||
    norm.includes("no cierra la puerta") ||
    norm.includes("descuadro");

  const mentionsGasWaterSmell =
    norm.includes("olor a gas") ||
    norm.includes("escape de gas") ||
    norm.includes("tuberia rota") ||
    norm.includes("fuga de agua");

  const mentionsDiagonalX =
    norm.includes("en x") ||
    norm.includes("diagonal") ||
    norm.includes("45 grados") ||
    norm.includes("cruzada");

  const mentionsThroughCrack =
    norm.includes("lado a lado") ||
    norm.includes("pasa la luz") ||
    norm.includes("pasante") ||
    norm.includes("traspasa") ||
    norm.includes("se ve el otro lado");

  // 5. Minor / Superficial Flags
  const mentionsSuperficial =
    norm.includes("superficial") ||
    norm.includes("pintura") ||
    norm.includes("estuco") ||
    norm.includes("panete") ||
    norm.includes("revoque") ||
    norm.includes("yeso") ||
    norm.includes("peladura") ||
    norm.includes("telarana") ||
    norm.includes("cabello") ||
    norm.includes("muy delgadita") ||
    norm.includes("fina") ||
    norm.includes("0.2") ||
    norm.includes("0.3") ||
    norm.includes("milimetro");

  // 6. Seismic Event Query
  const mentionsRecentQuake =
    norm.includes("sipi") ||
    norm.includes("choco") ||
    norm.includes("santander") ||
    norm.includes("temblor") ||
    norm.includes("sismo") ||
    norm.includes("terremoto");

  // -------------------------------------------------------------
  // BRANCH A: SEVERE DAMAGE / IMMEDIATE EVACUATION
  // -------------------------------------------------------------
  if (
    (mentionsColumn && (mentionsDiagonalX || mentionsRebar || mentionsCrushing || mentionsTilting || norm.includes("grieta grande") || norm.includes("rota"))) ||
    mentionsRebar ||
    mentionsTilting ||
    (mentionsBeam && (mentionsCrushing || mentionsThroughCrack || norm.includes("rota"))) ||
    (mentionsWall && mentionsThroughCrack && mentionsDiagonalX) ||
    mentionsGasWaterSmell
  ) {
    let specificCause = "Se ha detectado afectación severa en elementos portantes estructurales principales.";
    if (mentionsColumn) specificCause = "Afectación crítica en columna (elemento vertical de soporte primario).";
    else if (mentionsRebar) specificCause = "Exposición de armadura de acero de refuerzo con pérdida de confinamiento de concreto.";
    else if (mentionsTilting) specificCause = "Pérdida de verticalidad o pandeo evidente por solicitación lateral.";
    else if (mentionsGasWaterSmell) specificCause = "Posible fractura de redes hidrosanitarias o de gas con riesgo de incendio o asfixia.";

    const visualSignals: string[] = [];
    if (mentionsColumn) visualSignals.push("Falla en columna de soporte principal");
    if (mentionsRebar) visualSignals.push("Acero de refuerzo expuesto a la vista");
    if (mentionsCrushing) visualSignals.push("Descascaramiento / aplastamiento de concreto");
    if (mentionsDiagonalX) visualSignals.push("Grietas diagonales por esfuerzo cortante sísmico");
    if (mentionsTilting) visualSignals.push("Desplome o deformación angular evidente");
    if (visualSignals.length === 0) visualSignals.push("Daño estructural severo en elemento portante");

    const element = mentionsColumn
      ? "Columna"
      : mentionsBeam
      ? "Viga"
      : mentionsWall
      ? "Muro de carga"
      : "Elemento estructural principal";

    return {
      reply: `### 🚨 ALERTA ROJA: EVACUACIÓN PREVENTIVA INMEDIATA

De acuerdo con los criterios de evaluación post-sismo de la **Norma Sismorresistente Colombiana (NSR-10)** y el Comité AIS-400:

1. **Diagnóstico técnico preliminar:** ${specificCause} Las columnas y vigas son los elementos estructurales que sostienen la edificación. Cualquier pérdida de sección, agrietamiento diagonal severo o varillas expuestas compromete directamente la estabilidad ante posibles réplicas sísmicas.
2. **Acción inmediata requerida:**
   - **EVACÚA DE INMEDIATO** a todos los ocupantes de la vivienda o edificio hacia un punto de encuentro exterior despejado, alejado de postes eléctricos, fachadas y vidrios.
   - **NO utilices el ascensor bajo ninguna circunstancia**; usa las escaleras de emergencia con precaución.
   - Si puedes hacerlo con seguridad antes de salir, **corta los suministros principales de gas, energía eléctrica y agua**.
   - **No reingreses a la edificación** hasta que un ingeniero civil especialista en estructuras o el Cuerpo Oficial de Bomberos emita un concepto técnico favorable.

📞 **Comunícate de inmediato con las autoridades en Colombia:**
- **Línea Única de Emergencias:** Marcar **123**
- **Cuerpo Oficial de Bomberos:** Marcar **119**
- **Defensa Civil Colombiana:** Marcar **144**
- **Cruz Roja Colombiana:** Marcar **132**`,
      classification: "Daño severo / riesgo de colapso",
      recommendation: "Evacuar de inmediato",
      visualSignals,
      elementAnalyzed: element,
      confidence: "alta",
      urgentActionRequired: true,
      needsMorePhotos: false,
      followUpQuestions: [
        "¿Ya se encuentran todos los ocupantes fuera de la edificación en zona segura?",
        "¿Pudiste cerrar la llave de paso de gas y el interruptor general de luz?",
        "¿Se escuchan crujidos adicionales o reacomodaciones en el edificio?",
      ],
      calmMessage:
        calmMessage ||
        "Prioriza tu vida y la de tus seres queridos. Sal de la edificación con calma y en orden hacia una zona despejada.",
      engineUsed: "expert_nsr10",
    };
  }

  // -------------------------------------------------------------
  // BRANCH B: MODERATE DAMAGE (DIAGONAL CRACKS IN WALLS, JAMMED DOORS)
  // -------------------------------------------------------------
  if (
    mentionsDiagonalX ||
    mentionsJammedDoors ||
    (mentionsWall && (norm.includes("grieta") || norm.includes("abrio")) && !mentionsSuperficial) ||
    (mentionsBeam && norm.includes("grieta")) ||
    mentionsStairs
  ) {
    const visualSignals: string[] = [];
    if (mentionsDiagonalX) visualSignals.push("Grieta diagonal inclinada (efecto cortante en mampostería)");
    if (mentionsJammedDoors) visualSignals.push("Atascamiento de vanos de puertas/ventanas (distorsión de piso)");
    if (mentionsStairs) visualSignals.push("Afectación en rampa o descanso de escalera");
    if (visualSignals.length === 0) visualSignals.push("Fisuración con abertura notable en mampostería");

    const element = mentionsBeam
      ? "Viga"
      : mentionsStairs
      ? "Escalera"
      : mentionsWall
      ? "Muro de carga"
      : "Muro";

    return {
      reply: `### ⚠️ EVALUACIÓN TÉCNICA: DAÑO MODERADO DETECTADO

Con base en la morfología reportada y los patrones de comportamiento sísmico según la norma **NSR-10**:

1. **Análisis de la patología:**
   - Se evidencia un comportamiento típico de **esfuerzo cortante sísmico** en el muro o elemento. Las grietas diagonales a ~45° ocurren cuando la mampostería absorbe las fuerzas horizontales del movimiento telúrico.
   - Si las puertas o ventanas se atascaron, esto refleja una **distorsión angular de entrepiso (deriva sísmica)**, lo que significa que el marco estructural experimentó deformación lateral.
2. **Medidas preventivas inmediatas:**
   - **No pernoctar ni permanecer en la habitación afectada.** Delimita la zona con cinta de precaución para evitar el tránsito de personas.
   - Si la grieta es pasante (se observa de lado a lado del muro), no te apoyes en él ni cuelgues objetos pesados.
   - Realiza un **monitoreo con fisurómetro o testigos de yeso:** coloca una marca con lápiz y fecha en los extremos de la grieta para verificar si avanza con las réplicas.
   - Solicita una visita técnica formal de la oficina de Gestión del Riesgo municipal (ej. IDIGER en Bogotá, DAGRD en Medellín) o de la administración de tu copropiedad.`,
      classification: "Daño moderado",
      recommendation: "Requiere más información antes de recomendar",
      visualSignals,
      elementAnalyzed: element,
      confidence: "media",
      urgentActionRequired: false,
      needsMorePhotos: true,
      followUpQuestions: [
        "¿La grieta traspasa el muro hacia la habitación contigua o hacia la fachada exterior?",
        "¿El muro es de ladrillo estructural tolete con columnas de amarre, o es un tabique liviano de yeso/drywall?",
        "¿Has notado desprendimiento de pedazos de pañete o ladrillo?",
      ],
      calmMessage:
        calmMessage ||
        "El daño amerita precaución pero no hay colapso inminente reportado. Mantén la calma, aísla la zona y monitorea con testigos de yeso o lápiz.",
      engineUsed: "expert_nsr10",
    };
  }

  // -------------------------------------------------------------
  // BRANCH C: MINOR / SUPERFICIAL DAMAGE (PLASTER, CRACK < 0.5MM)
  // -------------------------------------------------------------
  if (
    mentionsSuperficial ||
    (norm.includes("fisura") && !norm.includes("columna") && !norm.includes("varilla")) ||
    norm.includes("pintura") ||
    norm.includes("estuco") ||
    norm.includes("panete") ||
    norm.includes("revoque")
  ) {
    return {
      reply: `### ✅ EVALUACIÓN TÉCNICA: DAÑO LEVE / FISURA NO ESTRUCTURAL

Revisión técnica preliminar conforme a las pautas de inspección de la **NSR-10**:

1. **Diagnóstico:**
   - La anomalía descrita corresponde a una **fisura capilar en el enlucido superficial** (estuco, pañete, revoque o pintura).
   - Este tipo de fisuraciones son muy frecuentes tras vibraciones sísmicas o asentamientos naturales de la mampostería debido a la diferencia de elasticidad entre el revoque y el ladrillo.
   - **No compromete la capacidad portante** ni la estabilidad global de la edificación.
2. **Pautas de seguimiento:**
   - **Se puede permanecer en el inmueble con tranquilidad.**
   - Mide el grosor con el **Fisurómetro digital** de SismoScan: si tiene menos de **0.5 mm** (similar al grosor de un cabello o papel), su reparación es netamente estética mediante masilla elástica y repinte.
   - Traza una pequeña marca a lápiz con la fecha actual en el inicio y fin de la fisura. Si en las próximas semanas no crece, el elemento está completamente estabilizado.`,
      classification: "Daño leve",
      recommendation: "Se puede permanecer con precaución",
      visualSignals: [
        "Fisura capilar superficial en enlucido de estuco / pañete (< 0.5 mm)",
        "Sin compromiso de elementos de concreto reforzado",
      ],
      elementAnalyzed: "Muro divisorio",
      confidence: "alta",
      urgentActionRequired: false,
      needsMorePhotos: false,
      followUpQuestions: [
        "¿El espesor de la fisura supera 1 milímetro?",
        "¿Observas alguna otra fisura similar en vigas o columnas principales?",
      ],
      calmMessage:
        calmMessage ||
        "Buenas noticias: esta tipología de fisuras es habitual y no representa peligro para la estabilidad de tu hogar.",
      engineUsed: "expert_nsr10",
    };
  }

  // -------------------------------------------------------------
  // BRANCH D: SEISMIC EVENT CONTEXT / GENERAL DAMAGE INQUIRY
  // -------------------------------------------------------------
  if (mentionsRecentQuake) {
    return {
      reply: `### 📋 PROTOCOLO DE INSPECCIÓN TRAS SISMO RECIENTE EN COLOMBIA

Has consultado sobre los efectos del movimiento telúrico en tu entorno:

1. **Protocolo sistemático de inspección paso a paso (NSR-10):**
   - **Paso 1: Elementos verticales principales (Columnas y muros portantes):** Revisa si hay grietas inclinadas en 'X', concreto desmoronado o varillas de acero expuestas. Son la prioridad máxima.
   - **Paso 2: Elementos horizontales (Vigas y losas):** Inspecciona las esquinas y uniones de vigas con columnas.
   - **Paso 3: Escaleras:** Verifica que los descansos y anclajes no presenten fisuras de corte ni separación de los muros.
   - **Paso 4: Muros de fachada y antepechos:** Confirma que no haya riesgo de caída de ladrillos, tejas o vidrios hacia la calle.
   - **Paso 5: Redes de gas y agua:** Cierra la llave si percibes olor a gas o escuchas siseo.
2. **¿Qué debes hacer ahora?**
   - Si observas alguna fisura específica, sube una **fotografía clara y bien iluminada** aquí en SismoScan.
   - Puedes abrir la herramienta **Inspeccionar con Fisurómetro** para medir la abertura en milímetros.
   - Ten lista tu **Mochila de Emergencia de 72 horas** (puedes consultar la lista interactiva en el botón superior "Kit 72h").`,
      classification: "Sin daño aparente",
      recommendation: "Se puede permanecer con precaución",
      visualSignals: ["Inspección preventiva post-sismo en curso"],
      elementAnalyzed: "Estructura general",
      confidence: "alta",
      urgentActionRequired: false,
      needsMorePhotos: true,
      followUpQuestions: [
        "¿En qué municipio o ciudad sentiste el sismo?",
        "¿Observas alguna fisura en columnas o vigas de concreto?",
        "¿Deseas adjuntar una foto del área que más te preocupa?",
      ],
      calmMessage:
        calmMessage ||
        "Conserva la calma. En Colombia la sismicidad es continua por nuestra ubicación tectónica; seguir el protocolo preventivo garantiza tu seguridad.",
      engineUsed: "expert_nsr10",
    };
  }

  // -------------------------------------------------------------
  // BRANCH E: DEFAULT STRUCTURAL ASSESSMENT
  // -------------------------------------------------------------
  return {
    reply: `### 🔍 EVALUACIÓN TÉCNICA ESTRUCTURAL PRELIMINAR

He analizado tu reporte según los criterios de inspección rápida post-sismo de la **Norma NSR-10**:

1. **Consideraciones técnicas:**
   - Para brindarte una clasificación concluyente y descartar riesgos ocultos, es fundamental precisar si el daño se ubica en un **elemento portante estructural** (columna, viga, muro de carga) o en un **elemento no estructural** (muro divisorio, tabique de yeso, acabado).
   - Las grietas peligrosas suelen ser **diagonales a ~45°**, tienen más de **2 mm de espesor**, traspasan el muro de lado a lado o exponen varillas de acero.
2. **Pautas de seguridad preventiva:**
   - **Si escuchas crujidos, la grieta crece o la estructura se deforma:** evacúa de inmediato hacia una zona abierta y llama a la Línea 123 o a Bomberos 119.
   - Si puedes, **toma una fotografía que muestre tanto el detalle de la fisura como el contexto completo del elemento** y súbela aquí para evaluarla con el fisurómetro digital.`,
    classification: "Requiere más información antes de recomendar" as any,
    recommendation: "Requiere más información antes de recomendar",
    visualSignals: [
      hasImage
        ? "Fotografía recibida - evaluación preliminar en curso"
        : "Descripción textual procesada",
    ],
    elementAnalyzed: "Elemento por confirmar",
    confidence: "media",
    urgentActionRequired: false,
    needsMorePhotos: !hasImage,
    followUpQuestions: [
      "¿El daño está en una columna, en una viga o en una pared divisoria?",
      "¿La grieta es superficial (afecta solo la pintura) o tiene profundidad evidente?",
      "¿Las puertas y ventanas abren con normalidad o se han atascado?",
    ],
    calmMessage:
      calmMessage ||
      "Estamos aquí para orientarte. Revisa los puntos anteriores con tranquilidad para emitir el concepto técnico más preciso.",
    engineUsed: "expert_nsr10",
  };
}
