import { Assets, BitmapText, Container, Graphics, Sprite, TextStyle } from 'pixi.js'
import type { AssetsParameters } from '../../../src/index'

const generateCircle = () => {
  const data = new Graphics()
  data.circle(25, 25, 12)
  data.fill(0x448866)
  data.stroke({ width: 1, color: 0x886644 })
  // data.filters = [new NoiseFilter()]
  data.localTransform.translate(25, 25)
  return data
}

const generateSprite = async () => {
  const data = new Sprite(await Assets.load('/images/sample.png'))
  data.worldTransform.translate(25, 25)
  // data.filters = [new NoiseFilter({ noise: 0.5 })]
  return data
}

const generateAnimationSheet = async () => {
  const data = new Container()
  for await (const i of [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]) {
    const item = await generateAnimation(i)
    item.x += i * 50
    data.addChild(item)
  }
  return data
}

const generateAnimation = async (tick: number) => {
  const data = new Sprite(await Assets.load('/images/sample.png'))
  data.pivot.set(25, 25)
  data.x = 25
  data.y = 25
  data.rotation = tick * 0.1 * Math.PI
  return data
}

const generateText = () => {
  const data = new BitmapText({
    text: 'Sample',
    style: new TextStyle({
      fontFamily: 'Mplus1-Regular',
      fill: 0xff8888,
      fontSize: 36
    })
  })
  return data
}

export = async (): Promise<AssetsParameters> => {
  return [
    { name: 'graphics', width: 50, height: 50, data: generateCircle() },
    { name: 'sprite', width: 50, height: 50, data: await generateSprite() },
    {
      name: 'animation',
      width: 500,
      height: 50,
      srcWidth: 50,
      srcHeight: 50,
      frames: 10,
      data: await generateAnimationSheet(),
      tick: async i => await generateAnimation(i)
    },
    { name: 'text', width: 100, height: 50, data: generateText() }
  ]
}
