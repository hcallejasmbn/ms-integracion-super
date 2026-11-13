"use client";
import { CircleAlert } from "lucide-react";
import { startTransition, useActionState, useState, type ReactNode } from "react";
import Boton, { type VarianteBoton } from "./Boton";
import type { AccionFormulario, ResultadoAccion } from "./formulario";
import Modal from "./Modal";

interface FormularioModalProps {
    // Contenido del botón que abre el modal (texto y, si se quiere, un ícono)
    readonly boton: ReactNode;
    readonly varianteBoton?: VarianteBoton;
    readonly titulo: string;
    readonly descripcion?: ReactNode;
    // Server Action que guarda; devuelve { ok: true } o el mensaje de error que se muestra en el modal
    readonly accion: AccionFormulario;
    readonly textoGuardar?: string;
    // peligro para confirmar acciones que no se pueden deshacer
    readonly varianteGuardar?: VarianteBoton;
    // Texto del botón mientras la acción corre
    readonly textoGuardando?: string;
    // Los campos del formulario (inputs con name y defaultValue); pueden venir de un Server Component
    readonly children: ReactNode;
}

// Botón que abre un modal con un formulario. Al guardar bien se cierra; si falla muestra el error y
// conserva lo escrito. Cada apertura empieza con el formulario y el error limpios
export default function FormularioModal({ boton, varianteBoton = "primario", children, ...formulario }: FormularioModalProps) {
    const [abierto, setAbierto] = useState(false);
    return (
        <>
            <Boton variante={varianteBoton} onClick={() => setAbierto(true)}>
                {boton}
            </Boton>
            {abierto && (
                <FormularioAbierto {...formulario} onCerrar={() => setAbierto(false)}>
                    {children}
                </FormularioAbierto>
            )}
        </>
    );
}

type FormularioAbiertoProps = Omit<FormularioModalProps, "boton" | "varianteBoton"> & { readonly onCerrar: () => void };

function FormularioAbierto({ titulo, descripcion, accion, textoGuardar = "Guardar", varianteGuardar = "primario", textoGuardando = "Guardando...", onCerrar, children }: FormularioAbiertoProps) {
    const [resultado, enviar, guardando] = useActionState(async (previo: ResultadoAccion, datos: FormData) => {
        const respuesta = await accion(previo, datos);
        if (respuesta?.ok) onCerrar();
        return respuesta;
    }, null);

    return (
        <Modal titulo={titulo} descripcion={descripcion} onCerrar={onCerrar}>
            <form
                // Se envía a mano y no con action={...}: React limpia los campos tras una action de formulario,
                // y si el guardado falla hay que conservar lo escrito
                onSubmit={(evento) => {
                    evento.preventDefault();
                    const datos = new FormData(evento.currentTarget);
                    startTransition(() => enviar(datos));
                }}>
                <fieldset disabled={guardando} className="space-y-4 px-5 py-4">
                    {children}
                </fieldset>
                {resultado?.ok === false && (
                    <p role="alert" className="mx-5 mb-4 flex gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                        <CircleAlert size={16} className="mt-0.5 shrink-0" />
                        {resultado.error}
                    </p>
                )}
                <div className="flex justify-end gap-2 border-t border-neutral-200 px-5 py-3">
                    <Boton variante="secundario" onClick={onCerrar} disabled={guardando}>
                        Cancelar
                    </Boton>
                    <Boton type="submit" variante={varianteGuardar} disabled={guardando}>
                        {guardando ? textoGuardando : textoGuardar}
                    </Boton>
                </div>
            </form>
        </Modal>
    );
}
