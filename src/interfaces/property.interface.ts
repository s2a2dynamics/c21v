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
  m2T: number;
  lat: string;
  lon: string;
  // Pilar 1: Datos Duros
  estacionamientos?: number;
  edad?: number;
  numeroElevadores?: number;
  pisoEnQueSeEncuentra?: number;
  plantaElectrica?: string;
  gasRed?: string;
  cisterna?: string;
  cocina?: string;
  // Detalle de caracteristicasJSON (Nuevos)
  seguridad24h?: boolean;
  recepcion?: boolean;
  sistemaContraIncendio?: boolean;
  aireAcondicionadoCentral?: boolean;
  amoblado_status?: boolean;
  maletero?: boolean;
  // Contacto & Oficina
  nombre_asesor?: string;
  tel_asesor?: string;
  link_whatsapp?: string;
  nombre_oficina?: string;
  cache_asesor?: any;
  galeria?: string[];
  avatar_final?: string;
  link_zona?: string;
  uniqueId?: number;
  // Pilar 2: Market Intelligence
  valorMercado?: number;
  precioM2C_AMC?: number;
  factorNegociacion?: number;
}
