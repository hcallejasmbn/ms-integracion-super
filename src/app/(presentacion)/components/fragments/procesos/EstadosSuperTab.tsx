import { Pencil, Plus } from "lucide-react";
import type { CodigoSuper } from "@/core/domain/configuracion-super/codigo-super";
import type { TipoSuper } from "@/core/domain/configuracion-super/tipo-super";
import type { EstadoSuper } from "@/core/domain/configuracion-super/estado-super";
import type { Actividad } from "@/core/domain/proceso/proceso";
import Badge from "../../ui/Badge";
import Buscador from "../../ui/Buscador";
import { coincide } from "../../ui/busqueda";
import FormularioModal from "../../ui/FormularioModal";
import type { AccionFormulario } from "../../ui/formulario";
import Tabla, { type Columna } from "../../ui/Tabla";
import CamposEstadoSuper from "./CamposEstadoSuper";

interface EstadosSuperTabProps {
    readonly procesoCodigo: string;
    readonly estados: readonly EstadoSuper[];
    // Para mostrar a qué actividad está asignado cada estado
    readonly actividades: readonly Actividad[];
    readonly stageCodes: readonly CodigoSuper[];
    readonly statusCodes: readonly CodigoSuper[];
    readonly tiposDias: readonly TipoSuper[];
    readonly tiposResponsable: readonly TipoSuper[];
    readonly q: string;
    readonly guardarEstadoSuper: AccionFormulario;
}

interface FilaEstado {
    readonly estado: EstadoSuper;
    readonly actividad: Actividad | undefined;
}

// Estados SUPER configurados para el proceso (las séxtuplas del manual); permite agregarlos y modificarlos.
// La asignación a una actividad se hace desde la pestaña de actividades
export default function EstadosSuperTab({ procesoCodigo, estados, actividades, stageCodes, statusCodes, tiposDias, tiposResponsable, q, guardarEstadoSuper }: EstadosSuperTabProps) {
    const actividadDe = new Map(
        actividades.flatMap((actividad) => (actividad.estadoSuper ? [[actividad.estadoSuper.id, actividad] as const] : [])),
    );
    const filas = estados
        .map((estado) => ({ estado, actividad: actividadDe.get(estado.id) }))
        .filter(({ estado, actividad }) =>
            coincide(q, estado.code, estado.status, estado.subtask, estado.responsibleType, actividad?.nombre),
        );

    const columnas: readonly Columna<FilaEstado>[] = [
        { encabezado: "Code", celda: ({ estado }) => <span className="font-mono text-xs">{estado.code}</span> },
        { encabezado: "Status", celda: ({ estado }) => <span className="font-medium">{estado.status}</span> },
        { encabezado: "Etapa", celda: ({ estado }) => <Badge tono="azul">{estado.stageValue}</Badge> },
        { encabezado: "Status SUPER", celda: ({ estado }) => <Badge tono="verde">{estado.statusValue}</Badge> },
        { encabezado: "Subtask", celda: ({ estado }) => <span className="text-neutral-700">{estado.subtask}</span> },
        {
            encabezado: "Días",
            celda: ({ estado }) => <span className="whitespace-nowrap text-neutral-700" title={estado.useWorkingDaysDescripcion}>
                    {estado.useWorkingDays}
                </span>,
        },
        {
            encabezado: "Responsable",
            celda: ({ estado }) => (
                <span className="text-neutral-700" title={estado.responsibleTypeDescripcion}>
                    {estado.responsibleType}
                </span>
            ),
        },
        {
            encabezado: "Suspensión",
            celda: ({ estado }) => estado.suspensionType ?? <span className="text-neutral-400">—</span>,
        },
        {
            encabezado: "Actividad",
            celda: ({ actividad }) => (actividad ? actividad.nombre : <Badge tono="ambar">Sin asignar</Badge>),
        },
        {
            encabezado: "Acción",
            alinear: "derecha",
            celda: ({ estado }) => (
                <FormularioModal
                    boton={
                        <>
                            <Pencil size={14} /> Editar
                        </>
                    }
                    varianteBoton="secundario"
                    titulo="Editar estado SUPER"
                    descripcion={`${estado.code} · ${estado.status}`}
                    accion={guardarEstadoSuper}>
                    <CamposEstadoSuper
                        procesoCodigo={procesoCodigo}
                        estado={estado}
                        stageCodes={stageCodes}
                        statusCodes={statusCodes}
                        tiposDias={tiposDias}
                        tiposResponsable={tiposResponsable}
                    />
                </FormularioModal>
            ),
        },
    ];

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Buscador placeholder="Buscar por code, status o actividad..." valorInicial={q} />
                <FormularioModal
                    boton={
                        <>
                            <Plus size={16} /> Agregar estado SUPER
                        </>
                    }
                    titulo="Agregar estado SUPER"
                    descripcion="Se crea sin asignar; asígnalo a una actividad desde la pestaña Actividades."
                    accion={guardarEstadoSuper}>
                    <CamposEstadoSuper
                        procesoCodigo={procesoCodigo}
                        stageCodes={stageCodes}
                        statusCodes={statusCodes}
                        tiposDias={tiposDias}
                        tiposResponsable={tiposResponsable}
                    />
                </FormularioModal>
            </div>
            <Tabla
                columnas={columnas}
                filas={filas}
                claveFila={({ estado }) => estado.id}
                vacio={q ? `No hay estados SUPER que coincidan con "${q}"` : "El proceso no tiene estados SUPER"}
            />
        </div>
    );
}
