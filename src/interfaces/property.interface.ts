export interface Property {
  id: number;
  encabezado: string;
  descripcion: string;
  precioVenta: number;
  precioRenta: number;
  moneda: string;
  recamaras: number;
  banios: number;
  municipio: string;
  colonia: string;
  tipoOperacion: string;
  m2C: number;
  nombre_asesor?: string;
  tel_asesor?: string;
  cache_asesor?: any;
  galeria?: string[];
  avatar_final?: string;
  link_zona?: string;
  uniqueId?: number;
}
