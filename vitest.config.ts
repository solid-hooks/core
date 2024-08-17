import { defineConfig } from 'vitest/config'
import solid from 'vite-plugin-solid'

export default defineConfig({
  // @ts-expect-error type check
  plugins: [solid()],
  test: {
    environment: 'jsdom',
  },
  resolve: {
    conditions: ['development', 'browser'],
  },
})
