"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PropertyService = void 0;
const database_1 = require("../config/database");
class PropertyService {
    async findAll(ciudad, operacion) {
        try {
            console.log("🚩 [PUNTO DE CONTROL 1] Iniciando consulta a Base de Datos...");
            // 1. QUERY DE PROPIEDADES
            let query = `
        SELECT 
          p.id as id_propiedad_real,
          p.encabezado,
          p.precioVenta,
          p.precioRenta,
          p.moneda,
          p.municipio,
          p.status,
          u.nombre as nombre_asesor,
          u.telMovil as telefono_asesor,
          u.cache as cache_asesor
        FROM propiedades p
        LEFT JOIN usuarios u ON p.idAsesorExclusiva = u.id
        WHERE 1=1 
      `;
            // NOTA: Quitamos filtros estrictos temporalmente para ver si llega ALGO
            // Solo dejamos el límite para no saturar
            query += ' ORDER BY p.id DESC LIMIT 5';
            console.log("🚩 [PUNTO DE CONTROL 2] Ejecutando SQL:", query);
            const [propiedades] = await database_1.db.query(query);
            console.log(`🚩 [PUNTO DE CONTROL 3] La DB respondió. Filas encontradas: ${propiedades ? propiedades.length : 0}`);
            if (!propiedades || propiedades.length === 0) {
                console.warn("⚠️ ALERTA: La base de datos devolvió 0 propiedades. Revisa la conexión o si la tabla está vacía.");
                return { propiedades: [], fotos: [] };
            }
            // Imprimimos la primera propiedad para ver qué columnas trae realmente
            console.log("🚩 [PUNTO DE CONTROL 4] Muestra de datos crudos (Primera fila):", JSON.stringify(propiedades[0], null, 2));
            // 2. QUERY DE FOTOS
            const ids = propiedades.map((r) => r.id_propiedad_real).join(',');
            let fotos = [];
            if (ids.length > 0) {
                const queryFotos = `SELECT idPropiedades, cache, orden FROM fotos WHERE idPropiedades IN (${ids}) ORDER BY orden ASC`;
                const [fotosRows] = await database_1.db.query(queryFotos);
                fotos = fotosRows;
                console.log(`🚩 [PUNTO DE CONTROL 5] Fotos encontradas: ${fotos.length}`);
            }
            return { propiedades, fotos };
        }
        catch (error) {
            console.error("❌ ERROR CRÍTICO EN SERVICIO:", error.message);
            // Lanzamos el error para verlo en pantalla
            throw new Error(`Fallo en DB: ${error.message}`);
        }
    }
}
exports.PropertyService = PropertyService;
