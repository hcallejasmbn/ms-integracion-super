"use client";
import { useParametrosUrl } from "../hooks/useParametrosUrl";

interface FiltroSelectProps {
    // Parámetro de la URL que escribe, por ejemplo "operacion"
    readonly parametro: string;
    readonly etiqueta: string;
    readonly opciones: readonly string[];
    // Valor actual del parámetro ("" = sin filtro)
    readonly valor: string;
    readonly textoTodos: string;
}

// Select que guarda la opción elegida en un parámetro de la URL, como Buscador con ?q=
export default function FiltroSelect({ parametro, etiqueta, opciones, valor, textoTodos }: FiltroSelectProps) {
    const [cambiar, pendiente] = useParametrosUrl();
    return (
        <label className="block">
            <span className="sr-only">{etiqueta}</span>
            <select
                value={valor}
                onChange={(evento) => cambiar(parametro, evento.target.value)}
                className={`w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none sm:w-auto ${pendiente ? "opacity-70" : ""}`}>
                <option value="">{textoTodos}</option>
                {opciones.map((opcion) => (
                    <option key={opcion} value={opcion}>
                        {opcion}
                    </option>
                ))}
            </select>
        </label>
    );
}
