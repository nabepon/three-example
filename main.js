import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r127/build/three.module.js';
import {OrbitControls} from 'https://threejsfundamentals.org/threejs/resources/threejs/r127/examples/jsm/controls/OrbitControls.js';
import { start } from './assets/render.js';
import { createClipImage } from './createClipImage.js'
// 準備
const canvas = document.querySelector('#threeCanvas');
const renderer = new THREE.WebGLRenderer({canvas});
const scene = new THREE.Scene();
scene.background = new THREE.Color( 0x222222 );
const group = new THREE.Group(); 
group.position.set(0, 0, 0);
scene.add(group);

// camera
const camera = new THREE.PerspectiveCamera(75, 2, 0.1, 5); // fov, aspect, near, far
camera.position.set(0, 0, 2);
new OrbitControls(camera, canvas);
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
const clippedImage = await createClipImage({ path: './assets/image.jpg' });

const imageCanvas = document.createElement('canvas');
document.querySelector('#canvasContainer').appendChild(imageCanvas);
imageCanvas.width = 350;
imageCanvas.height = 350;
const imageContext = imageCanvas.getContext('2d');

// 画像を用意する
const iconEl = new Image();
iconEl.src = "./assets/icon.svg";
await new Promise(r => iconEl.addEventListener("load", r, { once: true }));

// 描画
imageContext.fillStyle = "rgba(150, 150, 200, 0.3)";
imageContext.fillRect(0,0,350,350);
imageContext.drawImage(iconEl, 0, 0, 350, 350, 350/2-113/2, 350-150, 150, 150); // なんか変、sWidth, sHeightの基準がcanvas？
imageContext.drawImage(clippedImage, 0, 0, 350, 350, 350/2-110/2, 200, 110, 110);


// Textureとして指定する．以下Three.jsでよくあるオブジェクト描画と同じ
const imageTexture = new THREE.Texture(imageCanvas);
imageTexture.needsUpdate = true; 
const imageMaterial = new THREE.SpriteMaterial( { map: imageTexture, color: 0xffffff } );
const imageSprite = new THREE.Sprite( imageMaterial );
imageSprite.scale.set(1, 1, 1);
imageSprite.position.set(0, 0.75, 0); // zを上げればmeshより手前に持ってこれるが...
group.add( imageSprite );

