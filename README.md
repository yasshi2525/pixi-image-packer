# pixi-image-packer

pixi.js でレンダリングした画像データをローカルファイルシステムに保存します。  
レンダリング結果をブラウザで確認することもできます。  
描画対象は Hot Reload されるため、ソースコード修正のたびにブラウザを開いて保存するなどの手間が省けます。  

## Usage

### 画像生成スクリプトの作成

> [!IMPORTANT]
> スクリプトは Typescript で書かれている前提です

`AssetsParameters` または `Promise<AssetsParameters>` を返す関数を定義し、`export = <関数名>` としてください。  
後述の `pixi-image-packer-cli` コマンドを利用すると、実行時・本スクリプト変更時に描画内容をローカルファイルシステムに保存します。

```typescript
import { AssetsParameters } from "@yasshi2525/pixi-image-packer";
import { Assets, Container, Graphics, Sprite, Text } from "pixi.js";

const main = async (): Promise<AssetsParameters> => {
  return [
    { name: "graphics", width: 50, height: 50, data: generateCircle() },
    { name: "sprite", width: 50, height: 50, data: await generateSprite() },
    {
      name: "animation",
      width: 500,
      height: 50,
      srcWidth: 50,
      srcHeight: 50,
      frames: 10,
      data: await generateAnimationSheet(),
      tick: async (i) => await generateAnimation(i),
    },
    { name: "text", width: 100, height: 50, data: generateText() },
  ];
};

const generateCircle = () => {
  const data = new PIXI.Graphics();
  data.circle(25, 25, 25);
  data.fill(0x448866);
  data.stroke({ width: 5, color: 0x886644 });
  return data;
};

const generateSprite = () => {
  const data = new Sprite(await Assets.load("/images/sample.png"));
  return data;
};

const generateAnimationSheet = async () => {
  const data = new PIXI.Container();
  for (let i = 0; i < 10; i++) {
    const item = await generateAnimation(i);
    item.x += i * 50;
    data.addChild(item);
  }
  return data;
};

const generateAnimation = async (tick: number) => {
  const data = new Sprite(await Assets.load("/images/sample.png"));
  data.pivot.set(25, 25);
  data.x = 25;
  data.y = 25;
  data.rotation = tick * 0.1 * Math.PI;
  return data;
};

const generateText = () => {
  const data = new BitmapText({
    text: "Sample",
    style: new TextStyle({
      fontFamily: "Mplus1-Regular",
    }),
  });
  return data;
};

export = main;
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
| `--onlyCreate`      |               | 既存ファイルを削除するか     | `false`             |

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
    tick: (frame: number) => Container | Promise<Container> // アニメーション関数
}
```


## Author

[yasshi2525](https://twitter.com/yasshi2525)

## License

MIT License

### About Fonts

> [!NOTICE]
> This notice is for the source code project (GitHub), not for the npm package.

[This source code](https://github.com/yasshi2525/pixi-image-packer) includes [M+ FONTS](https://mplusfonts.github.io/), which are licesnsed under the [SIL Open Font License](https://openfontlicense.org/), Version 1.1. The font files are redistributed unmodified under the same license. See [OFL.txt](./OFL.txt) for details.
