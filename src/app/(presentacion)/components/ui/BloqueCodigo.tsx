import type { ReactNode } from "react";

interface BloqueCodigoProps {
    readonly titulo: string;
    // Texto a mostrar tal cual (por ejemplo JSON ya formateado); null muestra el texto de vacío
    readonly contenido: string | null;
    readonly vacio?: string;
    // Texto al lado del título, por ejemplo el status HTTP
    readonly detalle?: ReactNode;
    readonly tono?: "neutro" | "error";
}

// Bloque de texto monoespaciado con desplazamiento, para JSON, respuestas y errores
export default function BloqueCodigo({ titulo, contenido, vacio = "Sin contenido", detalle, tono = "neutro" }: BloqueCodigoProps) {
    const error = tono === "error";
    return (
        <section className={`overflow-hidden rounded-lg border ${error ? "border-red-200" : "border-neutral-200"}`}>
            <header
                className={`flex items-center justify-between gap-2 border-b px-4 py-2 text-sm font-medium ${error ? "border-red-200 bg-red-50 text-red-800" : "border-neutral-200 bg-neutral-50 text-neutral-900"}`}>
                <h2>{titulo}</h2>
                {detalle}
            </header>
            {contenido ? (
                <pre className="max-h-[28rem] overflow-auto p-4 font-mono text-xs leading-relaxed whitespace-pre text-neutral-800">
                    {contenido}
                </pre>
            ) : (
                <p className="p-4 text-sm text-neutral-500">{vacio}</p>
            )}
        </section>
    );
}
