import { readFileSync, writeFileSync, rmSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { build } from 'vite'

/**
 * Bakes the landing page into its HTML at build time.
 *
 * Run after `vite build`, this does a second, server-targeted build of
 * entry-server.jsx, renders "/" to a string with it, and writes the result into
 * the #root of dist/index.html. A visitor then gets the real page in the first
 * response instead of a spinner that lasts until half a megabyte of JavaScript
 * has downloaded, parsed and run.
 *
 * Two output files, because the routes need different treatment:
 *
 *   index.html  the landing page, with its markup baked in. Served at "/".
 *   app.html    the original empty shell with the boot spinner. Served at
 *               every other path.
 *
 * They cannot be the same file. Vercel rewrites unknown paths to a static
 * file, so if /dashboard were served the prerendered landing page, the browser
 * would paint the landing page before React had a chance to render the
 * dashboard over it. A visible flash of the wrong page — worse than the
 * spinner this is meant to replace. See the rewrite order in vercel.json.
 */

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '..')
const dist = resolve(root, 'dist')
const ssrOut = resolve(root, '.prerender-ssr')

// The route to bake, and the file it becomes. Deliberately just the one: the
// landing page is the only route a stranger arrives at cold with nothing
// cached. Everything else is reached from inside the app, by which point the
// bundle is already there and prerendering would buy nothing.
const ROUTE = '/'

const log = (msg) => process.stdout.write(`prerender: ${msg}\n`)

async function main() {
  log('building server bundle')
  await build({
    root,
    logLevel: 'warn',
    build: {
      ssr: resolve(root, 'src/entry-server.jsx'),
      outDir: ssrOut,
      emptyOutDir: true,
      // The client build already produced the assets that ship. This one is a
      // throwaway used for its exports and deleted below, so there is no point
      // hashing filenames or writing a manifest.
      //
      // manualChunks has to be cleared rather than inherited: a server build
      // leaves dependencies external, and Rollup refuses to place an external
      // module into a manual chunk.
      rollupOptions: {
        output: { entryFileNames: 'entry-server.mjs', manualChunks: undefined },
      },
    },
  })

  const { render } = await import(
    pathToFileURL(resolve(ssrOut, 'entry-server.mjs')).href
  )

  const shell = readFileSync(resolve(dist, 'index.html'), 'utf8')

  // The untouched shell, for every route that is not the landing page. Written
  // first so a failure below cannot leave the app without one.
  writeFileSync(resolve(dist, 'app.html'), shell)
  log('wrote app.html (shell for non-landing routes)')

  log(`rendering ${ROUTE}`)
  const html = render(ROUTE)

  // Swap the boot spinner for the real page, and mark the container so
  // main.jsx knows to hydrate this markup rather than throw it away and start
  // over. Anchored on </body> rather than the module script, which Vite hoists
  // into <head> during the build.
  const rootBlock = /(<div id="root">)([\s\S]*?)(<\/div>\s*<\/body>)/
  if (!rootBlock.test(shell)) {
    throw new Error('could not locate the #root block in dist/index.html')
  }

  const prerendered = shell.replace(
    rootBlock,
    () => `<div id="root" data-prerendered="${ROUTE}">${html}</div>\n  </body>`,
  )

  writeFileSync(resolve(dist, 'index.html'), prerendered)
  rmSync(ssrOut, { recursive: true, force: true })

  const kb = (s) => `${(Buffer.byteLength(s) / 1024).toFixed(0)}KB`
  log(`wrote index.html — ${kb(shell)} shell to ${kb(prerendered)} prerendered`)
}

main().catch((err) => {
  console.error('prerender failed:', err)
  process.exit(1)
})
