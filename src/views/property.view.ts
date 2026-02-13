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
        <p style="color:var(--c21-gold); font-weight: bold; letter-spacing: 2px; margin-top: 5px;">PANEL EMPRESARIAL</p>
      </header>
      
      <main class="grid">
        ${propiedades.map(p => `
          <article class="card">
            <div class="carousel">${(p.galeria || []).map((img: string) => `<img src="${img}" alt="Propiedad C21" loading="lazy">`).join('')}</div>
            <div class="content">
              <h4 style="margin:5px 0">${p.encabezado}</h4>
              <p class="price">${p.moneda} ${Number(p.precioVenta || p.precioRenta).toLocaleString()}</p>
              ${p.valorMercado ? `
                <div style="background:#e8f5e9; padding:5px 10px; border-radius:5px; margin-bottom:10px; font-size:0.85em; border: 1px solid #c8e6c9;">
                  <span style="color:#2e7d32; font-weight:bold;">💎 Oportunidad Inteligente:</span> 
                  ${p.precioVenta && p.valorMercado ? ((1 - (p.precioVenta / p.valorMercado)) * 100).toFixed(1) : 0}% bajo mercado
                </div>
              ` : ''}
              <p class="location">📍 ${p.municipio} | ${p.m2C}m² C | ${p.m2T || 0}m² T</p>
              
              <div style="font-size: 0.8em; color: #555; background: #fdfdfd; padding: 10px; border-radius: 8px; border: 1px solid #eee; margin-bottom: 15px;">
                <strong>Especificaciones:</strong><br>
                🚗 Puestos: ${p.estacionamientos || 0} | 📅 Año: ${p.edad || 'N/A'} | 🛗 Elev: ${p.numeroElevadores || 0} | 🏢 Piso: ${p.pisoEnQueSeEncuentra || 'N/A'}<br>
                <div style="margin-top:5px; display:flex; gap:5px; flex-wrap:wrap;">
                  ${p.plantaElectrica === 'si' ? '<span style="background:#fff3e0; color:#e65100; padding:2px 6px; border-radius:4px; font-size:0.85em;">⚡ Planta</span>' : ''}
                  ${p.cisterna === 'si' ? '<span style="background:#e3f2fd; color:#0d47a1; padding:2px 6px; border-radius:4px; font-size:0.85em;">💧 Pozo/Cisterna</span>' : ''}
                  ${p.gasRed === 'si' ? '<span style="background:#f3e5f5; color:#4a148c; padding:2px 6px; border-radius:4px; font-size:0.85em;">🔥 Gas Directo</span>' : ''}
                  ${p.seguridad24h ? '<span style="background:#ffebee; color:#c62828; padding:2px 6px; border-radius:4px; font-size:0.85em;">🛡️ Seguridad 24h</span>' : ''}
                  ${p.recepcion ? '<span style="background:#e0f2f1; color:#00695c; padding:2px 6px; border-radius:4px; font-size:0.85em;">🛎️ Recepción</span>' : ''}
                  ${p.sistemaContraIncendio ? '<span style="background:#eceff1; color:#37474f; padding:2px 6px; border-radius:4px; font-size:0.85em;">🧯 Contra Incendio</span>' : ''}
                  ${p.aireAcondicionadoCentral ? '<span style="background:#e0f7fa; color:#006064; padding:2px 6px; border-radius:4px; font-size:0.85em;">❄️ A/C Central</span>' : ''}
                  ${p.amoblado_status ? '<span style="background:#f1f8e9; color:#33691e; padding:2px 6px; border-radius:4px; font-size:0.85em;">🛋️ Amoblado</span>' : ''}
                  ${p.maletero ? '<span style="background:#efebe9; color:#4e342e; padding:2px 6px; border-radius:4px; font-size:0.85em;">📦 Maletero</span>' : ''}
                </div>
              </div>

              <div style="display:flex; align-items:center; gap:10px; margin-bottom:15px; padding-top:10px; border-top: 1px solid #eee;">
                <img src="${p.avatar_final}" style="width:40px; height:40px; border-radius:50%; border: 1px solid var(--c21-gold);">
                <div style="font-size:0.85em;">
                  <div style="font-weight:bold; color:var(--c21-dark)">${p.nombre_asesor || 'Asesor C21'}</div>
                  <div style="color:#666; font-size:0.9em;">C21 ${p.nombre_oficina || 'Venezuela'}</div>
                </div>
              </div>

              <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                <a href="${p.link_zona}" target="_blank" class="btn" style="font-size:0.85em; padding:8px;">Explorar Zona</a>
                ${p.link_whatsapp ? `<a href="${p.link_whatsapp}" target="_blank" class="btn" style="background:#25D366; font-size:0.85em; padding:8px;">WhatsApp</a>` : ''}
              </div>
            </div>
          </article>
        `).join('')}
      </main>

      <button id="chat-btn" onclick="toggleChat()">🤖</button>
      
      <div id="chat-window">
        <div id="chat-header">
          <span>Asistente Inmobiliario AI</span>
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
            
            // Renderizado Estructurado (Evitamos $ para no chocar con el servidor)
            let htmlContent = '<p><strong>' + data.saludo + '</strong></p>';
            htmlContent += '<p>' + data.analisis_estrategico + '</p>';
            
            if (data.recomendaciones && data.recomendaciones.length > 0) {
              htmlContent += '<div style="margin:10px 0; border-left: 3px solid #BEAF87; padding-left:10px;">';
              data.recomendaciones.forEach(function(rec) {
                htmlContent += '<div style="margin-bottom:12px;">';
                htmlContent += '<div style="font-weight:bold; color:#222;">ID ' + rec.id + ': ' + rec.titulo + '</div>';
                htmlContent += '<div style="font-size:0.9em; color:#555;">' + rec.razon_estrategica + '</div>';
                htmlContent += '<div style="font-size:0.85em; margin-top:4px;">';
                if (rec.metrics?.roi_estimado) htmlContent += '<span style="background:#e8f5e9; color:#2e7d32; padding:2px 6px; border-radius:4px; margin-right:5px;">📈 ROI: ' + rec.metrics.roi_estimado + '</span>';
                if (rec.metrics?.plusvalia_zona) htmlContent += '<span style="background:#e3f2fd; color:#0d47a1; padding:2px 6px; border-radius:4px; margin-right:5px;">📊 Plusvalía: ' + rec.metrics.plusvalia_zona + '</span>';
                if (rec.metrics?.oportunidad_porcentaje) htmlContent += '<span style="background:#fff3e0; color:#e65100; padding:2px 6px; border-radius:4px;">🔥 Oportunidad: ' + rec.metrics.oportunidad_porcentaje + '</span>';
                htmlContent += '</div></div>';
              });
              htmlContent += '</div>';
            }
            
            htmlContent += '<p style="font-style:italic; border-top:1px solid #eee; padding-top:8px; margin-top:8px;">' + data.conclusion_senior + '</p>';
            
            aiDiv.innerHTML = htmlContent;
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
