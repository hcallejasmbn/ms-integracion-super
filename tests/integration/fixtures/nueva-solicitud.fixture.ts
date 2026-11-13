import type { NuevaSolicitud } from "@/core/domain/solicitud/solicitud";

// Datos de QA que Mi Súper acepta. Se envían a la API real cuando MISUPER_INTEGRATION_CREAR_SOLICITUD=true
export const nuevaSolicitudFixture: NuevaSolicitud = {
  tramiteId: "59296",
  idSolicitudServicio: "prueba carmach",
  tipoBeneficiario: "company",
  creador: {
    tipo: "petitioner",
    datos: { rut: "12546655-1", nombre: "Claudio", apellido: "Perez", email: "claudio@test.cl" },
  },
  rutSolicitante: "12546655-1",
  rutEmpresa: "35793623-3",
  region: 15,
  comuna: 15101,
  direccion: "agustinas 1212",
};
