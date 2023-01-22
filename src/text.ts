import { OutlineFilter } from 'pixi-filters'
import { Container, Text, TextStyle } from 'pixi.js'
import { SingleFrameAssets } from './consumer/assets'

const margin = 6

const createText = (opts: {
  text: string; size: number; font?: string, color?: number; outlineColor?: number
}): Container => {
  const container = new Container()
  const style = new TextStyle({
    fontFamily: opts.font ?? 'sans-serif',
    fontSize: opts.size
  })
  const text = new Text(opts.text, style)
  text.style.fill = opts.color ?? 0x000000
  text.filters = [new OutlineFilter(opts.size / 8, opts.outlineColor ?? 0xffffff, 1)]
  text.localTransform
    .translate(margin + 1, margin)
  container.addChild(text)
  return container
}

export const createLabel = (opts: {
  name: string; text: string; size: number; font?: string, color?: number; scaleX?: number;
}): SingleFrameAssets => {
  const container = createText(opts)
  const text = container.children[0] as Text
  text.localTransform.translate(margin, 0)
  return {
    name: opts.name,
    data: container,
    width: text.width * (opts.scaleX ?? 1.0) + margin * 4,
    height: text.height + margin * 2
  }
}
