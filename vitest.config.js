import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './tests/setup.js',
    css: true,
    env: {
      // A stand-in for the Google OAuth client id, so the sign-in panel renders
      // the path that actually ships. Without one it renders its "not
      // configured" notice instead, and the tests would be checking a state no
      // deployed build is ever in. Not a real credential and never used to
      // reach Google — nothing in the suite leaves jsdom.
      VITE_CLIENT_ID: 'test-client-id.apps.googleusercontent.com',
    },
  },
})
