import { useEffect, ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  children: ReactNode;
  showCloseButton?: boolean;
  isFullscreen?: boolean;
}

const ModalHeader = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <div className={`px-6 py-4 border-b border-gray-100 dark:border-gray-800 ${className}`}>
    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{children}</h3>
  </div>
);

const ModalBody = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <div className={`p-6 flex-1 ${className}`}>{children}</div>
);

const ModalFooter = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <div className={`px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3 ${className}`}>
    {children}
  </div>
);

export const Modal = ({
  isOpen,
  onClose,
  children,
  className = "",
  showCloseButton = true,
  isFullscreen = false,
}: ModalProps) => {

  // Bloqueo de scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  if (!isOpen) return null;

  const contentClasses = isFullscreen
    ? "w-full h-full min-h-screen"
    : "relative w-full max-w-2xl mx-4 rounded-3xl bg-white dark:bg-gray-900 shadow-2xl overflow-hidden";

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      {/* Overlay (no cierra modal al hacer clic fuera) */}
      <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" />

      {/* Modal Container */}
      <div
        className={`${contentClasses} flex flex-col transform transition-all ${className}`}
      >
        {showCloseButton && (
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-all hover:bg-gray-200 hover:text-gray-800 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}

        {children}
      </div>
    </div>
  );
};

Modal.Header = ModalHeader;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;