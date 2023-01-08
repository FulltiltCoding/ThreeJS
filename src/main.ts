import {
    Scene,
    PerspectiveCamera,
    SphereGeometry,
    MeshStandardMaterial,
    Mesh,
    WebGLRenderer,
    Clock,
    AmbientLight,
    PointLight,
    BufferGeometry,
    PointsMaterial,
    Points,
    MathUtils,
    Float32BufferAttribute,
    Vector2
} from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';

const params: any = {
    exposure: 0.5,
    bloomStrength: 2.5,
    bloomThreshold: 0,
    bloomRadius: 0.5
};

let composer: EffectComposer;

// HTML Div Element for Three
const container: HTMLDivElement = document.querySelector<HTMLDivElement>("#app")!;

// scene
const scene: Scene = new Scene();

// camera
const camera: PerspectiveCamera = new PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 10000);
camera.position.z = 50;
scene.add(camera);

// renderer
const renderer: WebGLRenderer = new WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild<HTMLCanvasElement>(renderer.domElement);

// lights
const pointLight: PointLight = new PointLight(0xffffff, 8, 29);
pointLight.position.set(-15, 15, -15);
scene.add(pointLight);

const ambientLight: AmbientLight = new AmbientLight(0x404040, 5);
scene.add(ambientLight);

// center planet
const centerSphereGeometery: SphereGeometry = new SphereGeometry(4, 30, 30);
const centerSpheresMaterial: MeshStandardMaterial = new MeshStandardMaterial({
    color: 0xff4013,
    emissive: 0x000000,
    roughness: 0.3,
    metalness: 0.35,
});

const centerSphereMesh: Mesh = new Mesh(centerSphereGeometery, centerSpheresMaterial);
scene.add(centerSphereMesh);

// outer moons
const outerSphereGeometry: SphereGeometry = new SphereGeometry(1.5, 30, 30);
const outerSphereMesh1: Mesh = new Mesh(outerSphereGeometry, centerSpheresMaterial);
const outerSphereMesh2: Mesh = new Mesh(outerSphereGeometry, centerSpheresMaterial);
const outerSphereMesh3: Mesh = new Mesh(outerSphereGeometry, centerSpheresMaterial);
outerSphereMesh1.position.set(-15, 15, -15);
outerSphereMesh2.position.set(0, 0, 15);
outerSphereMesh3.position.set(20, 0, -20);
centerSphereMesh.add(outerSphereMesh1, outerSphereMesh2, outerSphereMesh3);

// particles
const geometry: BufferGeometry = new BufferGeometry();
const vertices: Array<number> = [];

for (let i: number = 0; i < 10000; i++) {

    vertices.push(MathUtils.randFloatSpread(2000)); // x
    vertices.push(MathUtils.randFloatSpread(2000)); // y
    vertices.push(MathUtils.randFloatSpread(2000)); // z
}

geometry.setAttribute("position", new Float32BufferAttribute(vertices, 3));

const particles: Points = new Points(geometry, new PointsMaterial({ color: 0x888888 }));
scene.add(particles);

// set up bloom
const renderScene: RenderPass = new RenderPass(scene, camera);
const bloomPass: UnrealBloomPass = new UnrealBloomPass(new Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
bloomPass.threshold = params.bloomThreshold;
bloomPass.strength = params.bloomStrength;
bloomPass.radius = params.bloomRadius;
composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);

// three Clock for animation
const clock: Clock = new Clock();

// continuous animation
const animate = (): void => {

    // This gives us a running timer for our orbiting electrons.
    const elapsedTime: number = clock.getElapsedTime();

    const orbitSpeed: number = 2.5;
    const cameraOrbitSpeed: number = 0.125;
    // left to right
    outerSphereMesh1.position.x = Math.sin(orbitSpeed * elapsedTime) * -10;
    outerSphereMesh1.position.y = Math.sin(orbitSpeed * elapsedTime) * 10;
    outerSphereMesh1.position.z = Math.cos(orbitSpeed * elapsedTime) * 10;

    // right to left
    outerSphereMesh2.position.x = Math.cos(orbitSpeed * elapsedTime) * 10;
    outerSphereMesh2.position.y = Math.cos(orbitSpeed * elapsedTime) * 10;
    outerSphereMesh2.position.z = Math.sin(orbitSpeed * elapsedTime) * 10;

    // Offset from our timer so the electrons don't smash into each other.
    var timeOffSet: number = 1.5 + clock.getElapsedTime();

    // orbit from the bottom to the top
    outerSphereMesh3.position.x = Math.sin(orbitSpeed * timeOffSet) * 0;
    outerSphereMesh3.position.y = Math.sin(orbitSpeed * timeOffSet) * 11;
    outerSphereMesh3.position.z = Math.cos(orbitSpeed * timeOffSet) * 11;

    // orbit the camera
    camera.position.x = Math.sin(cameraOrbitSpeed * timeOffSet) * 50;
    camera.position.z = Math.cos(cameraOrbitSpeed * timeOffSet) * 50;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);

    renderer.setAnimationLoop(animate);

    composer.render();
}

// window resizer - no need for render updates, animate will do this
const onWindowResized = (): void => {

    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}

window.addEventListener<"resize">("resize", onWindowResized);

animate();