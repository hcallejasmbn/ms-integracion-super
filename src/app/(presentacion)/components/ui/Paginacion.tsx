import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

interface PaginacionProps {
    readonly pagina: number;
    readonly totalPaginas: number;
    readonly total: number;
    // URL de cada página (sin el basePath; Link lo agrega), conservando los filtros
    readonly hrefPagina: (pagina: number) => string;
}

// "Página X de Y" con anterior y siguiente como enlaces, así la página vive en la URL (?pagina=)
export default function Paginacion({ pagina, totalPaginas, total, hrefPagina }: PaginacionProps) {
    return (
        <nav aria-label="Paginación" className="flex items-center justify-between gap-4 text-sm text-neutral-600">
            <span>
                {total} {total === 1 ? "registro" : "registros"} · Página {pagina} de {totalPaginas}
            </span>
            <span className="flex gap-2">
                <Paso href={pagina > 1 ? hrefPagina(pagina - 1) : undefined} etiqueta="Anterior">
                    <ChevronLeft size={16} />
                </Paso>
                <Paso href={pagina < totalPaginas ? hrefPagina(pagina + 1) : undefined} etiqueta="Siguiente">
                    <ChevronRight size={16} />
                </Paso>
            </span>
        </nav>
    );
}

function Paso({ href, etiqueta, children }: { readonly href?: string; readonly etiqueta: string; readonly children: React.ReactNode }) {
    const clase = "inline-flex size-8 items-center justify-center rounded-md border border-neutral-300";
    // Sin href (primera o última página) se muestra deshabilitado
    return href ? (
        <Link href={href} aria-label={etiqueta} className={`${clase} bg-white text-neutral-800 hover:bg-neutral-50`}>
            {children}
        </Link>
    ) : (
        <span aria-label={etiqueta} aria-disabled="true" className={`${clase} text-neutral-300`}>
            {children}
        </span>
    );
}
