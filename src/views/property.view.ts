import { Property } from '../interfaces/property.interface';

/**
 * Genera el Dashboard HTML para Century 21. 
 * Separado del controlador para cumplir con el principio de responsabilidad única.
 */
export function renderPropertyDashboard(propiedades: Property[]): string {
    return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>C21 Enterprise | Dashboard Inmobiliario</title>
      <style>
        :root {
          --c21-gold: #BEAF87;
          --c21-dark: #222222;
          --bg-gray: #f0f2f5;
          --white: #ffffff;
        }
        body { font-family: -apple-system, system-ui, sans-serif; background: var(--bg-gray); padding: 20px; margin: 0; }
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; max-width: 1200px; margin: 0 auto; }
        .card { background: var(--white); border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); transition: transform 0.2s; }
        .card:hover { transform: translateY(-5px); }
        .carousel { display: flex; overflow-x: auto; height: 200px; scroll-snap-type: x mandatory; background: #eee; }
        .carousel img { flex: 0 0 100%; object-fit: cover; scroll-snap-align: start; }
        .content { padding: 15px; }
        .price { color: #2e7d32; font-weight: bold; font-size: 1.1em; margin: 5px 0; }
        .location { color: #666; font-size: 0.9em; margin-bottom: 10px; }
        .btn { display: block; background: var(--c21-gold); color: var(--white); text-align: center; padding: 12px; text-decoration: none; border-radius: 8px; font-weight: bold; transition: opacity 0.2s; }
        .btn:hover { opacity: 0.9; }

        /* Estilos del Chatbot de Nueva Generación */
        #chat-btn { position: fixed; bottom: 20px; right: 20px; background: var(--c21-dark); color: var(--c21-gold); width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 30px; cursor: pointer; z-index: 9999; box-shadow: 0 4px 12px rgba(0,0,0,0.3); border: none; }
        #chat-window { display: none; position: fixed; bottom: 90px; right: 20px; width: 350px; height: 500px; background: var(--white); border-radius: 16px; box-shadow: 0 5px 25px rgba(0,0,0,0.2); flex-direction: column; z-index: 9999; border: 1px solid #ddd; overflow: hidden; }
        #chat-header { background: var(--c21-dark); color: var(--c21-gold); padding: 15px; font-weight: bold; display: flex; justify-content: space-between; align-items: center; }
        #chat-messages { flex-grow: 1; padding: 15px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; background: #f9f9f9; }
        .msg { padding: 10px 14px; border-radius: 12px; max-width: 85%; line-height: 1.4; font-size: 14px; position: relative; }
        .msg.user { background: var(--c21-gold); color: var(--white); align-self: flex-end; border-bottom-right-radius: 2px; }
        .msg.ai { background: #e4e6eb; color: #050505; align-self: flex-start; border-bottom-left-radius: 2px; }
        #chat-input-area { display: flex; border-top: 1px solid #eee; padding: 15px; background: var(--white); }
        #chat-input { flex-grow: 1; border: 1px solid #ddd; padding: 12px; border-radius: 24px; outline: none; margin-right: 10px; font-size: 14px; }
        #chat-send { background: var(--c21-gold); color: var(--white); border: none; width: 42px; height: 42px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 18px; }
      </style>
    </head>
    <body>
      <header style="text-align:center; padding: 40px 0;">
        <h1 style="color:var(--c21-dark); margin:0; font-size: 2em;">Century 21</h1>
        <p style="color:var(--c21-gold); font-weight: bold; letter-spacing: 2px; margin-top: 5px;">ENTERPRISE DASHBOARD</p>
      </header>
      
      <main class="grid">
        ${propiedades.map(p => `
          <article class="card">
            <div class="carousel">${(p.galeria || []).map((img: string) => `<img src="${img}" alt="Propiedad C21" loading="lazy">`).join('')}</div>
            <div class="content">
              <h4 style="margin:5px 0">${p.encabezado}</h4>
              <p class="price">${p.moneda} ${Number(p.precioVenta || p.precioRenta).toLocaleString()}</p>
              <p class="location">📍 ${p.municipio}</p>
              <a href="${p.link_zona}" target="_blank" class="btn">Explorar Zona 🔍</a>
            </div>
          </article>
        `).join('')}
      </main>

      <button id="chat-btn" onclick="toggleChat()">🤖</button>
      
      <div id="chat-window">
        <div id="chat-header">
          <span>AI Property Assistant</span>
          <span onclick="toggleChat()" style="cursor:pointer; font-size: 20px;">&times;</span>
        </div>
        <div id="chat-messages">
          <div class="msg ai">¡Bienvenido! Soy tu experto inmobiliario de Century 21. ¿En qué zona estás buscando tu próxima inversión? 🏠</div>
        </div>
        <div id="chat-input-area">
          <input type="text" id="chat-input" placeholder="Pregunta sobre estas propiedades..." onkeypress="handleKey(event)">
          <button id="chat-send" onclick="sendMessage()">➤</button>
        </div>
      </div>

      <script>
        function toggleChat() {
          const w = document.getElementById('chat-window');
          const isHidden = w.style.display === 'none' || !w.style.display;
          w.style.display = isHidden ? 'flex' : 'none';
          if (isHidden) document.getElementById('chat-input').focus();
        }

        function handleKey(e) {
          if (e.key === 'Enter') sendMessage();
        }

        async function sendMessage() {
          const input = document.getElementById('chat-input');
          const text = input.value.trim();
          if (!text) return;

          const msgs = document.getElementById('chat-messages');
          
          // Mensaje Usuario
          const userDiv = document.createElement('div');
          userDiv.className = 'msg user';
          userDiv.textContent = text;
          msgs.appendChild(userDiv);
          
          input.value = '';
          msgs.scrollTop = msgs.scrollHeight;

          // Llamar a la IA
          try {
            const response = await fetch('/api/chat', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ message: text })
            });
            
            const data = await response.json();
            
            const aiDiv = document.createElement('div');
            aiDiv.className = 'msg ai';
            aiDiv.textContent = data.reply;
            msgs.appendChild(aiDiv);
          } catch (e) {
            const errDiv = document.createElement('div');
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
}
