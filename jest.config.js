const { createDefaultPreset } = require('ts-jest')

/** @type {import("jest").Config} */
module.exports = {
  ...createDefaultPreset({ tsconfig: 'spec/tsconfig.json' })
}
