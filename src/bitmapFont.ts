import { OutlineFilter } from 'pixi-filters'
import { Container, Text, TextStyle } from 'pixi.js'
import { SingleFrameAssets } from './consumer/assets'

export const createBitmapFont = (
  opts: { name: string; chars: string; color?: number; size: number; font?: string, margin?: number }
): SingleFrameAssets => {
  const margin = opts.margin ?? 0
  const container = new Container()
  const style = new TextStyle({
    fontFamily: opts.font ?? 'sans-serif',
    fontSize: opts.size
  })
  const glyph: { map: {[index: number]: Object}; height: number } = { map: {}, height: 0 }
  opts.chars.split('').forEach((c, idx) => {
    const text = new Text(c === '-' ? '－' : c, style)
    text.style.fill = opts.color ?? 0x000000
    const f1 = new OutlineFilter(5, 0xffffff, 1)
    text.filters = [f1]
    text.localTransform
      .translate(margin, 0)
      .translate((opts.size - text.width) / 2, 0)
      .translate((opts.size + margin * 2) * idx, 0)
    container.addChild(text)
    glyph.map[c.charCodeAt(0)] = {
      x: Math.floor((opts.size + margin * 2) * idx),
      y: 0,
      width: Math.floor(opts.size + margin * 2),
      height: Math.floor(container.height)
    }
  })
  glyph.height = Math.floor(container.height)
  return {
    name: opts.name,
    data: container,
    width: opts.chars.length * (opts.size + margin * 2),
    height: container.height,
    glyph
  }
}
