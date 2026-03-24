import { create } from "zustand";

type AlertVariant = "success" | "info" | "warning" | "error";

interface AlertOptions {
  title: string;
  description: string;
  cancelText?: string;
  actionText?: string;
  variant?: AlertVariant;
  onAction?: () => Promise<void> | void; // La función a ejecutar al aceptar
}

interface AlertState {
  isOpen: boolean;
  isLoading: boolean;
  options: AlertOptions | null;
  // Funciones
  showAlert: (options: AlertOptions) => void;
  closeAlert: () => void;
  setLoading: (val: boolean) => void;
}

export const useAlertStore = create<AlertState>((set) => ({
  isOpen: false,
  isLoading: false,
  options: null,

  showAlert: (options) =>
    set({
      isOpen: true,
      options: {
        variant: "info",
        cancelText: "Cancelar",
        actionText: "Aceptar",
        ...options,
      },
      isLoading: false,
    }),

  closeAlert: () => set({ isOpen: false, options: null, isLoading: false }),
  setLoading: (val) => set({ isLoading: val }),
}));
