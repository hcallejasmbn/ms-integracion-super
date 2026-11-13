import type { EstadoSuper } from "@/core/domain/configuracion-super/estado-super";
import { MAX_NOMBRE_ACTIVIDAD, type Actividad } from "@/core/domain/proceso/proceso";
import Campo from "../../ui/Campo";
import Casilla from "../../ui/Casilla";
import { CLASE_CONTROL } from "../../ui/formulario";

interface CamposActividadProps {
    readonly procesoCodigo: string;
    // Sin actividad es un alta
    readonly actividad?: Actividad;
    readonly estados: readonly EstadoSuper[];
    // Actividades del proceso, para saber qué estados ya están asignados (la relación es 1:1)
    readonly actividades: readonly Actividad[];
}

// Campos del formulario de una actividad. Los nombres coinciden con lo que lee la Server Action guardarActividad
export default function CamposActividad({ procesoCodigo, actividad, estados, actividades }: CamposActividadProps) {
    const asignadoA = new Map(
        actividades.flatMap((otra) => (otra.estadoSuper ? [[otra.estadoSuper.id, otra] as const] : [])),
    );

    return (
        <>
            <input type="hidden" name="procesoCodigo" value={procesoCodigo} />
            <input type="hidden" name="id" value={actividad?.id ?? ""} />
            <Campo
                etiqueta="Nombre"
                obligatorio
                ayuda={
                    actividad
                        ? "La carga diaria identifica la actividad por su nombre: si lo cambias, las cargas deben usar el nombre nuevo."
                        : "Debe coincidir con el nombre que usa la carga diaria. La actividad se agrega al final del flujo."
                }>
                <input
                    name="nombre"
                    defaultValue={actividad?.nombre}
                    required
                    maxLength={MAX_NOMBRE_ACTIVIDAD}
                    className={CLASE_CONTROL}
                />
            </Campo>
            <Campo
                etiqueta="Estado SUPER"
                ayuda="Estado que se informa a SUPER cuando un expediente pasa por esta actividad. Cada estado se asigna a una sola actividad.">
                <select name="estadoSuperId" defaultValue={actividad?.estadoSuper?.id ?? ""} className={CLASE_CONTROL}>
                    <option value="">No informa a SUPER</option>
                    {estados.map((estado) => {
                        const otra = asignadoA.get(estado.id);
                        const ocupado = otra !== undefined && otra.id !== actividad?.id;
                        return (
                            <option key={estado.id} value={estado.id} disabled={ocupado}>
                                {estado.code} · {estado.status}
                                {ocupado ? ` (asignado a ${otra.nombre})` : ""}
                            </option>
                        );
                    })}
                </select>
            </Campo>
            <Casilla
                name="debeNotificar"
                etiqueta="Debe notificar"
                marcada={actividad?.debeNotificar ?? false}
                ayuda="La actividad se envía al servicio de notificación. Es independiente del estado SUPER."
            />
        </>
    );
}
