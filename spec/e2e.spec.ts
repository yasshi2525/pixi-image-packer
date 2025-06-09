import { execSync } from 'child_process'
import { tmpdir } from 'os'
import * as fs from 'fs'
import * as path from 'path'

describe('e2e', () => {
  let tmpDir: string

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(tmpdir(), 'pixi-image-packer-cli-e2e-'))
  })

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  })

  it('should save files', async () => {
    const exe = require('../package.json').bin['pixi-image-packer-cli'] as string
    const out = execSync(`node "${exe}" -o "${tmpDir}" -f "spec/e2e/fonts" -i "spec/e2e/images" -s "spec/e2e/src/index.ts"`)
    console.log(out.toString())
    expect(fs.statSync(path.join(tmpDir, 'graphics.png')).size).toBeGreaterThan(0)
    expect(fs.statSync(path.join(tmpDir, 'sprite.png')).size).toBeGreaterThan(0)
    expect(fs.statSync(path.join(tmpDir, 'animation.png')).size).toBeGreaterThan(0)
    expect(fs.statSync(path.join(tmpDir, 'text.png')).size).toBeGreaterThan(0)
    fs.readdirSync(tmpDir).forEach(f => console.log(f))
  })

  it('trim null', () => {
    const arr1 = [1, 2, 3] as (number | null)[]
    if (arr1.indexOf(null) !== -1) {
      arr1.splice(arr1.indexOf(null))
    }
    expect(arr1).toEqual([1, 2, 3])
  })
})
