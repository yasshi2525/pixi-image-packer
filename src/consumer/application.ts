import { Application } from 'pixi.js'
import { mode } from './mode'

export const application = async () => {
  const app = new Application()
  if (mode() === 'view') {
    await app.init({
      backgroundColor: 0x000000,
      preserveDrawingBuffer: true,
      antialias: true
    })
  } else {
    await app.init({
      backgroundAlpha: 0,
      preserveDrawingBuffer: true,
      antialias: true
    })
  }
  app.stage.eventMode = 'none' // bug? https://github.com/pixijs/pixijs/issues/9495
  return app
}
