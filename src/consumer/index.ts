import { AssetsParameters } from './assets'
import { application } from './application'
import { HotReload } from './hotreload'
import { draw } from './draw'
import { Assets } from 'pixi.js'

type ConsumerOption = {
  assets: () => Promise<AssetsParameters>,
  fonts: { name: string, url: string }[],
  images: { url: string }[]
  port: number
}

const main = async (opts: ConsumerOption) => {
  new HotReload({ port: opts.port }).start()
  const app = await application()
  Assets.addBundle('fonts', opts.fonts.map(f => ({
    alias: f.name,
    src: f.url,
    data: { family: f.name }
  })))
  await Assets.loadBundle('fonts')
  const assets = await opts.assets()
  // null 出現以降は無視
  if (assets.indexOf(null) !== -1) {
    assets.splice(assets.indexOf(null))
  }
  await Promise.all(assets.map(async a => await draw(app, a!)))
}

export = main
