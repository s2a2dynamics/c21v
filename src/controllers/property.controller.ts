import { Request, Response } from 'express';
import { PropertyService } from '../services/property.service';
import { aiModel } from '../config/ai';

const service = new PropertyService();
// Enlace de búsqueda para el entorno Sandbox
const SEARCH_BASE = "https://www.century21.com.ve/inmuebles?busqueda=";
const CDN_BASE = "https://cdn.21online.lat/venezuela"; 

// Función auxiliar para parsear el JSON de la base de datos de forma segura
const parseCache = (jsonRaw: any) => {
  if (!jsonRaw) return null;
  if (typeof jsonRaw === 'object') return jsonRaw; // Ya es objeto
  try {
    return JSON.parse(jsonRaw);
  } catch (e) {
    return null;
  }
};

export const getPropertiesHTML = async (req: Request, res: Response) => {
  try {
    // 1. Obtenemos datos crudos del servicio
    const { propiedades, fotos } = await service.findAll(req.query.ciudad as string, req.query.operacion as string);
    
    // 2. PROCESAMIENTO Y MAPEO DE DATOS
    const listaFinal = propiedades.map((p: any, index: number) => {
        
        // A. FOTOS: Cruzamos usando 'id_propiedad_real' para evitar conflictos
        const susFotos = fotos
            .filter((f: any) => f.idPropiedades == p.id_propiedad_real)
            .map((f: any) => {
                const data = parseCache(f.cache);
                if (data?.propiedadLarge?.path) return data.propiedadLarge.path;
                if (data?.propiedadThumbnail?.path) return data.propiedadThumbnail.path;
                return null;
            })
            .filter((url: any) => url !== null);

        // Si no hay fotos, usamos placeholder
        const galeria = (susFotos && susFotos.length > 0) ? susFotos : ['https://placehold.co/600x400?text=Sin+Foto'];

        // B. ASESOR: Lógica de prioridad (Nickname > Nombre Completo > Legacy)
        let asesorNombre = "Asesor C21";
        if (p.nombre_asesor) {
             asesorNombre = p.nombre_asesor; // Usamos nickname (ej: Ingrid Garcia)
        } else if (p.nombre) {
             asesorNombre = `${p.nombre} ${p.apellido_asesor || ''}`.trim();
        } else if (p.asesor_legacy) {
             asesorNombre = p.asesor_legacy;
        }

        // C. FOTO ASESOR: Parseamos el cache del usuario
        let avatarUrl = null;
        if (p.cache_asesor) {
            const data = parseCache(p.cache_asesor);
            if (data?.asesorThumbnail?.path) avatarUrl = data.asesorThumbnail.path;
        }
        if (!avatarUrl) {
            avatarUrl = `https://ui-avatars.com/api/?name=${asesorNombre}&background=f0f0f0&color=333`;
        }

        // D. PRECIO Y TEXTOS
        let precio = p.tipoOperacion === 'renta' ? p.precioRenta : p.precioVenta;
        const precioTexto = `${p.moneda || '$'} ${Number(precio || 0).toLocaleString()}`;
        const titulo = p.encabezado || "Oportunidad Century 21";
        const ubicacion = `${p.colonia || ''}, ${p.municipio || 'Venezuela'}`;
        
        // E. LINK ZONA (Solución Sandbox)
        const cleanTitle = (p.encabezado || "").replace(/[^a-zA-Z0-9\s]/g, '').trim();
        const linkZona = `${SEARCH_BASE}${encodeURIComponent(cleanTitle)}`;

        // OBJETO LIMPIO PARA LA VISTA
        return {
            id: p.id_propiedad_real,
            uniqueId: index,
            titulo: titulo,
            precio_texto: precioTexto,
            precio_num: Number(precio),
            ubicacion: ubicacion,
            link: linkZona,
            img: galeria[0], // Foto principal
            galeria: galeria, // Todas las fotos
            asesor: asesorNombre,
            telefono: p.telefono_asesor || "0414-0000000",
            avatar_asesor: avatarUrl,
            specs: { beds: p.recamaras || 0, bath: p.banios || 0, m2: p.m2C || 0 }
        };
    });
    
    // 3. GENERACIÓN DE HTML
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
          .card{background:white;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1); display:flex; flex-direction:column;}
          .carousel{display:flex;overflow-x:auto;height:200px;scroll-snap-type:x mandatory}
          .carousel img{flex:0 0 100%;object-fit:cover;scroll-snap-align:start}
          .content{padding:15px; flex-grow:1;}
          .btn{display:block;background:#BEAF87;color:white;text-align:center;padding:12px;text-decoration:none;border-radius:8px;margin-top:10px;font-weight:bold}
          
          /* CHATBOT */
          #chat-btn{position:fixed;bottom:20px;right:20px;background:#222;color:#BEAF87;width:65px;height:65px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:32px;cursor:pointer;z-index:9999;box-shadow:0 4px 15px rgba(0,0,0,0.4); transition: transform 0.2s;}
          #chat-btn:hover { transform: scale(1.1); }
          #chat-window { display: none; position: fixed; bottom: 100px; right: 20px; width: 400px; height: 70vh; max-height: 650px; background: white; border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.25); flex-direction: column; z-index: 9999; border: 1px solid #ddd; overflow: hidden; }
          #chat-header{background:#222;color:#BEAF87;padding:18px;font-weight:bold;display:flex;justify-content:space-between;align-items:center;font-size:16px; flex-shrink: 0;}
          #chat-messages { flex-grow: 1; padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 15px; background: #f9f9f9; scroll-behavior: smooth; }
          .msg{padding:12px 16px;border-radius:12px;max-width:85%;line-height:1.5;font-size:14px;white-space:pre-wrap;box-shadow: 0 1px 2px rgba(0,0,0,0.05);}
          .msg.user{background:#BEAF87;color:white;align-self:flex-end;border-bottom-right-radius:2px}
          .msg.ai{background:white;color:#333;align-self:flex-start;border-bottom-left-radius:2px;border: 1px solid #eee;}
          
          /* TARJETA DE CHAT */
          .chat-card { background: white; border-radius: 12px; overflow: hidden; margin-top: 5px; width: 95%; align-self: center; box-shadow: 0 3px 8px rgba(0,0,0,0.1); border: 1px solid #eee; flex-shrink: 0; display: flex; flex-direction: column; }
          .chat-card img { width: 100%; height: 160px; object-fit: cover; }
          .chat-card-content { padding: 12px; flex-grow: 1; }
          .chat-card h5 { margin: 0 0 5px 0; font-size: 15px; color: #222; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
          .chat-card p.price { margin: 0 0 5px 0; font-size: 14px; color: #2e7d32; font-weight: bold; }
          .chat-card p.location { margin: 0 0 10px 0; font-size: 12px; color: #666; display: flex; align-items: center; gap: 4px; }
          .chat-card-footer { border-top: 1px solid #f0f0f0; padding: 10px 12px; background: #fafafa; display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #555; }
          .agent-info { display: flex; align-items: center; gap: 6px; font-weight: 600; color: #333; }
          .agent-phone { color: #BEAF87; font-weight: bold; font-family: monospace; font-size: 12px;}
          .chat-card .mini-btn { display: block; background: #222; color: #BEAF87; text-align: center; padding: 8px; text-decoration: none; border-radius: 6px; font-size: 13px; font-weight: 600; margin-top: 8px; }
          #chat-input-area{display:flex;border-top:1px solid #eee;padding:15px;background:white; flex-shrink: 0;}
          #chat-input{flex-grow:1;border:1px solid #ddd;padding:12px;border-radius:25px;outline:none;margin-right:10px;font-size:14px;}
          #chat-send{background:#BEAF87;color:white;border:none;padding:0 20px;border-radius:50%;width:45px;height:45px;cursor:pointer;font-size:20px;display:flex;align-items:center;justify-content:center;}
        </style>
      </head>
      <body>
        <h2 style="text-align:center;color:#BEAF87;margin-bottom:30px">🏠 Century 21 - Enterprise Dashboard</h2>
        
        <div class="grid">
          ${listaFinal.map((p: any) => `
            <div class="card">
              <div class="carousel-wrapper">
                <div class="carousel" id="carousel-${p.uniqueId}" onscroll="updateCounter(${p.uniqueId})">
                   ${p.galeria.map((img:string) => `<img src="${img}" loading="lazy">`).join('')}
                </div>
                ${p.galeria.length > 1 ? `<div class="photo-count" id="count-${p.uniqueId}">📷 1 / ${p.galeria.length}</div>` : ''}
              </div>
              <div class="content">
                <h4 style="margin:0">${p.titulo}</h4>
                <p style="color:#2e7d32;font-weight:bold">${p.precio_texto}</p>
                <p style="color:#666;font-size:0.9em">📍 ${p.ubicacion}</p>
                <a href="${p.link}" target="_blank" class="btn">Ver Zona 🔍</a>
              </div>
              <div class="agent">
                <img src="${p.avatar_asesor}" onerror="this.src='https://ui-avatars.com/api/?name=${p.asesor}'">
                <div class="agent-info"><div class="agent-name">${p.asesor}</div></div>
                <a href="https://wa.me/${p.telefono.replace(/[^0-9]/g, '')}" target="_blank" class="whatsapp-btn">📞</a>
              </div>
            </div>
          `).join('')}
        </div>

        <div id="chat-btn" onclick="toggleChat()">🤖</div>
        <div id="chat-window">
          <div id="chat-header"><span>Asistente C21</span><span onclick="toggleChat()" style="cursor:pointer;font-size:20px">✕</span></div>
          <div id="chat-messages"><div class="msg ai">¡Hola! ¿En qué puedo ayudarte hoy? 🏠</div></div>
          <div id="chat-input-area">
            <input type="text" id="chat-input" placeholder="Escribe aquí..." onkeypress="if(event.key==='Enter')sendMessage()">
            <button id="chat-send" onclick="sendMessage()">➤</button>
          </div>
        </div>

        <script>
          var conversationHistory = [];
          function updateCounter(id) {
            const carousel = document.getElementById('carousel-' + id);
            const counter = document.getElementById('count-' + id);
            if (!carousel || !counter) return;
            const scrollPosition = carousel.scrollLeft;
            const width = carousel.offsetWidth;
            const currentPhoto = Math.round(scrollPosition / width) + 1;
            const totalPhotos = carousel.getElementsByTagName('img').length;
            counter.innerText = '📷 ' + currentPhoto + ' / ' + totalPhotos;
          }
          function toggleChat(){var w=document.getElementById('chat-window');w.style.display=(w.style.display==='flex')?'none':'flex';if(w.style.display==='flex')setTimeout(function(){document.getElementById('chat-input').focus()},100);}
          
          async function sendMessage(){
            var input = document.getElementById('chat-input'); var text = input.value.trim(); if(!text) return;
            var msgs = document.getElementById('chat-messages');
            var userDiv = document.createElement('div'); userDiv.className='msg user'; userDiv.innerText=text; msgs.appendChild(userDiv);
            conversationHistory.push("Cliente: "+text); input.value=''; msgs.scrollTop=msgs.scrollHeight;

            try {
              var res = await fetch('/api/chat', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({history:conversationHistory})});
              var data = await res.json();
              var parts = data.reply.split("||DATA||");
              var botText = parts[0];
              var aiDiv = document.createElement('div'); aiDiv.className='msg ai'; aiDiv.innerText=botText; msgs.appendChild(aiDiv);
              conversationHistory.push("Agente: "+botText);

              if(parts.length > 1) {
                try {
                  var jsonRaw = parts[1];
                  if(jsonRaw.indexOf("json")>-1) jsonRaw=jsonRaw.split("json")[1];
                  jsonRaw = jsonRaw.replace(/[\`]/g, "").trim();
                  var cards = JSON.parse(jsonRaw);
                  
                  if(Array.isArray(cards)){
                    cards.forEach(function(c) {
                      var cardDiv = document.createElement('div'); cardDiv.className='chat-card';
                      var imgHtml = '<img src="' + c.img + '" onerror="this.src=\\'https://placehold.co/400?text=C21\\'">';
                      var contentStart = '<div class="chat-card-content">';
                      var titleHtml = '<h5>' + (c.titulo || "Inmueble C21") + '</h5>';
                      var priceHtml = '<p class="price">' + c.precio_texto + '</p>';
                      var locHtml = '<p class="location">📍 ' + c.ubicacion + '</p>';
                      var btnHtml = '<a href="' + c.link + '" target="_blank" class="mini-btn">Ver Detalles</a>';
                      var contentEnd = '</div>';
                      var footerHtml = '<div class="chat-card-footer">' +
                                       '<div class="agent-info">👤 ' + c.asesor + '</div>' +
                                       '<div class="agent-phone">📞 ' + c.telefono + '</div>' +
                                       '</div>';
                      cardDiv.innerHTML = imgHtml + contentStart + titleHtml + priceHtml + locHtml + btnHtml + contentEnd + footerHtml;
                      msgs.appendChild(cardDiv);
                    });
                  }
                } catch(err) { console.warn(err); }
              }
            } catch(e) { var d=document.createElement('div'); d.className='msg ai'; d.innerText='Error de conexión.'; msgs.appendChild(d); }
            setTimeout(function(){msgs.scrollTop=msgs.scrollHeight},100);
          }
        </script>
      </body>
      </html>
    `;
    res.send(html);
  } catch (e: any) { res.status(500).send(e.message); }
};

export const chatWithGemini = async (req: Request, res: Response) => {
  try {
    const history = req.body.history || [];
    const conversationText = history.join("\n");
    // Llamada al servicio con los datos ya limpios
    const { propiedades, fotos } = await service.findAll(); 
    
    // Mapeo IDÉNTICO para el Bot
    const inventario = propiedades.map((casa: any) => {
        // Logica fotos para la IA
        const susFotos = fotos
            .filter((f: any) => f.idPropiedades == casa.id_propiedad_real)
            .map((f: any) => {
                const data = parseCache(f.cache);
                if (data?.propiedadLarge?.path) return data.propiedadLarge.path;
                return null;
            })
            .filter((url: any) => url !== null);

        let precio = casa.tipoOperacion === 'renta' ? casa.precioRenta : casa.precioVenta;
        
        // Logica Asesor para la IA
        let asesorNombre = "Asesor C21";
        if (casa.nombre_asesor) {
             asesorNombre = casa.nombre_asesor;
        } else if (casa.nombre) {
             asesorNombre = `${casa.nombre} ${casa.apellido_asesor || ''}`.trim();
        }

        return {
          titulo: casa.encabezado,
          precio_texto: `${casa.moneda} ${Number(precio).toLocaleString()}`,
          ubicacion: `${casa.colonia}, ${casa.municipio}`,
          link: `${SEARCH_BASE}${encodeURIComponent((casa.encabezado || "").replace(/[^a-zA-Z0-9\s]/g, '').trim())}`,
          img: susFotos.length > 0 ? susFotos[0] : 'https://placehold.co/400?text=C21',
          asesor: asesorNombre,
          telefono: casa.telefono_asesor || "0414-0000000"
        };
    });

    const prompt = `Eres un asesor de Century 21.
    INVENTARIO (JSON): ${JSON.stringify(inventario)}
    HISTORIAL: ${conversationText}
    INSTRUCCIONES:
    1. Selecciona 3-5 propiedades.
    2. Responde amable.
    3. FORMATO: Texto ||DATA|| [JSON ARRAY]
    4. Solo envía JSON crudo después del separador.`;

    const result = await aiModel.generateContent(prompt);
    const response = await result.response;
    res.json({ reply: response.text() });
  } catch (error: any) {
    console.error("Error IA:", error);
    res.json({ reply: "Dame un segundo..." });
  }
};