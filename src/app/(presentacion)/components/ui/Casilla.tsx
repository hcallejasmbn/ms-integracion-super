import type { ReactNode } from "react";

interface CasillaProps {
    readonly name: string;
    readonly etiqueta: string;
    readonly marcada: boolean;
    readonly ayuda?: ReactNode;
}

// Checkbox con etiqueta y ayuda, para los formularios. Marcado envía value="true"; desmarcado no viaja en el
// FormData, así que la Server Action lo lee como false
export default function Casilla({ name, etiqueta, marcada, ayuda }: CasillaProps) {
    return (
        <label className="flex items-start gap-3">
            <input
                type="checkbox"
                name={name}
                value="true"
                defaultChecked={marcada}
                className="mt-0.5 size-4 shrink-0 rounded border-neutral-300 accent-[#1d4ed8]"
            />
            <span className="space-y-1">
                <span className="block text-sm font-medium text-neutral-800">{etiqueta}</span>
                {ayuda && <span className="block text-xs text-neutral-500">{ayuda}</span>}
            </span>
        </label>
    );
}
