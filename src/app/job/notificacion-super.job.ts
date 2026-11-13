import { Cron } from "croner";
import { EnvConfig } from "@/config/env.config";
import { JobService } from "@/service/job/job-service";

const jobService = new JobService();

// Se guarda en globalThis para que la recarga en caliente de `next dev` no programe el job dos veces
const globalForJob = globalThis as unknown as { notificacionSuper?: Cron };

/**
 * Programa jobNotificacionSuper según JOB_NOTIFICACION_SUPER_CRON (por defecto, todos los días a las 3:00).
 * Lo llama src/instrumentation.ts al iniciar el servidor.
 */
export function programarNotificacionSuper(): void {
  if (!EnvConfig.jobNotificacionSuperActivo) {
    console.log("Job de notificación a SUPER desactivado (JOB_NOTIFICACION_SUPER_ACTIVO=false)");
    return;
  }

  globalForJob.notificacionSuper?.stop();
  globalForJob.notificacionSuper = new Cron(
    EnvConfig.jobNotificacionSuperCron,
    {
      name: "notificacion-super",
      timezone: EnvConfig.jobZonaHoraria,
      // Si una ejecución todavía no termina, la siguiente no parte
      protect: true,
    },
    ejecutarNotificacionSuper,
  );

  console.log("Job de notificación a SUPER programado", {
    cron: EnvConfig.jobNotificacionSuperCron,
    zonaHoraria: EnvConfig.jobZonaHoraria,
    proximaEjecucion: globalForJob.notificacionSuper.nextRun()?.toISOString(),
  });
}

// Un error no detiene la programación: se registra y el job vuelve a correr en la siguiente fecha
async function ejecutarNotificacionSuper(): Promise<void> {
  const inicio = Date.now();
  try {
    const cambios = await jobService.jobNotificacionSuper();
    console.log("Job de notificación a SUPER terminado", { cambios: cambios.length, duracionMs: Date.now() - inicio });
  } catch (error) {
    console.error("Falló el job de notificación a SUPER", error);
  }
}
