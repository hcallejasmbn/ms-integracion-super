"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Usuario } from "@/core/domain/auth/usuario";
import { MENU } from "./menu";
import UserMenu from "./UserMenu";

interface SidebarProps {
    readonly usuario: Usuario;
    readonly className?: string;
    // En móvil cierra el menú al elegir una opción
    readonly onNavegar?: () => void;
}

// Menú lateral: marca de la aplicación, opciones (MENU) y el usuario de la sesión
export default function Sidebar({ usuario, className = "", onNavegar }: SidebarProps) {
    // Sin el basePath, igual que los href del menú
    const pathname = usePathname();

    return (
        <aside className={`flex w-[286px] shrink-0 flex-col border-r border-neutral-200 bg-neutral-50 ${className}`}>
            <div className="flex items-center gap-3 px-3 pt-4 pb-2">
                {/* Círculo con los colores de la franja institucional */}
                <span className="size-6 shrink-0 rotate-12 rounded-full bg-[linear-gradient(90deg,#0f69c4_50%,#eb3c46_50%)]" />
                <div className="min-w-0 leading-tight">
                    <p className="truncate text-sm font-medium">Integración SUPER</p>
                    <p className="truncate text-xs text-neutral-600">Bienes Nacionales</p>
                </div>
            </div>

            <nav className="flex-1 overflow-y-auto px-2 pt-6" aria-label="Menú principal">
                <p className="px-1 pb-2 text-xs text-neutral-500">Menú</p>
                <ul className="space-y-0.5">
                    {MENU.map(({ label, href, icon: Icono }) => {
                        const activa = pathname === href || pathname.startsWith(`${href}/`);
                        return (
                            <li key={href}>
                                <Link
                                    href={href}
                                    onClick={onNavegar}
                                    aria-current={activa ? "page" : undefined}
                                    className={`flex items-center gap-2 rounded-md px-2 py-2 text-sm ${
                                        activa ? "bg-[#dbe3f5] font-medium text-neutral-900" : "text-neutral-800 hover:bg-neutral-100"
                                    }`}>
                                    <Icono size={16} className="shrink-0" />
                                    <span className="truncate">{label}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            <UserMenu usuario={usuario} />
        </aside>
    );
}
