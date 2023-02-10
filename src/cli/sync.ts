import { command } from './command'
import fs from 'fs'
import path from 'path'
import os, { cpus } from 'os'
import { SourceCompiler } from './compiler'
import { RenderServer } from './server'
import { Crawler } from './crawler'
import { ImagePool } from '@squoosh/lib'

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
  const imagePool = new ImagePool(cpus().length)
  await Promise.all(fs.readdirSync(args.outDir).map(async file => {
    const image = imagePool.ingestImage(fs.readFileSync(path.join(args.outDir, file)))
    await image.encode({ oxipng: { level: 85 } })
    const result = image.encodedWith.oxipng
    if (result) {
      fs.writeFileSync(path.join(args.outDir, file), result.binary)
    }
  }))
  await imagePool.close()
  console.log('compressed')

  await server.stop()
  fs.rmSync(tmpDir, { recursive: true })
  console.log(`removed tmpdir "${tmpDir}".`)
}
