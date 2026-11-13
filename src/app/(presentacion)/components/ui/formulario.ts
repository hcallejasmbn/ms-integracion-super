// Resultado de una Server Action de formulario: null antes del primer envío
export type ResultadoAccion = { readonly ok: true } | { readonly ok: false; readonly error: string } | null;

// Server Action que recibe el formulario, con la firma que espera useActionState
export type AccionFormulario = (previo: ResultadoAccion, datos: FormData) => Promise<ResultadoAccion>;

// Clases de inputs y selects, para que todos los formularios se vean igual. El color del texto va explícito:
// el modal se monta en body y no debe depender del color que herede
export const CLASE_CONTROL =
    "w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 disabled:bg-neutral-50 focus:ring-2 focus:ring-blue-600 focus:outline-none";
