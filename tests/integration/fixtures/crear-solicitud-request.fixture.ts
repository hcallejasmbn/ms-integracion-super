import type { CrearSolicitudRequest } from "@/service/super/model/crear-solicitud-request";

// Datos de QA que Mi Súper acepta. Se envían a la API real cuando MISUPER_INTEGRATION_CREAR_SOLICITUD=true
export const crearSolicitudRequestFixture: CrearSolicitudRequest = {
  service_id: "AM007",
  procedure_id: "59296",
  ms_entry_id: "",
  service_application_id: "prueba carmach",
  beneficiary_type: "company",
  creator: {
    type: "petitioner",
    data: { rut: "12546655-1", first_name: "Claudio", last_name: "Perez", email: "claudio@test.cl" },
  },
  company_rut: "35793623-3",
  cup: "",
  region: 15,
  commune: 15101,
  address: "agustinas 1212",
};
