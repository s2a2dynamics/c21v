import { Request, Response } from 'express';
import { PropertyService } from '../services/property.service';
import { aiModel } from '../config/ai';

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

    // Inyectamos contexto básico de las propiedades cargadas (Fase 1 del RAG-lite)
    const propiedades = await service.findAll();
    const inventoryContext = propiedades.map(p => `- ${p.encabezado}: ${p.moneda} ${p.precioVenta || p.precioRenta} en ${p.municipio}`).join('\n');

    const prompt = `
      Actúa como un agente inmobiliario experto de Century 21 Venezuela. Sé breve, amable y profesional.
      
      CONTEXTO DE INVENTARIO ACTUAL:
      ${inventoryContext}

      CLIENTE DICE: "${userMsg}"
      
      INSTRUCCIÓN: Responde al cliente basándote en el inventario si es relevante. Si no tenemos lo que busca, sé honesto y ofrece ayuda general.
    `;

    const result = await aiModel.generateContent(prompt);
    const response = await result.response;
    res.json({ reply: response.text() });
  } catch (error: any) {
    console.error("Error IA:", error);
    res.json({ reply: "Hubo un error técnico con el modelo de IA. Por favor verifica la configuración." });
  }
};
