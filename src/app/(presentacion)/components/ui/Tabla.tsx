import type { ReactNode } from "react";

// Columna de la tabla: celda dibuja el contenido de cada fila
export interface Columna<T> {
    readonly encabezado: string;
    readonly celda: (fila: T) => ReactNode;
    readonly alinear?: "izquierda" | "derecha";
    // Clases extra para el encabezado y las celdas de la columna (por ejemplo un ancho)
    readonly className?: string;
}

interface TablaProps<T> {
    readonly columnas: readonly Columna<T>[];
    readonly filas: readonly T[];
    readonly claveFila: (fila: T) => string | number;
    // Se muestra cuando no hay filas
    readonly vacio?: ReactNode;
}

// Tabla con el estilo de la aplicación: borde redondeado, encabezado en negrita y filas separadas por líneas.
// En pantallas angostas se desplaza horizontalmente
export default function Tabla<T>({ columnas, filas, claveFila, vacio = "Sin resultados" }: TablaProps<T>) {
    return (
        <div className="overflow-x-auto rounded-lg border border-neutral-200">
            <table className="w-full text-sm">
                <thead>
                    <tr>
                        {columnas.map((columna) => (
                            <th
                                key={columna.encabezado}
                                scope="col"
                                className={`px-3 py-3 font-medium whitespace-nowrap text-neutral-900 ${alineacion(columna)} ${columna.className ?? ""}`}>
                                {columna.encabezado}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {filas.length === 0 ? (
                        <tr className="border-t border-neutral-200">
                            <td colSpan={columnas.length} className="px-3 py-8 text-center text-neutral-500">
                                {vacio}
                            </td>
                        </tr>
                    ) : (
                        filas.map((fila) => (
                            <tr key={claveFila(fila)} className="border-t border-neutral-200 hover:bg-neutral-50">
                                {columnas.map((columna) => (
                                    <td
                                        key={columna.encabezado}
                                        className={`px-3 py-2.5 align-middle ${alineacion(columna)} ${columna.className ?? ""}`}>
                                        {columna.celda(fila)}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

function alineacion<T>(columna: Columna<T>): string {
    return columna.alinear === "derecha" ? "text-right" : "text-left";
}
