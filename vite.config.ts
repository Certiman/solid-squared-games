import { resolve } from 'path'
import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import UnocssPlugin from '@unocss/vite';
import dts from 'vite-plugin-dts'

const __dirname =`C:\\Users\\maart\\Programming\\solid-squared-games\\`

export default defineConfig({
  plugins: [
    solidPlugin(),
    UnocssPlugin({
      // your config or in uno.config.ts
    }),
    dts(),
  ],
  server: {
    port: 3000,
  },
  build: {
    target: 'esnext',
    lib: {
      entry: resolve(__dirname, 'src/index.tsx'),
      name: 'MyLib',
      formats: ['es'],
      fileName: 'my-lib'
    }
  },
});