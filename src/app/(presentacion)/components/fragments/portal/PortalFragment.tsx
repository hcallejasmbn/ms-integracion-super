import Link from "next/link";
import type { Usuario } from "@/core/domain/auth/usuario";
import { MENU } from "../../layout/menu";
import PageHeader from "../../layout/PageHeader";

interface PortalFragmentProps {
    readonly usuario: Usuario;
}

// Página de inicio: bienvenida y un acceso a cada opción del menú
export default function PortalFragment({ usuario }: PortalFragmentProps) {
    return (
        <>
            <PageHeader
                migas={[{ label: "Inicio" }]}
                titulo={`Bienvenido, ${usuario.nombre}`}
                descripcion="Integración de la tramitación del Ministerio con SUPER. Elige una opción para comenzar."
            />
            <ul className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {MENU.map(({ label, href, icon: Icono, descripcion }) => (
                    <li key={href}>
                        <Link
                            href={href}
                            className="flex h-full gap-3 rounded-lg border border-neutral-200 p-4 hover:bg-neutral-50">
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-[#dbe3f5] text-[#1d4ed8]">
                                <Icono size={18} />
                            </span>
                            <span className="min-w-0">
                                <span className="block text-sm font-medium text-neutral-900">{label}</span>
                                <span className="block text-sm text-neutral-600">{descripcion}</span>
                            </span>
                        </Link>
                    </li>
                ))}
            </ul>
        </>
    );
}
