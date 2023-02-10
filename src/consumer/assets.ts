import { Container } from 'pixi.js'

export type SingleFrameAssets = {
  name: string,
  data: Container,
  width: number,
  height: number
  glyph?: Object
}

export type MultiFrameAssets = SingleFrameAssets & {
  frames: number,
  srcWidth: number,
  srcHeight: number,
  tick: (frame: number) => Container
}

export type AssetsParameters = (SingleFrameAssets | MultiFrameAssets | null)[]
