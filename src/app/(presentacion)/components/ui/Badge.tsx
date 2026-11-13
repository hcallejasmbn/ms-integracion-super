import type { ReactNode } from "react";

const TONOS = {
    neutro: "border-neutral-300 bg-neutral-100 text-neutral-700",
    azul: "border-blue-200 bg-blue-50 text-blue-800",
    verde: "border-green-200 bg-green-50 text-green-800",
    ambar: "border-amber-200 bg-amber-50 text-amber-800",
    rojo: "border-red-200 bg-red-50 text-red-800",
} as const;

interface BadgeProps {
    readonly children: ReactNode;
    readonly tono?: keyof typeof TONOS;
}

// Etiqueta corta y redondeada, como la prioridad "Normal" de las tablas
export default function Badge({ children, tono = "neutro" }: BadgeProps) {
    return (
        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs whitespace-nowrap ${TONOS[tono]}`}>
            {children}
        </span>
    );
}
