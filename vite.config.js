import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Inline the compiled stylesheet into the HTML.
 *
 * A <link rel="stylesheet"> in the head halts *all* rendering until it
 * arrives — including the inline boot shell in index.html, which exists
 * precisely to give people something to look at while the app loads. Measured
 * on production: the stylesheet ran 430ms→642ms and first paint did not
 * happen until 696ms, so the shell never got to do its job.
 *
 * The obvious fix is rel=preload with an onload handler that swaps it to a
 * real stylesheet. Do not do that here — it was tried and shipped, and it is
 * how you get fifteen seconds of unstyled page on a phone. The swap is a
 * JavaScript callback, so it cannot run until the main thread is free, and
 * the main thread is busy for exactly as long as this app takes to boot:
 * half a megabyte of JS to parse and execute, then six QR codes that render
 * synchronously. The stylesheet had downloaded long before, and sat there
 * unapplied. Any CSS strategy whose final step is a JS callback inherits the
 * blocking it was meant to avoid.
 *
 * Inlining has no such dependency: the rules are in the document, so they
 * apply as the parser reads them. No request, no round trip, no main thread.
 *
 * This is what critical-CSS extraction collapses to in a single-page app. The
 * usual technique inlines the above-the-fold rules and defers the rest, but
 * the served HTML has an empty #root — there is no rendered markup to extract
 * from, because React has not run yet. And at 9KB brotli the whole sheet is
 * smaller than most sites' extracted critical subset, so "the critical part"
 * is all of it.
 *
 * The cost is that 9KB rides on every HTML response instead of being cached
 * separately. That is the right trade here: index.html is served
 * must-revalidate, so it is a conditional request every time anyway, and the
 * page this most affects is the one strangers land on with an empty cache.
 * The .css file stays in the bundle — unreferenced and never requested, but
 * removing it from the output buys nothing.
 */
function inlineStylesheet() {
  return {
    name: 'liffto:inline-stylesheet',
    enforce: 'post',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        if (!ctx?.bundle) return html
        return html.replace(
          /<link[^>]*rel="stylesheet"[^>]*href="([^"]+\.css)"[^>]*>/g,
          (match, href) => {
            const asset = ctx.bundle[href.replace(/^\//, '')]
            if (!asset || typeof asset.source !== 'string') return match
            return `<style>${asset.source}</style>`
          },
        )
      },
    },
  }
}

export default defineConfig({
  plugins: [react(), inlineStylesheet()],
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
