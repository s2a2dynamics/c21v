import { Request, Response } from 'express';
import { PropertyService } from '../services/property.service';
import { aiModel } from '../config/ai';
import { pool } from '../config/database';
import { AIResponseSchema } from '../schemas/ai.schema';

import { renderPropertyDashboard } from '../views/property.view';

const service = new PropertyService();

export const getPropertiesHTML = async (req: Request, res: Response) => {
  try {
    const propiedades = await service.findAll(req.query.ciudad as string, req.query.operacion as string);

    // Invocamos la Vista Modular (Arquitectura Limpia)
    const html = renderPropertyDashboard(propiedades);
    res.send(html);
  } catch (e: any) {
    console.error("Error Dashboard:", e);
    res.status(500).send("Error interno del servidor. Por favor, intente más tarde.");
  }
};

export const chatWithGemini = async (req: Request, res: Response) => {
  try {
    const userMsg = req.body.message || "";

    // Inyectamos contexto de alta calidad (Pilares 1, 2)
    const propiedades = await service.findAll();
    const inventoryContext = propiedades.map(p => {
      const opportunity = p.valorMercado && p.precioVenta ? `(${((1 - (p.precioVenta / p.valorMercado)) * 100).toFixed(0)}% Oportunidad)` : "";
      const specs = `Hab: ${p.recamaras}, Baños: ${p.banios}, Estac: ${p.estacionamientos || 0}, Elev: ${p.numeroElevadores || 0}, Piso: ${p.pisoEnQueSeEncuentra || 'N/A'}`;
      const amenities = [
        p.plantaElectrica === 'si' ? 'Planta Eléctrica' : '',
        p.cisterna === 'si' ? 'Pozo/Cisterna' : '',
        p.gasRed === 'si' ? 'Gas Directo' : '',
        p.seguridad24h ? 'Seguridad 24h' : '',
        p.recepcion ? 'Recepción' : '',
        p.sistemaContraIncendio ? 'Sistema Contra Incendio' : '',
        p.aireAcondicionadoCentral ? 'A/C Central' : '',
        p.amoblado_status ? 'Amoblado' : '',
        p.maletero ? 'Maletero' : ''
      ].filter(Boolean).join(', ');

      return `- [ID ${p.id}] ${p.encabezado}: ${p.moneda} ${p.precioVenta || p.precioRenta} en ${p.colonia}, ${p.municipio}. (${p.m2C}m2C / ${p.m2T}m2T). ${specs}. Amenidades: ${amenities || 'Básicas'}. Oficina: ${p.nombre_oficina}. ${opportunity}`;
    }).join('\n');

    // El "Alma" del Asesor Estratégico (Prompt Engineering Senior)
    const prompt = `
      Actúa como un Arquitecto de Soluciones Inmobiliarias y Mentor Senior de Century 21.
      Tu misión es transformar datos en activos estratégicos. No solo vendas metros cuadrados, vende ROI y legado.

      DATOS DEL PORTAFOLIO ACTUAL (AMC):
      ${inventoryContext}

      CONSULTA DEL CLIENTE: "${userMsg}"

      INSTRUCCIONES TÉCNICAS:
      - Genera una respuesta estructurada en JSON siguiendo este esquema:
        {
          "saludo": "Protocolo senior de C21",
          "analisis_estrategico": "Visión holística sobre la zona y la oportunidad solicitada",
          "recomendaciones": [
            {
              "id": "ID de la propiedad",
              "titulo": "Título corto",
              "razon_estrategica": "Justificación técnica de por qué es un activo valioso",
              "metrics": {
                "roi_estimado": "Cálculo basado en rentabilidad de zona",
                "plusvalia_zona": "Proyección a 5-10 años",
                "oportunidad_porcentaje": "Si aplica, % bajo mercado"
              }
            }
          ],
          "conclusion_senior": "Cierre enfocado en la construcción de patrimonio y próximos pasos"
        }
    `;

    // Generación Estructurada (Gemini Structured Output)
    const result = await aiModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const textResponse = result.response.text();
    const rawJson = JSON.parse(textResponse);

    // Validación Rigurosa con Zod
    const validatedResponse = AIResponseSchema.parse(rawJson);

    res.json(validatedResponse);
  } catch (error: any) {
    console.error("Error IA Estructurada:", error);
    res.json({
      saludo: "Estimado socio,",
      analisis_estrategico: "Estamos experimentando una alta demanda en nuestros sistemas de inteligencia Alpha.",
      recomendaciones: [],
      conclusion_senior: "Por favor, reintente su consulta técnica en unos segundos para recibir el análisis completo."
    });
  }
};

export const getRawProperty = async (req: Request, res: Response) => {
  try {
    const [rows]: any = await pool.execute('SELECT * FROM propiedades WHERE status = "enPromocion" LIMIT 1');
    res.json(rows[0] || { message: "No properties found" });
  } catch (error: any) {
    console.error("Error Debug:", error);
    res.status(500).json({ error: error.message });
  }
};
