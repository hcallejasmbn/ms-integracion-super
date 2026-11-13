import { ListTree } from "lucide-react";
import type { Proceso } from "@/core/domain/proceso/proceso";
import PageHeader from "../../layout/PageHeader";
import Badge from "../../ui/Badge";
import BotonLink from "../../ui/BotonLink";
import Buscador from "../../ui/Buscador";
import { coincide } from "../../ui/busqueda";
import Tabla, { type Columna } from "../../ui/Tabla";

interface ProcesosFragmentProps {
    readonly procesos: readonly Proceso[];
    // Texto de búsqueda (?q=)
    readonly q: string;
}

const COLUMNAS: readonly Columna<Proceso>[] = [
    {
        encabezado: "Código",
        className: "w-24",
        celda: (proceso) => <span className="font-mono text-xs text-neutral-700">{proceso.codigo}</span>,
    },
    { encabezado: "Nombre", celda: (proceso) => <span className="font-medium">{proceso.nombre}</span> },
    {
        encabezado: "Código en SUPER",
        celda: (proceso) =>
            proceso.codigoSuper ? (
                <span className="text-neutral-700">{proceso.codigoSuper}</span>
            ) : (
                <Badge tono="ambar">Sin configurar</Badge>
            ),
    },
    {
        encabezado: "Acción",
        alinear: "derecha",
        celda: (proceso) => (
            <BotonLink href={`/procesos/${encodeURIComponent(proceso.codigo)}`}>
                <ListTree size={14} />
                Ver actividades
            </BotonLink>
        ),
    },
];

// Lista de procesos con búsqueda por código o nombre
export default function ProcesosFragment({ procesos, q }: ProcesosFragmentProps) {
    const filtrados = procesos.filter((proceso) => coincide(q, proceso.codigo, proceso.nombre, proceso.codigoSuper));

    return (
        <>
            <PageHeader
                migas={[{ label: "Inicio", href: "/portal" }, { label: "Procesos" }]}
                titulo="Procesos"
                descripcion="Procesos cargados y su código en SUPER. Revisa sus actividades y el estado que cada una informa."
            />
            <div className="mt-8 space-y-4">
                <Buscador placeholder="Buscar por código o nombre..." valorInicial={q} />
                <Tabla
                    columnas={COLUMNAS}
                    filas={filtrados}
                    claveFila={(proceso) => proceso.codigo}
                    vacio={q ? `No hay procesos que coincidan con "${q}"` : "No hay procesos cargados"}
                />
            </div>
        </>
    );
}
