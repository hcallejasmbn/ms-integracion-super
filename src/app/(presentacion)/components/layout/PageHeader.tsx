import Breadcrumb, { type Miga } from "./Breadcrumb";

interface PageHeaderProps {
    readonly migas: readonly Miga[];
    readonly titulo: string;
    readonly descripcion?: string;
}

// Encabezado de cada página privada: ruta de navegación, título y una descripción breve
export default function PageHeader({ migas, titulo, descripcion }: PageHeaderProps) {
    return (
        <div className="space-y-3">
            <Breadcrumb migas={migas} />
            <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">{titulo}</h1>
            {descripcion && <p className="text-sm text-neutral-600">{descripcion}</p>}
        </div>
    );
}
