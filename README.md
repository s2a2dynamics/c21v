📘 Documentación Técnica: Sistema Asistente Inmobiliario (C21 Venezuela)
Versión: 1.0.0 (Release Enterprise)
Arquitectura: Microservicio Serverless (Google Cloud Run)
Stack Tecnológico: Node.js, TypeScript, MySQL, Google Gemini 1.5 AI.
Fecha: Enero 2026
1. Resumen de Arquitectura (High-Level Overview)
El sistema actúa como un Middleware Inteligente que conecta tres mundos aislados:
El Usuario Final: Accede vía navegador web (Frontend SSR).
La Data Legacy (AWS): Una base de datos MySQL remota con estructura compleja y datos serializados.
La Inteligencia Artificial (Google): El modelo Gemini 1.5 Flash que procesa lenguaje natural.
Flujo de Datos
Cliente (Navegador) ↔ Cloud Run (Node.js) ↔ Túnel Seguro (Cloud NAT) ↔ AWS RDS (Base de Datos)
2. Estructura del Proyecto (File Tree)
La aplicación sigue el patrón de diseño MVC (Modelo-Vista-Controlador) adaptado a API REST.
src/
├── app.ts .................. Punto de Entrada: Configura el servidor y rutas.
├── config/
│   ├── database.ts ......... Configuración del Pool de Conexiones MySQL.
│   └── ai.ts ............... Inicialización del cliente Google Gemini.
├── services/
│   └── property.service.ts . Lógica de Negocio: Consultas SQL y limpieza de datos.
├── controllers/
│   └── property.controller.ts  Controlador: Generación de HTML y Lógica del Chatbot.
└── interfaces/
    └── property.interface.ts Tipado estricto de datos (TypeScript).


3. Análisis Detallado del Código
A. Configuración de Base de Datos (src/config/database.ts)
Función: Establece la conexión segura con AWS.
Patrón Singleton (Pool): No abrimos una conexión por cada usuario (lo cual tumbaría el servidor). Creamos un Pool (piscina) de 10 conexiones que se reutilizan y se mantienen vivas ("keep-alive").
Seguridad: Lee las credenciales estrictamente desde Variables de Entorno (process.env), nunca hardcodeadas.
export const db = createPool({
  host: process.env.DB_HOST,      // IP Pública de AWS RDS
  user: process.env.DB_USER,
  password: process.env.DB_PASS,  // Nota: Usamos DB_PASS, no PASSWORD
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,            // Límite de concurrencia
  queueLimit: 0
});


B. Lógica de Negocio (src/services/property.service.ts)
Función: Extraer la "aguja del pajar" en la base de datos de Century 21.
Este archivo resuelve dos problemas críticos de la base de datos legacy:
Conflicto de IDs: Las tablas propiedades y usuarios tienen ambas una columna id. Al unirlas, se sobrescribían.
Solución: Usamos el alias SQL p.id as id_propiedad_real.
Duplicidad de Filas: Si hacíamos un JOIN con la tabla de fotos, una casa con 10 fotos generaba 10 filas repetidas, saturando la memoria.
Solución: Estrategia de "Dos Pasos". Primero buscamos las casas, luego buscamos sus fotos en una consulta separada.
El Código Explicado:
async findAll(ciudad?: string, operacion?: string) {
    // PASO 1: Buscar las propiedades (Casas + Asesor)
    let query = `
      SELECT 
        p.id as id_propiedad_real, -- ALIAS CRÍTICO
        p.encabezado, p.precioVenta, ... 
        u.nickname as nombre_asesor, -- Datos del asesor unidos
        u.cache as cache_asesor      -- JSON con la foto del asesor
      FROM propiedades p
      LEFT JOIN usuarios u ON p.idAsesorExclusiva = u.id -- Relación correcta detectada
      WHERE p.status = 'enPromocion' -- Filtro de negocio (Solo activas)
    `;
    
    // ... (Lógica de inyección de filtros segura con params []) ...

    const [propiedades] = await db.query(query, params);

    // PASO 2: Buscar las fotos solo para estas casas
    // Creamos una lista de IDs: "123, 124, 125"
    const ids = propiedades.map(r => r.id_propiedad_real).join(',');
    
    if (ids.length > 0) {
      // Traemos las fotos ordenadas
      const queryFotos = `SELECT idPropiedades, cache FROM fotos WHERE idPropiedades IN (${ids}) ORDER BY orden ASC`;
      const [fotosRows] = await db.query(queryFotos);
      
      return { propiedades, fotos: fotosRows }; // Devolvemos todo separado para procesar
    }
}


C. Controlador y Vista (src/controllers/property.controller.ts)
Función: El "Cerebro Visual". Procesa los datos crudos, descifra los JSONs de imágenes y genera la interfaz.
1. Función parseCache
La base de datos guarda las rutas de las imágenes dentro de un string JSON en la columna cache. Esta función auxiliar intenta leerlo de forma segura (try/catch) para que la app no se rompa si el JSON está corrupto.
2. Endpoint getPropertiesHTML (La Web)
Genera el HTML en el servidor (SSR).
Mapeo Inteligente: Cruza el array de propiedades con el array de fotos usando el id_propiedad_real.
Fallbacks: Si el asesor no tiene nombre, pone "Asesor C21". Si no hay foto, pone un placeholder.
Renderizado: Inyecta los datos en una plantilla HTML con estilos CSS modernos (Grid, Flexbox, Carrusel).
3. Endpoint chatWithGemini (La IA)
Aquí ocurre la magia del RAG (Retrieval Augmented Generation).
Paso A (Contexto): Recibe el historial de chat del usuario.
Paso B (Recuperación): Llama a service.findAll() para obtener el inventario fresco de AWS en ese segundo.
Paso C (Prompt Engineering): Construye una instrucción compleja para Gemini:"Actúa como vendedor. Aquí tienes la lista de casas: [Lista JSON]. El usuario preguntó: [Mensaje]. Si encuentras algo, responde con texto Y ADEMÁS anexa un bloque de código oculto ||DATA|| con el JSON de las casas para yo pintarlas."
Paso D (Respuesta): Envía la respuesta al Frontend.
// Prompt Maestro para Gemini
const prompt = `
  Eres un asesor de Century 21.
  INVENTARIO ACTUALIZADO (JSON): ${JSON.stringify(inventario)}
  HISTORIAL CONVERSACIÓN: ${conversationText}
  
  INSTRUCCIONES:
  1. Si el cliente pide algo específico, búscalo en el inventario.
  2. Responde amable y breve.
  3. FORMATO OBLIGATORIO: 
     Texto de respuesta...
     ||DATA|| 
     [JSON ARRAY DE LAS CASAS ENCONTRADAS]
`;


D. El Frontend (JavaScript en el HTML)
Dentro de la plantilla HTML en el controlador, hay un script <script> que maneja el chat en el navegador del cliente.
Función sendMessage:
Envía el texto al servidor.
Recibe la respuesta.
Busca el separador mágico ||DATA||.
Texto: Lo pone en una burbuja de chat.
Datos (JSON): Lo convierte dinámicamente en tarjetas HTML (<div class="chat-card">) con foto, precio y botón, y las inserta en el chat.
Limpieza: Usa .replace(/```json/g, '') para limpiar si la IA intentó usar Markdown.
4. Guía de Despliegue y Mantenimiento
Comandos de Operación (Cloud Shell)
1. Compilar TypeScript a JavaScript:
npm run build


Genera la carpeta dist/ con el código listo para producción.
2. Desplegar a Google Cloud Run:
gcloud run deploy test-ip-connectivity \
  --source . \
  --region us-central1 \
  --allow-unauthenticated


3. Actualizar Variables de Entorno (Si cambian la contraseña de AWS):
gcloud run services update test-ip-connectivity \
  --update-env-vars DB_PASS=NuevaPassword123


Monitoreo
Logs: Ver en consola de GCP -> Cloud Run -> Logs.
Errores comunes:
ECONNREFUSED: Fallo de conexión con AWS (Revisar IP o Firewall de Amazon).
Access denied: Usuario/Clave de DB incorrectos (Revisar Variables de Entorno).
GoogleGenerativeAI Error: Problema con la API Key de Gemini o modelo no disponible.
Documento generado por S&S Dynamics para Century 21 Venezuela.
