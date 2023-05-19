import { describe, expect, it } from 'vitest'
import {
  defultBinaryFile,
  defultExcludeFrom,
  makeBinaryFilterOptsInclude,
  makeFilesFilterOptsExclude
} from '../src/files.js'

describe('makeFilesFilterOptsExclude()', () => {
  it('sould returns default', () => {
    expect(makeFilesFilterOptsExclude()).toEqual(defultExcludeFrom)
    expect(makeFilesFilterOptsExclude('')).toEqual(defultExcludeFrom)
  })
  it('sould appends a string', () => {
    expect(makeFilesFilterOptsExclude('**/test/**spec*')).toEqual([
      ...defultExcludeFrom,
      '**/test/**spec*'
    ])
  })
  it('sould join a string array', () => {
    expect(
      makeFilesFilterOptsExclude(['**/test/**spec*', '**/misc/**'])
    ).toEqual([...defultExcludeFrom, ...['**/test/**spec*', '**/misc/**']])
  })
})

describe('makeBinaryFilterOptsInclude()', () => {
  it('sould returns default', () => {
    expect(makeBinaryFilterOptsInclude()).toEqual(defultBinaryFile)
    expect(makeBinaryFilterOptsInclude('')).toEqual(defultBinaryFile)
  })
  it('sould appends a string', () => {
    expect(makeBinaryFilterOptsInclude('**/*.mp4')).toEqual([
      ...defultBinaryFile,
      '**/*.mp4'
    ])
  })
  it('sould join a string array', () => {
    expect(makeBinaryFilterOptsInclude(['**/*.mp4', '**/*.mp3'])).toEqual([
      ...defultBinaryFile,
      ...['**/*.mp4', '**/*.mp3']
    ])
  })
})
