# string-diff-viewer

Compare two string and generate human-friendly output to stdout (based on [git-split-diffs](https://github.com/banga/git-split-diffs))

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
  console.log( await format( diffs ) )
} )()
```

# Related

- [git-split-diffs](https://github.com/banga/git-split-diffs) - GitHub style split diffs in your terminal

# License

MIT
