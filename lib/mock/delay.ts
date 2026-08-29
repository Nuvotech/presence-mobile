// Small artificial delay so mock-mode loading states (spinners,
// pull-to-refresh) behave visibly like a real network call would.
export const mockDelay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));
