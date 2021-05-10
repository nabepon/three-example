// ThreeのTextureにするとき正方形なので縦横固定
const CANVAS_SIZE = 350;
const ICON_SIZE = 200;
const ICON = {
  WIDTH: 113/150 * ICON_SIZE,
  SIZE: ICON_SIZE,
};
const LABEL = {
  WIDTH: CANVAS_SIZE,
  HEIGHT: 50,
}


/**
 * 画像を合成したcanvasを作成
 * TODO: キャッシュ機能
 */
export const createTextureImage = async ({ path, label }) => {
  const [clippedImage, iconImage, labelImage] = await Promise.all([
    loadClipImage({ path }),
    loadIconImage(),
    createLabel({ label }),
  ]);

  const canvas = document.createElement('canvas');
  document.querySelector('#canvasContainer').appendChild(canvas);
  canvas.width = CANVAS_SIZE;
  canvas.height = CANVAS_SIZE;
  const ctx = canvas.getContext('2d');

  // 画像描画
  ctx.fillStyle = "rgba(150, 150, 200, 0.3)";
  ctx.fillRect(0,0, CANVAS_SIZE, CANVAS_SIZE);
  // SVGのdrawImageは何か変、sw, shの基準がcanvas？描画は矩形で配置は画像の比率で行うとうまくいく
  ctx.drawImage(iconImage, 0, 0, CANVAS_SIZE, CANVAS_SIZE, CANVAS_SIZE/2 - ICON.WIDTH/2, CANVAS_SIZE - ICON.SIZE, ICON.SIZE, ICON.SIZE);
  ctx.drawImage(clippedImage, 0, 0, clippedImage.width, clippedImage.height, CANVAS_SIZE/2 - ICON.WIDTH/2, CANVAS_SIZE - ICON.SIZE, ICON.WIDTH, ICON.WIDTH);
  ctx.drawImage(labelImage, 0, 0, LABEL.WIDTH, LABEL.HEIGHT, 0, CANVAS_SIZE - ICON.SIZE - LABEL.HEIGHT - 10, LABEL.WIDTH, LABEL.HEIGHT);

  return canvas
}

/**
 * テキスト描画
 * TODO: 改行処理、枠追加
 */
export const createLabel = ({ label }) => {
  const canvas = document.createElement('canvas');
  canvas.width = LABEL.WIDTH;
  canvas.height = LABEL.HEIGHT;
  const ctx = canvas.getContext('2d');
  ctx.font = '40px Arial';
  ctx.fillStyle = '#fff';
  const textWidth = ctx.measureText(label).width;
  ctx.fillText(label, (LABEL.WIDTH - textWidth)/2, LABEL.HEIGHT);

  return canvas
}

/**
 * icon画像を読み込む
 */
export const loadIconImage = async () => {
  const iconEl = new Image();
  iconEl.src = "./assets/icon.svg";
  await new Promise(r => iconEl.addEventListener("load", r, { once: true }));
  return iconEl
}

/**
 * 画像を読み込み、円状にclipしたcanvasを作成する
 */
export const loadClipImage = async ({ path }) => {
  const SIZE = 200;

  // canvas作成
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  // サイズ設定
  canvas.width = SIZE;
  canvas.height = SIZE;

  // プレビュー用にdomに追加
  document.querySelector('#clipImageContainer').appendChild(canvas);

  // 円状にclip
  ctx.fillStyle = "rgba(150, 150, 200, 0.3)";
  ctx.fillRect(0,0, SIZE, SIZE)
  ctx.beginPath();
  ctx.arc(SIZE/2, SIZE/2, SIZE/2, 0, Math.PI*2, false);
  ctx.clip();

  // 画像読み込み
  const imgEl = new Image();
  imgEl.src = path;
  await new Promise(r => imgEl.addEventListener("load", r, { once: true }));
  // drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
  // sx, sy, sWidth, sHeight -> 取得した画像のどの部分を使うか
  // dx, dy, dWidth, dHeight ->　その画像をどの位置にどの大きさで配置するか
  ctx.drawImage(imgEl, 0, 0, imgEl.width, imgEl.height, 0, 0, SIZE, SIZE);

  return canvas;
}