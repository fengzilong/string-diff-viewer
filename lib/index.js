const path = require( 'path' )
const execa = require( 'execa' )
const tempy = require( 'tempy' )
const fse = require( 'fs-extra' )
const { transform } = require( 'git-split-diffs-api' )

async function diff( oldStr, newStr ) {
  // remove newline tip from git
  if ( !oldStr.endsWith( '\n' ) && !newStr.endsWith( '\n' ) ) {
    oldStr = oldStr + '\n'
    newStr = newStr + '\n'
  }

  const tempfile = tempy.file( { name: 'diff' } )

  const execaOptions = {
    cwd: path.dirname( tempfile ),
  }

  await execa.command( 'git init', execaOptions )

  await fse.writeFile( tempfile, oldStr, 'utf8' )
  await execa.command( 'git add -f ' + tempfile, execaOptions )
  await execa.command( 'git commit --allow-empty -m "old"', execaOptions )

  await fse.writeFile( tempfile, newStr, 'utf8' )
  await execa.command( 'git add -f ' + tempfile, execaOptions )

  const subprocess = execa.command(
    `git diff --cached --ignore-space-at-eol --no-ext-diff`,
    execaOptions
  )

  const { stdout } = await subprocess

  await fse.remove( tempfile )

  return stdout
}

async function format( diffs = '', options = {} ) {
  return await transform( diffs, {
    // load language grammer in shiki is slow
    disableSyntaxHighlight: true,
    forceSideBySide: true,
    ...options
  } ) || diffs || ''
}

exports.diff = diff
exports.format = format
