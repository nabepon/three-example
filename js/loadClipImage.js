/**
 * 画像を読み込み、円状にclipしたcanvasを作成する
 */
export const loadClipImage = async ({ path }) => {
  // canvas作成
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  // サイズ設定
  canvas.width = 350;
  canvas.height = 350;

  // プレビュー用にdomに追加
  document.querySelector('#clipImageContainer').appendChild(canvas);

  // 円状にclip
  ctx.fillStyle = "rgba(150, 150, 200, 0.3)";
  ctx.fillRect(0,0,350,350);
  ctx.beginPath();
  ctx.arc(175, 175, 175, 0, Math.PI*2, false);
  ctx.clip();

  // 画像読み込み
  const imgEl = new Image();
  imgEl.src = path;
  await new Promise(r => imgEl.addEventListener("load", r, { once: true }));
  // drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
  // sx, sy, sWidth, sHeight -> 取得した画像のどの部分を使うか
  // dx, dy, dWidth, dHeight ->　その画像をどの位置にどの大きさで配置するか
  ctx.drawImage(imgEl, 0, 0, imgEl.width, imgEl.height, 0, 0, 350, 350);

  return canvas;
}