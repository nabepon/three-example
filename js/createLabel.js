/**
 * テキスト描画
 * TODO: 改行処理、枠追加
 */
export const createLabel = ({ label }) => {
  const canvas = document.createElement('canvas');
  canvas.width = 350;
  canvas.height = 50;
  const ctx = canvas.getContext('2d');
  ctx.font = '40px Arial';
  ctx.fillStyle = '#fff';
  const textWidth = ctx.measureText(label).width;
  ctx.fillText(label, (350-textWidth)/2, 50);

  return canvas
}