import puppeteer from 'puppeteer'
import * as fs from 'fs'
import path from 'path'

type CrawlerOption = {
  port: number,
  outPath: string
}

export class Crawler {
  private readonly port: number
  private readonly outPath: string

  constructor (opts: CrawlerOption) {
    this.port = opts.port
    this.outPath = opts.outPath
  }

  async download () {
    const browser = await puppeteer.launch({
      headless: true
    })
    const page = await browser.newPage()
    await page.goto(`http://localhost:${this.port}/?download=1`)
    await page.waitForSelector('a')

    const ls = await page.evaluate(() => {
      const list = [...document.querySelectorAll('a')]
      return list.map(a => ({ name: a.download, data: a.href }))
    })

    if (fs.existsSync(this.outPath)) {
      fs.rmSync(this.outPath, { recursive: true, force: true })
    }
    ls.forEach(data => {
      const dirIdx = data.name.lastIndexOf('/')
      const outDir = (dirIdx === -1) ? this.outPath : path.join(this.outPath, data.name.substring(0, dirIdx))
      fs.mkdirSync(outDir, { recursive: true })

      if (data.name.endsWith('.json')) {
        fs.writeFileSync(
          path.join(this.outPath, data.name),
          decodeURIComponent(data.data.replace(/^data:text\/json;charset=utf-8,/, ''))
        )
      } else {
        fs.writeFileSync(
          path.join(this.outPath, data.name),
          data.data.replace(/^data:image\/png;base64,/, ''),
          'base64'
        )
      }
    })
    await browser.close()
    console.log(`saved images to ${this.outPath}`)
  }
}
