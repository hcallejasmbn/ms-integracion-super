// Texto sin tildes y en minúsculas, para que "concesion" encuentre "Concesión"
function normalizar(texto: string): string {
    return texto.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

// true si alguno de los campos contiene el texto buscado. Sin texto, todo coincide
export function coincide(buscado: string, ...campos: readonly (string | null | undefined)[]): boolean {
    const q = normalizar(buscado.trim());
    return q === "" || campos.some((campo) => campo != null && normalizar(campo).includes(q));
}

// searchParams puede traer el parámetro repetido (?q=a&q=b); se usa el primero
export function parametroTexto(valor: string | string[] | undefined): string {
    return (Array.isArray(valor) ? valor[0] : valor) ?? "";
}
