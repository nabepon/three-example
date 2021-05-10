import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r127/build/three.module.js';
import {OrbitControls} from 'https://threejsfundamentals.org/threejs/resources/threejs/r127/examples/jsm/controls/OrbitControls.js';
import { start } from './render.js';
import { createTextureImage } from './createTextureImage.js'

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

[{
  path: './assets/image.jpg',
  label: 'qwypgj, Hello, World! qwypgj,',
  x: 0,
}, {
  path: './assets/image.jpg',
  label: 'Hello, World!',
  x: 1,
}, {
  path: './assets/image.jpg',
  label: 'Hello, World!',
  x: -1,
}].forEach(async data => {
  // image作成、Textureとして指定
  const textureImage = await createTextureImage({path: data.path, label: data.label});
  const imageTexture = new THREE.Texture(textureImage);
  imageTexture.needsUpdate = true;
  const imageMaterial = new THREE.SpriteMaterial( { map: imageTexture, color: 0xffffff } );
  const imageSprite = new THREE.Sprite( imageMaterial );
  imageSprite.scale.set(1, 1, 1);
  imageSprite.position.set(data.x, 0.75, 0); // zを上げればmeshより手前に持ってこれるが...
  group.add( imageSprite );
});

