# Guía Paso a Paso: Actualizar C21V en Cloud Shell

¡Excelente, Socio! Veo en tu captura que ya estás dentro de la carpeta `c21v`. Esto nos ahorra tiempo. Vamos a actualizar tu código con el nuevo refactor estratégico.

## 1. Sincronizar con GitHub (Traer la nueva rama)

Como ya tienes la carpeta, solo tenemos que avisarle a Git que hay una rama nueva llamada `feature/strategic-exercise-c21v`.

Ejecuta este comando:
```bash
git fetch origin
```

Ahora, cámbiate a la rama del refactor:
```bash
git checkout feature/strategic-exercise-c21v
```
*(Si te dice que tienes archivos modificados y no te deja cambiar, escribe `git checkout .` para limpiar y vuelve a intentarlo).*

---

## 2. Actualizar Librerías (Zod y otras)

He añadido una librería llamada **Zod** para validar tus contraseñas. Necesitamos instalarla:

```bash
npm install
```

---

## 3. Autorizar tu IP Pública

Tu base de datos requiere una IP Fija. Como Cloud Shell cambia de IP, vamos a ver cuál tienes hoy:

```bash
curl ifconfig.me
```
**Acción**: Copia ese número y añádelo a la lista de IPs permitidas de tu base de datos (Whitelist).

---

## 4. Configurar tus Secretos (.env)

Ahora vamos a crear tu archivo de configuración. En tu captura no veo un archivo `.env`, así que vamos a crearlo desde la plantilla que te dejé:

1. **Crear el archivo**:
   ```bash
   cp .env.example .env
   ```

2. **Editarlo con detalle**:
   ```bash
   nano .env
   ```
   - Baja con las flechas hasta llegar a `DB_HOST`, `DB_USER`, etc.
   - Borra el texto de ejemplo y escribe tus datos reales.
   - **Para guardar**: Pulsa `Ctrl + O` y luego `Enter`.
   - **Para salir**: Pulsa `Ctrl + X`.

---

## 5. ¡Lanzar el Sistema!

Ahora que todo está configurado, arranca el servidor:
```bash
npm run dev
```

### Cómo ver el resultado:
Mira en la parte de arriba de tu pantalla de Cloud Shell. Hay un icono que dice **"Vista previa en la web"**.
1. Haz clic ahí.
2. Elige **"Vista previa en el puerto 8080"**.

¡Deberías ver el nuevo diseño modular y poder hablar con la IA sobre tus propiedades!
