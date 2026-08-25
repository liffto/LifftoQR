import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Stop the compiled stylesheet from blocking the first paint.
 *
 * A <link rel="stylesheet"> in the head halts *all* rendering until it
 * arrives — including the inline boot shell in index.html, which exists
 * precisely to give people something to look at while the app loads. Measured
 * on production: the stylesheet ran 430ms→642ms and first paint did not
 * happen until 696ms, so the shell never got to do its job.
 *
 * This is the shape critical-CSS extraction takes in a single-page app. The
 * usual technique inlines the above-the-fold rules and defers the rest, but
 * here the served HTML has an empty #root — there is no above-the-fold markup
 * to extract from, because React has not run yet. The boot shell *is* the
 * first screen, its CSS is already inline, and everything else can arrive
 * without holding up paint.
 *
 * rel=preload as=style rather than the media="print" trick: both avoid
 * blocking, but preload keeps the request at high priority instead of
 * dropping it to the bottom of the queue. onload swaps it to a real
 * stylesheet; <noscript> covers browsers that would otherwise never run it.
 */
function nonBlockingStylesheet() {
  return {
    name: 'liffto:non-blocking-stylesheet',
    enforce: 'post',
    apply: 'build',
    transformIndexHtml(html) {
      return html.replace(
        /<link rel="stylesheet"([^>]*?)href="([^"]+\.css)"([^>]*)>/g,
        (_match, before, href, after) =>
          `<link rel="preload" as="style"${before}href="${href}"${after} onload="this.onload=null;this.rel='stylesheet'">` +
          `<noscript><link rel="stylesheet"${before}href="${href}"${after}></noscript>`,
      )
    },
  }
}

export default defineConfig({
  plugins: [react(), nonBlockingStylesheet()],
  build: {
    rollupOptions: {
      output: {
        // Split the dependencies out of the app chunk. Everything is still
        // loaded up front, so this changes nothing about the first visit —
        // what it fixes is every visit after a deploy. As one chunk, editing
        // a single component invalidated all 636KB; split, the vendor code
        // keeps its hash and stays cached, and only the app chunk is refetched.
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          qr: ['qr-code-styling'],
          data: ['@tanstack/react-query', 'axios'],
          icons: ['lucide-react', 'react-icons/fa', 'react-icons/fa6'],
        },
      },
    },
  },
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://liffto-qr.vercel.app',
        changeOrigin: true,
      },
    },
  },
})
