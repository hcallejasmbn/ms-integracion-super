// Ruta de la app con sus parámetros; los vacíos o undefined no se agregan
export function conParametros(ruta: string, parametros: Readonly<Record<string, string | number | undefined>>): string {
    const consulta = new URLSearchParams();
    for (const [nombre, valor] of Object.entries(parametros)) {
        if (valor !== undefined && valor !== "") consulta.set(nombre, String(valor));
    }
    const texto = consulta.toString();
    return texto ? `${ruta}?${texto}` : ruta;
}
