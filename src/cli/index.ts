import { command } from './command'
import { watch } from './watch'
import { sync } from './sync'

const main = async () => {
  const args = command()
  if (args.sync) {
    await sync(args)
    process.exit(0)
  } else {
    await watch(args)
  }
}

export = main
