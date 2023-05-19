import { opendir } from 'fs/promises'
import { join } from 'node:path'
import { makeFilesFiter } from './files.js'

export async function* walk(
  filesFilter: ReturnType<typeof makeFilesFiter>,
  dir: string,
  filePathInFiles: string[] = []
): AsyncGenerator<[string, string], void, void> {
  for await (const d of await opendir(dir)) {
    const entry = join(dir, d.name)
    if (filesFilter(entry)) {
      if (d.isDirectory()) {
        yield* walk(filesFilter, entry, [...filePathInFiles, d.name])
      } else if (d.isFile()) {
        yield [entry, [...filePathInFiles, d.name].join('/')]
      }
    }
  }
}
