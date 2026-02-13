export interface AIResponse {
    saludo: string;
    analisis_estrategico: string;
    recomendaciones: {
        id: number;
        titulo: string;
        razon_estrategica: string;
        metrics: {
            roi_estimado?: string;
            plusvalia_zona?: string;
            oportunidad_porcentaje?: string;
        }
    }[];
    conclusion_senior: string;
}
