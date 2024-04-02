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
        this.models = [];
        this.cameraOffset = {
            x: 0,
            y: 100,
            z: 1000
        };
        this.modelDistanceThreshold = 512;
        this.onTexturesLoaded = () => {};
        this.loadTextures(textures);
        this.loadFonts();
    }

    loadTextures(textures) {
        this.loadingTextures = 0;
        console.log("Loading textures...");
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
                console.log("All textures loaded");
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
        console.log("Initialized 3D frame");
    }

    addLight() {
        const ambientLight = new THREE.AmbientLight(0x777777, 1);
        this.scene.add(ambientLight);
        const light = new THREE.DirectionalLight(0xffffff, 5);
        light.position.set(0, -3000, 1000);
        light.target.position.set(1500, -1500, 0);
        this.setupLight(light);
        this.scene.add(light);
        const helper = new THREE.DirectionalLightHelper(light, 0);
    }

    setupLight(light) {
        light.shadow.mapSize.width = 4096;
        light.shadow.mapSize.height = 4096;
        light.shadow.camera.near = 0.5;
        light.shadow.camera.far = 10000;
        light.shadow.camera.left = -2000;
        light.shadow.camera.right = 2000;
        light.shadow.camera.top = 2000;
        light.shadow.camera.bottom = -2000;
        light.castShadow = true;
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

    findTexture(name) {
        for (const textureKey in this.textures) {
            if (textureKey.includes(name)) {
                return this.textures[textureKey];
            }
        }
    }

    /**
     * Draws a rectangle with a texture
     * @param x {number}
     * @param y {number}
     * @param width {number}
     * @param height {number}
     * @param texture {CanvasImageSource|string}
     * @param z {number}
     * @param adjustDepth
     * @param overwriteDepth
     * @param userData
     */
    drawTexturedRect(x, y, width, height, texture, z = 0, adjustDepth = true, overwriteDepth = null, userData = null) {
        let material;
        if (texture.constructor === String) {
            material = this.findTexture(texture);
        } else {
            material = this.textures[texture.src];
        }
        const mesh = new THREE.Mesh(this.geometries.box, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.position.set(x, -y, z);
        this.anchorMeshTopLeft(mesh, width, height);
        if (adjustDepth) {
            mesh.scale.set(width, height, overwriteDepth ?? z);
            mesh.position.z -= z / 2;
        } else {
            mesh.scale.set(width, height, overwriteDepth ?? 1);
        }
        mesh.rotation.set(0, 0, 0);
        if (userData) {
            mesh.userData = userData;
        }
        this.scene.add(mesh);
        return mesh;
    }

    /**
     * Draws a rectangle with a color
     * @param x
     * @param y
     * @param width
     * @param height
     * @param color
     * @param z
     * @param adjustDepth
     * @param overwriteDepth
     * @param disableShadows
     * @param userData
     */
    drawRect(x, y, width, height, color, z = 0, adjustDepth = true, overwriteDepth = null, disableShadows = false, userData = null) {
        if (!this.materials[color]) {
            this.materials[color] = new THREE.MeshPhongMaterial({color});
        }
        const material = this.materials[color];
        const mesh = new THREE.Mesh(this.geometries.box, material);
        if (!disableShadows) {
            mesh.castShadow = true;
            mesh.receiveShadow = true;
        }
        mesh.position.set(x, -y, z);
        this.anchorMeshTopLeft(mesh, width, height);
        if (adjustDepth) {
            mesh.scale.set(width, height, z);
            mesh.position.z -= z / 2;
        } else {
            mesh.scale.set(width, height, overwriteDepth ?? 1);
        }
        mesh.rotation.set(0, 0, 0);
        if (userData) {
            mesh.userData = userData;
        }
        this.scene.add(mesh);
        return mesh;
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
        if (this.scene) {
            this.scene.children = [];
        }
        this.models = [];
        this.renderedModelVoxels = {};
    }

    softDisplay() {
        if (this.loadingTextures > 0) {
            return;
        }
        this.checkModelVoxelsVisibility();
        this.renderer.render(this.scene, this.camera);
    }

    getCameraViewPosition() {
        return {
            x: this.camera.position.x,
            y: -this.camera.position.y + 100,
            z: this.camera.position.z
        };
    }

    checkModelVoxelsVisibility() {
        const camPos = this.getCameraViewPosition();
        for (const model of this.models) {
            const distanceToCamera = Math.sqrt(Math.pow(camPos.x - model.x, 2) + Math.pow(camPos.y - model.y, 2) + Math.pow(camPos.z - model.z, 2));
            const meshes = this.renderedModelVoxels[model.modelId];
            if (distanceToCamera > this.modelDistanceThreshold) {
                if (meshes && meshes.length > 0) {
                    for (const mesh of meshes) {
                        this.scene.remove(mesh);
                    }
                    delete this.renderedModelVoxels[model.modelId];
                }
            } else {
                if (!meshes || meshes.length === 0) {
                    this.drawModelDefinition(model.modelDefinition, model.x, model.y, model.z, model.voxelSize, model.modelId);
                }
            }
        }
    }

    drawModelDefinition(modelDefinition, x, y, z, voxelSize, modelId) {
        const camPos = this.getCameraViewPosition();
        const distanceToCamera = Math.sqrt(Math.pow(camPos.x - x, 2) + Math.pow(camPos.y - y, 2) + Math.pow(camPos.z - z, 2));
        if (modelId && this.models.find((model) => model.modelId === modelId) === undefined) {
            this.models.push({modelId, modelDefinition, x, y, z, voxelSize});
        }
        if (distanceToCamera > this.modelDistanceThreshold) {
            return;
        }
        z += voxelSize / 2;
        let meshes = [];
        for (const voxel of modelDefinition.voxels) {
            if (voxel.color) {
                meshes = meshes.concat(this.drawColoredVoxel(voxel, modelDefinition.colors[voxel.color], x, y, z, voxelSize, modelId));
            } else if (voxel.texture) {
                meshes = meshes.concat(this.drawTexturedVoxel(voxel, voxel.texture, x, y, z, voxelSize, modelId));
            }
        }
        this.renderedModelVoxels[modelId] = meshes;
    }

    drawColoredVoxel(voxel, color, bx, by, bz, voxelSize, userData) {
        if (voxel.x.constructor === String && voxel.x.startsWith("range:")) {
            const rangeParts = this.parseRange(voxel.x);
            let meshes = [];
            for (let x = rangeParts[0]; x <= rangeParts[1]; x++) {
                meshes = meshes.concat(this.drawColoredVoxel({...voxel, x}, color, bx, by, bz, voxelSize, userData));
            }
            return meshes;
        }
        if (voxel.y.constructor === String && voxel.y.startsWith("range:")) {
            const rangeParts = this.parseRange(voxel.y);
            let meshes = [];
            for (let y = rangeParts[0]; y <= rangeParts[1]; y++) {
                meshes = meshes.concat(this.drawColoredVoxel({...voxel, y}, color, bx, by, bz, voxelSize, userData));
            }
            return meshes;
        }
        if (voxel.z.constructor === String && voxel.z.startsWith("range:")) {
            const rangeParts = this.parseRange(voxel.z);
            let meshes = [];
            for (let z = rangeParts[0]; z <= rangeParts[1]; z++) {
                meshes = meshes.concat(this.drawColoredVoxel({...voxel, z}, color, bx, by, bz, voxelSize, userData));
            }
            return meshes;
        }
        const fx = bx + voxel.x * voxelSize;
        const fy = by + voxel.y * voxelSize;
        const fz = bz + voxel.z * voxelSize;
        return [this.drawRect(fx, fy, voxelSize, voxelSize, color, fz, false, voxelSize, false, userData)];
    }

    drawTexturedVoxel(voxel, texture, bx, by, bz, voxelSize, userData) {
        if (voxel.x.constructor === String && voxel.x.startsWith("range:")) {
            const rangeParts = this.parseRange(voxel.x);
            let meshes = [];
            for (let x = rangeParts[0]; x <= rangeParts[1]; x++) {
                meshes = meshes.concat(this.drawTexturedVoxel({...voxel, x}, texture, bx, by, bz, voxelSize, userData));
            }
            return meshes;
        }
        if (voxel.y.constructor === String && voxel.y.startsWith("range:")) {
            const rangeParts = this.parseRange(voxel.y);
            let meshes = [];
            for (let y = rangeParts[0]; y <= rangeParts[1]; y++) {
                meshes = meshes.concat(this.drawTexturedVoxel({...voxel, y}, texture, bx, by, bz, voxelSize, userData));
            }
            return meshes;
        }
        if (voxel.z.constructor === String && voxel.z.startsWith("range:")) {
            const rangeParts = this.parseRange(voxel.z);
            let meshes = [];
            for (let z = rangeParts[0]; z <= rangeParts[1]; z++) {
                meshes = meshes.concat(this.drawTexturedVoxel({...voxel, z}, texture, bx, by, bz, voxelSize, userData));
            }
            return meshes;
        }
        const fx = bx + voxel.x * voxelSize;
        const fy = by + voxel.y * voxelSize;
        const fz = bz + voxel.z * voxelSize;
        return [this.drawTexturedRect(fx, fy, voxelSize, voxelSize, texture, fz, false, voxelSize, userData)];
    }

    parseRange(range) {
        return range.split(":")[1].split("-").map((n) => parseInt(n));
    }
}