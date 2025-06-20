import { Application, Graphics } from 'pixi.js'
import { MultiFrameAssets, SingleFrameAssets } from './assets'
import { mode } from './mode'
import { application } from './application'

const isMulti = (obj: SingleFrameAssets | MultiFrameAssets): obj is MultiFrameAssets => {
  return 'frames' in obj
}

const grid = (dataset: MultiFrameAssets, alpha: number = 0.75) => {
  const width = dataset.srcWidth
  const height = dataset.srcHeight

  for (let y = 0; y < dataset.height / height; y++) {
    for (let x = 0; x < dataset.width / width; x++) {
      const g = new Graphics()
      g.rect(x * width + 1, y * height + 1, width - 2, height - 2)
      g.stroke({ width: 1, color: 0xffffff, alpha })
      dataset.data.addChild(g)
    }
  }
  return dataset
}

const createDownloadDiv = (app: Application, name: string) => {
  const div = document.createElement('div')
  const image = document.createElement('img')

  image.src = app.canvas.toDataURL()

  const a = document.createElement('a')
  a.append(image)
  a.href = app.canvas.toDataURL()
  a.download = `${name}.png`
  div.appendChild(a)
  return div
}

const createDownloadGlyph = (glyph: Object, name: string) => {
  const a = document.createElement('a')
  a.text = 'glyph'
  a.download = `${name}.json`
  a.href =
    'data:text/json;charset=utf-8,' +
    encodeURIComponent(JSON.stringify(glyph))
  return a
}

export const draw = async (app: Application, asset: SingleFrameAssets | MultiFrameAssets) => {
  if (mode() === 'view' && isMulti(asset)) {
    asset.data = grid(asset).data
  }
  app.stage.addChild(asset.data)
  app.renderer.resize(asset.width, asset.height)
  app.renderer.render(app.stage)
  document.body.appendChild(createDownloadDiv(app, asset.name))
  if (asset.glyph) {
    document.body.appendChild(createDownloadGlyph(asset.glyph, asset.name))
  }
  app.stage.removeChildren()

  if (mode() === 'view' && isMulti(asset)) {
    const appMulti = await application()
    appMulti.renderer.resize(asset.srcWidth, asset.srcHeight)
    let frames = 0
    appMulti.ticker.maxFPS = 30
    appMulti.ticker.add(async () => {
      appMulti.stage.removeChildren()
      appMulti.stage.addChild(await asset.tick(frames))
      appMulti.renderer.render(appMulti.stage)
      frames++
      if (frames >= asset.frames) {
        frames = 0
      }
    })
    document.body.appendChild(appMulti.canvas)
  }
}
