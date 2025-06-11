import esbuild, { BuildContext, BuildOptions, Loader } from 'esbuild'
import path from 'path'
import * as fs from 'fs'
import { FSWatcher } from 'fs'

type SourceCompilerOptions = {
  srcPath: string
  outPath: string
}

const ENTRY_FILENAME = 'entry.ts'
const JS_FILENAME = 'index.js'

export class SourceCompiler {
  private readonly srcPath: string
  private readonly outPath: string
  private context?: BuildContext
  private watcher?: FSWatcher
  private readonly bundleWatchers: (() => void)[]

  constructor (opts: SourceCompilerOptions) {
    this.srcPath = opts.srcPath
    this.outPath = opts.outPath
    this.bundleWatchers = []
  }

  async build () {
    this.createEntryFile()
    await esbuild.build(this.getBuildOptions())
  }

  async watch () {
    this.createEntryFile()
    // 空ファイルを作らないとファイルをwatchできない
    fs.writeFileSync(this.getBundlePath(), '')
    this.context = await esbuild.context(this.getBuildOptions())
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

  getBuildOptions (): BuildOptions {
    return {
      entryPoints: [this.getEntryPath()],
      outfile: this.getBundlePath(),
      bundle: true,
      format: 'esm',
      plugins: [{
        name: 'virtual-src-path-resolver',
        setup: (build) => {
          build.onResolve({ filter: /^__PROVIDER_PATH__$/ }, () => ({
            path: this.srcPath,
            namespace: 'absolute-path'
          }))
          build.onResolve({ filter: /^__CONSUMER_PATH__$/ }, () => ({
            path: this.getConsumerPath(),
            namespace: 'absolute-path'
          }))
          build.onResolve({ filter: /^pixi\.js$/ }, args => ({
            path: require.resolve('pixi.js')
          }))
          build.onLoad({ filter: /.*/, namespace: 'absolute-path' }, args => ({
            resolveDir: path.dirname(args.path),
            contents: fs.readFileSync(args.path, 'utf-8'),
            loader: path.extname(args.path).slice(1) as Loader
          }))
        }
      }]
    }
  }

  getEntryPath () {
    return path.join(this.outPath, ENTRY_FILENAME)
  }

  getConsumerPath () {
    return path.join(__dirname, '..', 'consumer', 'index.js')
  }

  getBundlePath () {
    return path.join(this.outPath, JS_FILENAME)
  }

  addBundleWatcher (cb: () => void) {
    this.bundleWatchers.push(cb)
  }

  createEntryFile () {
    fs.writeFileSync(this.getEntryPath(), this.getEntryTemplate())
  }

  getEntryTemplate () {
    return `
import producer from '__PROVIDER_PATH__'
import consume, { ConsumerOption } from '__CONSUMER_PATH__'
export = async (opts: Omit<ConsumerOption, 'assets'>) => {
  await consume({
    ...opts,
    assets: producer
  })
}`
  }
}
