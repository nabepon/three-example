// ThreeのTextureにするとき正方形なので縦横固定
const CANVAS_SIZE = 300;

const ICON_SIZE = 200;
const ICON = {
  WIDTH: ICON_SIZE * 113/150,
  SIZE: ICON_SIZE,
};

const FONT_SIZE = 35;
const LABEL_MARGIN = 20;
const LABEL = {
  WIDTH: 250,
  HEIGHT: FONT_SIZE * 2 + LABEL_MARGIN, // qやyの下が見切れるので遊びを10入れる
  FONT_SIZE,
  MARGIN: LABEL_MARGIN,
}

const CLIP_IMG_SIZE = ICON.WIDTH;

/**
 * cache
 * Promiseをcacheとして入れることで、
 * cache生成前に次のアクセスがきた場合もcacheにヒットできる
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
    return cloneCanvas(await cacheCanvas);
  }

  cache.texture[cacheKey] = new Promise(resolve => {
    (async () => {
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

      resolve(canvas);
    })()
  });
  return cache.texture[cacheKey];
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

  cache.label[label] = new Promise(resolve => {
    const canvas = document.createElement('canvas');
    canvas.width = LABEL.WIDTH;
    canvas.height = LABEL.HEIGHT;
    const ctx = canvas.getContext('2d');
    ctx.font = LABEL.FONT_SIZE + 'px Arial';
    ctx.fillStyle = '#fff';

    // 改行しないバージョン
    // const textWidth = ctx.measureText(label).width;
    // ctx.fillText(label, (LABEL.WIDTH - textWidth)/2, LABEL.HEIGHT);

    const wrapText = (ctx, label, maxWidth) => {
      ctx.textAlign = "center";
      let line = '';
      const lines = [];
      label.split('').forEach((char, index) => {
        let testLine = line + char;
        const testWidth = ctx.measureText(testLine).width;
        if (testWidth > maxWidth && index > 0) {
          lines.push(line);
          line = char;
        } else {
          line = testLine;
        }
      })
      lines.push(line);
      lines.forEach((line, index) => {
        ctx.fillText(line, maxWidth/2, LABEL.HEIGHT - LABEL.MARGIN - LABEL.FONT_SIZE * index);
      })
    }

    wrapText(ctx, label, LABEL.WIDTH);
    resolve(canvas);
  });
  return cache.label[label]
}

/**
 * icon画像を読み込む
 */
const loadIconImage = async () => {
  if(cache.icon.element) {
    return cache.icon.element;
  }

  cache.icon.element = new Promise(async resolve => {
    const iconEl = new Image();
    iconEl.src = "./assets/icon.svg";
    await new Promise(r => iconEl.addEventListener("load", r, { once: true }));
    resolve(iconEl);
  });
  return cache.icon.element;
}

/**
 * 画像を読み込み、円状にclipしたcanvasを作成する
 */
const loadClipImage = async ({ path }) => {
  if(cache.image[path]) {
    return cache.image[path];
  }

  cache.image[path] = new Promise(resolve => {
    (async () => {
      // 画像読み込み
      const imgEl = new Image();
      imgEl.src = path;
      await new Promise(r => imgEl.addEventListener("load", r, { once: true }));

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
      ctx.fillRect(0,0, canvas.width, CLIP_IMG_SIZE)
      ctx.beginPath();
      ctx.arc(CLIP_IMG_SIZE/2, CLIP_IMG_SIZE/2, CLIP_IMG_SIZE/2, 0, Math.PI*2, false);
      ctx.clip();
      // drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
      // sx, sy, sWidth, sHeight -> 取得した画像のどの部分を使うか
      // dx, dy, dWidth, dHeight ->　その画像をどの位置にどの大きさで配置するか
      const renderHeight = CLIP_IMG_SIZE;
      const renderWidth = (imgEl.width / imgEl.height) * renderHeight;
      ctx.drawImage(imgEl, 0, 0, imgEl.width, imgEl.height, (CLIP_IMG_SIZE - renderWidth) / 2, 0, renderWidth, renderHeight);

      resolve(canvas);
    })()
  });
  return cache.image[path];
}
