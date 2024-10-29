import * as esbuild from 'npm:esbuild'
import { denoPlugins } from 'jsr:@luca/esbuild-deno-loader'
import { serveDir } from 'jsr:@std/http/file-server'
import deno_json from './deno.json' with { type: "json" }

const now = new Date()

await esbuild.build({
  banner: {
    js: `// ==UserScript==
// @name        Copy Linear.app branch name
// @namespace   Violentmonkey Scripts
// @match       https://linear.app/*/issue/*/*
// @grant       none
// @version     ${deno_json.version}
// @author      -
// @description ${now.toISOString()}
// @icon        https://static.linear.app/client/assets/favicon.hash-Ch-xRaRR.svg
// @updateURL   https://raw.githubusercontent.com/shiftgeist/deno-userscript-copy-linear-branch-name/refs/heads/main/dist/index.js
// @downloadURL https://raw.githubusercontent.com/shiftgeist/deno-userscript-copy-linear-branch-name/refs/heads/main/dist/index.js
// ==/UserScript==`,
  },
  plugins: denoPlugins(),
  entryPoints: ['./main.ts'],
  outfile: './dist/linear-create-branch.user.js',
  bundle: true,
  format: 'cjs',
})

const dev = Deno.env.get('NODE_ENV') === 'dev'

if (dev) {
  Deno.serve(req =>
    serveDir(req, {
      fsRoot: './dist',
    })
  )
}
