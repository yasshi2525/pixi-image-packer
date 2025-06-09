import puppeteer from 'puppeteer'
import * as fs from 'fs'
import path from 'path'

type CrawlerOption = {
  port: number,
  outPath: string,
  timeout?: number,
  onlyCreate?: boolean
}

export class Crawler {
  private readonly port: number
  private readonly outPath: string
  private readonly timeout: number
  private readonly onlyCreate: boolean
  private downloadQueue: number

  constructor (opts: CrawlerOption) {
    this.port = opts.port
    this.outPath = opts.outPath
    this.timeout = opts.timeout ?? 30000
    this.onlyCreate = opts.onlyCreate ?? false
    this.downloadQueue = 0
  }

  async download () {
    if (this.downloadQueue > 0) {
      this.downloadQueue++
      return Promise.resolve()
    }
    console.log('crawling images...')
    try {
      const browser = await puppeteer.launch({
        timeout: this.timeout,
        args: ['--no-sandbox']
      })
      const page = await browser.newPage()
      page.setDefaultTimeout(this.timeout)
      await page.goto(`http://localhost:${this.port}/?download=1`)
      await page.waitForSelector('a')

      const ls = await page.evaluate(() => {
        const list = [...document.querySelectorAll('a')]
        return list.map(a => ({ name: a.download, data: a.href }))
      })

      if (fs.existsSync(this.outPath) && !this.onlyCreate) {
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
    } catch (e) {
      console.error(e)
    }
    if (this.downloadQueue > 0) {
      this.downloadQueue--
      await this.download()
    }
  }
}
