import path from 'node:path'
import fs from 'node:fs'
import { diff } from './lib/index.js'

console.log(
  await diff(
    fs.readFileSync(path.join(process.cwd(), 'fixtures/before.js'), 'utf8'),
    fs.readFileSync(path.join(process.cwd(), 'fixtures/after.js'), 'utf8'),
    {
      sideBySide: true,
      theme: 'dark',
      syntaxTheme: 'github-dark',
      language: 'js',
      displayFilename: 'foo/bar.mjs',
      transparentBg: true,
    }
  ),
)