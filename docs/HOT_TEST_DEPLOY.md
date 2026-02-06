# Guía de Despliegue "En Caliente" (Hot Test) en Cloud Run

¡Excelente visión, Socio! Si la base de datos solo acepta la IP `136.111.17.182`, entonces probar localmente en el terminal de Cloud Shell no funcionará (porque Cloud Shell tiene una IP distinta). 

Para probar "en caliente", lo que vamos a hacer es **desplegar el contenedor directamente a Cloud Run** y forzarlo a salir por el canal privado que ya tienes configurado. Así, para la base de datos, ¡será una conexión legítima!

---

## 1. Construir la Imagen (Docker + Cloud Build)

En lugar de compilar solo con `npm`, vamos a empaquetar todo el sistema en un contenedor profesional:

```bash
# Envía el código a Google para que lo empaquete
gcloud builds submit --tag gcr.io/$GOOGLE_CLOUD_PROJECT/c21v-app
```
*(Espera a que termine. Esto sube tu código a un almacén seguro de imágenes).*

---

## 2. Desplegar a Cloud Run con IP Fija

Aquí viene la magia de Arquitecto. Este comando lanza tu app y la conecta al "Túnel VPC" para que salga por tu IP fija:

```bash
gcloud run deploy c21v-service \
  --image gcr.io/$GOOGLE_CLOUD_PROJECT/c21v-app \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --vpc-connector NOMBRE_DE_TU_CONNECTOR \
  --set-env-vars GOOGLE_API_KEY=tu_key,DB_HOST=tu_host,DB_USER=tu_user,DB_PASS=tu_pass,DB_NAME=tu_base
```

### Notas Importantes de Mentor:
1. **`--vpc-connector`**: Reemplaza `NOMBRE_DE_TU_CONNECTOR` con el nombre del conector que mencionaste en tu arquitectura (el que está unido al Cloud NAT con la IP fija).
2. **Variables `--set-env-vars`**: Por ahora las pasamos así para probar rápido ("Hot Test"), pero en producción usaremos **Secret Manager** para mayor seguridad.
3. **Región**: Asegúrate de usar la misma región donde está tu conector VPC (ej: `us-central1`).

---

## 3. ¿Por qué esto sí funcionará?

Como Arquitecto, te explico el flujo:
1. **Tu App** arranca en Cloud Run.
2. Al ir a conectar con la **Base de Datos**, el tráfico entra por el **Serverless VPC Access Connector**.
3. El **Cloud NAT** toma ese tráfico y le pone la "etiqueta" de tu IP fija: `136.111.17.182`.
4. La **Base de Datos** ve llegar la IP autorizada y... **¡BINGO!**, te deja entrar.

---

## 4. Verificación Final

Una vez termine el comando de arriba, te dará una **URL de Service**. 
Ábrela en tu navegador y prueba el Chatbot. Si te responde con datos de la base de datos, ¡hemos conquistado la nube!

¿Tienes el nombre del conector VPC a mano para ayudarte a montar el comando final?
