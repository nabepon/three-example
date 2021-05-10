import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r127/build/three.module.js';
import {OrbitControls} from 'https://threejsfundamentals.org/threejs/resources/threejs/r127/examples/jsm/controls/OrbitControls.js';
import { start } from './assets/render.js';

// 準備
const canvas = document.querySelector('#threeCanvas');
const renderer = new THREE.WebGLRenderer({canvas});
const scene = new THREE.Scene();
const group = new THREE.Group(); 
group.position.set(0, 0, 0);
scene.add(group);

// camera
const camera = new THREE.PerspectiveCamera(75, 2, 0.1, 5); // fov, aspect, near, far
camera.position.set(0, 0, 2);
const controls = new OrbitControls(camera, canvas);
start(scene, camera, renderer);

// light
const light = new THREE.DirectionalLight(0xFFFFFF, 1); // color, intensity
light.position.set(-1, 2, 4);
scene.add(light);

// mesh
const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5); // width, height, depth
const material = new THREE.MeshPhongMaterial({color: 0x44aa88});
const cube = new THREE.Mesh(geometry, material);
group.add(cube);


/*
* ここからimage
*/
const imageCanvas = document.createElement('canvas');
document.querySelector('#canvasContainer').appendChild(imageCanvas);
imageCanvas.width = 350;
imageCanvas.height = 350;

// クリップする円の位置と半径を指定する
const imageContext = imageCanvas.getContext('2d');
imageContext.fillStyle = "rgb(150, 150, 200)";
imageContext.fillRect(0,0,350,350);
// TODO 一度画像をclipしたcanvasを作ってから再度canvasに乗せる必要がある
imageContext.beginPath();
imageContext.arc(175, 175, 175, 0, Math.PI*2, false);
imageContext.clip();

// 画像を用意する
const iconEl = new Image();
const imgEl = new Image();
const loadPromise = Promise.all([
  new Promise(resolve => iconEl.addEventListener("load", resolve, false)),
  new Promise(resolve => imgEl.addEventListener("load", resolve, false)),
]);
iconEl.src = "./assets/icon.svg";
imgEl.src = "./assets/image.jpg";
await loadPromise;

// drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
// sx, sy, sWidth, sHeight -> 取得した画像のどの部分を使うか
// dx, dy, dWidth, dHeight ->　その画像をどの位置にどの大きさで配置するか
imageContext.drawImage(imgEl, 0, 0, imgEl.width, imgEl.height, 0, 0, 350, 350);
imageContext.drawImage(iconEl, 0, 0, 350, 350, 100, 200, 150, 150); // なんか変、sWidth, sHeightの基準がcanvas？


// Textureとして指定する．以下Three.jsでよくあるオブジェクト描画と同じ
const imageTexture = new THREE.Texture(imageCanvas);
imageTexture.needsUpdate = true; 
const imageMaterial = new THREE.SpriteMaterial( { map: imageTexture, color: 0xffffff } );
const imageSprite = new THREE.Sprite( imageMaterial );
imageSprite.scale.set(1, 1, 1);
imageSprite.position.set(0, 0.7, 0); // zを上げればmeshより手前に持ってこれるが...
group.add( imageSprite );

