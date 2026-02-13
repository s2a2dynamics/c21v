import { pool } from '../config/database';
import { Property } from '../interfaces/property.interface';

const SEARCH_BASE = "https://www.century21.com.ve/v/resultados/ordenado-por_relevancia/por_";

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
        p.tipoOperacion, p.m2C, p.m2T, p.lat, p.lon,
        p.estacionamientos, p.edad, p.numeroElevadores, p.pisoEnQueSeEncuentra,
        p.plantaElectrica, p.gasRed, p.cisterna, p.cocina,
        p.caracteristicasJSON,
        COALESCE(u.nickname, 'Asesor C21') as nombre_asesor, 
        u.telMovil as tel_asesor, u.cache as cache_asesor,
        COALESCE(af.nombre, 'Venezuela') as nombre_oficina,
        a.valorMercado, a.precioM2C as precioM2C_AMC, a.factorNegociacion
      FROM propiedades p
      LEFT JOIN usuarios u ON p.idAsesorExclusiva = u.id
      LEFT JOIN afiliados af ON p.idAfiliados = af.id
      LEFT JOIN amc a ON p.id = a.idPropiedades
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

      // 3. Generar Link de Zona y WhatsApp
      const rawZona = casa.municipio || casa.colonia || "venezuela";
      const zonaBusqueda = rawZona.toLowerCase().trim().replace(/\s+/g, '-');
      const linkZona = `${SEARCH_BASE}${zonaBusqueda}`;

      let linkWhatsapp = null;
      if (casa.tel_asesor) {
        const cleanPhone = casa.tel_asesor.replace(/\D/g, '');
        linkWhatsapp = `https://wa.me/${cleanPhone}?text=${encodeURIComponent('Hola, me interesa el inmueble código ' + casa.id)}`;
      }

      // 4. Extraer Amenidades del JSON
      const ams = this.parseCache(casa.caracteristicasJSON);
      const campos = ams?.campos || [];
      const getVal = (name: string) => campos.find((c: any) => c.nombre === name)?.valor === true;

      return {
        ...casa,
        galeria: susFotos,
        avatar_final: avatarUrl,
        link_zona: linkZona,
        link_whatsapp: linkWhatsapp,
        uniqueId: index,
        // Nuevos campos mapeados
        seguridad24h: getVal('seguridad24h'),
        recepcion: getVal('recepcion'),
        sistemaContraIncendio: getVal('sistemaContraIncendio'),
        aireAcondicionadoCentral: getVal('aireAcondicionadoCentral'),
        amoblado_status: getVal('amoblado'),
        maletero: getVal('baulera')
      };
    });
  }
}
