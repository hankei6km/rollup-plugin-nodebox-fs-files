import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import type { PluginImpl } from 'rollup'
import { createFilter, dataToEsm } from '@rollup/pluginutils'
import { walk } from './walk.js'

export const defultExcludeFrom = [
  '**/.DS_Store',
  '**/Thumbs.db',
  '**/.git/**',
  '**/.gitignore',
  '**/.vscode/**',
  '**/node_modules/**',
  '**/dist/**',
  '**/build/**',
  '**/out/**'
]

export const defultBinaryFile = [
  '**/*.png',
  '**/*.jpg',
  '**/*.jpeg',
  '**/*.gif',
  '**/*.ico',
  '**/*.wasm'
]

export type NodeboxFsFilesOptions = {
  from: string
  insertTo: string
  excludeFrom?: string | string[]
  binaryFile?: string | string[]
}

export function makeFilesFilterOptsExclude(
  excludeFrom?: NodeboxFsFilesOptions['excludeFrom']
): Parameters<typeof createFilter>[1] {
  return typeof excludeFrom === 'string' && excludeFrom.length > 0
    ? [...defultExcludeFrom, excludeFrom]
    : [...defultExcludeFrom, ...(excludeFrom || [])]
}

export function makeBinaryFilterOptsInclude(
  binaryFile?: NodeboxFsFilesOptions['binaryFile']
): Parameters<typeof createFilter>[1] {
  return typeof binaryFile === 'string' && binaryFile.length > 0
    ? [...defultBinaryFile, binaryFile]
    : [...defultBinaryFile, ...(binaryFile || [])]
}

export function makeFilesFiter(
  excludeFrom?: NodeboxFsFilesOptions['excludeFrom']
): ReturnType<typeof createFilter> {
  return createFilter([], makeFilesFilterOptsExclude(excludeFrom))
}
export function makebinaryFilesFiter(
  binaryFile?: NodeboxFsFilesOptions['binaryFile']
): ReturnType<typeof createFilter> {
  return createFilter(makeBinaryFilterOptsInclude(binaryFile), [])
}

export const nodeboxFsFiles: PluginImpl<NodeboxFsFilesOptions> =
  function nodeboxFsFiles(opts?: NodeboxFsFilesOptions) {
    if (!opts?.from) {
      throw new Error('from option should be specified')
    }
    if (!opts?.insertTo) {
      throw new Error('insertTo option should be specified')
    }

    const filter = createFilter(opts.insertTo, [])
    const filesFilter = makeFilesFiter(opts.excludeFrom)
    const binaryFilter = makebinaryFilesFiter(opts.binaryFile)
    let curFiles: Record<string, any> = {}

    return {
      name: 'nodebox-fs-files',

      async buildStart() {
        curFiles = {}
        const dir = resolve('.', opts.from)
        for await (const [entry, relEntry] of walk(filesFilter, dir, [])) {
          const content = await readFile(entry)
          curFiles[relEntry] = binaryFilter(entry)
            ? content
            : content.toString('utf-8')
        }
      },

      async transform(code, id) {
        if (filter(id)) {
          // Once JSON.stringify and parse to make it available in fs.init of Nodebox.
          // It becomes { type: "Buffer", data: [ 97, 98, 99 ] }.
          // If you don't do this, it will be { type: "Buffer", 1: 97, 2: 98, 3: 99 }.
          return dataToEsm(
            { files: JSON.parse(JSON.stringify(curFiles)) },
            {
              compact: false,
              indent: '\t',
              preferConst: false,
              objectShorthand: false,
              namedExports: true
            }
          )
        }
        return null
      }
    }
  }
