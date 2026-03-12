// store/useModalStore.ts
import { create } from "zustand";

interface ModalState {
  size: "sm" | "md" | "lg";
  isOpen: boolean;
  view: React.ReactNode | null;
  title: string;
  footer: React.ReactNode | null;
  formId: string;
  isLoading: boolean;
  show: (
    view: React.ReactNode,
    options?: {
      size?: "sm" | "md" | "lg";
      title?: string;
      footer?: React.ReactNode;
      formId?: string; // Podemos pasar un ID fijo o dejar que el form lo registre
    },
  ) => void;
  setFormId: (id: string) => void;
  close: () => void;
  toggle: () => void;
  setLoading: (value: boolean) => void;
}

export const useModalStore = create<ModalState>((set) => ({
  size: "lg",
  isLoading: false,
  isOpen: false,
  view: null,
  title: "",
  footer: null,
  formId: "",
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  show: (view, options) =>
    set({
      isOpen: true,
      view,
      size: options?.size || "lg",
      title: options?.title || "",
      footer: options?.footer || null,
      formId: options?.formId || "",
    }),
  setFormId: (id) => set({ formId: id }),
  close: () =>
    set({
      isOpen: false,
      view: null,
      title: "",
      formId: "",
    }),
  setLoading: (value) => set(() => ({ isLoading: value })),
}));
