import path from 'node:path'
import execa from 'execa'
import tempy from 'tempy'
import fse from 'fs-extra'
import { transform } from 'git-split-diffs-api'
import { uid } from 'uid/single'
import stripAnsi from 'strip-ansi'
import sliceAnsi from 'slice-ansi'

async function generateGitDiff( oldSource, newSource, language = '' ) {
  // remove newline tip from git
  if ( !oldSource.endsWith( '\n' ) && !newSource.endsWith( '\n' ) ) {
    oldSource = oldSource + '\n'
    newSource = newSource + '\n'
  }

  const filename = `${uid(10)}.${language}`

  const tempfile = tempy.file( { name: filename } )

  const execaOptions = {
    cwd: path.dirname( tempfile ),
  }

  await execa.command( 'git init', execaOptions )

  await fse.writeFile( tempfile, oldSource, 'utf8' )
  await execa.command( 'git add -f ' + tempfile, execaOptions )
  await execa.command( 'git commit --allow-empty -m "old"', execaOptions )

  await fse.writeFile( tempfile, newSource, 'utf8' )
  await execa.command( 'git add -f ' + tempfile, execaOptions )

  const subprocess = execa.command(
    `git diff --cached --ignore-space-at-eol --no-ext-diff`,
    execaOptions
  )

  const { stdout } = await subprocess

  await fse.remove( tempfile )

  return {
    content: stdout,
    replacement: filename,
  }
}

async function format( gitDiff = {}, options = {} ) {
  const transformConfig = {}

  if (options.sideBySide !== false) {
    transformConfig.MIN_LINE_WIDTH = 0
  }

  transformConfig.SYNTAX_HIGHLIGHTING_THEME = options.syntaxTheme ?? ''

  if (options.theme) {
    transformConfig.THEME_NAME = options.theme
  }

  // gitDiff.content contains [uid].[lang]
  // `transform` will use extname to get proper language
  const formatted = await transform(
    gitDiff.content,
    transformConfig,
    options.columns
  ) || gitDiff.content || ''
  
  
  return (
    fixFilenameLine(
      formatted,
      // use this to find the filename line
      gitDiff.replacement,
      // caculate diff width
      options.displayFilename.length - gitDiff.replacement.length
    )
    // replace [uid].[lang] to displayFilename
    .replace(gitDiff.replacement, options.displayFilename)
  )
}

// The line with filename may have no background at its end
// because we replace the filename internally
// git-split-diffs-api fills blank with the width caculated by `[uid].[language]`
// which is not matched with options.displayFilename width
function fixFilenameLine(ansiString, replacement, diffWidth) {
  const lines = ansiString.split('\n')

  return lines
    .map(line => {
      if (line.includes(replacement)) {
        const rawline = stripAnsi(line)

        if (diffWidth === 0) {
          return line
        }
        
        if (diffWidth > 0) {
          // width will be overflow after replacing, we should slice the line
          return sliceAnsi(line, 0, rawline.length - diffWidth)
        }

        // still need more spaces(with bg) to fill the end of line
        const lastCharWithAnsi = sliceAnsi(line, rawline.length - 1, rawline.length)
        return line + lastCharWithAnsi.repeat(Math.abs(diffWidth))
      }

      return line
    }).join('\n')
}

async function diff(oldSource, newSource, options = {}) {
  const language = options.language ?? 'text'
  const theme = options.theme ?? 'dark'
  const syntaxTheme = options.syntaxTheme ?? 'one-dark-pro'
  const displayFilename = options.displayFilename ?? 'diff'
  const sideBySide = options.sideBySide
  const columns = options.columns

  return await format(
    await generateGitDiff(oldSource, newSource, language),
    { sideBySide, theme, syntaxTheme, displayFilename, columns }
  )
}

export {
  diff,
}
