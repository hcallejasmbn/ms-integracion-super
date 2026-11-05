import type { NuevaSolicitud } from "@/core/domain/solicitud/solicitud";

// Datos de QA que Mi Súper acepta. Se envían a la API real cuando MISUPER_INTEGRATION_CREAR_SOLICITUD=true
export const nuevaSolicitudFixture: NuevaSolicitud = {
  tramiteId: "59296",
  idSolicitudServicio: "prueba carmach",
  beneficiario: { tipo: "company", rut: "35793623-3", email: "claudio@test.cl" },
  creador: { rut: "12546655-1", nombre: "Claudio", apellido: "Perez", email: "claudio@test.cl" },
};
