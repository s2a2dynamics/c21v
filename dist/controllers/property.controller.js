"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatWithGemini = exports.getPropertiesHTML = void 0;
const property_service_1 = require("../services/property.service");
const ai_1 = require("../config/ai");
const service = new property_service_1.PropertyService();
const getPropertiesHTML = async (req, res) => {
    try {
        const propiedades = await service.findAll(req.query.ciudad, req.query.operacion);
        // HTML Minificado y limpio para evitar errores de sintaxis en el cliente
        let html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>C21 Enterprise</title>
        <style>
          body{font-family:-apple-system,system-ui,sans-serif;background:#f0f2f5;padding:20px;margin:0}
          .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:20px;max-width:1200px;margin:0 auto}
          .card{background:white;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1)}
          .carousel{display:flex;overflow-x:auto;height:200px;scroll-snap-type:x mandatory}
          .carousel img{flex:0 0 100%;object-fit:cover;scroll-snap-align:start}
          .content{padding:15px}
          .btn{display:block;background:#BEAF87;color:white;text-align:center;padding:12px;text-decoration:none;border-radius:8px;margin-top:10px;font-weight:bold}
          /* Chat Styles */
          #chat-btn{position:fixed;bottom:20px;right:20px;background:#222;color:#BEAF87;width:60px;height:60px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:30px;cursor:pointer;z-index:9999;box-shadow:0 4px 12px rgba(0,0,0,0.3)}
          #chat-window{display:none;position:fixed;bottom:90px;right:20px;width:320px;height:450px;background:white;border-radius:12px;box-shadow:0 5px 25px rgba(0,0,0,0.2);flex-direction:column;z-index:9999;border:1px solid #ddd;overflow:hidden}
          #chat-header{background:#222;color:#BEAF87;padding:15px;font-weight:bold;display:flex;justify-content:space-between}
          #chat-messages{flex-grow:1;padding:15px;overflow-y:auto;display:flex;flex-direction:column;gap:10px;background:#f9f9f9}
          .msg{padding:8px 12px;border-radius:10px;max-width:85%;line-height:1.4;font-size:14px}
          .msg.user{background:#BEAF87;color:white;align-self:flex-end}
          .msg.ai{background:#e4e6eb;color:#050505;align-self:flex-start}
          #chat-input-area{display:flex;border-top:1px solid #eee;padding:10px;background:white}
          #chat-input{flex-grow:1;border:1px solid #ddd;padding:10px;border-radius:20px;outline:none;margin-right:10px}
          #chat-send{background:#BEAF87;color:white;border:none;padding:0 15px;border-radius:50%;width:40px;height:40px;cursor:pointer;font-size:18px}
        </style>
      </head>
      <body>
        <h2 style="text-align:center;color:#BEAF87;margin-bottom:30px">🏠 Century 21 - Enterprise Dashboard</h2>
        
        <div class="grid">
          ${propiedades.map(p => `
            <div class="card">
              <div class="carousel">${(p.galeria || []).map((img) => `<img src="${img}" loading="lazy">`).join('')}</div>
              <div class="content">
                <h4 style="margin:0 0 5px 0">${p.encabezado}</h4>
                <p style="color:#2e7d32;font-weight:bold;font-size:1.1em;margin:0">${p.moneda} ${Number(p.precioVenta || p.precioRenta).toLocaleString()}</p>
                <p style="color:#666;font-size:0.9em">📍 ${p.municipio}</p>
                <a href="${p.link_zona}" target="_blank" class="btn">Ver Zona 🔍</a>
              </div>
            </div>
          `).join('')}
        </div>

        <div id="chat-btn" onclick="toggleChat()">🤖</div>
        
        <div id="chat-window">
          <div id="chat-header">
            <span>Asistente C21</span>
            <span onclick="toggleChat()" style="cursor:pointer">✕</span>
          </div>
          <div id="chat-messages">
            <div class="msg ai">¡Hola! Soy tu asistente virtual de Century 21. ¿Buscas comprar o alquilar? 🏠</div>
          </div>
          <div id="chat-input-area">
            <input type="text" id="chat-input" placeholder="Escribe aquí..." onkeypress="handleKey(event)">
            <button id="chat-send" onclick="sendMessage()">➤</button>
          </div>
        </div>

        <script>
          // Funciones Globales Simplificadas
          function toggleChat() {
            var w = document.getElementById('chat-window');
            if (w.style.display === 'flex') {
              w.style.display = 'none';
            } else {
              w.style.display = 'flex';
              document.getElementById('chat-input').focus();
            }
          }

          function handleKey(e) {
            if (e.key === 'Enter') sendMessage();
          }

          async function sendMessage() {
            var input = document.getElementById('chat-input');
            var text = input.value.trim();
            if (!text) return;

            var msgs = document.getElementById('chat-messages');
            
            // 1. Mostrar mensaje usuario
            var userDiv = document.createElement('div');
            userDiv.className = 'msg user';
            userDiv.textContent = text;
            msgs.appendChild(userDiv);
            
            input.value = '';
            msgs.scrollTop = msgs.scrollHeight;

            // 2. Llamar a la IA
            try {
              var response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text })
              });
              
              var data = await response.json();
              
              var aiDiv = document.createElement('div');
              aiDiv.className = 'msg ai';
              aiDiv.textContent = data.reply;
              msgs.appendChild(aiDiv);
            } catch (e) {
              var errDiv = document.createElement('div');
              errDiv.className = 'msg ai';
              errDiv.textContent = 'Lo siento, tuve un problema de conexión. Intenta de nuevo.';
              msgs.appendChild(errDiv);
            }
            msgs.scrollTop = msgs.scrollHeight;
          }
        </script>
      </body>
      </html>
    `;
        res.send(html);
    }
    catch (e) {
        res.status(500).send(e.message);
    }
};
exports.getPropertiesHTML = getPropertiesHTML;
const chatWithGemini = async (req, res) => {
    try {
        const userMsg = req.body.message || "";
        const result = await ai_1.aiModel.generateContent("Actúa como un agente inmobiliario experto de Century 21 Venezuela. Sé breve, amable y profesional. El cliente dice: " + userMsg);
        const response = await result.response;
        res.json({ reply: response.text() });
    }
    catch (error) {
        console.error("Error IA:", error);
        res.json({ reply: "Hubo un error técnico con el modelo de IA. Por favor verifica la configuración." });
    }
};
exports.chatWithGemini = chatWithGemini;
