import path from 'node:path'
import execa from 'execa'
import tempy from 'tempy'
import fse from 'fs-extra'
import { transform } from 'git-split-diffs-api'
import { uid } from 'uid/single'

async function generateGitDiff( oldSource, newSource, language = '' ) {
  // remove newline tip from git
  if ( !oldSource.endsWith( '\n' ) && !newSource.endsWith( '\n' ) ) {
    oldSource = oldSource + '\n'
    newSource = newSource + '\n'
  }

  const filename = `${uid()}.${language}`

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
  
  // replace [uid].[lang] to displayFilename
  return formatted.replace(gitDiff.replacement, options.displayFilename ?? '')
}

async function diff(oldSource, newSource, options = {}) {
  const language = options.language ?? ''
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
