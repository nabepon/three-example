import { loadClipImage } from './loadClipImage.js'
import { loadIconImage } from './loadIconImage.js'
import { createLabel } from './createLabel.js'

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
  canvas.width = 350;
  canvas.height = 350;
  const ctx = canvas.getContext('2d');

  // 画像描画
  ctx.fillStyle = "rgba(150, 150, 200, 0.3)";
  ctx.fillRect(0,0,350,350);
  // SVGのdrawImageは何か変、sw, shの基準がcanvas？描画は矩形で配置は画像の比率で行うとうまくいく
  ctx.drawImage(iconImage, 0, 0, 350, 350, 350/2-113/2, 350-150, 150, 150);
  ctx.drawImage(clippedImage, 0, 0, 350, 350, 350/2-110/2, 200, 110, 110);
  ctx.drawImage(labelImage, 0, 0, 350, 50, 0, 0, 350, 50);

  return canvas
}