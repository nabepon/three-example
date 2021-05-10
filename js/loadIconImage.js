/**
 * icon画像を読み込む
 */
export const loadIconImage = async () => {
  const iconEl = new Image();
  iconEl.src = "./assets/icon.svg";
  await new Promise(r => iconEl.addEventListener("load", r, { once: true }));
  return iconEl
}