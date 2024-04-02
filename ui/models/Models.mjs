export class Models {
    static house = {
        name: "house",
        colors: {
            door: 0x000000,
        },
        voxels: [
            { x: "range:2-7", y: "range:2-6", z: "range:0-4", texture: "brick" },
            { x: "range:2-3", y: 7, z: "range:0-4", texture: "brick" },
            { x: "range:6-7", y: 7, z: "range:0-4", texture: "brick" },
            { x: "range:4-5", y: 7, z: "range:3-4", texture: "brick" },
            { x: "range:3-6", y: "range:2-7", z: 5, texture: "brick" },
            { x: "range:4-5", y: "range:2-7", z: 6, texture: "brick" },
            { x: 1, y: "range:1-8", z: 4, texture: "roof" },
            { x: 2, y: "range:1-8", z: 5, texture: "roof" },
            { x: 3, y: "range:1-8", z: 6, texture: "roof" },
            { x: 4, y: "range:1-8", z: 7, texture: "roof" },
            { x: 5, y: "range:1-8", z: 7, texture: "roof" },
            { x: 6, y: "range:1-8", z: 6, texture: "roof" },
            { x: 7, y: "range:1-8", z: 5, texture: "roof" },
            { x: 8, y: "range:1-8", z: 4, texture: "roof" },
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

    static tree = {
        name: "tree",
        colors: {
            trunk: 0x8B4513,
            leaves: 0x256111,
        },
        voxels: [
            { x: 4, y: 4, z: "range:0-5", color: "trunk" },
            { x: "range:2-6", y: "range:2-6", z: 6, color: "leaves" },
            { x: "range:3-5", y: "range:3-5", z: 7, color: "leaves" },
            { x: 4, y: 6, z: 7, color: "leaves" },
        ]
    }

    static tree2 = {
        name: "tree2",
        colors: {
            trunk: 0x8B4513,
            leaves: 0x256111,
        },
        voxels: [
            { x: 4, y: 4, z: "range:0-6", color: "trunk" },
            { x: "range:3-5", y: "range:3-5", z: 7, color: "leaves" },
            { x: "range:2-6", y: "range:2-6", z: 8, color: "leaves" },
            { x: "range:3-5", y: "range:3-5", z: 9, color: "leaves" },
            { x: 2, y: 4, z: 9, color: "leaves" },
        ]
    }

    static stones = {
        name: "stones",
        colors: {
            stone: 0x808080,
        },
        voxels: [
            { x: "range:2-3", y: "range:3-4", z: "range:0-1", color: "stone" },
            { x: 4, y: "range:3-5", z: 0, color: "stone" },
            { x: 7, y: 6, z: 0, color: "stone" },
            { x: 8, y: 1, z: 0, color: "stone" },
        ]
    }

    static grass = {
        name: "grass",
        colors: {
            grass: 0x00A000,
        },
        voxels: [
            { x: 0, y: 0, z: "range:0-1", color: "grass" },
            { x: 1, y: 3, z: "range:0-1", color: "grass" },
            { x: 1, y: 8, z: "range:0-1", color: "grass" },
            { x: 2, y: 4, z: "range:0-1", color: "grass" },
            { x: 2, y: 7, z: "range:0-1", color: "grass" },
            { x: 3, y: 1, z: "range:0-1", color: "grass" },
            { x: 4, y: 3, z: "range:0-1", color: "grass" },
            { x: 4, y: 6, z: "range:0-1", color: "grass" },
            { x: 5, y: 1, z: "range:0-1", color: "grass" },
            { x: 5, y: 4, z: "range:0-1", color: "grass" },
            { x: 5, y: 9, z: "range:0-1", color: "grass" },
            { x: 6, y: 5, z: "range:0-1", color: "grass" },
            { x: 6, y: 7, z: "range:0-1", color: "grass" },
            { x: 7, y: 2, z: "range:0-1", color: "grass" },
            { x: 8, y: 0, z: "range:0-1", color: "grass" },
            { x: 8, y: 4, z: "range:0-1", color: "grass" },
            { x: 8, y: 8, z: "range:0-1", color: "grass" },
            { x: 9, y: 3, z: "range:0-1", color: "grass" },
            { x: 9, y: 6, z: "range:0-1", color: "grass" },
        ]
    }
}