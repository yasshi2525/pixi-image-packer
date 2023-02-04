# pixi-image-packer

pixi.js でレンダリングした画像データをローカルファイルシステムに保存します。  
レンダリング結果をブラウザで確認することもできます。  
描画対象は Hot Reload されるため、ソースコード修正のたびにブラウザを開いて保存するなどの手間が省けます。  

## Usage

### 画像生成スクリプトの作成

`Promise<AssetsParameters>` を返す関数を定義し、`export = <関数名>` としてください。  
後述の `pixi-image-packer-cli` コマンドを利用すると、実行時・本スクリプト変更時に描画内容をローカルファイルシステムに保存します。

```typescript
import {AssetsParameters } from 'pixi-image-packer';
import * as PIXI from 'pixi.js'
import {GlowFilter} from "pixi-filters";

const main = async (): Promise<AssetsParameters> => {
  return [
    { name: 'graphics', width: 50, height: 50, data: generateCircle() },
    { name: 'sprite', width: 50, height: 50, data: await generateSprite() },
    { name: 'animation', width: 500, height: 50, srcWidth: 50, srcHeight: 50, frames: 10,
      data: await generateAnimationSheet(), tick: (i) => generateAnimation(i) }
  ]
}

const generateCircle = () => {
  const data = new PIXI.Graphics()
  data.beginFill(0x448866)
  data.lineStyle(5, 0x886644)
  data.drawCircle(25, 25, 25)
  data.endFill()
  data.filters = [new GlowFilter()]
  return data
}

const generateSprite = () => {
  const data = PIXI.Sprite.from('/images/flower.png')
  data.localTransform.scale(0.125, 0.125)
  data.filters = [new GlowFilter()]
  return data
}

const generateAnimationSheet = async () => {
  await PIXI.Texture.fromURL('/images/flower.png')
  const data = new PIXI.Container()
  for (let i = 0; i < 10; i++) {
    const item = await generateAnimation(i)
    item.localTransform.translate(i * 50, 0)
    data.addChild(item)
  }
  return data
}

const generateAnimation = (tick: number) => {
  const data = PIXI.Sprite.from('/images/flower.png')
  data.anchor.set(0.5, 0.5)
  data.localTransform
    .rotate(tick * 0.1 * Math.PI)
    .scale(0.125, 0.125)
  data.filters = [new GlowFilter()]
  return data
}

export = main
```

## Reference 

### `pixi-image-packer-cli` コマンド

```sh
pixi-image-packer-cli [options] <src-file>
```

`<src-file>` には画像生成スクリプトファイルパスを指定してください。TypeScriptのみ対応しています。

#### Options

| パラメタ名               | 短縮名           | 説明               | デフォルト値              |
|---------------------|---------------|------------------|---------------------|
| `--outDir <path>`   | `-o <path>`   | 画像出力先ディレクトリ      | `.`                 |
| `--port <number>`   | `-p <number>` | 描画確認用サーバのポート番号   | `18080`             |
| `--timeout<number>` | `-t <number>` | 画像保存時のタイムアウト(ms) | `30000` (30秒)       |
| `--fontDir <path>`  | `-f <path>`   | フォント格納ディレクトリ     | なし                  |
| `--imageDir <path>` | `-i <path>`   | 元画像格納ディレクトリ      | なし                  |
| `--lang <string>`   |               | htmlの表示言語        | `ja`                |
| `--title <string>`  |               | htmlのタイトル        | `pixi-image-packer` |
| `--sync`            | `-s`          | クロール後終了          | `false`             |

指定例

```sh
pixi-image-packer-cli -o out -i assets/images -f assets/fonts src/index.ts
```

#### details

##### `--outDir <path>` (`-o <path>`)

指定したディレクトリにレンダリング後の画像が格納されます。  
ファイル名は画像生成スクリプトの戻り値配列の各要素、`<name>.png` (Glyphの場合、`<name>.json`) です。  
`<name>` に `/` を入れることでサブディレクトリに保存されます。
たとえば

##### `--fontDir <path>` (`-f <path>`)

フォントファイルが格納されたディレクトリを指定します。  
ディレクトリ配下のファイルは拡張子を除いた `<filename>` という名前で、`font-family` として使うことができます。

##### `--imageDir <path>` (`-i <path>`)

スプライトに使う元画像が格納されたディレクトリを指定します。  
ディレクトリ配下のファイルは `/images/<file>` というパスにマッピングされます。

### `AssetsParameters` 型

#### 単一フレーム

```typescript
{
    name: string,         // 出力ファイル名 (拡張子なし)
    data: PIXI.Container, // 描画対象
    width: number,        // 出力画像サイズ幅
    height: number,       // 出力画像サイズ高さ
    glyph?: Object        // グリフ情報 (任意)
}
```

#### 複数フレーム (アニメーション)

```typescript
{
    name: string,         // 出力ファイル名 (拡張子なし)
    data: PIXI.Container, // 描画対象
    width: number,        // 出力画像サイズ幅 (srcWidth * frames)
    height: number,       // 出力画像サイズ高さ
    glyph?: Object        // グリフ情報 (任意)
    frames: number,       // フレーム数
    srcWidth: number,     // フレームごとの画像サイズ幅
    srcHeight: number,    // フレームごとの画像高さ
    tick: (frame: number) => Container // アニメーション関数
}
```


## Author

[yasshi2525](https://twitter.com/yasshi2525)

## License

MIT License
