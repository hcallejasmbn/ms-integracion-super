import type { ButtonHTMLAttributes } from "react";

export const VARIANTES_BOTON = {
    primario: "bg-[#1d4ed8] text-white hover:bg-[#1e40af] disabled:bg-blue-300",
    secundario: "border border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-50 disabled:text-neutral-400",
    // Acciones que no se pueden deshacer, como eliminar
    peligro: "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300",
} as const;

export type VarianteBoton = keyof typeof VARIANTES_BOTON;

interface BotonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    readonly variante?: VarianteBoton;
}

// Botón con el estilo de la aplicación; por defecto type="button" para no enviar formularios sin querer
export default function Boton({ variante = "primario", type = "button", className = "", ...props }: BotonProps) {
    return (
        <button
            type={type}
            className={`inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium whitespace-nowrap disabled:cursor-not-allowed ${VARIANTES_BOTON[variante]} ${className}`}
            {...props}
        />
    );
}
