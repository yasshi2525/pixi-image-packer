import { command } from './command.js'
import fs from 'fs'
import path from 'path'
import os from 'os'
import { SourceCompiler } from './compiler.js'
import { RenderServer } from './server.js'
import { Crawler } from './crawler.js'
import { compress } from './compress.js'

export const sync = async (args: ReturnType<typeof command>) => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pixi-image-packer-cli'))
  console.log(`created tmpdir "${tmpDir}".`)

  const compiler = new SourceCompiler({
    srcPath: args.srcFile as string,
    outPath: tmpDir
  })
  await compiler.build()

  const server = new RenderServer({
    bundlePath: compiler.getBundlePath(),
    fontDirs: args.fontDir ? [args.fontDir] : [],
    imageDir: args.imageDir ? [args.imageDir] : [],
    port: args.port,
    lang: args.lang,
    title: args.title
  })
  await server.start()

  const crawler = new Crawler({
    outPath: args.outDir,
    port: args.port,
    timeout: args.timeout,
    onlyCreate: args.onlyCreate
  })
  await crawler.download()

  console.log('compressing...')
  await compress(args.outDir)
  console.log('compressed')

  await server.stop()
  fs.rmSync(tmpDir, { recursive: true })
  console.log(`removed tmpdir "${tmpDir}".`)
}
