import yargs from 'yargs'

export const command = () =>
  yargs(process.argv.slice(2))
    .command('* <src-file>', 'download rendered image drawn by source module')
    .options({
      outDir: {
        type: 'string',
        alias: 'o',
        description: 'output directory',
        demandOption: false,
        default: '.'
      },
      port: {
        type: 'number',
        alias: 'p',
        description: 'listening port number of a server',
        demandOption: false,
        default: 18080
      },
      timeout: {
        type: 'number',
        alias: 't',
        description: 'timeout for crawling each image',
        demandOption: false,
        default: 30000
      },
      sync: {
        type: 'boolean',
        alias: 's',
        description: 'end when crawling is completed',
        demandOption: false,
        default: false
      },
      fontDir: {
        type: 'string',
        alias: 'f',
        description: 'font source directory',
        demandOption: false
      },
      imageDir: {
        type: 'string',
        alias: 'i',
        description: 'image source directory',
        demandOption: false
      },
      lang: {
        type: 'string',
        description: 'language of html file',
        demandOption: false,
        default: 'ja'
      },
      title: {
        type: 'string',
        description: 'title of html file',
        demandOption: false,
        default: 'pixi-image-packer'
      }
    })
    .check(args => {
      if (args.port < 0 || args.port > 65535) {
        throw new Error('port number must be [0, 65535].')
      }
      if (args.timeout < 0) {
        throw new Error('timeout must be greater than or equals 0')
      }
      return true
    })
    .parseSync()
