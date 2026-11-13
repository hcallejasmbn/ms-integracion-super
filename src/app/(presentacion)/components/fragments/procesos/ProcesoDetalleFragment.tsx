import type { CodigoSuper } from "@/core/domain/configuracion-super/codigo-super";
import type { TipoSuper } from "@/core/domain/configuracion-super/tipo-super";
import type { EstadoSuper } from "@/core/domain/configuracion-super/estado-super";
import type { Actividad, Proceso } from "@/core/domain/proceso/proceso";
import PageHeader from "../../layout/PageHeader";
import Badge from "../../ui/Badge";
import type { AccionFormulario } from "../../ui/formulario";
import Pestanas from "../../ui/Pestanas";
import ActividadesTab from "./ActividadesTab";
import EstadosSuperTab from "./EstadosSuperTab";

// Valores de ?tab=; sin el parámetro se muestran las actividades
export const PESTANAS_PROCESO = ["actividades", "estados-super"] as const;
export type PestanaProceso = (typeof PESTANAS_PROCESO)[number];

interface ProcesoDetalleFragmentProps {
    readonly proceso: Proceso;
    // En el orden del flujo (el orden en que se crearon)
    readonly actividades: readonly Actividad[];
    readonly estados: readonly EstadoSuper[];
    readonly stageCodes: readonly CodigoSuper[];
    readonly statusCodes: readonly CodigoSuper[];
    readonly tiposDias: readonly TipoSuper[];
    readonly tiposResponsable: readonly TipoSuper[];
    readonly pestana: PestanaProceso;
    // Texto de búsqueda (?q=) de la pestaña activa
    readonly q: string;
    readonly guardarActividad: AccionFormulario;
    readonly guardarEstadoSuper: AccionFormulario;
}

// Proceso con dos pestañas: sus actividades (con el estado SUPER que informa cada una) y sus estados SUPER
export default function ProcesoDetalleFragment(props: ProcesoDetalleFragmentProps) {
    const { proceso, actividades, estados, pestana, q } = props;
    const conEstado = actividades.filter((actividad) => actividad.estadoSuper).length;
    const ruta = `/procesos/${encodeURIComponent(proceso.codigo)}`;

    return (
        <>
            <PageHeader
                migas={[
                    { label: "Inicio", href: "/portal" },
                    { label: "Procesos", href: "/procesos" },
                    { label: proceso.nombre },
                ]}
                titulo={proceso.nombre}
                descripcion="Actividades del proceso en el orden del flujo y los estados que informan a SUPER."
            />

            <dl className="mt-6 grid grid-cols-2 gap-4 rounded-lg border border-neutral-200 p-4 text-sm lg:grid-cols-4">
                <Dato titulo="Código">
                    <span className="font-mono">{proceso.codigo}</span>
                </Dato>
                <Dato titulo="Código en SUPER">
                    {proceso.codigoSuper ?? <Badge tono="ambar">Sin configurar</Badge>}
                </Dato>
                <Dato titulo="Actividades">{actividades.length}</Dato>
                <Dato titulo="Informan a SUPER">
                    {conEstado} de {actividades.length}
                </Dato>
            </dl>

            <div className="mt-8 space-y-4">
                {/* Cambiar de pestaña limpia la búsqueda */}
                <Pestanas
                    activa={pestana}
                    pestanas={[
                        { id: "actividades", label: "Actividades", href: ruta, contador: actividades.length },
                        { id: "estados-super", label: "Estados SUPER", href: `${ruta}?tab=estados-super`, contador: estados.length },
                    ]}
                />
                {pestana === "actividades" ? (
                    <ActividadesTab
                        procesoCodigo={proceso.codigo}
                        actividades={actividades}
                        estados={estados}
                        q={q}
                        guardarActividad={props.guardarActividad}
                    />
                ) : (
                    <EstadosSuperTab
                        procesoCodigo={proceso.codigo}
                        estados={estados}
                        actividades={actividades}
                        stageCodes={props.stageCodes}
                        statusCodes={props.statusCodes}
                        tiposDias={props.tiposDias}
                        tiposResponsable={props.tiposResponsable}
                        q={q}
                        guardarEstadoSuper={props.guardarEstadoSuper}
                    />
                )}
            </div>
        </>
    );
}

function Dato({ titulo, children }: { readonly titulo: string; readonly children: React.ReactNode }) {
    return (
        <div className="min-w-0 space-y-1">
            <dt className="text-xs text-neutral-500">{titulo}</dt>
            <dd className="truncate text-neutral-900">{children}</dd>
        </div>
    );
}
