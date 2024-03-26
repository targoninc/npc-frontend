import * as THREE from "three";
import {TextGeometry} from "three/examples/jsm/geometries/TextGeometry";
import {FontLoader} from "three/examples/jsm/loaders/FontLoader";

export class ThreeJsDrawer {
    constructor(canvas, textures) {
        this.canvas = canvas;
        this.materials = {};
        this.geometries = {
            box: new THREE.BoxGeometry(1, 1, 1)
        };
        this.fontsLoadingState = 'unloaded';
        this.font = null;
        this.textureLoader = new THREE.TextureLoader();
        this.textures = {};
        this.cameraOffset = {
            x: 0,
            y: 400,
            z: 1000
        };
        this.onTexturesLoaded = () => {};
        this.loadTextures(textures);
        this.loadFonts();
    }

    loadTextures(textures) {
        this.loadingTextures = 0;
        for (const textureKey in textures) {
            const texture = textures[textureKey];
            if (texture.constructor === Array) {
                texture.forEach((texture) => {
                    this.loadTexture(texture);
                });
            } else {
                this.loadTexture(texture);
            }
        }
    }

    setOnTexturesLoaded(callback) {
        this.onTexturesLoaded = callback;
    }

    loadTexture(inTexture) {
        this.loadingTextures++;
        this.textureLoader.load(inTexture.src, (texture) => {
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(1, 1);
            texture.minFilter = THREE.NearestFilter;
            texture.magFilter = THREE.NearestFilter;
            this.textures[inTexture.src] = new THREE.MeshPhongMaterial({
                map: texture,
                transparent: true
            });
            this.loadingTextures--;
            if (this.loadingTextures === 0) {
                this.onTexturesLoaded();
            }
        });
    }

    loadFonts() {
        if (this.fontsLoadingState === 'loading') {
            return;
        }
        this.fontsLoadingState = 'loading';
        const loader = new FontLoader();
        const fontUrl = "https://threejs.org/examples/fonts/helvetiker_regular.typeface.json";
        loader.load(fontUrl, (font) => {
            this.font = font;
            this.fontsLoadingState = 'loaded';
        });
    }

    initialize3dFrame(offset, zoom) {
        const width = document.body.clientWidth;
        const height = document.body.clientHeight;
        if (!this.threeJsInitialized) {
            this.camera = new THREE.PerspectiveCamera(90, width / height, 0.1, 10000);
            this.renderer = new THREE.WebGLRenderer({
                canvas: this.canvas,
                antialias: true,
            });
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            this.scene = new THREE.Scene();
            this.threeJsInitialized = true;
        }
        this.renderer.clear();
        this.renderer.setSize(width, height);
        this.camera.position.x = offset.x;
        this.camera.position.y = -offset.y;
        this.camera.position.z = this.cameraOffset.z * zoom;
        this.camera.lookAt(offset.x + this.cameraOffset.x, -offset.y + this.cameraOffset.y, 0);
        this.addLight();
    }

    addLight() {
        const ambientLight = new THREE.AmbientLight(0x777777, 1);
        //this.scene.add(ambientLight);
        const light = new THREE.DirectionalLight(0xffffff, 5);
        light.position.set(3000, 2000, 1500);
        light.target.position.set(0, 0, 0);
        this.setupLight(light);
        this.scene.add(light);
        const backLight = new THREE.DirectionalLight(0xffffff, .2);
        backLight.position.set(-3000, -2000, 1500);
        backLight.target.position.set(0, 0, 0);
        this.setupLight(backLight);
        this.scene.add(backLight);
    }

    setupLight(light) {
        light.castShadow = true;
        light.shadow.mapSize.width = 2048;
        light.shadow.mapSize.height = 2048;
        light.shadow.camera.near = 0.5;
        light.shadow.camera.far = 5000;
    }

    updateCameraPosition(offset, zoom) {
        this.camera.position.x = offset.x;
        this.camera.position.y = -offset.y;
        this.camera.position.z = this.cameraOffset.z * zoom;
        this.camera.lookAt(offset.x + this.cameraOffset.x, -offset.y + this.cameraOffset.y, 0);
        this.softDisplay();
    }

    clear(offset, zoom) {
        this.initialize3dFrame(offset, zoom);
    }

    anchorMeshTopLeft(mesh, width, height) {
        mesh.position.x += width / 2;
        mesh.position.y -= height / 2;
    }

    /**
     * Draws a rectangle with a texture
     * @param x {number}
     * @param y {number}
     * @param width {number}
     * @param height {number}
     * @param texture {CanvasImageSource}
     * @param z {number}
     * @param adjustDepth
     * @param overwriteDepth
     */
    drawTexturedRect(x, y, width, height, texture, z = 0, adjustDepth = true, overwriteDepth = null) {
        const material = this.textures[texture.src];
        const mesh = new THREE.Mesh(this.geometries.box, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.position.set(x, -y, z);
        this.anchorMeshTopLeft(mesh, width, height);
        if (adjustDepth) {
            mesh.scale.set(width, height, overwriteDepth ?? z);
        } else {
            mesh.scale.set(width, height, overwriteDepth ?? 1);
        }
        mesh.position.z -= z / 2;
        mesh.rotation.set(0, 0, 0);
        this.scene.add(mesh);
    }

    /**
     * Draws a rectangle with a color
     * @param x
     * @param y
     * @param width
     * @param height
     * @param color
     * @param depth
     * @param adjustDepth
     */
    drawRect(x, y, width, height, color, depth = 0, adjustDepth = true) {
        if (!this.materials[color]) {
            this.materials[color] = new THREE.MeshPhongMaterial({color});
        }
        const material = this.materials[color];
        const mesh = new THREE.Mesh(this.geometries.box, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.position.set(x, -y, depth);
        this.anchorMeshTopLeft(mesh, width, height);
        if (adjustDepth) {
            mesh.scale.set(width, height, depth);
            mesh.position.z -= depth / 2;
        } else {
            mesh.scale.set(width, height, 1);
        }
        mesh.rotation.set(0, 0, 0);
        this.scene.add(mesh);
    }

    drawText(x, y, text, color, fontSize = 52) {
        if (this.fontsLoadingState !== 'loaded') {
            this.loadFonts();
            return;
        }
        const geometry = new TextGeometry(text, {
            font: this.font,
            size: fontSize,
            height: 5,
            curveSegments: 12,
            bevelEnabled: false,
        });
        if (!this.materials[color]) {
            this.materials[color] = new THREE.MeshPhongMaterial({color});
        }
        const material = this.materials[color];
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x, y, 0);
        this.scene.add(mesh);
    }

    cleanScene() {
        for (const materialKey in this.materials) {
            this.materials[materialKey].dispose();
        }
        this.materials = {};
        this.scene.children = [];
        this.addLight();
    }

    softDisplay() {
        if (this.loadingTextures > 0) {
            return;
        }
        this.renderer.render(this.scene, this.camera);
    }
}