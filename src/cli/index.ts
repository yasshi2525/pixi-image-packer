import { command } from './command.js'
import { watch } from './watch.js'
import { sync } from './sync.js'

const main = async () => {
  const args = command()
  if (args.sync) {
    await sync(args)
    process.exit(0)
  } else {
    await watch(args)
  }
}

export default main
