import { Application } from 'pixi.js'
import { mode } from './mode'

export const application = () => {
  return (mode() === 'view')
    ? new Application({
      backgroundColor: 0x000000,
      preserveDrawingBuffer: true,
      antialias: true
    })
    : new Application({
      backgroundAlpha: 0,
      preserveDrawingBuffer: true,
      antialias: true
    })
}
