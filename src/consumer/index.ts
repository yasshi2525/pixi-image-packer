import { AssetsParameters } from './assets.js'
import { application } from './application.js'
import { HotReload } from './hotreload.js'
import { draw } from './draw.js'
import { Assets } from 'pixi.js'

type ConsumerOption = {
  assets: () => AssetsParameters | Promise<AssetsParameters>,
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

export default main
