import esbuild from 'esbuild'
import express, { Express } from 'express'
import { Server } from 'http'
import path from 'path'
import * as ws from 'ws'
import * as fs from 'fs'

type RenderServerOption = {
  bundlePath: string,
  fontDirs?: string[],
  imageDir?: string[],
  port: number,
  lang: string,
  title: string
}

type FontMapping = {
  name: string,
  url: string,
  path: string
}

type ImageMapping = {
  url: string
  path: string
}

const PRODUCER_ENDPOINT = '/producer.js'
const CONSUMER_ENDPOINT = '/consumer.js'
const CSS_ENDPOINT = '/app.css'
const FONTS_ENDPOINT = '/fonts/'
const IMAGES_ENDPOINT = '/images/'

export class RenderServer {
  private readonly bundlePath: string
  private readonly fontPaths: FontMapping[]
  private readonly imagePaths: ImageMapping[]
  private readonly port: number
  private readonly lang: string
  private readonly title: string
  private readonly app: Express
  private server?: Server
  private wsServer?: ws.WebSocketServer

  constructor (opts: RenderServerOption) {
    esbuild.buildSync({
      entryPoints: [path.join(import.meta.dirname, '..', 'consumer', 'index.js')],
      bundle: true,
      format: 'esm',
      outfile: path.join(import.meta.dirname, 'consumer.js')
    })
    this.bundlePath = opts.bundlePath
    this.fontPaths = (opts.fontDirs ?? []).reduce((prev, dir) =>
      prev.concat(fs.readdirSync(dir).map(pth => ({
        name: path.parse(pth).name,
        url: FONTS_ENDPOINT + pth,
        path: path.resolve(dir, pth)
      }))), [] as FontMapping[])
    this.imagePaths = (opts.imageDir ?? []).reduce((prev, dir) =>
      prev.concat(fs.readdirSync(dir).map(pth => ({
        url: IMAGES_ENDPOINT + pth,
        path: path.resolve(dir, pth)
      }))), [] as ImageMapping[])
    this.port = opts.port
    this.lang = opts.lang
    this.title = opts.title
    this.app = express()
    this.app.get('/', (req, res) => {
      res.send(this.indexTemplate())
    })
    this.app.get(CSS_ENDPOINT, (req, res) => {
      res.send(this.cssTemplate())
    })
    this.app.get(PRODUCER_ENDPOINT, (req, res) => {
      res.sendFile(this.bundlePath)
    })
    this.app.get(CONSUMER_ENDPOINT, (req, res) => {
      res.sendFile(path.join(import.meta.dirname, 'consumer.js'))
    })
    this.fontPaths.forEach(f => {
      this.app.get(f.url, (req, res) => {
        res.sendFile(f.path)
      })
    })
    this.imagePaths.forEach(i => {
      this.app.get(i.url, (req, res) => {
        res.contentType('image/png')
        res.sendFile(i.path)
      })
    })
  }

  async start () {
    await new Promise<void>((resolve) => {
      this.server = this.app.listen(this.port, () => {
        console.log(`started http server http://localhost:${this.port}`)
        resolve()
      })
    })
    this.wsServer = new ws.WebSocketServer({ server: this.server })
  }

  stop () {
    console.log('stopping http server...')
    this.server?.close((err) => {
      if (err) {
        console.error(err)
      } else {
        console.log('stopped http server')
      }
    })
    return Promise.resolve()
  }

  reload () {
    this.wsServer?.clients.forEach(c => c.send('reload', (err) => {
      if (err) {
        console.error(err)
      }
    }))
    console.log('reload http serer')
  }

  getDisposer () {
    return async () => {
      await this.stop()
    }
  }

  private indexTemplate () {
    return `
<!DOCTYPE html>
<html lang="${this.lang}">
    <head>
        <meta http-equiv="Content-Type" content="text/html" charset="UTF-8">
        <link rel="stylesheet" type="text/css" href="${CSS_ENDPOINT}" />
        <title>${this.title}</title>
        <script type="module">
            import producer from '${PRODUCER_ENDPOINT}'
            import consumer from '${CONSUMER_ENDPOINT}'
            (async () => {
                await consumer({
                    port: ${this.port},
                    assets: producer,
                    fonts: ${JSON.stringify(this.fontPaths)},
                    images: ${JSON.stringify(this.imagePaths)}
                })
            })()
        </script>
    </head>
</html>
`
  }

  private cssTemplate () {
    return this.fontPaths.reduce((prev, m) => prev.concat(`
@font-face {
  font-family: ${m.name};
  src: url(${m.url});
}
`), '')
  }
}
