# rollup-plugin-nodebox-fs-files

Converts file to [Nodebox](https://sandpack.codesandbox.io/docs/advanced-usage/nodebox) [files](https://github.com/codesandbox/nodebox-runtime/blob/main/packages/nodebox/api.md#nodeboxfsinitfiles).

## Installation

```shell
npm install --save-dev @hankei6km/rollup-plugin-nodebox-fs-files
```

## Usage

```js
// rollup.config.js
import nodeboxFsFiles from '@hankei6km/rollup-plugin-nodebox-fs-files'

export default {
  input: 'src/index.mjs',
  plugins: [
    nodeboxFsFiles({
      from: 'box-src/proj',
      insertTo: 'src/files.mjs'
    })
  ]
}
```

from

```
box-src/proj/
├── index.js
├── node_modules
│   └── ...
├── public
│   └── image.png
└── src
    └── lib.js
```

to

```js
// src/files.mjs
export const files = {
  'index.js': 'console.log(...;\n',
  'public/image.png': { type: 'Buffer', data: [97, 98, 99 /*...*/] },
  'src/lib.js': 'export default ...;\n'
}
```

> NOTE: Define a temporary `export` to bypass a linting error.
>
> ```js
> // src/files.mjs
> export const files = {}
> ```

## Examples

`misc` directory is ignored.

```js
// rollup.config.js
import nodeboxFsFiles from '@hankei6km/rollup-plugin-nodebox-fs-files'

export default {
  input: 'src/index.mjs',
  plugins: [
    nodeboxFsFiles({
      from: 'box-src/proj',
      insertTo: 'src/files.mjs',
      excludeFrom: '**/misc/**'
    })
  ]
}
```

converts `.mp4` and `.mp3` files as binary.

```js
// rollup.config.js
import nodeboxFsFiles from '@hankei6km/rollup-plugin-nodebox-fs-files'

export default {
  input: 'src/index.mjs',
  plugins: [
    nodeboxFsFiles({
      from: 'box-src/proj',
      insertTo: 'src/files.mjs',
      binaryFile: ['**/*.mp4', '**/*.mp3']
    })
  ]
}
```

vite example.

```js
// vite.config.js
import { defineConfig } from 'vite'
import { nodeboxFsFiles } from '@hankei6km/rollup-plugin-nodebox-fs-files'

export default defineConfig({
  plugins: [
    nodeboxFsFiles({
      from: 'box-src/proj',
      insertTo: 'src/files.mjs'
    })
  ]
})
```

## License

MIT License

Copyright (c) 2023 hankei6km
