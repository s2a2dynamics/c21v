# Century 21 Enterprise | AI Strategy Dashboard 🚀

Este proyecto es una plataforma de **Inteligencia Estratégica Inmobiliaria** diseñada para transformar el inventario estático de Century 21 en activos dinámicos y altamente rentables.

## 🏛️ Visión Arquitectónica
El sistema se construye sobre tres pilares estratégicos:
1.  **Pilar 1: Digital File & Hard Data:** Integración profunda de especificaciones técnicas y amenidades extraídas de `caracteristicasJSON`.
2.  **Pilar 2: IA Mentorship:** Un motor de asesoría senior basado en Gemini Pro con **Structured Outputs (Zod)** que entrega análisis de ROI y Plusvalía.
3.  **Pilar 3: Market Intelligence (En progreso):** Algoritmos de ranking basados en AMC (Análisis Comparativo de Mercado).

## 🛠️ Stack Tecnológico
- **Backend:** Node.js + TypeScript + Express
- **AI Engine:** Google Gemini Pro Latest
- **Database:** MySQL (GCP Cloud SQL Integration)
- **Deployment:** Google Cloud Run + VPC Connector
- **Validation:** Zod (Structured JSON Contracts)

## 🌟 Rama: `feature/strategic-exercise-c21v`
Esta rama contiene las implementaciones más recientes enfocadas en:
- **Mapeo Avanzado de Amenidades:** Extracción automática de seguridad 24h, infraestructura crítica (planta/pozo) y detalles técnicos.
- **Asistente de Inversión Senior:** Migración de un chatbot genérico a un consultor estructurado que argumenta mediante métricas financieras.
- **Dashboard Dinámico:** Interfaz optimizada con insignias visuales y contacto directo vía WhatsApp.

## 🚀 Despliegue
El proyecto está configurado para desplegarse en **Google Cloud Run**.

```bash
# Comando de despliegue oficial
gcloud run deploy c21v-service \
  --source . \
  --project century21venezuela \
  --region us-central1 \
  --allow-unauthenticated \
  --vpc-connector c21-vpc-connector
```

## 📋 Variables de Entorno Necesarias
Para la ejecución local y en producción, se requieren:
- `GOOGLE_API_KEY`: Para el motor de IA Alpha.
- `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`: Credenciales de acceso al núcleo de datos.

---
**Desarrollado con visión de negocio por S2A2 Dynamics.**
