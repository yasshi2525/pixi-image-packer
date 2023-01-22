import { command } from './command'
import * as fs from 'fs'
import path from 'path'
import * as os from 'os'
import { SourceCompiler } from './compiler'
import { RenderServer } from './server'
import { Crawler } from './crawler'

const main = async () => {
  const disposers: (() => Promise<void>)[] = []
  const args = command()
  const dispose = async () => {
    console.log(`disposing... (${disposers.length})`)
    while (disposers.length > 0) {
      const fn = disposers.pop()!
      await fn()
    }
    console.log('disposed')
  }

  try {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pixi-image-packer-cli'))
    console.log(`created tmpdir "${tmpDir}".`)
    disposers.push(async () => {
      if (fs.existsSync(tmpDir)) {
        fs.rmSync(tmpDir, { recursive: true })
        console.log(`removed tmpdir "${tmpDir}".`)
      }
      await Promise.resolve()
    })

    const compiler = new SourceCompiler({
      srcPath: args.srcFile as string,
      outPath: tmpDir
    })
    await compiler.start()
    disposers.push(compiler.getDisposer())

    const server = new RenderServer({
      sigHandlers: disposers,
      bundlePath: compiler.getBundlePath(),
      fontDirs: args.fontDir ? [args.fontDir] : [],
      imageDir: args.imageDir ? [args.imageDir] : [],
      port: args.port,
      lang: args.lang,
      title: args.title
    })
    await server.start()
    disposers.push(server.getDisposer())
    compiler.addBundleWatcher(() => server.reload())

    const crawler = new Crawler({ outPath: args.outDir, port: args.port })
    compiler.addBundleWatcher(() => crawler.download())

    console.log('waiting...')
    await new Promise<void>(resolve => {
      process.on('SIGINT', () => {
        setTimeout(() => process.exit(1), 30 * 1000).unref()
        console.log('interrupted')
        new Promise<void>(resolve => {
          dispose().then(() => {
            console.log('all disposer was ended')
            resolve()
          })
        }).then(() => {
          console.log('end waiting')
          resolve()
        })
      })
    })
  } finally {
    console.log('finalized')
    await dispose()
  }
}

export = main
