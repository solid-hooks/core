import solid from 'vite-plugin-solid'
import { defineConfig } from 'vitest/config'

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
