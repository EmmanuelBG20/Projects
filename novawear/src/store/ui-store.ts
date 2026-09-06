import { create } from "zustand";

interface UIState {
  isCartOpen: boolean;
  isMobileMenuOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleMobileMenu: (open?: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isCartOpen: false,
  isMobileMenuOpen: false,
  openCart: () => set({ isCartOpen: true }),
  closeCart: () => set({ isCartOpen: false }),
  toggleMobileMenu: (open) => set((s) => ({ isMobileMenuOpen: open ?? !s.isMobileMenuOpen })),
}));
