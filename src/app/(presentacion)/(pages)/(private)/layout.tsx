import { requerirUsuario } from "../../../auth/sesion";
import AppShell from "../../components/layout/AppShell";

// Cabecera y menú lateral comunes a todas las páginas privadas. El layout no reemplaza la verificación
// de cada página: no se vuelve a renderizar al navegar, así que cada page.tsx sigue llamando a requerirUsuario()
export default async function PrivateLayout({ children }: LayoutProps<"/">) {
    const usuario = await requerirUsuario();
    return <AppShell usuario={usuario}>{children}</AppShell>;
}
