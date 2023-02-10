import { AssetsParameters } from './assets'
import { application } from './application'
import { HotReload } from './hotreload'
import { draw } from './draw'
import { Application } from 'pixi.js'

type ConsumerOption = {
  assets: (app: Application) => Promise<AssetsParameters>,
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
  const app = application()
  const assets = await opts.assets(app)
  for (let i = 0; i < assets.length; i++) {
    const a = assets[i]
    if (a == null) {
      return
    }
    draw(app, a)
  }
}

export = main
