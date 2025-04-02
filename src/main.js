import * as THREE from 'three';
import './styles/style.css';

// === 설정값 ===
const SETTINGS = {
    backgroundColor: 0xffffff,
    terrainSize: 10,
    viewRadius: 50,
    moveSpeed: 0.2,
    sphereRadius: 1,
    cameraOffset: new THREE.Vector3(0, 5, 10),
};

// === 전역 변수 ===
let movement = { x: 0, z: 0 };
const keys = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false };

// === 초기화 ===
const scene = new THREE.Scene();
scene.background = new THREE.Color(SETTINGS.backgroundColor);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// === 텍스처 로드 ===
const textureLoader = new THREE.TextureLoader();
const gridTexture = textureLoader.load('./assets/textures/grid.png');
const sphereTexture = textureLoader.load('./assets/textures/colors.png');
setupGridTexture(gridTexture);

// === 지형 및 구체 생성 ===
const terrainGroup = new THREE.Group();
scene.add(terrainGroup);

const sphere = createSphere();
scene.add(sphere);

// === 이벤트 처리 ===
setupKeyboardEvents();

// === 애니메이션 루프 ===
function animate() {
    requestAnimationFrame(animate);

    updateSpherePosition();
    updateCameraPosition();
    updateTerrain();

    renderer.render(scene, camera);
}
animate();

// === 함수 정의 ===

// 텍스처 설정
function setupGridTexture(texture) {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(5, 5);
}

// 구체 생성
function createSphere() {
    const geometry = new THREE.SphereGeometry(SETTINGS.sphereRadius, 32, 32);
    const material = new THREE.MeshBasicMaterial({ map: sphereTexture });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.y = SETTINGS.sphereRadius; // 바닥 위에 배치
    return sphere;
}

// 키보드 이벤트 설정
function setupKeyboardEvents() {
    window.addEventListener('keydown', (event) => {
        if (keys.hasOwnProperty(event.key)) {
            keys[event.key] = true;
            updateMovement();
        }
    });

    window.addEventListener('keyup', (event) => {
        if (keys.hasOwnProperty(event.key)) {
            keys[event.key] = false;
            updateMovement();
        }
    });
}

// 이동값 업데이트
function updateMovement() {
    movement.x = 0;
    movement.z = 0;

    if (keys.ArrowUp) movement.z = -SETTINGS.moveSpeed;
    if (keys.ArrowDown) movement.z = SETTINGS.moveSpeed;
    if (keys.ArrowLeft) movement.x = -SETTINGS.moveSpeed;
    if (keys.ArrowRight) movement.x = SETTINGS.moveSpeed;
}

// 구체 위치 업데이트
function updateSpherePosition() {
    sphere.position.x += movement.x;
    sphere.position.z += movement.z;

    const movementVector = new THREE.Vector3(movement.x, 0, movement.z);
    const movementLength = movementVector.length();

    if (movementLength > 0) {
        const rotationAxis = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), movementVector).normalize();
        const rotationAngle = movementLength / SETTINGS.sphereRadius;
        sphere.rotateOnWorldAxis(rotationAxis, rotationAngle);
    }
}

// 카메라 위치 업데이트
function updateCameraPosition() {
    const cameraPosition = sphere.position.clone().add(SETTINGS.cameraOffset);
    camera.position.copy(cameraPosition);
    camera.lookAt(sphere.position);
}

// 지형 생성
function createTerrain(x, z) {
    const geometry = new THREE.PlaneGeometry(SETTINGS.terrainSize, SETTINGS.terrainSize, 10, 10);
    const material = new THREE.MeshBasicMaterial({ map: gridTexture, side: THREE.DoubleSide });
    const terrain = new THREE.Mesh(geometry, material);

    const vertices = geometry.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 3) {
        vertices[i + 2] = 0;
    }
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();

    terrain.rotation.x = -Math.PI / 2;
    terrain.position.set(x, 0, z);
    terrainGroup.add(terrain);

    return terrain;
}

// 지형 업데이트
function updateTerrain() {
    const cameraX = Math.floor(camera.position.x / SETTINGS.terrainSize) * SETTINGS.terrainSize;
    const cameraZ = Math.floor(camera.position.z / SETTINGS.terrainSize) * SETTINGS.terrainSize;

    const requiredTerrains = new Set();
    for (let x = -SETTINGS.viewRadius; x <= SETTINGS.viewRadius; x += SETTINGS.terrainSize) {
        for (let z = -SETTINGS.viewRadius; z <= SETTINGS.viewRadius; z += SETTINGS.terrainSize) {
            const terrainX = cameraX + x;
            const terrainZ = cameraZ + z;
            requiredTerrains.add(`${terrainX},${terrainZ}`);
            if (!terrainGroup.getObjectByName(`${terrainX},${terrainZ}`)) {
                const terrain = createTerrain(terrainX, terrainZ);
                terrain.name = `${terrainX},${terrainZ}`;
            }
        }
    }

    terrainGroup.children.forEach((terrain) => {
        if (!requiredTerrains.has(terrain.name)) {
            terrainGroup.remove(terrain);
        }
    });
}