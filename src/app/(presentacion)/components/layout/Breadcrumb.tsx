import { ChevronRight } from "lucide-react";
import Link from "next/link";

// Paso de la ruta de navegación; sin href es la página actual
export interface Miga {
    readonly label: string;
    readonly href?: string;
}

interface BreadcrumbProps {
    readonly migas: readonly Miga[];
}

export default function Breadcrumb({ migas }: BreadcrumbProps) {
    return (
        <nav aria-label="Ruta de navegación">
            <ol className="flex flex-wrap items-center gap-1.5 text-sm text-neutral-600">
                {migas.map((miga, indice) => (
                    <li key={`${indice}-${miga.label}`} className="flex items-center gap-1.5">
                        {indice > 0 && <ChevronRight size={14} className="text-neutral-500" />}
                        {miga.href ? (
                            <Link href={miga.href} className="hover:text-neutral-900">
                                {miga.label}
                            </Link>
                        ) : (
                            <span aria-current="page" className="text-neutral-900">
                                {miga.label}
                            </span>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
}
