// ThreeのTextureにするとき正方形なので縦横固定
const CANVAS_SIZE = 300;

const ICON_SIZE = 200;
const ICON = {
  WIDTH: ICON_SIZE * 113/150,
  SIZE: ICON_SIZE,
};

const FONT_SIZE = 35;
const LABEL = {
  WIDTH: 250,
  HEIGHT: FONT_SIZE * 2 + 10, // qやyの下が見切れるので遊びを10入れる
  FONT_SIZE: FONT_SIZE,
}

const CLIP_IMG_SIZE = ICON.WIDTH;

/**
 * cache
 */
const cache = {};
const resetCache = () => {
  cache.texture = {};
  cache.label = {};
  cache.image = {};
  cache.icon = {};
}
resetCache();

/**
 * 画像を合成したcanvasを作成
 */
export const createTextureImage = async ({ path, label }) => {
  const cacheKey = path　+ '?label=' + label
  const cacheCanvas = cache.texture[cacheKey];
  if(cacheCanvas) {
    // cacheをコピーして返す、そのまま返すとthreeでエラーになる
    return cloneCanvas(cacheCanvas);
  }

  const [clippedImage, iconImage, labelImage] = await Promise.all([
    loadClipImage({ path }),
    loadIconImage(),
    createLabel({ label }),
  ]);

  const canvas = document.createElement('canvas');
  document.querySelector('#createdCanvasThumb').appendChild(canvas);
  canvas.width = CANVAS_SIZE;
  canvas.height = CANVAS_SIZE;
  const ctx = canvas.getContext('2d');

  // 画像描画
  ctx.fillStyle = "rgba(150, 150, 200, 0.3)";
  ctx.fillRect(0,0, CANVAS_SIZE, CANVAS_SIZE);
  // SVGのdrawImageは何か変、sw, shの基準がcanvas？描画は矩形で配置は画像の比率で行うとうまくいく
  ctx.drawImage(iconImage, 0, 0, CANVAS_SIZE, CANVAS_SIZE, CANVAS_SIZE/2 - ICON.WIDTH/2, CANVAS_SIZE - ICON.SIZE, ICON.SIZE, ICON.SIZE);
  ctx.drawImage(clippedImage, 0, 0, clippedImage.width, clippedImage.height, CANVAS_SIZE/2 - ICON.WIDTH/2, CANVAS_SIZE - ICON.SIZE, CLIP_IMG_SIZE, CLIP_IMG_SIZE);
  ctx.drawImage(labelImage, 0, 0, LABEL.WIDTH, LABEL.HEIGHT, (CANVAS_SIZE - LABEL.WIDTH)/2, CANVAS_SIZE - ICON.SIZE - LABEL.HEIGHT, LABEL.WIDTH, LABEL.HEIGHT);

  cache.texture[cacheKey] = canvas;
  return canvas;
}

const cloneCanvas = (_canvas) => {
  const canvas = document.createElement('canvas');
  canvas.width = _canvas.width;
  canvas.height = _canvas.height;
  const image = _canvas.getContext('2d').getImageData(0, 0, _canvas.width, _canvas.height);
  canvas.getContext('2d').putImageData(image, 0, 0);
  return canvas;
}

/**
 * テキスト描画
 */
const createLabel = ({ label }) => {
  if(cache.label[label]) {
    return cache.label[label];
  }

  const canvas = document.createElement('canvas');
  canvas.width = LABEL.WIDTH;
  canvas.height = LABEL.HEIGHT;
  const ctx = canvas.getContext('2d');
  ctx.font = LABEL.FONT_SIZE + 'px Arial';
  ctx.fillStyle = '#fff';

  // 改行しないバージョン
  // const textWidth = ctx.measureText(label).width;
  // ctx.fillText(label, (LABEL.WIDTH - textWidth)/2, LABEL.HEIGHT);

  // TODO: リファクタ
  const wrapText = (context, label, maxWidth) => {
    context.textAlign = "center";
    const words = label.split('');
    let line = '';
    let y = LABEL.FONT_SIZE;

    for(let n = 0; n < words.length; n++) {
      let testLine = line + words[n];
      const testWidth = context.measureText(testLine).width;
      if (testWidth > maxWidth && n > 0) {
        context.fillText(line, maxWidth/2, y);
        line = words[n];
        y += LABEL.FONT_SIZE;
      } else {
        line = testLine;
      }
    }
    context.fillText(line, maxWidth/2, y);
  }

  wrapText(ctx, label, LABEL.WIDTH);

  cache.label[label] = canvas;
  return canvas
}

/**
 * icon画像を読み込む
 */
const loadIconImage = async () => {
  if(cache.icon.element) {
    return cache.icon.element;
  }

  const iconEl = new Image();
  iconEl.src = "./assets/icon.svg";
  await new Promise(r => iconEl.addEventListener("load", r, { once: true }));

  cache.icon.element = iconEl;
  return iconEl
}

/**
 * 画像を読み込み、円状にclipしたcanvasを作成する
 */
const loadClipImage = async ({ path }) => {
  if(cache.image[path]) {
    return cache.image[path];
  }

  // canvas作成
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  // サイズ設定
  canvas.width = CLIP_IMG_SIZE;
  canvas.height = CLIP_IMG_SIZE;

  // プレビュー用にdomに追加
  document.querySelector('#createdCanvasThumb').appendChild(canvas);

  // 円状にclip
  ctx.fillStyle = "rgba(150, 150, 200, 0.3)";
  ctx.fillRect(0,0, CLIP_IMG_SIZE, CLIP_IMG_SIZE)
  ctx.beginPath();
  ctx.arc(CLIP_IMG_SIZE/2, CLIP_IMG_SIZE/2, CLIP_IMG_SIZE/2, 0, Math.PI*2, false);
  ctx.clip();

  // 画像読み込み
  const imgEl = new Image();
  imgEl.src = path;
  await new Promise(r => imgEl.addEventListener("load", r, { once: true }));
  // drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
  // sx, sy, sWidth, sHeight -> 取得した画像のどの部分を使うか
  // dx, dy, dWidth, dHeight ->　その画像をどの位置にどの大きさで配置するか
  ctx.drawImage(imgEl, 0, 0, imgEl.width, imgEl.height, 0, 0, CLIP_IMG_SIZE, CLIP_IMG_SIZE);

  cache.image[path] = canvas;
  return canvas;
}
