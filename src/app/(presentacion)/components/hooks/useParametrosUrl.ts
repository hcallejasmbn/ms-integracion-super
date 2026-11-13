"use client";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";

/**
 * Cambia un parámetro de la URL (?q=, ?operacion=...) con router.replace en una transición, sin tocar los demás.
 * Quita ?pagina= porque con otro filtro la página actual puede no existir. Vacío borra el parámetro.
 * Devuelve la función y si la página se está volviendo a dibujar.
 */
export function useParametrosUrl(): readonly [(nombre: string, valor: string) => void, boolean] {
    const router = useRouter();
    // Sin el basePath; router.replace lo agrega
    const pathname = usePathname();
    const [pendiente, startTransition] = useTransition();

    const cambiar = (nombre: string, valor: string) => {
        // Se leen al cambiar, no al dibujar, así el componente no depende de useSearchParams
        const parametros = new URLSearchParams(window.location.search);
        if (valor) parametros.set(nombre, valor);
        else parametros.delete(nombre);
        parametros.delete("pagina");
        const consulta = parametros.toString();
        startTransition(() => {
            router.replace(consulta ? `${pathname}?${consulta}` : pathname, { scroll: false });
        });
    };

    return [cambiar, pendiente] as const;
}
