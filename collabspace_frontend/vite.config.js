import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "tailwindcss";

export default defineConfig({
  define: {
    'process.env': {},
    global: "window",
  },
  plugins: [react({
    fastRefresh: true,
  })],
  css: {
    postcss: {
        plugins: [tailwindcss()],
    },
  },
  envPrefix: 'VITE_', // Explicitly set the default prefix (optional if you haven't changed it)
})