import * as esbuild from 'npm:esbuild'
import { denoPlugins } from 'jsr:@luca/esbuild-deno-loader'
import { serveDir } from 'jsr:@std/http/file-server'

const now = new Date()
const versionCmd = new Deno.Command('git', {
  args: ['rev-parse', '--short', 'HEAD'],
})
const { code, stdout, stderr } = await versionCmd.output()

console.assert(code === 0)
const version = new TextDecoder().decode(stdout).trim()

if (code !== 0) {
  console.error('Error in build.ts:', new TextDecoder().decode(stderr))
}

await esbuild.build({
  banner: {
    js: `// ==UserScript==
// @name        Copy Linear.app branch name
// @namespace   Violentmonkey Scripts
// @match       https://linear.app/*/issue/*/*
// @grant       none
// @version     ${version}
// @author      -
// @description ${now.toISOString()}
// @icon        https://static.linear.app/client/assets/favicon.hash-Ch-xRaRR.svg
// @updateURL   https://raw.githubusercontent.com/shiftgeist/deno-userscript-copy-linear-branch-name/refs/heads/main/dist/index.js
// @downloadURL https://raw.githubusercontent.com/shiftgeist/deno-userscript-copy-linear-branch-name/refs/heads/main/dist/index.js
// ==/UserScript==`,
  },
  plugins: denoPlugins(),
  entryPoints: ['./main.ts'],
  outfile: './dist/index.js',
  bundle: true,
  format: 'cjs',
})

const dev = Deno.env.get('NODE_ENV') === 'dev'

if (dev) {
  Deno.serve(req => {
    return serveDir(req, {
      fsRoot: './dist',
    })
  })
}
