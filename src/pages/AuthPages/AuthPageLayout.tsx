import React from "react";
import { Link } from "react-router";
import ThemeTogglerTwo from "../../components/common/ThemeTogglerTwo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex items-center justify-center min-h-screen p-6 bg-gray-50 dark:bg-gray-950 overflow-hidden">
      {/* Logo de fondo izquierda y visible */}
      <div className="absolute inset-0 flex items-center justify-left pointer-events-none select-none">
        <img
          src="/images/logo/fundes.png"
          alt=""
          className="w-[600px] h-auto object-contain opacity-[0.22] blur-sm"
        />
      </div>

      {/* Logo secundario decorativo esquina derecha */}
      <div className="absolute bottom-0 right-0 -mr-24 -mb-24 pointer-events-none select-none">
        <img
          src="/images/logo/fundes.png"
          alt=""
          className="w-[400px] h-auto object-contain opacity-[0.20] blur-md rotate-[15deg]"
        />
      </div>

      {/* Top Left Logo Branding */}
      <div className="absolute top-8 left-8 flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2.5 transition-transform hover:scale-105">
          <img
            width={40}
            height={40}
            src="/images/logo/fundes.png"
            alt="Logo"
            className="w-10 h-10 object-contain"
          />
          <span className="text-xl font-bold tracking-tight text-gray-800 dark:text-white/90">
            <span className="text-black">FU</span>
            <span className="text-red-600">ND</span>
            <span className="text-yellow-400">ES</span>
          </span>
        </Link>
      </div>

      {/* Main Content Card Container */}
      <div className="relative z-10 w-full max-w-[480px]">
        {children}
      </div>

      {/* Footer Info */}
      <div className="absolute bottom-6 w-full px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-medium text-gray-400 dark:text-gray-500">
        <p>© 2026 FUNDES. Derechos Reservados.</p>
        <div className="flex items-center gap-6">
          <Link to="#" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">Terminos y Condiciones</Link>
          <Link to="#" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">Politica de Privacidad</Link>
        </div>
      </div>

      {/* Theme Toggler */}
      <div className="fixed z-50 bottom-6 right-6">
        <ThemeTogglerTwo />
      </div>
    </div>
  );
}

