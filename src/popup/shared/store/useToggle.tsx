import { create } from "zustand";

interface ToggleType {
  active: boolean;
  setActive: (active: boolean) => void;
}

export const useToggle = create<ToggleType>((set) => ({
  active: false,
  setActive: (active: boolean) => set({ active }),
}));
