import { AssetsParameters } from './assets'
import { application } from './application'
import { HotReload } from './hotreload'
import { draw } from './draw'

type ConsumerOption = {
  assets: () => Promise<AssetsParameters>,
  fonts: { name: string, url: string }[],
  images: { url: string }[]
  port: number
}

const main = async (opts: ConsumerOption) => {
  new HotReload({ port: opts.port }).start()
  await Promise.all(opts.fonts.map(async (f) => {
    const ff = new FontFace(f.name, `url(${f.url})`)
    const loaded = await ff.load()
    document.fonts.add(loaded)
  }))
  await document.fonts.ready
  const app = application();
  (await opts.assets()).forEach(a => draw(app, a))
}

export = main
