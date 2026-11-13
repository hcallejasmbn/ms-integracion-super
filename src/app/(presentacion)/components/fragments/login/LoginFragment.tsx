"use client";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BASE_PATH } from "@/config/base-path";
import { useIsMobile } from "../../hooks/useIsMobile";

// Mensajes para los códigos que el callback del SSO (/api/auth/callback) envía en ?error=
const MENSAJES_ERROR: Record<string, string> = {
    autenticacion_fallida: "No se pudo iniciar sesión con tu cuenta institucional",
    login_expirado: "El inicio de sesión expiró; vuelve a intentarlo",
    azure_no_disponible: "El servicio de autenticación no está disponible; intenta más tarde",
};

export default function LoginFragment() {
    return (
        <Suspense fallback={null}>
            <LoginBody />
        </Suspense>
    );
}

function LoginBody() {
    const searchParams = useSearchParams();
    // Ruta de la app (sin el basePath) a la que se vuelve después del login
    const returnTo = searchParams.get("returnTo") ?? "/portal";
    const error = searchParams.get("error");
    const errorMessage = error ? (MENSAJES_ERROR[error] ?? "No se pudo iniciar sesión") : null;

    const [isLoading, setLoading] = useState(false);
    const [errorCerrado, setErrorCerrado] = useState(false);
    const showError = errorMessage !== null && !errorCerrado;
    const isMobile = useIsMobile();

    // El login con Azure es una navegación completa: /api/auth/login redirige a Microsoft y vuelve por el callback
    const buttonLoginHandler = () => {
        setLoading(true);
        window.location.assign(`${BASE_PATH}/api/auth/login?returnTo=${encodeURIComponent(returnTo)}`);
    };

    return (
        <main className={`flex min-h-screen bg-white text-black font-gob p-4 md:p-6 ${isMobile ? "flex-col" : "h-screen"}`}>
            {/* Left panel / top banner */}
            <section className={`bg-[#0A2547] rounded-[20px] flex items-center justify-center relative ${isMobile ? "w-full py-10 mb-6" : "w-[40%] h-full"}`}>
                <div className="franja-gob w-[180px] absolute top-4 right-8"></div>
                <div className="flex items-center gap-6 md:gap-10">
                    <img
                        src={`${BASE_PATH}/assets/img/logotipo-bienes-nacionales.png`}
                        alt="Logotipo Ministerio de Bienes Nacionales"
                        className="w-[100px] md:w-[140px]"
                    />
                    <h2 className="text-white font-medium text-xl md:text-2xl leading-none">
                        Administración integración SUPER
                    </h2>
                </div>
            </section>

            {/* Right panel / Login form */}
            <section className={`relative flex flex-col items-center justify-center flex-grow ${isMobile ? "w-full py-4" : "w-[60%] h-full"}`}>
                {showError && (
                    <div className="absolute top-4 w-11/12 max-w-md bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow text-center z-50">
                        <p className="font-semibold">{errorMessage}</p>
                        <button
                            className="mt-2 text-sm underline cursor-pointer"
                            onClick={() => setErrorCerrado(true)}>
                            Cerrar
                        </button>
                    </div>
                )}

                <div className="flex flex-col items-center gap-8 w-full max-w-md">
                    <div className="flex items-start gap-4">
                        <div className="mt-1 md:mt-2">
                            <p className="text-[18px] md:text-[24px] leading-none text-[#232944] font-normal">
                                Integración SUPER
                            </p>
                            <p className="text-[18px] md:text-[24px] leading-none text-[#232944] font-normal">
                                Bienes Nacionales
                            </p>
                        </div>
                    </div>

                    <p className="text-center text-[#707070] text-sm md:text-base leading-tight font-normal">
                        Ingrese con su cuenta institucional para acceder al sistema
                    </p>

                    <button
                        onClick={buttonLoginHandler}
                        disabled={isLoading}
                        className="w-full max-w-sm flex items-center justify-center gap-3 border border-gray-300 bg-white px-8 py-3 hover:bg-gray-50 transition cursor-pointer disabled:opacity-50">
                        {isLoading ? (
                            <>
                                <svg
                                    className="animate-spin h-5 w-5 text-gray-600"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24">
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span className="text-gray-600">Iniciando sesión...</span>
                            </>
                        ) : (
                            <>
                                <img
                                    src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg"
                                    alt="Botón de ingreso con Microsoft"
                                    className="w-5 h-5"
                                />
                                <span className="text-gray-600 font-medium">
                                    Sign in with Microsoft
                                </span>
                            </>
                        )}
                    </button>
                </div>

                <div className={`w-full flex flex-col items-center ${isMobile ? "mt-12 mb-4" : "absolute bottom-8"}`}>
                    <div className="w-full max-w-[420px] h-px bg-gray-300 mb-10"></div>
                    <div className="flex flex-col items-center w-fit">
                        <p className="text-sm text-gray-500 mb-2 font-normal text-center">
                            Ministerio de Bienes Nacionales
                        </p>
                        <div className="franja-gob w-full"></div>
                    </div>
                </div>
            </section>
        </main>
    );
}