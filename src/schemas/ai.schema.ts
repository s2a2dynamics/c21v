import { z } from 'zod';

export const AIResponseSchema = z.object({
    saludo: z.string().describe("Saludo profesional de Asesor Senior"),
    analisis_estrategico: z.string().describe("Análisis holístico de la búsqueda del cliente"),
    recomendaciones: z.array(z.object({
        id: z.coerce.number(),
        titulo: z.string(),
        razon_estrategica: z.string().describe("Por qué es una buena inversión"),
        metrics: z.object({
            roi_estimado: z.string().optional(),
            plusvalia_zona: z.string().optional(),
            oportunidad_porcentaje: z.string().optional()
        })
    })).max(3),
    conclusion_senior: z.string().describe("Cierre persuasivo enfocado en el legado y activos")
});

export type AIResponse = z.infer<typeof AIResponseSchema>;
