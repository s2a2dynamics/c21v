# Guía para Principiantes: Ejecutar C21V en Google Cloud Shell

¡Hola Socio! No te preocupes, como tu mentor estoy aquí para que no te pierdas en ningún paso. Vamos a hacerlo con todo el detalle posible.

## 1. ¿Dónde estoy y a dónde voy? (Navegación)

Cuando abras Google Cloud Shell, verás una línea de texto que termina en `$`. Eso es el "Prompt" (tu lugar de mando).

### El comando `pwd` (¿Dónde estoy?)
Escribe `pwd` y dale a Enter. Te responderá algo como `/home/asuarezh64`. Esa es tu "casa" en la nube. **Es ahí donde debemos empezar.**

---

## 2. Descargar el Proyecto (Git Clone)

Copia y pega este comando tal cual. Esto descargará una copia de tu código desde GitHub a tu carpeta en la nube.

```bash
git clone https://github.com/s2a2dynamics/c21v.git
```

Una vez termine, escribe `ls`. Verás una carpeta nueva llamada `c21v`.

### Entrar en la carpeta
Para trabajar "dentro" del proyecto, debemos entrar en esa carpeta:
```bash
cd c21v
```
*(Ahora verás que el prompt cambia para mostrar que estás dentro de `c21v`)*.

---

## 3. Seleccionar la Rama de Trabajo (Checkout)

Como somos arquitectos, no trabajamos directamente en `main`. Vamos a la rama donde hice todos los cambios nuevos:

```bash
git checkout feature/strategic-exercise-c21v
```
**¿Por qué?:** Esto asegura que estás usando la versión con el diseño modular y la nueva IA.

---

## 4. Instalar las herramientas (npm install)

El código necesita librerías externas para funcionar. Ejecuta esto y espera a que terminen de salir líneas en la pantalla:

```bash
npm install
```

---

## 5. El Firewall y la IP Fija (Whitelist)

Tu base de datos es segura y solo deja entrar a IPs conocidas. Cloud Shell te da una IP distinta cada vez. 

**Paso A: Saber la IP de hoy**
```bash
curl ifconfig.me
```
Aparecerá un número (ej: `34.123.45.67`). **Cópialo.**

**Paso B: Abrir el Firewall**
Ve a donde tengas tu base de datos y añade esa IP en la lista de permitidas para el puerto `3306`.

---

## 6. Configurar tus Secretos (.env)

Necesitamos decirle al programa cuáles son tus contraseñas.

1. **Crea el archivo**:
   ```bash
   cp .env.example .env
   ```

2. **Edítalo**:
   ```bash
   nano .env
   ```
   *Usa las flechas del teclado para moverte. Escribe tu `DB_HOST`, `DB_USER`, `DB_PASS` y tu `GOOGLE_API_KEY`. Cuando termines, pulsa `Ctrl + O` (para guardar), luego `Enter`, y `Ctrl + X` (para salir).*

---

## 7. ¡Arrancar!

Finalmente, ejecuta:
```bash
npm run dev
```

Si todo está bien, verás un mensaje: `🚀 Servidor C21 + Gemini listo en puerto 8080`.

### Ver la Web
En la esquina superior derecha de Cloud Shell, busca un icono de un cuadrado con una flecha (**"Vista previa en la web"**) y selecciona **"Vista previa en el puerto 8080"**.

¡Ahí verás tu nuevo dashboard!
