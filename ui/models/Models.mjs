export class Models {
    static house = {
        name: "house",
        colors: {
            brick: 0x8B4513,
            roof: 0x8B0000,
            door: 0x000000,
        },
        voxels: [
            { x: "range:2-7", y: "range:2-7", z: "range:0-4", color: "brick" },
            { x: "range:3-6", y: "range:2-7", z: 5, color: "brick" },
            { x: "range:4-5", y: "range:2-7", z: 6, color: "brick" },
            { x: 1, y: "range:1-8", z: 4, color: "roof" },
            { x: 2, y: "range:1-8", z: 5, color: "roof" },
            { x: 3, y: "range:1-8", z: 6, color: "roof" },
            { x: 4, y: "range:1-8", z: 7, color: "roof" },
            { x: 5, y: "range:1-8", z: 7, color: "roof" },
            { x: 6, y: "range:1-8", z: 6, color: "roof" },
            { x: 7, y: "range:1-8", z: 5, color: "roof" },
            { x: 8, y: "range:1-8", z: 4, color: "roof" },
            { x: "range:4-5", y: 8, z: "range:0-2", color: "door" }
        ]
    }
}