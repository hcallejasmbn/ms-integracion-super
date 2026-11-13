import Link from "next/link";
import type { ReactNode } from "react";

interface BotonLinkProps {
    // Ruta de la app sin el basePath (Link lo agrega)
    readonly href: string;
    readonly children: ReactNode;
}

// Enlace con aspecto de botón primario (azul), para las acciones de una fila
export default function BotonLink({ href, children }: BotonLinkProps) {
    return (
        <Link
            href={href}
            className="inline-flex items-center gap-1.5 rounded-md bg-[#1d4ed8] px-3 py-1.5 text-sm font-medium whitespace-nowrap text-white hover:bg-[#1e40af]">
            {children}
        </Link>
    );
}
