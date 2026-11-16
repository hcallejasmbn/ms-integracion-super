"use client";
import { Search } from "lucide-react";
import { useState } from "react";
import { useParametrosUrl } from "../hooks/useParametrosUrl";

interface BuscadorProps {
    readonly placeholder: string;
    // Valor actual de ?q=, que la página lee de searchParams
    readonly valorInicial: string;
}

// Caja de búsqueda que guarda el texto en ?q= de la URL, sin tocar los demás parámetros (salvo ?pagina=,
// que vuelve a la primera). La página (Server Component) lee ese parámetro y filtra en el servidor,
// así la búsqueda se puede compartir o recargar
export default function Buscador({ placeholder, valorInicial }: BuscadorProps) {
    const [texto, setTexto] = useState(valorInicial);
    const [cambiarParametro, buscando] = useParametrosUrl();

    const cambiar = (valor: string) => {
        setTexto(valor);
        cambiarParametro("q", valor.trim());
    };

    return (
        <label className="relative block w-full max-w-sm">
            <span className="sr-only">{placeholder}</span>
            <Search size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-neutral-500" />
            <input
                type="search"
                value={texto}
                onChange={(evento) => cambiar(evento.target.value)}
                placeholder={placeholder}
                className={`w-full rounded-md border border-neutral-200 bg-white py-2 pr-3 pl-9 text-sm placeholder:text-neutral-500 focus:ring-2 focus:ring-blue-600 focus:outline-none ${buscando ? "opacity-70" : ""}`}
            />
        </label>
    );
}
