import { Search, Trash2 } from "lucide-react";
import Form from "next/form";
import type { RangoLimpieza } from "@/core/domain/traza/limpieza";
import Boton from "../../ui/Boton";
import Campo from "../../ui/Campo";
import { CLASE_CONTROL, type AccionFormulario } from "../../ui/formulario";
import { formatearDia, formatearFechaHora } from "../../ui/formato";
import FormularioModal from "../../ui/FormularioModal";

// Lo que la página calculó para el rango elegido: la cantidad a eliminar, o por qué el rango no sirve
export type RevisionLimpieza =
    | { readonly tipo: "sin-rango" }
    | { readonly tipo: "invalido"; readonly error: string }
    | { readonly tipo: "valido"; readonly rango: RangoLimpieza; readonly cantidad: number };

export interface LimpiezaPanelProps {
    readonly revision: RevisionLimpieza;
    // Valores escritos en ?desde= y ?hasta=, para volver a mostrarlos
    readonly desde: string;
    readonly hasta: string;
    // Hoy (YYYY-MM-DD), tope de los campos de fecha
    readonly hoy: string;
    readonly rangoTabla: { readonly primera: Date | null; readonly ultima: Date | null };
    readonly eliminarTrazas: AccionFormulario;
}

// Limpieza de log_ejecucion por rango de días: primero se revisa cuántas trazas hay (GET con ?desde=&hasta=)
// y después se confirman en un modal, que llama a la Server Action
export default function LimpiezaPanel({ revision, desde, hasta, hoy, rangoTabla, eliminarTrazas }: LimpiezaPanelProps) {
    return (
        <div className="max-w-3xl space-y-6">
            <div className="space-y-1 text-sm text-neutral-600">
                <p>
                    Elimina de la base de datos las trazas de ejecución de un rango de días (ambos incluidos, en hora de
                    Chile). Úsalo para liberar espacio: la eliminación no se puede deshacer.
                </p>
                <p>
                    {rangoTabla.primera && rangoTabla.ultima
                        ? `Hay trazas desde el ${formatearFechaHora(rangoTabla.primera)} hasta el ${formatearFechaHora(rangoTabla.ultima)}.`
                        : "No hay trazas registradas."}
                </p>
            </div>

            {/* action="" vuelve a esta página con los campos como parámetros; tab mantiene la pestaña */}
            <Form action="" className="flex flex-col gap-4 rounded-lg border border-neutral-200 p-4 sm:flex-row sm:items-end">
                <input type="hidden" name="tab" value="limpieza" />
                <Campo etiqueta="Desde" obligatorio className="sm:w-48">
                    <input type="date" name="desde" defaultValue={desde} max={hoy} required className={CLASE_CONTROL} />
                </Campo>
                <Campo etiqueta="Hasta" obligatorio className="sm:w-48">
                    <input type="date" name="hasta" defaultValue={hasta} max={hoy} required className={CLASE_CONTROL} />
                </Campo>
                <Boton type="submit" variante="secundario" className="h-[38px]">
                    <Search size={16} /> Revisar
                </Boton>
            </Form>

            {revision.tipo === "invalido" && (
                <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                    {revision.error}
                </p>
            )}

            {revision.tipo === "valido" && (
                <ResumenRango rango={revision.rango} cantidad={revision.cantidad} eliminarTrazas={eliminarTrazas} />
            )}
        </div>
    );
}

function ResumenRango({ rango, cantidad, eliminarTrazas }: { readonly rango: RangoLimpieza; readonly cantidad: number; readonly eliminarTrazas: AccionFormulario }) {
    const periodo = `entre el ${formatearDia(rango.desde)} y el ${formatearDia(rango.hasta)}`;
    if (cantidad === 0) {
        return <p className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-700">No hay trazas {periodo}.</p>;
    }
    const trazas = `${cantidad} ${cantidad === 1 ? "traza" : "trazas"}`;
    return (
        <div className="flex flex-col gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-amber-900">
                Hay <strong>{trazas}</strong> {periodo}.
            </p>
            <FormularioModal
                boton={
                    <>
                        <Trash2 size={16} /> Eliminar {trazas}
                    </>
                }
                varianteBoton="peligro"
                titulo="Eliminar trazas de ejecución"
                textoGuardar={`Eliminar ${trazas}`}
                textoGuardando="Eliminando..."
                varianteGuardar="peligro"
                accion={eliminarTrazas}>
                <input type="hidden" name="desde" value={rango.desde} />
                <input type="hidden" name="hasta" value={rango.hasta} />
                <p className="text-sm text-neutral-700">
                    Se eliminarán las trazas registradas {periodo}, correctas y fallidas. Esta acción <strong>no se puede deshacer</strong>.
                </p>
            </FormularioModal>
        </div>
    );
}
