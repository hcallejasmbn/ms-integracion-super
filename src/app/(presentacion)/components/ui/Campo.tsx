import type { ReactNode } from "react";

interface CampoProps {
    readonly etiqueta: string;
    // Texto de ayuda bajo el control
    readonly ayuda?: ReactNode;
    readonly obligatorio?: boolean;
    // El input o select; queda dentro del label, así no necesita id
    readonly children: ReactNode;
    readonly className?: string;
}

// Etiqueta + control + ayuda, para los formularios
export default function Campo({ etiqueta, ayuda, obligatorio = false, children, className = "" }: CampoProps) {
    return (
        <label className={`block space-y-1 ${className}`}>
            <span className="block text-sm font-medium text-neutral-800">
                {etiqueta}
                {obligatorio && <span className="text-red-600"> *</span>}
            </span>
            {children}
            {ayuda && <span className="block text-xs text-neutral-500">{ayuda}</span>}
        </label>
    );
}
