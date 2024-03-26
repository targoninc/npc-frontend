export class Models {
    static house = {
        name: "house",
        colors: {
            brick: 0x8B4513,
            roof: 0x8B0000,
            door: 0x000000,
        },
        voxels: [
            { x: "range:2-7", y: "range:2-6", z: "range:0-4", texture: "brick" },
            { x: "range:2-3", y: 7, z: "range:0-4", texture: "brick" },
            { x: "range:6-7", y: 7, z: "range:0-4", texture: "brick" },
            { x: "range:4-5", y: 7, z: "range:3-4", texture: "brick" },
            { x: "range:3-6", y: "range:2-7", z: 5, texture: "brick" },
            { x: "range:4-5", y: "range:2-7", z: 6, texture: "brick" },
            { x: 1, y: "range:1-8", z: 4, color: "roof" },
            { x: 2, y: "range:1-8", z: 5, color: "roof" },
            { x: 3, y: "range:1-8", z: 6, color: "roof" },
            { x: 4, y: "range:1-8", z: 7, color: "roof" },
            { x: 5, y: "range:1-8", z: 7, color: "roof" },
            { x: 6, y: "range:1-8", z: 6, color: "roof" },
            { x: 7, y: "range:1-8", z: 5, color: "roof" },
            { x: 8, y: "range:1-8", z: 4, color: "roof" },
            { x: "range:4-5", y: 7, z: "range:0-2", color: "door" },
        ]
    }

    static palm = {
        name: "palm",
        colors: {
            trunk: 0x8B4513,
            leaves: 0x256111,
        },
        voxels: [
            { x: 4, y: 4, z: "range:0-5", color: "trunk" },
            { x: 4, y: 4, z: "range:6-7", color: "leaves" },
            { x: 4, y: 5, z: "range:7-8", color: "leaves" },
            { x: 4, y: 6, z: 8, color: "leaves" },
            { x: 4, y: 7, z: 7, color: "leaves" },
            { x: 4, y: 8, z: 6, color: "leaves" },
            { x: 5, y: 4, z: "range:7-8", color: "leaves" },
            { x: 6, y: 4, z: 8, color: "leaves" },
            { x: 7, y: 4, z: 7, color: "leaves" },
            { x: 8, y: 4, z: 6, color: "leaves" },
            { x: 3, y: 3, z: "range:7-8", color: "leaves" },
            { x: 2, y: 2, z: "range:5-7", color: "leaves" },
        ]
    }
}