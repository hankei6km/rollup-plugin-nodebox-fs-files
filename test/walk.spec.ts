import { describe, expect, it } from 'vitest'
import { makeFilesFiter } from '../src/files'
import { walk } from '../src/walk.js'

describe('walk()', () => {
  it('should walk a directory', async () => {
    const filesFile = makeFilesFiter([])
    const files: Record<string, string> = {}
    for await (const [file, filePathInFiles] of walk(
      filesFile,
      './test/fixtures/walk',
      []
    )) {
      files[file] = filePathInFiles
    }
    expect(files).toEqual({
      'test/fixtures/walk/index.js': 'index.js',
      'test/fixtures/walk/src/lib.js': 'src/lib.js',
      'test/fixtures/walk/misc/test_misc.txt': 'misc/test_misc.txt',
      'test/fixtures/walk/public/image.png': 'public/image.png'
    })
  })
  it('should respect a custom filter', async () => {
    const filesFile = makeFilesFiter(['**/misc/**'])
    const files: Record<string, string> = {}
    for await (const [file, filePathInFiles] of walk(
      filesFile,
      './test/fixtures/walk',
      []
    )) {
      files[file] = filePathInFiles
    }
    expect(files).toEqual({
      'test/fixtures/walk/index.js': 'index.js',
      'test/fixtures/walk/src/lib.js': 'src/lib.js',
      'test/fixtures/walk/public/image.png': 'public/image.png'
    })
  })
  it('should throw a error when pass a not exist directory', async () => {
    const filesFile = makeFilesFiter([])
    const files: Record<string, string> = {}
    await expect(async () => {
      for await (const [file, filePathInFiles] of walk(
        filesFile,
        './test/fixtures/not-exist',
        []
      )) {
        files[file] = filePathInFiles
      }
    }).rejects.toThrow()
  })
})
