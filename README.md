# string-diff-viewer

Compare two strings with good-lookin' diffs (from [git-split-diffs](https://github.com/banga/git-split-diffs)) in your terminal

<img src="screenshot.jpg" width="650">

# Installation

```bash
npm i string-diff-viewer
```

# Usage

```js
const { diff } = require( 'string-diff-viewer' )

diff( oldStr, newStr ).then( console.log )
```

# Related

- [git-split-diffs](https://github.com/banga/git-split-diffs) - GitHub style split diffs in your terminal

# License

MIT
