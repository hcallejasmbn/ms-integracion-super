"use client";
import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
    readonly titulo: string;
    readonly descripcion?: ReactNode;
    readonly onCerrar: () => void;
    readonly children: ReactNode;
}

// Ventana sobre la página. Se cierra con Escape, con la X o haciendo clic fuera de ella.
// Quien la usa decide cuándo se muestra (la dibuja solo mientras está abierta, siempre tras una acción del
// usuario, así que document existe). Se dibuja en document.body para no heredar estilos de donde se abre,
// por ejemplo la alineación de una celda de tabla
export default function Modal({ titulo, descripcion, onCerrar, children }: ModalProps) {
    // Escape se escucha en el documento: al guardar, el formulario se deshabilita y el foco sale del modal
    useEffect(() => {
        const alPresionar = (evento: KeyboardEvent) => {
            if (evento.key === "Escape") onCerrar();
        };
        document.addEventListener("keydown", alPresionar);
        return () => document.removeEventListener("keydown", alPresionar);
    }, [onCerrar]);

    return createPortal(
        <div
            className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 sm:items-center"
            onMouseDown={(evento) => {
                if (evento.target === evento.currentTarget) onCerrar();
            }}>
            <div
                role="dialog"
                aria-modal="true"
                aria-label={titulo}
                // Recibe el foco al abrirse, para que el teclado empiece dentro del modal
                tabIndex={-1}
                autoFocus
                className="w-full max-w-2xl rounded-lg bg-white shadow-xl outline-none">
                <div className="flex items-start justify-between gap-4 border-b border-neutral-200 px-5 py-4">
                    <div className="space-y-1">
                        <h2 className="text-base font-semibold text-neutral-900">{titulo}</h2>
                        {descripcion && <p className="text-sm text-neutral-600">{descripcion}</p>}
                    </div>
                    <button
                        type="button"
                        onClick={onCerrar}
                        aria-label="Cerrar"
                        className="rounded-md p-1 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900">
                        <X size={18} />
                    </button>
                </div>
                {children}
            </div>
        </div>,
        document.body,
    );
}
