# Guía de Test en Google Cloud Shell - Proyecto C21V

Sigue estos pasos para validar el refactor estratégico en la nube.

## 1. Preparar el Entorno
Abre Google Cloud Shell y ejecuta:

```bash
# Clonar el repositorio y entrar
git clone https://github.com/s2a2dynamics/c21v.git
cd c21v

# Cambiar a la rama del refactor (CRÍTICO)
git checkout feature/strategic-exercise-c21v

# Instalar dependencias
npm install
```

## 2. Gestión de IP Fija (Whitelist)
Como tu base de datos requiere IP fija y Cloud Shell usa IPs temporales, ejecuta esto para saber qué IP autorizar **ahora mismo**:

```bash
curl ifconfig.me
```
> [!IMPORTANT]
> Copia la IP que salga y añádela temporalmente al firewall de tu base de datos (puerto 3306).

## 3. Configurar Secretos
Crea el archivo `.env` basado en la plantilla que preparamos:

```bash
cp .env.example .env
nano .env
```
*Rellena los datos de tu DB y tu API Key de Gemini.*

## 4. Ejecución y Validación
Lanza el servidor en modo desarrollo:

```bash
npm run dev
```

### Qué verificar:
1. **Validación de Zod**: Si olvidaste una variable en el `.env`, el servidor fallará inmediatamente con un error claro. No habrá fallos silenciosos.
2. **Web Dashboard**: Usa el botón "Web Preview" de Cloud Shell (puerto 8080) para ver el nuevo diseño modular.
3. **Chatbot Inteligente**: Pregunta al bot: *"¿Qué casas tienes disponibles?"*. Debería responderte listando las propiedades reales de tu base de datos gracias al nuevo contexto inyectado.
