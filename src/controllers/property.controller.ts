import { Request, Response } from 'express';
import { PropertyService } from '../services/property.service';
import { aiModel } from '../config/ai';

const service = new PropertyService();

// --- 1. VISTA HTML (Incluye el Widget de Chat) ---
export const getPropertiesHTML = async (req: Request, res: Response) => {
  try {
    const propiedades = await service.findAll(req.query.ciudad as string, req.query.operacion as string);
    
    // HTML Maestro
    let html = `
      <head>
        <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Century 21 Enterprise AI</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f0f2f5; padding: 20px; }
          .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; max-width: 1200px; margin: 0 auto; }
          .card { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
          .carousel { display: flex; overflow-x: auto; height: 220px; scroll-snap-type: x mandatory; }
          .carousel img { flex: 0 0 100%; object-fit: cover; scroll-snap-align: start; }
          .content { padding: 15px; }
          .btn { display: block; background: #BEAF87; color: white; text-align: center; padding: 10px; text-decoration: none; border-radius: 8px; margin-top: 10px; font-weight:bold; }
          .agent { display: flex; align-items: center; padding: 10px; background: #fafafa; border-top: 1px solid #eee; }
          .agent img { width: 40px; height: 40px; border-radius: 50%; margin-right: 10px; }
          
          /* Estilos del Chat */
          #chat-btn { position: fixed; bottom: 20px; right: 20px; background: #222; color: #BEAF87; width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 30px; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.3); z-index: 1000; transition: transform 0.2s; }
          #chat-btn:hover { transform: scale(1.1); }
          #chat-window { display: none; position: fixed; bottom: 90px; right: 20px; width: 350px; height: 500px; background: white; border-radius: 12px; box-shadow: 0 5px 25px rgba(0,0,0,0.2); flex-direction: column; z-index: 1000; overflow: hidden; border: 1px solid #eee; }
          #chat-header { background: #222; color: #BEAF87; padding: 15px; font-weight: bold; display: flex; justify-content: space-between; align-items: center; }
          #chat-messages { flex-grow: 1; padding: 15px; overflow-y: auto; background: #f9f9f9; display: flex; flex-direction: column; gap: 10px; }
          #chat-input-area { display: flex; border-top: 1px solid #eee; background: white; padding: 5px; }
          #chat-input { flex-grow: 1; border: none; padding: 15px; outline: none; font-size: 16px; }
          #chat-send { background: #BEAF87; color: white; border: none; padding: 0 20px; cursor: pointer; font-weight: bold; border-radius: 0 0 12px 0; }
          .msg { padding: 10px 14px; border-radius: 12px; max-width: 85%; font-size: 0.9em; line-height: 1.4; word-wrap: break-word; }
          .msg.user { background: #BEAF87; color: white; align-self: flex-end; border-bottom-right-radius: 2px; }
          .msg.ai { background: white; border: 1px solid #e0e0e0; color: #333; align-self: flex-start; border-bottom-left-radius: 2px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
          .typing { font-style: italic; color: #999; font-size: 0.8em; margin-left: 10px; display: none; }
        </style>
      </head>
      <body>
        <h2 style="text-align:center; color:#BEAF87; margin-bottom: 20px;">🏠 Century 21 - Enterprise Dashboard</h2>
        
        <div class="grid">
          ${propiedades.length ? propiedades.map((p: any) => `
            <div class="card">
              <div class="carousel">${p.galeria.map((src:string) => `<img src="${src}">`).join('')}</div>
              <div class="content">
                <div style="display:flex;justify-content:space-between;">
                   <h3 style="margin:0 0 5px 0">${p.encabezado}</h3>
                   <span style="background:#333;color:white;padding:2px 6px;border-radius:4px;font-size:0.7em;height:fit-content">${p.tipoOperacion}</span>
                </div>
                <p style="color:#666;margin:5px 0">📍 ${p.municipio} (${p.colonia})</p>
                <div style="font-weight:800; color:#2e7d32; font-size:1.1em">${p.moneda} ${Number(p.precioVenta||p.precioRenta).toLocaleString()}</div>
                <a href="${p.link_zona}" target="_blank" class="btn">Ver Zona en Web 🔍</a>
              </div>
              <div class="agent">
                <img src="${p.avatar_final}">
                <div style="flex-grow:1;font-size:0.9em"><b>${p.nombre_asesor}</b></div>
                <a href="https://wa.me/${(p.tel_asesor||'').replace(/\D/g,'')}" style="text-decoration:none;font-size:1.5em">📞</a>
              </div>
            </div>`).join('') : '<div style="grid-column:1/-1;text-align:center;padding:40px;color:#777">No hay propiedades activas por el momento.</div>'}
        </div>

        <div id="chat-btn" onclick="toggleChat()">🤖</div>
        
        <div id="chat-window">
          <div id="chat-header">
             <span>Asistente IA (Gemini)</span>
             <span style="cursor:pointer;font-size:1.2em" onclick="toggleChat()">✖</span>
          </div>
          <div id="chat-messages">
             <div class="msg ai">¡Hola! Soy la IA de Century 21. Puedo buscar propiedades por ti. ¿Qué necesitas?</div>
          </div>
          <div class="typing" id="typing-indicator">Gemini está pensando...</div>
          <div id="chat-input-area">
            <input type="text" id="chat-input" placeholder="Ej: Apto en Lechería..." onkeypress="handleKey(event)">
            <button id="chat-send" onclick="sendMessage()">➤</button>
          </div>
        </div>

        <script>
          function toggleChat() {
            const w = document.getElementById('chat-window');
            w.style.display = w.style.display === 'flex' ? 'none' : 'flex';
            if(w.style.display === 'flex') document.getElementById('chat-input').focus();
          }
          function handleKey(e) { if(e.key === 'Enter') sendMessage(); }
          
          async function sendMessage() {
            const input = document.getElementById('chat-input');
            const text = input.value.trim();
            if(!text) return;
            
            // UI Usuario
            const msgs = document.getElementById('chat-messages');
            msgs.innerHTML += '<div class="msg user">' + text + '</div>';
            input.value = '';
            msgs.scrollTop = msgs.scrollHeight;
            document.getElementById('typing-indicator').style.display = 'block';

            try {
              // LLAMADA AL BACKEND
              const res = await fetch('/api/chat', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ message: text })
              });
              const data = await res.json();
              
              // UI Respuesta IA
              document.getElementById('typing-indicator').style.display = 'none';
              // Convertimos saltos de línea a <br> para que se vea bien
              const formattedReply = data.reply.replace(/\n/g, '<br>');
              msgs.innerHTML += '<div class="msg ai">' + formattedReply + '</div>';
            } catch(e) {
              document.getElementById('typing-indicator').style.display = 'none';
              msgs.innerHTML += '<div class="msg ai" style="color:red">Error de conexión 🔌</div>';
            }
            msgs.scrollTop = msgs.scrollHeight;
          }
        </script>
      </body>`;
    
    res.send(html);
  } catch (error: any) {
    res.status(500).send(`Error: ${error.message}`);
  }
};

// --- 2. LÓGICA DEL CHATBOT CON GEMINI ---
export const chatWithGemini = async (req: Request, res: Response) => {
  try {
    const userMsg = req.body.message || "";
    console.log("Usuario pregunta:", userMsg);

    // PASO A: Instruimos a Gemini para que actúe como una Función
    const toolsPrompt = `
      Eres un asistente inmobiliario experto.
      El usuario te preguntará algo.
      
      TU OBJETIVO: Determinar si el usuario quiere BUSCAR propiedades en la base de datos.
      
      SI QUIERE BUSCAR: Responde SOLO con un JSON con este formato exacto:
      { "action": "SEARCH_DB", "ciudad": "NombreCiudad", "operacion": "venta" o "renta" }
      
      SI NO QUIERE BUSCAR (es un saludo o pregunta general): Responde texto normal amablemente.
      
      Pregunta del usuario: "${userMsg}"
    `;

    const result = await aiModel.generateContent(toolsPrompt);
    const aiText = result.response.text();
    console.log("Gemini Pensamiento:", aiText);

    // PASO B: Detectamos si Gemini quiere usar la herramienta (JSON)
    // Usamos una Regex para extraer el JSON limpio, por si Gemini añade texto extra
    const jsonMatch = aiText.match(/\{.*\}/s);
    
    if (jsonMatch) {
      try {
        const params = JSON.parse(jsonMatch[0]);
        
        if (params.action === "SEARCH_DB") {
           // ¡BINGO! Ejecutamos la búsqueda real
           console.log("Ejecutando búsqueda:", params);
           const results = await service.findAll(params.ciudad, params.operacion);
           
           // Resumen para Gemini
           const dataSummary = results.slice(0, 4).map(p => 
             `- ${p.encabezado} (${p.municipio}) Precio: ${p.moneda} ${p.precioVenta||p.precioRenta}. LinkZona: ${p.link_zona}`
           ).join('\n');

           // PASO C: Gemini redacta la respuesta final con los datos reales
           const finalPrompt = `
             El usuario preguntó: "${userMsg}"
             
             He buscado en la base de datos y encontré esto:
             ${dataSummary || "No encontré propiedades con esos criterios exactos en este momento."}
             
             TAREA: Redacta una respuesta amable para el cliente resumiendo estas opciones. 
             Usa emojis. No inventes datos que no estén aquí.
           `;
           
           const finalRes = await aiModel.generateContent(finalPrompt);
           return res.json({ reply: finalRes.response.text() });
        }
      } catch (e) {
        console.error("Error parseando JSON de Gemini", e);
      }
    }

    // Si no hubo búsqueda, devolvemos lo que dijo Gemini originalmente
    res.json({ reply: aiText });

  } catch (error: any) {
    console.error("Error Chatbot:", error);
    res.status(500).json({ reply: "Lo siento, mis neuronas digitales tropezaron. Intenta de nuevo." });
  }
};
