import Link from "next/link";

export interface Pestana {
    readonly id: string;
    readonly label: string;
    // Ruta de la app sin el basePath (Link lo agrega)
    readonly href: string;
    readonly contador?: number;
}

interface PestanasProps {
    readonly pestanas: readonly Pestana[];
    readonly activa: string;
}

// Pestañas como enlaces: la pestaña activa vive en la URL (por ejemplo ?tab=), así el Server Component
// dibuja solo su contenido y la pestaña se puede compartir o recargar
export default function Pestanas({ pestanas, activa }: PestanasProps) {
    return (
        <nav aria-label="Secciones" className="flex gap-1 overflow-x-auto overflow-y-hidden border-b border-neutral-200">
            {pestanas.map(({ id, label, href, contador }) => {
                const seleccionada = id === activa;
                return (
                    <Link
                        key={id}
                        href={href}
                        scroll={false}
                        aria-current={seleccionada ? "page" : undefined}
                        className={`-mb-px flex items-center gap-2 border-b-2 px-3 py-2 text-sm font-medium whitespace-nowrap ${
                            seleccionada
                                ? "border-[#1d4ed8] text-[#1d4ed8]"
                                : "border-transparent text-neutral-600 hover:border-neutral-300 hover:text-neutral-900"
                        }`}>
                        {label}
                        {contador !== undefined && (
                            <span
                                className={`rounded-full px-1.5 text-xs ${seleccionada ? "bg-blue-50" : "bg-neutral-100"}`}>
                                {contador}
                            </span>
                        )}
                    </Link>
                );
            })}
        </nav>
    );
}
