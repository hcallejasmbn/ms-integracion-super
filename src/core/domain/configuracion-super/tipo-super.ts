// Opción de un catálogo de SUPER con descripción (type_works_days o type_responsible): code es el valor
// que se envía a SUPER, por ejemplo DÍAS HÁBILES o TITULAR
export interface TipoSuper {
  readonly code: string;
  readonly descripcion: string;
}
