import { defineConfig } from 'tsup'

export default defineConfig({
  clean: true,
  entry: {
    index: 'src/index.ts',
    web: 'src/web/index.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  shims: true,
  treeshake: true,
  external: ['vite', 'esbuild'],
})
