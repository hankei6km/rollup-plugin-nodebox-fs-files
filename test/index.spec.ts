import { rollup } from 'rollup'
import * as vite from 'vite'
import { describe, expect, it } from 'vitest'
import type { NodeboxFsFilesOptions } from '../src/index.js'
import { nodeboxFsFiles } from '../src/index.js'

describe('NodeboxFsFilesOptions', () => {
  it('should be exported', () => {
    const opts: NodeboxFsFilesOptions = {
      from: 'from',
      insertTo: 'insertTo',
      excludeFrom: 'excludeFrom'
    }
    expect(opts).toBeTruthy()
  })
})

describe('rollup-plugin-nodebox-fs-files', () => {
  const expectFiles = () =>
    JSON.stringify({
      'index.js': "console.log('dummy')\n",
      'misc/test_misc.txt': 'misc data\n',
      'src/lib.js': "export const dummy = 'dummy'\n",
      'public/image.png': Buffer.from('dummy file\n')
    })

  it('should converts fixtures/walk to an exported object', async () => {
    await rollup({
      input: 'test/fixtures/src/index.mjs',
      plugins: [
        nodeboxFsFiles({
          from: 'test/fixtures/walk',
          insertTo: 'test/fixtures/src/files.mjs'
        })
      ]
    })
      .then((bundle) => bundle.generate({ format: 'iife', name: 'files' }))
      .then((res) => {
        const files = new Function(`${res.output[0].code}; return files`)()
        expect(files).toEqual(JSON.parse(expectFiles()))
      })
  })

  it('should converts fixtures/walk to an exported object in vite environment', async () => {
    const result = await vite.build({
      logLevel: 'silent',
      root: 'test/fixtures/src',
      plugins: [
        nodeboxFsFiles({
          from: 'test/fixtures/walk',
          insertTo: 'test/fixtures/src/files.mjs'
        })
      ],
      build: {
        lib: {
          entry: 'index.mjs',
          formats: ['iife'],
          name: 'files'
        }
      }
    })
    // Check if the result is vite.Rollup.RollupOutput[] (How to make type guards work?)
    expect(result).toBeInstanceOf(Array)
    if (Array.isArray(result)) {
      const files = new Function(`${result[0].output[0].code}; return files`)()
      expect(files).toEqual(JSON.parse(expectFiles()))
    } else {
      throw new Error('result is not Array')
    }
  })

  it('should exclide misc/', async () => {
    const ex = JSON.parse(expectFiles())
    delete ex['misc/test_misc.txt']
    await rollup({
      input: 'test/fixtures/src/index.mjs',
      plugins: [
        nodeboxFsFiles({
          from: 'test/fixtures/walk',
          insertTo: 'test/fixtures/src/files.mjs',
          excludeFrom: '**/misc/**'
        })
      ]
    })
      .then((bundle) => bundle.generate({ format: 'iife', name: 'files' }))
      .then((res) => {
        const files = new Function(`${res.output[0].code}; return files`)()
        expect(files).toEqual(ex)
      })
  })

  it('should reject when from is not specified', async () => {
    await expect(async () =>
      rollup({
        input: 'test/fixtures/src/index.mjs',
        plugins: [
          nodeboxFsFiles({
            insertTo: 'test/fixtures/src/files.mjs'
          } as any)
        ]
      })
    ).rejects.toThrow('from option should be specified')
  })

  it('should reject when insertTo is not specified', async () => {
    await expect(async () =>
      rollup({
        input: 'test/fixtures/src/index.mjs',
        plugins: [
          nodeboxFsFiles({
            from: 'test/fixtures/walk'
          } as any)
        ]
      })
    ).rejects.toThrow('insertTo option should be specified')
  })

  it('should reject when feom is not exist', async () => {
    await expect(async () =>
      rollup({
        input: 'test/fixtures/src/index.mjs',
        plugins: [
          nodeboxFsFiles({
            from: 'test/fixtures/not_exist',
            insertTo: 'test/fixtures/src/files.mjs'
          })
        ]
      })
    ).rejects.toThrow('ENOENT: no such file or directory')
  })
})
