import { Pencil, Plus } from "lucide-react";
import type { EstadoSuper } from "@/core/domain/configuracion-super/estado-super";
import type { Actividad } from "@/core/domain/proceso/proceso";
import Badge from "../../ui/Badge";
import Buscador from "../../ui/Buscador";
import { coincide } from "../../ui/busqueda";
import FormularioModal from "../../ui/FormularioModal";
import type { AccionFormulario } from "../../ui/formulario";
import Tabla, { type Columna } from "../../ui/Tabla";
import CamposActividad from "./CamposActividad";

interface ActividadesTabProps {
    readonly procesoCodigo: string;
    // En el orden del flujo (el orden en que se crearon)
    readonly actividades: readonly Actividad[];
    readonly estados: readonly EstadoSuper[];
    readonly q: string;
    readonly guardarActividad: AccionFormulario;
}

// Actividad con su posición en el flujo, que se calcula antes de filtrar para que no cambie al buscar
interface FilaActividad {
    readonly orden: number;
    readonly actividad: Actividad;
}

const SIN_ESTADO = <span className="text-neutral-400">—</span>;

// Actividades del proceso con el estado SUPER que informa cada una; permite agregarlas y modificarlas
export default function ActividadesTab({ procesoCodigo, actividades, estados, q, guardarActividad }: ActividadesTabProps) {
    const filas = actividades
        .map((actividad, indice) => ({ orden: indice + 1, actividad }))
        .filter(({ actividad }) => coincide(q, actividad.nombre, actividad.estadoSuper?.code, actividad.estadoSuper?.status));

    const columnas: readonly Columna<FilaActividad>[] = [
        {
            encabezado: "N°",
            className: "w-12",
            celda: ({ orden }) => <span className="font-mono text-xs text-neutral-600">{orden}</span>,
        },
        { encabezado: "Actividad", celda: ({ actividad }) => <span className="font-medium">{actividad.nombre}</span> },
        {
            encabezado: "Estado SUPER",
            celda: ({ actividad: { estadoSuper } }) =>
                estadoSuper ? (
                    <span className="flex flex-col leading-tight">
                        <span className="font-mono text-xs text-neutral-600">{estadoSuper.code}</span>
                        <span>{estadoSuper.status}</span>
                    </span>
                ) : (
                    <Badge>No informa</Badge>
                ),
        },
        {
            encabezado: "Etapa",
            celda: ({ actividad: { estadoSuper } }) =>
                estadoSuper ? <Badge tono="azul">{estadoSuper.stageValue}</Badge> : SIN_ESTADO,
        },
        {
            encabezado: "Status",
            celda: ({ actividad: { estadoSuper } }) =>
                estadoSuper ? <Badge tono="verde">{estadoSuper.statusValue}</Badge> : SIN_ESTADO,
        },
        {
            encabezado: "Responsable",
            celda: ({ actividad: { estadoSuper } }) =>
                estadoSuper ? <span className="text-neutral-700">{estadoSuper.responsibleType}</span> : SIN_ESTADO,
        },
        {
            encabezado: "Notifica",
            celda: ({ actividad }) => (actividad.debeNotificar ? <Badge tono="verde">Sí</Badge> : <Badge>No</Badge>),
        },
        {
            encabezado: "Acción",
            alinear: "derecha",
            celda: ({ actividad }) => (
                <FormularioModal
                    boton={
                        <>
                            <Pencil size={14} /> Editar
                        </>
                    }
                    varianteBoton="secundario"
                    titulo="Editar actividad"
                    descripcion={actividad.nombre}
                    accion={guardarActividad}>
                    <CamposActividad
                        procesoCodigo={procesoCodigo}
                        actividad={actividad}
                        estados={estados}
                        actividades={actividades}
                    />
                </FormularioModal>
            ),
        },
    ];

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Buscador placeholder="Buscar por actividad o estado SUPER..." valorInicial={q} />
                <FormularioModal
                    boton={
                        <>
                            <Plus size={16} /> Agregar actividad
                        </>
                    }
                    titulo="Agregar actividad"
                    accion={guardarActividad}>
                    <CamposActividad procesoCodigo={procesoCodigo} estados={estados} actividades={actividades} />
                </FormularioModal>
            </div>
            <Tabla
                columnas={columnas}
                filas={filas}
                claveFila={({ actividad }) => actividad.id}
                vacio={q ? `No hay actividades que coincidan con "${q}"` : "El proceso no tiene actividades"}
            />
        </div>
    );
}
