import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface OnboardingState {
  // Whether user has completed the initial tour
  hasCompletedTour: boolean;
  // Which tooltips have been dismissed
  dismissedTooltips: string[];
  // Current tour step (for resuming)
  currentTourStep: number;

  // Actions
  completeTour: () => void;
  resetTour: () => void;
  dismissTooltip: (tooltipId: string) => void;
  setTourStep: (step: number) => void;
  isTooltipDismissed: (tooltipId: string) => boolean;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      hasCompletedTour: false,
      dismissedTooltips: [],
      currentTourStep: 0,

      completeTour: () => set({ hasCompletedTour: true, currentTourStep: 0 }),

      resetTour: () => set({ hasCompletedTour: false, currentTourStep: 0, dismissedTooltips: [] }),

      dismissTooltip: (tooltipId: string) =>
        set((state) => ({
          dismissedTooltips: [...state.dismissedTooltips, tooltipId],
        })),

      setTourStep: (step: number) => set({ currentTourStep: step }),

      isTooltipDismissed: (tooltipId: string) =>
        get().dismissedTooltips.includes(tooltipId),
    }),
    {
      name: "offerhub-onboarding",
    }
  )
);
