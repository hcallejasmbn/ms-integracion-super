import { ZONA_HORARIA } from "@/core/domain/zona-horaria";

// Las fechas se muestran en la zona horaria del Ministerio, sin depender de la del servidor
const FECHA_HORA = new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
    timeZone: ZONA_HORARIA,
});

// Por ejemplo 11-11-2026 14:05:32
export function formatearFechaHora(fecha: Date): string {
    return FECHA_HORA.format(fecha).replace(",", "");
}

// 850 ms, 1,2 s; null si no se midió
export function formatearDuracion(ms: number | null): string {
    if (ms === null) return "—";
    return ms < 1000 ? `${ms} ms` : `${(ms / 1000).toLocaleString("es-CL", { maximumFractionDigits: 1 })} s`;
}

// JSON con sangría; un texto que no es JSON (por ejemplo HTML de un 5xx) se devuelve tal cual
export function formatearJson(valor: unknown): string {
    if (typeof valor !== "string") return JSON.stringify(valor, null, 2);
    try {
        return JSON.stringify(JSON.parse(valor), null, 2);
    } catch {
        return valor;
    }
}

// Un día YYYY-MM-DD como DD-MM-YYYY, sin pasar por Date (que lo correría de zona horaria)
export function formatearDia(dia: string): string {
    const [anio, mes, diaDelMes] = dia.split("-");
    return `${diaDelMes}-${mes}-${anio}`;
}
