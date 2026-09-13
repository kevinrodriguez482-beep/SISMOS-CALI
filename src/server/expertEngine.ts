import type { StructuralEvaluation } from "../types";

export interface ExpertAnalysisResult {
  reply: string;
  classification?:
    | "Sin daño aparente"
    | "Daño leve"
    | "Daño moderado"
    | "Daño severo / riesgo de colapso"
    | "No determinada";
  recommendation?:
    | "Se puede permanecer con precaución"
    | "Evacuar de inmediato"
    | "Requiere más información antes de recomendar";
  visualSignals?: string[];
  elementAnalyzed?: string;
  confidence?: "alta" | "media" | "baja";
  urgentActionRequired?: boolean;
  needsMorePhotos?: boolean;
  followUpQuestions?: string[];
  calmMessage?: string;
  engineUsed: "gemini" | "expert_nsr10";
}

/**
 * Normalizes text for matching (lowercase, strips accents, removes punctuation)
 */
function normalizeText(text: string): string {
  return (text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/**
 * Motor Experto de Triaje Estructural y Asistente Sismorresistente NSR-10 / AIS (Colombia).
 * Provee respuestas inmediatas, precisas, empáticas y fundamentadas en ingeniería sismorresistente
 * tanto para consultas conversacionales, protocolos de protección civil, como para evaluación
 * patológica de daños en edificaciones.
 */
export function analyzeWithNSR10ExpertEngine(
  userText: string,
  hasImage: boolean,
  _imageMimeType?: string
): ExpertAnalysisResult {
  const norm = normalizeText(userText);

  // -------------------------------------------------------------
  // 1. Detección de pánico, estrés o alarma
  // -------------------------------------------------------------
  const hasPanic =
    norm.includes("miedo") ||
    norm.includes("panico") ||
    norm.includes("asustad") ||
    norm.includes("angustia") ||
    norm.includes("se va a caer") ||
    norm.includes("se cayo") ||
    norm.includes("cruje") ||
    norm.includes("ruido fuerte") ||
    norm.includes("socorro") ||
    norm.includes("auxilio") ||
    norm.includes("ayuda por favor");

  const calmMessage = hasPanic
    ? "Respira profundo y mantén la serenidad. Tu integridad y la de tus seres queridos es lo primordial. Si sientes vibraciones intensas o escuchas crujidos estructurales, sal con calma hacia un punto de encuentro exterior despejado."
    : undefined;

  // -------------------------------------------------------------
  // 2. Agradecimientos, cortesía y despedidas
  // -------------------------------------------------------------
  if (
    /^(gracias|muchas gracias|mil gracias|agradezco|vale gracias|perfecto gracias|muy amable|ok gracias|listo gracias)\b/.test(
      norm
    ) ||
    norm === "gracias" ||
    norm === "muchas gracias" ||
    norm === "ok" ||
    norm === "vale" ||
    norm === "entendido" ||
    norm === "de acuerdo" ||
    norm === "perfecto" ||
    norm === "listo"
  ) {
    return {
      reply: `¡Con mucho gusto! Estoy aquí para acompañarte y velar por tu seguridad y la de tu edificación.

💡 **Recomendaciones finales para recordar:**
- Si en los próximos días observas que alguna fisura se ensancha o escuchas crujidos, no dudes en volver a consultar o subir una nueva foto.
- Mantén a mano tu **Mochila de Emergencia de 72 horas** y ten identificadas las rutas de evacuación libres de obstáculos.
- Ante cualquier emergencia grave, marca directamente al **123** o al **119** (Bomberos de Colombia).

¿Tienes alguna otra duda técnica o deseas revisar algún otro muro o columna?`,
      confidence: "alta",
      urgentActionRequired: false,
      needsMorePhotos: false,
      engineUsed: "expert_nsr10",
    };
  }

  // -------------------------------------------------------------
  // 3. Saludos iniciales / "¿Quién eres?" / "¿Qué es SismoScan?"
  // -------------------------------------------------------------
  const isGreeting =
    /^(hola|buenas|buenos dias|buenas tardes|buenas noches|que tal|saludos|como estas|hey)\b/.test(
      norm
    ) &&
    !norm.includes("grieta") &&
    !norm.includes("temblor") &&
    !norm.includes("dano") &&
    !norm.includes("pared") &&
    !norm.includes("columna") &&
    !norm.includes("viga");

  if (isGreeting) {
    return {
      reply: `¡Hola! Soy **SismoScan**, tu asistente preliminar de evaluación de riesgo estructural para edificaciones en Colombia, orientado bajo las directrices de la norma sismorresistente **NSR-10** y las guías de la Asociación Colombiana de Ingeniería Sísmica (AIS).

**¿En qué puedo orientarte hoy?**
1. 📸 **Evaluar una grieta o daño:** Describe la fisura o adjunta una fotografía para que determinemos si está en un elemento estructural y si requiere precaución o evacuación.
2. 📏 **Fisurómetro digital:** Si tienes una foto, puedes medir con precisión milimétrica la abertura de la fisura.
3. 🚨 **¿Qué hacer durante un sismo?:** Pregúntame sobre protocolos de repliegue, zonas seguras o mitos comunes.
4. 🎒 **Mochila de 72 horas:** Revisa qué elementos esenciales debes empacar para afrontar emergencias.
5. 📊 **Sismos recientes:** En el cintillo superior puedes monitorear en tiempo real los eventos sísmicos reportados en Colombia.

¿Cómo te encuentras en este momento y qué área de tu edificación deseas consultar?`,
      confidence: "alta",
      urgentActionRequired: false,
      needsMorePhotos: false,
      followUpQuestions: [
        "¿Notaste alguna grieta o fisura tras el sismo reciente?",
        "¿Qué debo hacer si empieza a temblar?",
        "¿Cuáles son las líneas de emergencia en Colombia?",
      ],
      calmMessage,
      engineUsed: "expert_nsr10",
    };
  }

  // Identidad del proyecto / ODS 9
  if (
    norm.includes("quien eres") ||
    norm.includes("que es sismoscan") ||
    norm.includes("quien te creo") ||
    norm.includes("para que sirves") ||
    norm.includes("ods 9")
  ) {
    return {
      reply: `**SismoScan** es un sistema inteligente de triaje estructural preliminar desarrollado como proyecto universitario en Colombia, alineado con el **Objetivo de Desarrollo Sostenible 9 (ODS 9: Industria, Innovación e Infraestructura)** de la ONU.

**Nuestro propósito:**
- **Democratizar la evaluación técnica:** Ayudar a la comunidad a diferenciar rápidamente entre fisuras estéticas superficiales y daños estructurales críticos (en columnas, vigas y muros portantes).
- **Reducir el colapso de líneas de socorro:** Guiar a los ciudadanos para que sepan cuándo es seguro permanecer en su vivienda y cuándo es imperativo evacuar y llamar a los bomberos (**119**) o a emergencias (**123**).
- **Fundamento normativo:** Aplicamos los criterios de inspección post-sismo de la **Norma Sismorresistente Colombiana NSR-10** y las recomendaciones del Comité AIS-400 de la Asociación Colombiana de Ingeniería Sísmica.

*Nota de responsabilidad:* SismoScan ofrece orientación preliminar de triaje y no sustituye el peritaje oficial de un ingeniero estructural matriculado ni las disposiciones de los comités locales de Gestión del Riesgo.`,
      confidence: "alta",
      urgentActionRequired: false,
      needsMorePhotos: false,
      followUpQuestions: [
        "¿Cómo evalúo una grieta en mi casa?",
        "¿Cómo sé si una pared es muro de carga?",
        "¿Qué debe tener la mochila de 72 horas?",
      ],
      engineUsed: "expert_nsr10",
    };
  }

  // -------------------------------------------------------------
  // 4. ¿Qué hacer durante un sismo? / Protocolos de actuación
  // -------------------------------------------------------------
  if (
    (norm.includes("que hago") ||
      norm.includes("que hacer") ||
      norm.includes("como actuar") ||
      norm.includes("durante")) &&
    (norm.includes("tiembla") ||
      norm.includes("temblor") ||
      norm.includes("sismo") ||
      norm.includes("terremoto"))
  ) {
    return {
      reply: `### 🛡️ Protocolo Oficial: ¿Qué hacer durante un sismo?

Conforme a las recomendaciones de la **Unidad Nacional para la Gestión del Riesgo de Desastres (UNGRD)** y de los Cuerpos de Bomberos de Colombia:

#### 1. Durante el movimiento sísmico:
- **Agáchate, Cúbrete y Aférrate:**
  - Ubícate debajo de una mesa o escritorio resistente de madera o metal y aférrate fuertemente a una pata.
  - Si no hay muebles cerca, agáchate contra una pared interior y protege tu cabeza y cuello con ambos brazos.
- **Aléjate del peligro inmediato:**
  - Mantén distancia de ventanas de vidrio, espejos, lámparas pesadas y estantes altos que puedan volcarse.
- **🚫 NO uses ascensores bajo ninguna circunstancia:** Pueden quedar atrapados o sin energía súbitamente.
- **🚫 Desmitificación del marco de la puerta:** En construcciones modernas con tabiques de drywall o puertas de madera delgada, los marcos no brindan protección estructural. Es mucho más seguro estar bajo una mesa sólida.

#### 2. Según el lugar donde te encuentres:
- **En pisos altos (edificios):** No corras desesperadamente hacia las escaleras durante el temblor; permanece en la zona de repliegue interno hasta que pase el movimiento fuerte, luego evacúa por escaleras.
- **En la calle:** Dirígete a una zona abierta lejos de postes de energía, cables de alta tensión, fachadas con vidrios y árboles grandes.
- **En un vehículo:** Reduce la velocidad con precaución, detente en un lugar seguro (lejos de puentes elevados o cables) y permanece dentro con las luces de parqueo encendidas.
- **En la cama:** Permanece en ella, gírate boca abajo y cubre tu cabeza con la almohada (siempre que no haya lámparas pesadas encima).

#### 3. Inmediatamente después del sismo:
1. Revisa si hay heridos y presta primeros auxilios si es seguro.
2. Si percibes olor a gas o agua saliendo, cierra las válvulas principales.
3. Inspecciona visualmente si hay grietas severas en columnas o vigas. Si las ves, evacúa de inmediato hacia el punto de encuentro.`,
      confidence: "alta",
      urgentActionRequired: false,
      needsMorePhotos: false,
      followUpQuestions: [
        "¿Qué debo empacar en la mochila de 72 horas?",
        "¿Cómo sé si una grieta en la columna es peligrosa?",
        "¿A qué número llamo si hay una emergencia?",
      ],
      calmMessage,
      engineUsed: "expert_nsr10",
    };
  }

  // -------------------------------------------------------------
  // 5. Líneas de emergencia en Colombia
  // -------------------------------------------------------------
  if (
    norm.includes("linea") ||
    norm.includes("telefono") ||
    norm.includes("numero") ||
    norm.includes("a quien llamo") ||
    norm.includes("bomberos") ||
    norm.includes("defensa civil") ||
    norm.includes("cruz roja") ||
    norm.includes("contacto de emergencia")
  ) {
    return {
      reply: `### 📞 Líneas Oficiales de Emergencia en Colombia

En caso de riesgo estructural inminente, heridos o emergencias tras un sismo, comunícate inmediatamente con los siguientes números gratuitos desde cualquier celular o teléfono fijo:

- 🚨 **Línea Única de Seguridad y Emergencias:** Marca **123** *(Atiende Policía, Bomberos, Ambulancias y Gestión del Riesgo en todo el territorio nacional)*.
- 🚒 **Cuerpo Oficial de Bomberos:** Marca **119** *(Rescate técnico, incendios, escapes de gas y evaluación preliminar de riesgo de colapso)*.
- ⛑️ **Defensa Civil Colombiana:** Marca **144** *(Socorro, búsqueda, salvamento y evacuación humanitaria)*.
- 🚑 **Cruz Roja Colombiana:** Marca **132** *(Atención médica prehospitalaria, ambulancias y primeros auxilios)*.
- 👮 **Policía Nacional:** Marca **112** *(Seguridad ciudadana y control del orden público)*.

#### Organismos Técnicos Locales de Gestión del Riesgo:
- **Bogotá:** IDIGER *(Llama al 123)*.
- **Medellín y Valle de Aburrá:** DAGRD *(Llama al 123)*.
- **Cali:** Secretaría de Gestión del Riesgo de Emergencias *(Llama al 119 o 123)*.
- **Monitoreo sísmico oficial:** Servicio Geológico Colombiano (**SGC**).`,
      confidence: "alta",
      urgentActionRequired: false,
      needsMorePhotos: false,
      followUpQuestions: [
        "¿Qué debo hacer si hay fuga de gas?",
        "¿Cómo sé si debo evacuar mi edificio?",
        "¿Qué hacer si hay un herido?",
      ],
      engineUsed: "expert_nsr10",
    };
  }

  // -------------------------------------------------------------
  // 6. Mochila de emergencia / Kit de 72 horas
  // -------------------------------------------------------------
  if (
    norm.includes("kit") ||
    norm.includes("mochila") ||
    norm.includes("72 horas") ||
    norm.includes("que empacar") ||
    norm.includes("kit de emergencia")
  ) {
    return {
      reply: `### 🎒 Mochila de Emergencia de 72 Horas (Guía Oficial Colombia)

La mochila de emergencia debe estar guardada en un lugar accesible y cerca de la salida principal de la vivienda. Debe asegurar la subsistencia de los miembros del hogar durante al menos 72 horas:

1. 💧 **Agua potable:** Mínimo 2 litros diarios por persona (preferiblemente en botellas plásticas selladas).
2. 🥫 **Alimentos no perecederos:** Enlatados con abre-fácil (atún, frijoles, verduras), barras de cereal y frutos secos.
3. 🔦 **Iluminación y comunicación:**
   - Linterna LED con baterías de repuesto o linterna de dínamo.
   - Radio portátil AM/FM a baterías para escuchar los boletines del SGC y UNGRD.
   - Batería externa (Power Bank) cargada para el celular con cable.
4. 🩹 **Botiquín de primeros auxilios:**
   - Gasas estériles, vendas elásticas, micropore, alcohol antiséptico, solución salina, analgésicos y **medicamentos esenciales** de uso diario para hipertensión, diabetes, etc.
5. 📂 **Documentos protegidos en bolsa hermética:**
   - Copias de cédulas de ciudadanía, tarjetas de identidad, escrituras del inmueble y carnés de salud.
   - Llaves de repuesto de la casa y del auto.
6. 📯 **Herramientas y seguridad:**
   - **Silbato o pito** de alta potencia (vital para emitir señales sonoras si quedas atrapado).
   - Llave inglesa o alicate para cerrar las llaves de paso de gas y agua.
   - Navaja multiusos, fósforos en bolsa plástica o encendedor.
7. 🐕 **Mascotas:** Comida seca, plato plegable, correa y copia del carné de vacunación.`,
      confidence: "alta",
      urgentActionRequired: false,
      needsMorePhotos: false,
      followUpQuestions: [
        "¿Dónde consigo los elementos del kit?",
        "¿Cómo actuar durante el temblor?",
        "¿Qué debo inspeccionar en mi casa tras el sismo?",
      ],
      engineUsed: "expert_nsr10",
    };
  }

  // -------------------------------------------------------------
  // 7. Uso del Fisurómetro digital
  // -------------------------------------------------------------
  if (
    norm.includes("fisurometro") ||
    norm.includes("como medir") ||
    norm.includes("calibrar") ||
    norm.includes("medir grieta") ||
    norm.includes("regla")
  ) {
    return {
      reply: `### 📏 Cómo usar el Fisurómetro Digital de SismoScan

El fisurómetro digital te permite cuantificar el espesor de la grieta en milímetros utilizando una fotografía y un objeto de referencia conocido:

1. **Toma la fotografía adecuadamente:**
   - Coloca un objeto de tamaño estándar al lado de la grieta en el mismo plano (por ejemplo, una **moneda colombiana de $500** de 23.7 mm de diámetro, o una **cédula de ciudadanía** que mide 85.6 mm de ancho).
   - Toma la foto de frente (perpendicular al muro), con buena iluminación y sin inclinar la cámara.
2. **Sube o selecciona la foto en el chat:**
   - Toca el botón **"Inspeccionar / Fisurómetro"** que aparece sobre la foto.
3. **Calibración:**
   - Selecciona el objeto de referencia (moneda o cédula) y ajusta los extremos del calibrador azul sobre el objeto.
4. **Medición de la grieta:**
   - Desplaza los cursores naranjas sobre los dos bordes de la fisura. El sistema calculará automáticamente el espesor en milímetros:
     - **< 0.5 mm:** Fisura capilar superficial (daño leve, usualmente pintura o estuco).
     - **0.5 a 1.5 mm:** Fisura moderada (requiere seguimiento con testigos de lápiz).
     - **> 2.0 mm:** Grieta de consideración (debe ser evaluada por un ingeniero).`,
      confidence: "alta",
      urgentActionRequired: false,
      needsMorePhotos: false,
      followUpQuestions: [
        "¿Qué significa una grieta en diagonal?",
        "¿Qué es la norma NSR-10?",
        "¿Puedo enviar una foto ahora?",
      ],
      engineUsed: "expert_nsr10",
    };
  }

  // -------------------------------------------------------------
  // 8. Tipos de grietas y patología estructural (NSR-10)
  // -------------------------------------------------------------
  // Grietas diagonales o en X
  if (
    norm.includes("en x") ||
    norm.includes("diagonal") ||
    norm.includes("45 grados") ||
    norm.includes("cruzada") ||
    norm.includes("cortante")
  ) {
    const isColumnOrBeam =
      norm.includes("columna") || norm.includes("viga") || norm.includes("pilar");

    if (isColumnOrBeam) {
      return {
        reply: `### 🚨 ALERTA: Grieta diagonal en elemento portante (${
          norm.includes("columna") ? "Columna" : "Viga"
        })

De acuerdo con el Título C y G de la norma **NSR-10**:
1. **Mecanismo de falla:**
   - Las grietas diagonales a aproximadamente 45° en columnas o vigas son la manifestación directa de **falla por cortante sísmico**.
   - Indican que las fuerzas horizontales del sismo superaron la resistencia del concreto y de los estribos transversales de acero.
2. **Nivel de riesgo:**
   - **Daño severo con riesgo de colapso.** La columna es un elemento vertical no redundante: si falla, transfiere su carga súbitamente a elementos vecinos generando fallas progresivas.
3. **Acción requerida:**
   - **EVACUAR DE INMEDIATO** la edificación hacia una zona exterior despejada.
   - No usar ascensores; descender por escaleras con paso firme.
   - Cortar el gas y la electricidad si están a la mano antes de salir.
   - Contactar a la **Línea 123** o a **Bomberos 119**.`,
        classification: "Daño severo / riesgo de colapso",
        recommendation: "Evacuar de inmediato",
        visualSignals: [
          "Falla por cortante sísmico (grieta diagonal a 45°)",
          "Compromiso de elemento estructural portante primario",
        ],
        elementAnalyzed: norm.includes("columna") ? "Columna" : "Viga",
        confidence: "alta",
        urgentActionRequired: true,
        needsMorePhotos: false,
        followUpQuestions: [
          "¿Ya salieron todos los ocupantes de la edificación?",
          "¿Se observan varillas de acero expuestas o concreto triturado?",
          "¿Hay desniveles en el piso o puertas atascadas?",
        ],
        calmMessage:
          "Conserva la calma, toma tus documentos y evacúa con tranquilidad hacia una zona exterior abierta.",
        engineUsed: "expert_nsr10",
      };
    }

    return {
      reply: `### ⚠️ Grietas diagonales o en 'X' en muros de mampostería

En la ingeniería sismorresistente colombiana (**NSR-10, Título D**):
1. **¿Por qué ocurren?**
   - El sismo sacude la estructura en ciclos de vaivén de un lado a otro. El primer medio ciclo produce tracción diagonal en un sentido (grieta a 45° hacia la derecha); el contra-ciclo produce la grieta opuesta, formando una **"X"**.
   - Es el daño típico por esfuerzo cortante en muros de ladrillo.
2. **Evaluación preliminar:**
   - Si el muro es un **tabique divisorio no portante**, el riesgo de colapso global es bajo, pero hay peligro de desprendimiento de ladrillos o pañete.
   - Si el muro es un **muro de carga confinado** (estructural), el daño es **moderado a severo** y la capacidad sismorresistente del inmueble ha quedado reducida.
3. **Pautas de seguridad:**
   - No permanezcas ni duermas cerca de este muro. Delimita la zona.
   - Verifica si la grieta traspasa el muro hacia el otro lado.
   - Si las puertas contiguas no abren o se atascaron, evacúa preventivamente.`,
      classification: "Daño moderado",
      recommendation: "Requiere más información antes de recomendar",
      visualSignals: [
        "Grietas en 'X' o diagonales por cortante sísmico",
        "Solicitación cíclica en mampostería",
      ],
      elementAnalyzed: "Muro de carga",
      confidence: "media",
      urgentActionRequired: false,
      needsMorePhotos: true,
      followUpQuestions: [
        "¿La grieta traspasa el muro de lado a lado?",
        "¿El muro es de ladrillo estructural tolete o de yeso/drywall?",
        "¿Las puertas y ventanas abren bien o se descuadraron?",
      ],
      calmMessage,
      engineUsed: "expert_nsr10",
    };
  }

  // Grieta horizontal
  if (norm.includes("horizontal")) {
    return {
      reply: `### 🔍 Diagnóstico: Grietas horizontales en edificaciones

Según las patologías descritas en la **NSR-10**:
1. **Causas más frecuentes:**
   - **Falla de flexión fuera del plano:** Durante el temblor, el muro se flexionó como una losa empujada perpendicularmente por la inercia, abriendo la junta entre dos hiladas de ladrillos.
   - **Falta de adherencia en el mortero de pega:** Mezcla pobre en cemento o ladrillos colocados sin humedecer durante la construcción.
   - **Unión losa-muro:** Separación entre el remate superior del tabique y la placa o viga de entrepiso.
2. **Peligros a verificar:**
   - **Riesgo de volcamiento:** Si el muro mide más de 2.5 metros de alto y la grieta horizontal recorre toda su longitud a media altura, el muro podría volcarse ante una réplica sísmica.
3. **Recomendación:**
   - No te apoyes en el muro ni coloques muebles pesados contra él.
   - Si se ubica en una fachada exterior o antepecho de balcón, acorda la zona inferior para evitar accidentes con transeúntes.`,
      classification: "Daño moderado",
      recommendation: "Se puede permanecer con precaución",
      visualSignals: ["Fisura horizontal por flexión fuera del plano en junta de mortero"],
      elementAnalyzed: "Muro",
      confidence: "media",
      urgentActionRequired: false,
      needsMorePhotos: true,
      followUpQuestions: [
        "¿El muro se siente suelto o con juego si se empuja suavemente?",
        "¿La grieta está en la unión con el techo o a mitad de pared?",
      ],
      engineUsed: "expert_nsr10",
    };
  }

  // Grieta vertical
  if (norm.includes("vertical")) {
    return {
      reply: `### 🔍 Diagnóstico: Grietas verticales en edificaciones

En la inspección técnica post-sismo de edificaciones:
1. **Causas habituales:**
   - **Junta fría de construcción (Muro vs. Columna):** Es sumamente común en Colombia ver grietas verticales exactamente donde termina la columna de concreto y empieza el muro de ladrillo. Ocurre porque ambos materiales tienen rigideces y coeficientes de dilatación térmica diferentes.
   - **Asentamiento diferencial:** Si la grieta vertical es ancha en la base y se cierra hacia arriba (o viceversa), puede indicar que un sector del terreno o cimiento cedió unos milímetros tras la vibración.
   - **Contracción térmica:** Fisuras verticales en muros largos sin juntas de dilatación.
2. **Nivel de riesgo:**
   - En la gran mayoría de casos corresponde a **daño leve a moderado** en la unión, siempre que la columna de concreto en sí misma no esté agrietada ni rota.`,
      classification: "Daño leve",
      recommendation: "Se puede permanecer con precaución",
      visualSignals: ["Separación vertical en interfaz muro-columna o junta fría"],
      elementAnalyzed: "Muro divisorio",
      confidence: "alta",
      urgentActionRequired: false,
      needsMorePhotos: false,
      followUpQuestions: [
        "¿La grieta vertical está pegada a una columna de concreto?",
        "¿La columna tiene fisuras o está intacta?",
      ],
      engineUsed: "expert_nsr10",
    };
  }

  // Muros de carga vs tabiques divisorios
  if (
    norm.includes("muro de carga") ||
    norm.includes("muro estructural") ||
    norm.includes("tabique") ||
    norm.includes("pared divisoria") ||
    norm.includes("como saber si")
  ) {
    return {
      reply: `### 🧱 ¿Cómo diferenciar un Muro de Carga de un Tabique Divisorio?

En las tipologías constructivas habituales de Colombia (mampostería confinada y pórticos):

| Característica | Muro Estructural / de Carga | Muro Divisorio / Tabique |
| :--- | :--- | :--- |
| **Función** | Soporta el peso del techo/pisos superiores y resiste sismos | Solo separa espacios (habitaciones, baños) |
| **Material común** | Ladrillo tolete macizo, bloque estructural relleno | Ladrillo hueco de 6 huecos, panel yeso/drywall |
| **Espesor** | Grueso (≥ 12 a 15 cm más pañete) | Delgado (usualmente ≤ 10 cm) |
| **Ubicación** | Se repite en la misma posición en todos los pisos | Puede estar en un piso y no en el de abajo |
| **Sonido al golpear** | Sonido seco, denso y macizo | Sonido hueco o resonante |
| **Confinamiento** | Rodeado por vigas y columnas de amarre vaciadas contra él | Pegado posteriormente sin anclaje sismorresistente |

⚠️ **Regla de oro:** Daños en muros divisorios no comprometen la estabilidad del edificio; daños en muros de carga sí requieren inspección inmediata.`,
      confidence: "alta",
      urgentActionRequired: false,
      needsMorePhotos: false,
      followUpQuestions: [
        "¿En cuál de los dos tipos de muro está la grieta que observas?",
        "¿Se notan columnas de concreto en los extremos del muro?",
      ],
      engineUsed: "expert_nsr10",
    };
  }

  // -------------------------------------------------------------
  // 9. Sismos en Colombia / ¿Por qué tiembla tanto? / Réplicas
  // -------------------------------------------------------------
  if (
    norm.includes("por que tiembla") ||
    norm.includes("porque tiembla") ||
    norm.includes("falla sismica") ||
    norm.includes("placas tectonicas") ||
    norm.includes("santander") ||
    norm.includes("mesa de los santos") ||
    norm.includes("superficial") ||
    norm.includes("profundo") ||
    norm.includes("replica")
  ) {
    return {
      reply: `### 🇨🇴 Sismicidad en Colombia: Guía Técnica del SGC

Colombia es un país con una **alta amenaza sísmica** debido a su compleja configuración geodinámica:

1. **Convergencia de Placas Tectónicas:**
   - En nuestro territorio convergen tres placas principales: la **Placa de Nazca** (que subduce bajo el Pacífico), la **Placa Sudamericana** y la **Placa del Caribe**, además del Bloque Panamá-Chocó.
   - Existen fallas geológicas activas muy conocidas como la Falla de Romeral, Falla de Bucaramanga-Santa Marta, Falla del Borde Llanero y Falla de Murindó.
2. **El Nido Sísmico de Bucaramanga (Mesa de los Santos):**
   - Es el **segundo nido sísmico más activo del planeta**, registrando hasta 40 temblores diarios. Afortunadamente, la mayoría ocurren a profundidades intermedias (~150 km), lo que disipa gran parte de la energía destructiva antes de llegar a la superficie.
3. **¿Sismo Superficial o Profundo?**
   - **Superficial (< 30 km):** Liberan la energía muy cerca de la superficie; se sienten violentos y provocan mayores daños a las construcciones locales (ej. Armenia 1999, Popayán 1983).
   - **Profundo (> 70 km):** Se sienten en un área geográfica muy extensa pero con aceleraciones del suelo más moderadas.
4. **¿Qué pasa con las réplicas?**
   - Las réplicas son reacomodaciones de la corteza. Si una edificación ya quedó sentida o con daño moderado, una réplica de menor magnitud puede agravar el daño. Por eso es vital evaluar el riesgo preliminar.`,
      confidence: "alta",
      urgentActionRequired: false,
      needsMorePhotos: false,
      followUpQuestions: [
        "¿En qué municipio o departamento sentiste el sismo?",
        "¿Observaste daños en tu vivienda después del evento?",
      ],
      engineUsed: "expert_nsr10",
    };
  }

  // -------------------------------------------------------------
  // 10. Rama de Alerta Severa / Evacuación Inmediata
  // -------------------------------------------------------------
  const mentionsColumn =
    norm.includes("columna") ||
    norm.includes("pilar") ||
    norm.includes("colunma") ||
    norm.includes("apoyo") ||
    norm.includes("pie de amigo");

  const mentionsBeam =
    norm.includes("viga") ||
    norm.includes("dintel") ||
    norm.includes("vigueta") ||
    norm.includes("amarre");

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
    norm.includes("triturado");

  const mentionsTilting =
    norm.includes("inclinad") ||
    norm.includes("desplome") ||
    norm.includes("torcid") ||
    norm.includes("pandeo") ||
    norm.includes("abombad") ||
    norm.includes("descuadrad");

  const mentionsGasWaterSmell =
    norm.includes("olor a gas") ||
    norm.includes("escape de gas") ||
    norm.includes("tuberia rota") ||
    norm.includes("fuga de agua");

  const mentionsThroughCrack =
    norm.includes("lado a lado") ||
    norm.includes("pasa la luz") ||
    norm.includes("pasante") ||
    norm.includes("traspasa") ||
    norm.includes("se ve el otro lado");

  if (
    (mentionsColumn && (norm.includes("grieta") || mentionsRebar || mentionsCrushing || mentionsTilting || norm.includes("rota"))) ||
    mentionsRebar ||
    mentionsTilting ||
    (mentionsBeam && (mentionsCrushing || mentionsThroughCrack || norm.includes("rota"))) ||
    mentionsGasWaterSmell
  ) {
    let specificCause = "Se ha detectado afectación severa en elementos portantes estructurales principales.";
    if (mentionsColumn) specificCause = "Afectación crítica en columna (elemento vertical de soporte primario).";
    else if (mentionsRebar) specificCause = "Exposición de armadura de acero de refuerzo con desprendimiento del recubrimiento de concreto.";
    else if (mentionsTilting) specificCause = "Pérdida de verticalidad, desplome o pandeo lateral evidente.";
    else if (mentionsGasWaterSmell) specificCause = "Fractura probable en redes de gas o sanitarias con riesgo de explosión o asfixia.";

    const visualSignals: string[] = [];
    if (mentionsColumn) visualSignals.push("Falla en columna de soporte principal");
    if (mentionsRebar) visualSignals.push("Acero de refuerzo expuesto a la vista");
    if (mentionsCrushing) visualSignals.push("Descascaramiento / aplastamiento de concreto");
    if (mentionsTilting) visualSignals.push("Desplome o deformación angular evidente");
    if (visualSignals.length === 0) visualSignals.push("Daño estructural severo en elemento portante");

    const element = mentionsColumn
      ? "Columna"
      : mentionsBeam
      ? "Viga"
      : "Elemento estructural principal";

    return {
      reply: `### 🚨 ALERTA ROJA: EVACUACIÓN PREVENTIVA INMEDIATA

Conforme a las pautas de evaluación post-sismo de la **Norma NSR-10** y el Comité AIS-400:

1. **Diagnóstico técnico preliminar:** ${specificCause} Las columnas y vigas son los elementos estructurales que sostienen la edificación. Cualquier pérdida de sección de concreto, agrietamiento severo o varillas expuestas compromete directamente la estabilidad ante posibles réplicas sísmicas.
2. **Acciones obligatorias de seguridad:**
   - **EVACÚA DE INMEDIATO** a todos los ocupantes de la edificación hacia un punto de encuentro exterior despejado, lejos de cables eléctricos, fachadas y vidrios.
   - **NO utilices el ascensor bajo ninguna circunstancia**; desciende por las escaleras de emergencia.
   - Si puedes hacerlo con seguridad antes de salir, **corta los suministros principales de gas, luz y agua**.
   - **No reingreses a la edificación** hasta que un ingeniero civil especialista en estructuras o el Cuerpo Oficial de Bomberos emita un concepto técnico favorable.

📞 **Comunícate de inmediato con las autoridades en Colombia:**
- **Línea Única de Emergencias:** Marcar **123**
- **Cuerpo Oficial de Bomberos:** Marcar **119**
- **Defensa Civil Colombiana:** Marcar **144**`,
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
        "¿Se escuchan crujidos adicionales en el edificio?",
      ],
      calmMessage:
        calmMessage ||
        "Prioriza tu vida y la de tus seres queridos. Sal de la edificación con calma y en orden hacia una zona despejada.",
      engineUsed: "expert_nsr10",
    };
  }

  // -------------------------------------------------------------
  // 11. Rama de Daño Moderado (Muros agrietados, puertas atascadas)
  // -------------------------------------------------------------
  const mentionsJammedDoors =
    norm.includes("puerta no abre") ||
    norm.includes("puerta atascada") ||
    norm.includes("ventana atascada") ||
    norm.includes("no cierra la puerta") ||
    norm.includes("descuadro");

  const mentionsCrack =
    norm.includes("grieta") ||
    norm.includes("fisura") ||
    norm.includes("rajadura") ||
    norm.includes("abrio");

  const mentionsSuperficial =
    norm.includes("superficial") ||
    norm.includes("pintura") ||
    norm.includes("estuco") ||
    norm.includes("panete") ||
    norm.includes("revoque") ||
    norm.includes("yeso") ||
    norm.includes("cabello") ||
    norm.includes("muy delgadita") ||
    norm.includes("fina");

  if (mentionsCrack && !mentionsSuperficial) {
    return {
      reply: `### ⚠️ EVALUACIÓN TÉCNICA: DAÑO MODERADO / INSPECCIÓN REQUERIDA

Con base en tu reporte y los patrones de comportamiento sísmico según la norma **NSR-10**:

1. **Análisis técnico preliminar:**
   - La presencia de grietas visibles en muros indica que la estructura experimentó aceleraciones sísmicas considerables y disipó energía a través de la mampostería.
   - ${
     mentionsJammedDoors
       ? "**Alerta adicional por vanos atascados:** El atascamiento de puertas o ventanas evidencia una distorsión angular de entrepiso (deriva sísmica lateral)."
       : "Es necesario confirmar si la fisura tiene profundidad o si traspasa el muro de lado a lado."
   }
2. **Medidas preventivas inmediatas:**
   - **Delimita la zona:** Evita que personas duerman o transiten frecuentemente cerca del muro afectado.
   - **Monitoreo con testigos de lápiz:** Traza dos marcas pequeñas con lápiz y la fecha de hoy en los extremos de la grieta. Si observas que se alarga tras una réplica, es señal de avance del daño.
   - **Medición con fisurómetro:** Si tienes una foto, pulsa el botón *Inspeccionar / Fisurómetro* para verificar si el espesor supera 1.5 a 2 mm.`,
      classification: "Daño moderado",
      recommendation: "Requiere más información antes de recomendar",
      visualSignals: [
        "Fisuración con abertura notable en mampostería",
        mentionsJammedDoors
          ? "Atascamiento de vanos (posible deriva sísmica de entrepiso)"
          : "Disipación de energía por cortante en muros",
      ],
      elementAnalyzed: "Muro de carga",
      confidence: "media",
      urgentActionRequired: false,
      needsMorePhotos: !hasImage,
      followUpQuestions: [
        "¿La grieta traspasa el muro hacia la habitación contigua o fachada?",
        "¿El muro es de ladrillo estructural tolete con columnas de amarre o de drywall?",
        "¿Se notan fisuras en las columnas o vigas más cercanas?",
      ],
      calmMessage:
        calmMessage ||
        "El daño requiere precaución pero no hay signos de colapso inminente. Mantén la calma, aísla la zona y realiza seguimiento preventivo.",
      engineUsed: "expert_nsr10",
    };
  }

  // -------------------------------------------------------------
  // 12. Rama de Daño Leve / Fisuras Capilares (< 0.5 mm en estuco)
  // -------------------------------------------------------------
  if (mentionsSuperficial) {
    return {
      reply: `### ✅ EVALUACIÓN TÉCNICA: DAÑO LEVE / FISURA NO ESTRUCTURAL

Revisión técnica conforme a las pautas de inspección de la **NSR-10**:

1. **Diagnóstico:**
   - La anomalía descrita corresponde a una **fisura capilar en el enlucido superficial** (estuco, pañete, revoque o pintura).
   - Estas microfisuras son sumamente comunes tras vibraciones sísmicas o cambios de temperatura, debido a que el estuco y la pintura son materiales rígidos pero poco elásticos comparados con el ladrillo.
   - **No comprometen la capacidad portante** ni la estabilidad global de la edificación.
2. **Recomendaciones:**
   - **Se puede permanecer en el inmueble con total tranquilidad.**
   - Mide el espesor con el **Fisurómetro digital** de SismoScan: si tiene menos de **0.5 mm** (grosor similar a un cabello o una hoja de papel), su reparación es cosmética con masilla elástica y pintura.
   - Haz una marca con lápiz en el extremo de la fisura. Si en las próximas 3 semanas no avanza, el acabado ya se asentó.`,
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
        "¿Observas alguna otra fisura en columnas principales?",
      ],
      calmMessage:
        calmMessage ||
        "Buenas noticias: esta tipología de fisuras es habitual y no representa peligro para la estabilidad de tu hogar.",
      engineUsed: "expert_nsr10",
    };
  }

  // -------------------------------------------------------------
  // 13. Rama por defecto enriquecida (Conversación / Asistencia)
  // -------------------------------------------------------------
  return {
    reply: `Entendido. He analizado tu mensaje desde la perspectiva de la seguridad estructural y sismorresistente colombiana (**NSR-10**):

1. **Para brindarte una orientación técnica precisa:**
   - Si se trata de un daño físico, cuéntame: **¿dónde está ubicado?** (por ejemplo: en una columna vertical de concreto, en una viga horizontal del techo, o en un muro divisorio de ladrillo).
   - También puedes **adjuntar una fotografía** usando el botón de la cámara para que clasifiquemos la gravedad visualmente.
2. **Regla básica de seguridad inmediata:**
   - Si observas que el elemento tiene varillas de acero a la vista, está inclinado o produce crujidos continuos, no permanezcas en el lugar: **evacúa de inmediato** y llama al **123** o **119** (Bomberos).
   - Si son fisuras muy finas en la pintura o pañete, usualmente son superficiales y no representan riesgo de colapso.

¿Deseas detallar lo que observas o tienes alguna pregunta específica sobre qué hacer tras el temblor?`,
    confidence: "media",
    urgentActionRequired: false,
    needsMorePhotos: !hasImage,
    followUpQuestions: [
      "¿El daño está en una columna, viga o pared divisoria?",
      "¿La grieta traspasa la pared de lado a lado?",
      "¿Las puertas y ventanas abren con normalidad?",
    ],
    calmMessage,
    engineUsed: "expert_nsr10",
  };
}
