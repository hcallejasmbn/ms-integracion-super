import { ChevronsUpDown, LogOut } from "lucide-react";
import { BASE_PATH } from "@/config/base-path";
import type { Usuario } from "@/core/domain/auth/usuario";

interface UserMenuProps {
    readonly usuario: Usuario;
}

// Usuario de la sesión al pie del menú lateral; al hacer clic despliega "Cerrar sesión"
export default function UserMenu({ usuario }: UserMenuProps) {
    return (
        <details className="relative px-2 py-3">
            <summary className="flex cursor-pointer list-none items-center gap-3 rounded-md px-1 py-1.5 hover:bg-neutral-100 [&::-webkit-details-marker]:hidden">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-neutral-100 text-xs text-neutral-600">
                    {iniciales(usuario.nombre)}
                </span>
                <span className="min-w-0 flex-1 leading-tight">
                    <span className="block truncate text-sm font-medium uppercase">{usuario.nombre}</span>
                    <span className="block truncate text-xs text-neutral-600">{usuario.email}</span>
                </span>
                <ChevronsUpDown size={16} className="shrink-0 text-neutral-600" />
            </summary>
            <div className="absolute right-2 bottom-full left-2 mb-1 rounded-md border border-neutral-200 bg-white p-1 shadow-lg">
                {/* Navegación completa: /api/auth/logout cierra solo la sesión de esta app y vuelve a /login */}
                <a
                    href={`${BASE_PATH}/api/auth/logout`}
                    className="flex items-center gap-2 rounded px-2 py-1.5 text-sm text-neutral-800 hover:bg-neutral-100">
                    <LogOut size={16} />
                    Cerrar sesión
                </a>
            </div>
        </details>
    );
}

// Primera letra de las dos primeras palabras del nombre, por ejemplo "Gerardo Moises" → "GM"
function iniciales(nombre: string): string {
    return nombre
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((palabra) => palabra[0].toUpperCase())
        .join("");
}
