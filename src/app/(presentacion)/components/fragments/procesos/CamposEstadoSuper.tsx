import type { CodigoSuper } from "@/core/domain/configuracion-super/codigo-super";
import type { TipoSuper } from "@/core/domain/configuracion-super/tipo-super";
import { MAX_ESTADO_SUPER, type EstadoSuper } from "@/core/domain/configuracion-super/estado-super";
import Campo from "../../ui/Campo";
import { CLASE_CONTROL } from "../../ui/formulario";

interface CamposEstadoSuperProps {
    readonly procesoCodigo: string;
    // Sin estado es un alta
    readonly estado?: EstadoSuper;
    readonly stageCodes: readonly CodigoSuper[];
    readonly statusCodes: readonly CodigoSuper[];
    readonly tiposDias: readonly TipoSuper[];
    readonly tiposResponsable: readonly TipoSuper[];
}

// Campos del formulario de un estado SUPER (los del manual). Los nombres coinciden con lo que lee la
// Server Action guardarEstadoSuper. Stage code, status code, use working days y responsible type se eligen
// de sus catálogos
export default function CamposEstadoSuper({
    procesoCodigo,
    estado,
    stageCodes,
    statusCodes,
    tiposDias,
    tiposResponsable,
}: CamposEstadoSuperProps) {
    return (
        <div className="grid gap-4 sm:grid-cols-2">
            <input type="hidden" name="procesoCodigo" value={procesoCodigo} />
            <input type="hidden" name="id" value={estado?.id ?? ""} />
            <Campo etiqueta="Code" obligatorio ayuda="Único en el proceso, por ejemplo IWSP-1">
                <input name="code" defaultValue={estado?.code} required maxLength={MAX_ESTADO_SUPER.code} className={CLASE_CONTROL} />
            </Campo>
            <Campo etiqueta="Status" obligatorio ayuda="Nombre del estado">
                <input name="status" defaultValue={estado?.status} required maxLength={MAX_ESTADO_SUPER.status} className={CLASE_CONTROL} />
            </Campo>
            <Campo etiqueta="Stage code" obligatorio>
                <select name="stageCode" defaultValue={estado?.stageCode ?? ""} required className={CLASE_CONTROL}>
                    <OpcionesCatalogo codigos={stageCodes} />
                </select>
            </Campo>
            <Campo etiqueta="Status code" obligatorio>
                <select name="statusCode" defaultValue={estado?.statusCode ?? ""} required className={CLASE_CONTROL}>
                    <OpcionesCatalogo codigos={statusCodes} />
                </select>
            </Campo>
            <Campo etiqueta="Subtask" obligatorio className="sm:col-span-2">
                <input name="subtask" defaultValue={estado?.subtask} required maxLength={MAX_ESTADO_SUPER.subtask} className={CLASE_CONTROL} />
            </Campo>
            <Campo etiqueta="Use working days" obligatorio>
                <select name="useWorkingDays" defaultValue={estado?.useWorkingDays ?? ""} required className={CLASE_CONTROL}>
                    <OpcionesTipo tipos={tiposDias} />
                </select>
            </Campo>
            <Campo etiqueta="Responsible type" obligatorio>
                <select name="responsibleType" defaultValue={estado?.responsibleType ?? ""} required className={CLASE_CONTROL}>
                    <OpcionesTipo tipos={tiposResponsable} />
                </select>
            </Campo>
            <Campo etiqueta="Suspension type" ayuda="Opcional; vacío si el estado no suspende el plazo">
                <input
                    name="suspensionType"
                    defaultValue={estado?.suspensionType ?? ""}
                    maxLength={MAX_ESTADO_SUPER.suspensionType}
                    className={CLASE_CONTROL}
                />
            </Campo>
        </div>
    );
}

function OpcionesCatalogo({ codigos }: { readonly codigos: readonly CodigoSuper[] }) {
    return (
        <>
            <option value="" disabled>
                Selecciona...
            </option>
            {codigos.map(({ code, value }) => (
                <option key={code} value={code}>
                    {value}
                </option>
            ))}
        </>
    );
}

// Catálogos con descripción: se muestra el código, que es lo que se envía a SUPER, y la descripción como tooltip
function OpcionesTipo({ tipos }: { readonly tipos: readonly TipoSuper[] }) {
    return (
        <>
            <option value="" disabled>
                Selecciona...
            </option>
            {tipos.map(({ code, descripcion }) => (
                <option key={code} value={code} title={descripcion}>
                    {code}
                </option>
            ))}
        </>
    );
}
