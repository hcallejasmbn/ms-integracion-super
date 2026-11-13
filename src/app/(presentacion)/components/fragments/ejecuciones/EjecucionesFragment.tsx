import { Eye } from "lucide-react";
import type { Ejecucion, PaginaEjecuciones, ResultadoEjecucion } from "@/core/domain/traza/ejecucion";
import PageHeader from "../../layout/PageHeader";
import BotonLink from "../../ui/BotonLink";
import Buscador from "../../ui/Buscador";
import FiltroSelect from "../../ui/FiltroSelect";
import Paginacion from "../../ui/Paginacion";
import Pestanas from "../../ui/Pestanas";
import Tabla, { type Columna } from "../../ui/Tabla";
import { conParametros } from "../../ui/url";
import { COLUMNAS_EJECUCION } from "./columnas";
import LimpiezaPanel, { type LimpiezaPanelProps } from "./LimpiezaPanel";

export const RUTA_EJECUCIONES = "/ejecuciones";

interface EjecucionesFragmentProps {
    readonly pagina: PaginaEjecuciones;
    readonly operaciones: readonly string[];
    // Filtros actuales de la URL (?resultado=, ?operacion=, ?q=)
    readonly resultado: ResultadoEjecucion | undefined;
    readonly operacion: string;
    readonly q: string;
    // Con ?tab=limpieza la página manda los datos del panel de limpieza y no se muestra la lista
    readonly limpieza?: LimpiezaPanelProps;
}

type HrefLista = (parametros: { resultado?: string; pagina?: number }) => string;

const COLUMNAS: readonly Columna<Ejecucion>[] = [
    COLUMNAS_EJECUCION.fecha,
    COLUMNAS_EJECUCION.operacion,
    COLUMNAS_EJECUCION.llamada,
    COLUMNAS_EJECUCION.status,
    COLUMNAS_EJECUCION.resultado,
    COLUMNAS_EJECUCION.duracion,
    {
        encabezado: "Track ID",
        celda: (ejecucion) => (
            <span className="font-mono text-xs text-neutral-500" title={ejecucion.trackId}>
                {ejecucion.trackId.slice(0, 8)}
            </span>
        ),
    },
    {
        encabezado: "Acción",
        alinear: "derecha",
        celda: (ejecucion) => (
            <BotonLink href={`${RUTA_EJECUCIONES}/${ejecucion.id}`}>
                <Eye size={14} />
                Ver detalle
            </BotonLink>
        ),
    },
];

// Traza de las llamadas a SUPER. Las pestañas Todas/Correctas/Fallidas filtran la lista (con filtro por operación,
// búsqueda por track ID o URL y paginación, todo en la base de datos porque la tabla crece con cada llamada);
// la pestaña Limpieza la reemplaza por el panel para eliminar trazas por rango de fechas
export default function EjecucionesFragment({ pagina, operaciones, resultado, operacion, q, limpieza }: EjecucionesFragmentProps) {
    // Las pestañas de resultado conservan los demás filtros y vuelven a la primera página
    const href: HrefLista = (parametros) => conParametros(RUTA_EJECUCIONES, { resultado, operacion, q, ...parametros });
    const { OK, ERROR } = pagina.porResultado;

    return (
        <>
            <PageHeader
                migas={[{ label: "Inicio", href: "/portal" }, { label: "Traza ejecuciones" }]}
                titulo="Traza ejecuciones"
                descripcion="Cada llamada a SUPER, de la más reciente a la más antigua. Abre una para ver lo enviado, la respuesta y el error. La api key y el token no se guardan."
            />
            <div className="mt-8 space-y-4">
                <Pestanas
                    activa={limpieza ? "limpieza" : (resultado ?? "todas")}
                    pestanas={[
                        { id: "todas", label: "Todas", href: href({ resultado: undefined }), contador: OK + ERROR },
                        { id: "OK", label: "Correctas", href: href({ resultado: "OK" }), contador: OK },
                        { id: "ERROR", label: "Fallidas", href: href({ resultado: "ERROR" }), contador: ERROR },
                        { id: "limpieza", label: "Limpieza", href: conParametros(RUTA_EJECUCIONES, { tab: "limpieza" }) },
                    ]}
                />
                {limpieza ? (
                    <LimpiezaPanel {...limpieza} />
                ) : (
                    <ListaEjecuciones pagina={pagina} operaciones={operaciones} resultado={resultado} operacion={operacion} q={q} href={href} />
                )}
            </div>
        </>
    );
}

interface ListaEjecucionesProps extends Omit<EjecucionesFragmentProps, "limpieza"> {
    readonly href: HrefLista;
}

function ListaEjecuciones({ pagina, operaciones, resultado, operacion, q, href }: ListaEjecucionesProps) {
    return (
        <>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Buscador placeholder="Buscar por track ID o URL..." valorInicial={q} />
                <FiltroSelect
                    parametro="operacion"
                    etiqueta="Operación"
                    opciones={operaciones}
                    valor={operacion}
                    textoTodos="Todas las operaciones"
                />
            </div>
            <Tabla
                columnas={COLUMNAS}
                filas={pagina.ejecuciones}
                claveFila={(ejecucion) => ejecucion.id}
                vacio={q || operacion || resultado ? "No hay ejecuciones con estos filtros" : "Todavía no hay llamadas a SUPER registradas"}
            />
            <Paginacion
                pagina={pagina.pagina}
                totalPaginas={pagina.totalPaginas}
                total={pagina.total}
                hrefPagina={(numero) => href({ pagina: numero > 1 ? numero : undefined })}
            />
        </>
    );
}
