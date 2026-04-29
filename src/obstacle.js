export default class Obstacle {
    constructor(distance, angle, rotSpeed, colour, type) {
        this.distance = distance;
        this.angle = angle;
        this.rotSpeed = rotSpeed;
        this.imgName = type.fileName + "-" + colour + fileType
        this.type = type;
        const coins = Math.round(15 * Math.random() - 10);
        this.addCoins(coins)
        this.coinImgName = coinName + fileType;
    }

    comparator(elementToAdd, existingElement) {
        return elementToAdd.distance > existingElement.distance; //back to front rendering
    }

    addCoins(Coins) {
        this.coins = [];
        if (!Coins) return;
        if (Coins instanceof Array) {
            for (let i = 0; i < Coins.length; i++) {
                if (Coins[i]) {
                    const posX = this.type.coinPositions[i].x
                    const posY = this.type.coinPositions[i].y
                    this.coins.push({x: posX, y: posY, value: 1})
                }
            }
        } else if (Number.isInteger(Coins)) {
            for (let i = 0; i < this.type.coinPositions.length; i++) {
                const posX = this.type.coinPositions[i].x
                const posY = this.type.coinPositions[i].y
                if (Coins > 0) {
                    this.coins.push({x: posX, y: posY, value: 1})
                    Coins--;
                } else break;
            }
        }

    }
}

export function randomObstacleType() {
    const keys = Object.keys(OBSTACLE_TYPES);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    const type = OBSTACLE_TYPES[randomKey]
    return type
}

export const OBSTACLE_TYPES = {
    oneCorner: {
        fileName: "1corner",
        coinPositions: [{x: 0.2125, y: 0.2125}],
    },
    oneHole: {
        fileName: "1hole",
        coinPositions: [{x: 0.5, y: 0.15}],
    },
    twoCorner: {
        fileName: "2corner",
        coinPositions: [{x: 0.2125, y: 0.2125}, {x: 0.7875, y: 0.2125}],
    },
    twoHole: {
        fileName: "2hole",
        coinPositions: [{x: 0.5, y: 0.15}, {x: 0.5, y: 0.875}],
    },
    fourHole: {
        fileName: "4hole",
        coinPositions: [{x: 0.5, y: 0.15}, {x: 0.875, y: 0.5}, {x: 0.5, y: 0.875}, {x: 0.15, y: 0.5}],
    },
    fourCorner: {
        fileName: "4corners",
        coinPositions: [{x: 0.2125, y: 0.2125}, {x: 0.7875, y: 0.2125}, {x: 0.7875, y: 0.7875}, {x: 0.2125, y: 0.7875}],
    },
    cross: {
        fileName: "cross",
        coinPositions: [{x: 0.5, y: 0.5}, {x: 0.333, y: 0.5}, {x: 0.5, y: 0.333}, {x: 0.666, y: 0.5}, {
            x: 0.5,
            y: 0.667
        }],
    }
}
export const fileType = ".png"
export const coinName = "coin"