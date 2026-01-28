import { pool } from '../config/database';
import { Property } from '../interfaces/property.interface';

const SEARCH_BASE = "https://www.century21.com.ve/inmuebles?busqueda=";

export class PropertyService {

  // Lógica para leer JSONs sucios de la BD antigua
  private parseCache(cacheString: any): any {
    if (typeof cacheString === 'string') {
      try { return JSON.parse(cacheString); } catch (e) { return null; }
    }
    return cacheString;
  }

  // Búsqueda Principal
  async findAll(ciudad?: string, operacion?: string): Promise<Property[]> {
    let query = `
      SELECT 
        p.id, p.encabezado, p.descripcion, p.precioVenta, p.precioRenta, 
        p.moneda, p.recamaras, p.banios, p.municipio, p.colonia, 
        p.tipoOperacion, p.m2C,
        u.nickname as nombre_asesor, u.telMovil as tel_asesor, u.cache as cache_asesor
      FROM propiedades p
      LEFT JOIN usuarios u ON p.idAsesorExclusiva = u.id
      WHERE p.status = 'enPromocion'
      AND p.encabezado IS NOT NULL AND p.encabezado != ''
      AND (p.precioVenta > 0 OR p.precioRenta > 0)
    `;

    const params: any[] = [];
    if (ciudad) {
      query += ` AND p.municipio LIKE ?`;
      params.push(`%${ciudad}%`);
    }
    if (operacion) {
      query += ` AND p.tipoOperacion LIKE ?`;
      params.push(`%${operacion}%`);
    }

    query += ` ORDER BY p.id DESC LIMIT 10`;

    // Ejecutamos la consulta
    const [rows]: any = await pool.execute(query, params);
    if (rows.length === 0) return [];

    // Buscar fotos para estas propiedades
    const ids = rows.map((p: any) => p.id).join(',');
    const [fotos]: any = await pool.execute(`
      SELECT idPropiedades, cache, orden FROM fotos 
      WHERE idPropiedades IN (${ids}) ORDER BY orden ASC
    `);

    // Procesar y limpiar datos
    return rows.map((casa: any, index: number) => {
      // 1. Procesar Galería (Buscando fotos grandes o thumbnails)
      const susFotos = fotos
        .filter((f: any) => f.idPropiedades === casa.id)
        .map((f: any) => {
          const data = this.parseCache(f.cache);
          if (data?.propiedadLarge?.path) return data.propiedadLarge.path;
          if (data?.propiedadThumbnail?.path) return data.propiedadThumbnail.path;
          return null;
        })
        .filter((url: string | null) => url !== null)
        .slice(0, 5);

      // 2. Procesar Avatar Asesor
      let avatarUrl = null;
      const cacheAsesor = this.parseCache(casa.cache_asesor);
      if (cacheAsesor?.asesorThumbnail?.path) {
        avatarUrl = cacheAsesor.asesorThumbnail.path;
      } else {
        avatarUrl = `https://ui-avatars.com/api/?name=${casa.nombre_asesor || 'C21'}&background=f0f0f0&color=333`;
      }

      // 3. Generar Link de Zona (Solución Sandbox)
      const zonaBusqueda = casa.colonia || casa.municipio || "Venezuela";
      const linkZona = `${SEARCH_BASE}${encodeURIComponent(zonaBusqueda)}`;

      return {
        ...casa,
        galeria: susFotos,
        avatar_final: avatarUrl,
        link_zona: linkZona,
        uniqueId: index
      };
    });
  }
}
