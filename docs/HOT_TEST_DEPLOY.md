# Guía de Despliegue "En Caliente" (Hot Test) en Cloud Run

¡Excelente visión, Socio! Si la base de datos solo acepta la IP `136.111.17.182`, entonces probar localmente en el terminal de Cloud Shell no funcionará (porque Cloud Shell tiene una IP distinta). 

Para probar "en caliente", lo que vamos a hacer es **desplegar el contenedor directamente a Cloud Run** y forzarlo a salir por el canal privado que ya tienes configurado. Así, para la base de datos, ¡será una conexión legítima!

---

## 1. El "Comando Maestro" (Build + Deploy en uno)

En lugar de construir y luego desplegar en dos pasos (donde falló el permiso de la imagen), vamos a usar el comando más moderno y sencillo de Google. Este comando detecta tu `Dockerfile`, sube el código, lo empaqueta y lo lanza a Cloud Run automáticamente.

Ejecuta esto:

```bash
gcloud run deploy c21v-service \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --vpc-connector c21-vpc-connector \
  --vpc-egress all-traffic \
  --set-env-vars GOOGLE_API_KEY="AIzaSyBX9PKDmHPlx9NMPrg5iJ5EfB68-xn2ULE",DB_HOST="genioi.cmccfp1q8z6i.us-west-2.rds.amazonaws.com",DB_USER="c21venezuela",DB_PASS="hI4xK.yVQjhd_mV2",DB_NAME="venezuela2",DB_PORT="3306"
```

### ¿Qué hace `--source .`?
1. **Sube tu código** a una carpeta temporal.
2. **Crea la imagen** automáticamente en Artifact Registry (sin que tengas que crear repositorios manualmente).
3. **Despliega** directamente a Cloud Run.

### Notas Importantes de Mentor:
1. **`--vpc-connector`**: Ya he puesto `c21-vpc-connector`, que es el recurso que reservaste.
2. **`--vpc-egress all-traffic`**: Esto es CRÍTICO. Obliga a que TODO el tráfico (incluyendo el de la base de datos) pase por el conector para usar tu IP fija. El nombre correcto del flag es `--vpc-egress`.
3. **Variables `--set-env-vars`**: Por ahora las pasamos así para probar rápido ("Hot Test").

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
