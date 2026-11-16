"use client";
import { useSyncExternalStore } from "react";

// Mismo corte que el prefijo md: de Tailwind (768px)
const CONSULTA_MOVIL = "(max-width: 767px)";

function suscribir(avisar: () => void): () => void {
    const consulta = window.matchMedia(CONSULTA_MOVIL);
    consulta.addEventListener("change", avisar);
    return () => consulta.removeEventListener("change", avisar);
}

// true si el ancho de la ventana es de móvil. En el servidor no hay ventana: se asume escritorio
export function useIsMobile(): boolean {
    return useSyncExternalStore(
        suscribir,
        () => window.matchMedia(CONSULTA_MOVIL).matches,
        () => false,
    );
}
