"use strict";

export const GAME_TICK_RATE = 100;//[hz] physics/ game logic calculations per second
export const SCREEN_TICK_RATE = 30;//[hz] screen redraws per second
export const SENSITIVITY = 1;

export let DEBUG_MODE = false
export const IMAGE_PATH = "./images/"

export const WALL_REL_SIZE = 1; //relative to screen size at dist = 1 [m]
export const CLOSEST_REL_WALL_DIST = 0.95;
export const TRANSPARENCY_THRESHOLD = 100; //Max value of Alpha to be considered passable [0-255]
export const MAX_DIST = 20; // Max distance from player to render [seconds]


export const COLOURS =["red", "green", "blue", "yellow", "purple", "orange"];
export const COLOUR_MAP = {
    red: [255, 0, 0],
    green: [0, 255, 0],
    blue: [0, 0, 255],
    yellow: [255, 255, 0],
    purple: [128, 0, 128],
    orange: [255, 165, 0],
}

export const SHAPES = {
    // SQUARE: "square",  Not yet implemented
    CIRCLE: "circle",
}

export default {GAME_TICK_RATE,SCREEN_TICK_RATE,DEBUG_MODE,IMAGE_PATH,SENSITIVITY}

export const DEBUGVARS = {DEBUG_MODE, setDebugMode : (val) => {DEBUG_MODE = val} };


