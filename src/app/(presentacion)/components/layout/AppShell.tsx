"use client";
import { useState, type ReactNode } from "react";
import type { Usuario } from "@/core/domain/auth/usuario";
import { useIsMobile } from "../hooks/useIsMobile";
import Header from "./Header";
import Sidebar from "./Sidebar";

interface AppShellProps {
    readonly usuario: Usuario;
    readonly children: ReactNode;
}

// Estructura de las páginas privadas: cabecera arriba, menú lateral a la izquierda y el contenido a la derecha.
// En escritorio el menú se oculta y se muestra con el botón de la cabecera; en móvil se abre encima del contenido
export default function AppShell({ usuario, children }: AppShellProps) {
    const isMobile = useIsMobile();
    const [abiertoEscritorio, setAbiertoEscritorio] = useState(true);
    const [abiertoMovil, setAbiertoMovil] = useState(false);
    const abierto = isMobile ? abiertoMovil : abiertoEscritorio;

    const alternarSidebar = () => {
        if (isMobile) {
            setAbiertoMovil(!abiertoMovil);
        } else {
            setAbiertoEscritorio(!abiertoEscritorio);
        }
    };

    return (
        <div className="flex h-screen w-full flex-col bg-white text-neutral-900 font-gob">
            <Header sidebarAbierto={abierto} onAlternarSidebar={alternarSidebar} />
            <div className="relative flex min-h-0 flex-1">
                {abierto && isMobile && (
                    <div className="fixed inset-0 top-[52px] z-30 bg-black/30" onClick={() => setAbiertoMovil(false)} />
                )}
                {abierto && (
                    <Sidebar
                        usuario={usuario}
                        className={isMobile ? "fixed top-[52px] bottom-0 left-0 z-40 shadow-xl" : ""}
                        onNavegar={isMobile ? () => setAbiertoMovil(false) : undefined}
                    />
                )}
                <main className="min-w-0 flex-1 overflow-y-auto px-4 py-8 md:px-10">{children}</main>
            </div>
        </div>
    );
}
