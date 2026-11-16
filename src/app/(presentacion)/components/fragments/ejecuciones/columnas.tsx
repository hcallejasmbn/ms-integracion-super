import type { Ejecucion } from "@/core/domain/traza/ejecucion";
import Badge from "../../ui/Badge";
import { formatearDuracion, formatearFechaHora } from "../../ui/formato";
import type { Columna } from "../../ui/Tabla";

// Columnas comunes a la lista de ejecuciones y a las de un mismo track ID

export function ResultadoBadge({ ejecucion }: { readonly ejecucion: Ejecucion }) {
    return ejecucion.resultado === "OK" ? <Badge tono="verde">Correcta</Badge> : <Badge tono="rojo">Fallida</Badge>;
}

// Status HTTP, o "Sin respuesta" cuando la llamada no llegó (timeout, red)
export function StatusHttp({ ejecucion }: { readonly ejecucion: Ejecucion }) {
    return ejecucion.responseStatus === null ? (
        <Badge tono="ambar">Sin respuesta</Badge>
    ) : (
        <span className={`font-mono text-xs ${ejecucion.responseStatus >= 400 ? "text-red-700" : "text-neutral-700"}`}>
            {ejecucion.responseStatus}
        </span>
    );
}

export const COLUMNAS_EJECUCION = {
    fecha: {
        encabezado: "Fecha",
        celda: (ejecucion) => <span className="whitespace-nowrap text-neutral-700">{formatearFechaHora(ejecucion.fechaInicio)}</span>,
    },
    operacion: {
        encabezado: "Operación",
        celda: (ejecucion) => <span className="font-mono text-xs font-medium">{ejecucion.operacion}</span>,
    },
    llamada: {
        encabezado: "Llamada",
        celda: (ejecucion) => (
            <span className="flex max-w-xs items-center gap-2" title={ejecucion.url}>
                <span className="font-mono text-xs text-neutral-500">{ejecucion.metodo}</span>
                <span className="truncate text-neutral-700">{rutaDe(ejecucion.url)}</span>
            </span>
        ),
    },
    status: { encabezado: "HTTP", celda: (ejecucion) => <StatusHttp ejecucion={ejecucion} /> },
    resultado: { encabezado: "Resultado", celda: (ejecucion) => <ResultadoBadge ejecucion={ejecucion} /> },
    duracion: {
        encabezado: "Duración",
        alinear: "derecha",
        celda: (ejecucion) => <span className="whitespace-nowrap text-neutral-700">{formatearDuracion(ejecucion.duracionMs)}</span>,
    },
} satisfies Record<string, Columna<Ejecucion>>;

// Solo la ruta: el host es el mismo en todas las llamadas
function rutaDe(url: string): string {
    try {
        return new URL(url).pathname;
    } catch {
        return url;
    }
}
