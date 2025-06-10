import { createDefaultPreset } from 'ts-jest'

/** @type {import("jest").Config} */
export default {
  ...createDefaultPreset({ tsconfig: 'spec/tsconfig.json' })
}
