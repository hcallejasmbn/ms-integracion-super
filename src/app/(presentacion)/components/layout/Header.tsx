import { PanelLeft } from "lucide-react";

interface HeaderProps {
    readonly sidebarAbierto: boolean;
    readonly onAlternarSidebar: () => void;
}

// Cabecera de las páginas privadas: botón para mostrar u ocultar el menú y el nombre de la institución
export default function Header({ sidebarAbierto, onAlternarSidebar }: HeaderProps) {
    return (
        <header className="flex h-[52px] shrink-0 items-center gap-3 border-b border-neutral-200 bg-white px-3">
            <button
                type="button"
                onClick={onAlternarSidebar}
                aria-label={sidebarAbierto ? "Ocultar menú" : "Mostrar menú"}
                aria-expanded={sidebarAbierto}
                className="cursor-pointer rounded-md p-2 text-neutral-700 hover:bg-neutral-100">
                <PanelLeft size={16} />
            </button>
            <span className="h-5 w-px bg-neutral-200" />
            <span className="truncate text-sm text-neutral-600">Ministerio de Bienes Nacionales</span>
        </header>
    );
}
