import type { Ejecucion } from "@/core/domain/traza/ejecucion";
import PageHeader from "../../layout/PageHeader";
import Badge from "../../ui/Badge";
import BloqueCodigo from "../../ui/BloqueCodigo";
import BotonLink from "../../ui/BotonLink";
import { formatearDuracion, formatearFechaHora, formatearJson } from "../../ui/formato";
import Tabla, { type Columna } from "../../ui/Tabla";
import { COLUMNAS_EJECUCION, ResultadoBadge, StatusHttp } from "./columnas";
import { RUTA_EJECUCIONES } from "./EjecucionesFragment";

interface EjecucionDetalleFragmentProps {
    readonly ejecucion: Ejecucion;
    // Todas las llamadas con el mismo track ID (incluida esta), en orden
    readonly relacionadas: readonly Ejecucion[];
}

// Detalle de una llamada a SUPER: datos, request enviado, respuesta, error y las demás llamadas de la operación
export default function EjecucionDetalleFragment({ ejecucion, relacionadas }: EjecucionDetalleFragmentProps) {
    const fallida = ejecucion.resultado === "ERROR";
    const columnas: readonly Columna<Ejecucion>[] = [
        COLUMNAS_EJECUCION.fecha,
        COLUMNAS_EJECUCION.operacion,
        COLUMNAS_EJECUCION.status,
        COLUMNAS_EJECUCION.resultado,
        COLUMNAS_EJECUCION.duracion,
        {
            encabezado: "Acción",
            alinear: "derecha",
            celda: (otra) =>
                otra.id === ejecucion.id ? (
                    <Badge tono="azul">Viendo</Badge>
                ) : (
                    <BotonLink href={`${RUTA_EJECUCIONES}/${otra.id}`}>Ver detalle</BotonLink>
                ),
        },
    ];

    return (
        <>
            <PageHeader
                migas={[
                    { label: "Inicio", href: "/portal" },
                    { label: "Traza ejecuciones", href: RUTA_EJECUCIONES },
                    { label: `Ejecución ${ejecucion.id}` },
                ]}
                titulo={`${ejecucion.operacion} · ejecución ${ejecucion.id}`}
                descripcion={`${ejecucion.metodo} ${ejecucion.url}`}
            />

            <dl className="mt-6 grid grid-cols-2 gap-4 rounded-lg border border-neutral-200 p-4 text-sm lg:grid-cols-4">
                <Dato titulo="Resultado">
                    <ResultadoBadge ejecucion={ejecucion} />
                </Dato>
                <Dato titulo="Status HTTP">
                    <StatusHttp ejecucion={ejecucion} />
                </Dato>
                <Dato titulo="Fecha">{formatearFechaHora(ejecucion.fechaInicio)}</Dato>
                <Dato titulo="Duración">{formatearDuracion(ejecucion.duracionMs)}</Dato>
                <Dato titulo="Track ID" className="col-span-2">
                    <span className="font-mono text-xs break-all">{ejecucion.trackId}</span>
                </Dato>
                <Dato titulo="Operación">
                    <span className="font-mono text-xs">{ejecucion.operacion}</span>
                </Dato>
                <Dato titulo="Intento">{ejecucion.intento}</Dato>
            </dl>

            <div className="mt-8 space-y-6">
                {ejecucion.error && (
                    <BloqueCodigo titulo="Error" tono="error" contenido={ejecucion.error} detalle="La llamada no obtuvo respuesta HTTP" />
                )}
                <div className="grid gap-6 xl:grid-cols-2">
                    <BloqueCodigo
                        titulo="Request enviado"
                        contenido={ejecucion.request === null ? null : formatearJson(ejecucion.request)}
                        vacio="La llamada no llevaba body"
                    />
                    <BloqueCodigo
                        titulo="Respuesta de SUPER"
                        tono={fallida && ejecucion.responseStatus !== null ? "error" : "neutro"}
                        detalle={ejecucion.responseStatus !== null && <span className="font-mono text-xs">HTTP {ejecucion.responseStatus}</span>}
                        contenido={ejecucion.responseBody ? formatearJson(ejecucion.responseBody) : null}
                        vacio={ejecucion.responseStatus === null ? "Sin respuesta" : "Respuesta vacía"}
                    />
                </div>

                <section className="space-y-3">
                    <div>
                        <h2 className="text-base font-semibold text-neutral-900">Llamadas de la misma operación</h2>
                        <p className="text-sm text-neutral-600">
                            Comparten el track ID: por ejemplo la obtención del token y la creación de la solicitud.
                        </p>
                    </div>
                    <Tabla columnas={columnas} filas={relacionadas} claveFila={(otra) => otra.id} />
                </section>
            </div>
        </>
    );
}

function Dato({ titulo, className = "", children }: { readonly titulo: string; readonly className?: string; readonly children: React.ReactNode }) {
    return (
        <div className={`min-w-0 space-y-1 ${className}`}>
            <dt className="text-xs text-neutral-500">{titulo}</dt>
            <dd className="text-neutral-900">{children}</dd>
        </div>
    );
}
