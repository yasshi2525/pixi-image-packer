import fs from 'fs'
import path from 'path'
import { ImagePool } from '@squoosh/lib'

export const compress = async (outDir: string, imagePool: ImagePool) => {
  console.log('compressing...')
  await Promise.all(fs.readdirSync(outDir)
    .filter(file => path.extname(file) === '.png')
    .map(async file => {
      const image = imagePool.ingestImage(fs.readFileSync(path.join(outDir, file)))
      await image.encode({ oxipng: { level: 85 } })
      const result = image.encodedWith.oxipng
      if (result) {
        fs.writeFileSync(path.join(outDir, file), result.binary)
      }
    }))
  console.log('compressed')
}
