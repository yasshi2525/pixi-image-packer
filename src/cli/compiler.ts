import esbuild, { BuildContext } from 'esbuild'
import path from 'path'
import * as fs from 'fs'
import { FSWatcher } from 'fs'

type SourceCompilerOptions = {
  srcPath: string
  outPath: string
}

const JS_FILENAME = 'producer.js'

export class SourceCompiler {
  private readonly srcPath: string
  private readonly outPath: string
  private context?: BuildContext
  private watcher?: FSWatcher
  private readonly bundleWatchers:(() => void)[]

  constructor (opts: SourceCompilerOptions) {
    this.srcPath = opts.srcPath
    this.outPath = opts.outPath
    this.bundleWatchers = []
  }

  async start () {
    // 空ファイルを作らないとファイルをwatchできない
    fs.writeFileSync(this.getBundlePath(), '')
    this.context = await esbuild.context({
      entryPoints: [this.srcPath],
      outfile: this.getBundlePath(),
      bundle: true,
      format: 'esm'
    })
    await this.context.watch()
    this.watcher = fs.watch(this.getBundlePath(), () => {
      console.log('detected source file changes.')
      this.bundleWatchers.forEach(cb => cb())
    })
    console.log(`watching... "${this.srcPath}"`)
  }

  getDisposer () {
    return async () => {
      this.watcher?.close()
      await this.context?.dispose()
      console.log(`stopped watching "${this.srcPath}"`)
    }
  }

  getBundlePath () {
    return path.join(this.outPath, JS_FILENAME)
  }

  addBundleWatcher (cb: () => void) {
    this.bundleWatchers.push(cb)
  }
}
