type HotReloadOption = {
  port: number
}

type ConnectState = 'UNCONNECT' | 'RECONNECTING' | 'CONNECTED'

const RETRY_INTERVAL = 1000

export class HotReload {
  private state: ConnectState
  private readonly port: number
  private ws?: WebSocket

  constructor (opts: HotReloadOption) {
    this.state = 'UNCONNECT'
    this.port = opts.port
  }

  start () {
    this.open()
  }

  private open () {
    if (this.ws) {
      console.log('skip to open connection because it is already opened.')
      return
    }
    this.ws = new WebSocket(`ws://localhost:${this.port}`)
    this.ws.addEventListener('open', () => {
      console.log('connected to server')
      if (this.state === 'RECONNECTING') {
        location.reload()
      }
      this.state = 'CONNECTED'
    })
    this.ws.addEventListener('close', () => {
      console.warn(`connection was closed. retry after ${RETRY_INTERVAL} ms`)
      this.ws = undefined
      this.state = 'RECONNECTING'
      setTimeout(() => this.open(), RETRY_INTERVAL)
    })
    this.ws.addEventListener('message', (e) => {
      if (e.data === 'reload') {
        location.reload()
      } else {
        console.log(`unhandled message: ${e.data}`)
      }
    })
  }
}
