import { AssetsParameters } from './assets'
import { application } from './application'
import { HotReload } from './hotreload'
import { draw } from './draw'
import { Assets, BitmapFont } from 'pixi.js'

type ConsumerOption = {
  assets: () => Promise<AssetsParameters>,
  fonts: { name: string, url: string }[],
  images: { url: string }[]
  port: number
}

const main = async (opts: ConsumerOption) => {
  new HotReload({ port: opts.port }).start()
  const app = await application()
  Assets.addBundle('fonts', opts.fonts.map(f => ({ alias: f.name, src: f.url })))
  await Assets.loadBundle('fonts')
  for (const font of opts.fonts) {
    BitmapFont.install({ name: `${font.name}-bitmap`, style: { fontFamily: font.name } })
  }
  const assets = await opts.assets()
  await Promise.all(assets.map(async a => {
    if (a == null) {
      return
    }
    await draw(app, a)
  }))
}

export = main
