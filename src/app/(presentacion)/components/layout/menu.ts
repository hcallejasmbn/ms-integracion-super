import { ScrollText, Workflow, type LucideIcon } from "lucide-react";

// Opción del menú lateral. href es una ruta de la app sin el basePath (Link lo agrega)
export interface OpcionMenu {
    readonly label: string;
    readonly href: string;
    readonly icon: LucideIcon;
    // Texto corto para las tarjetas de acceso del portal
    readonly descripcion: string;
}

// Opciones del menú lateral, en el orden en que se muestran
export const MENU: readonly OpcionMenu[] = [
    {
        label: "Procesos",
        href: "/procesos",
        icon: Workflow,
        descripcion: "Procesos, sus actividades y los estados que se informan a SUPER",
    },
    {
        label: "Traza ejecuciones",
        href: "/ejecuciones",
        icon: ScrollText,
        descripcion: "Llamadas a SUPER, correctas y fallidas, con lo enviado y lo que respondió",
    },
];
