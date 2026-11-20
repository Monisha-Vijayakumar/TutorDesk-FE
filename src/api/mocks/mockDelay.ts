// DEV ONLY — makes mock responses feel like a real network call so loading states show.
const MOCK_DELAY_MS = 500

export const waitForMockDelay = (): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS))
}
