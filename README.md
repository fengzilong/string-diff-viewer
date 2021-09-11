# string-diff-viewer

Compare two strings with good-lookin' diffs (from [git-split-diffs](https://github.com/banga/git-split-diffs)) in your terminal

<img src="screenshot.jpg" width="650">

# Installation

```bash
npm i string-diff-viewer
```

# Usage

```js
const { diff, format } = require( 'string-diff-viewer' )

;( async () => {
  const diffs = await diff( oldStr, newStr )
  console.log( format( diffs ) )
} )()

```

# Related

- [git-split-diffs](https://github.com/banga/git-split-diffs) - GitHub style split diffs in your terminal

# License

MIT
