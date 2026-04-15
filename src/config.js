"use strict";

export const GAME_TICK_RATE = 100;//[hz] physics/ game logic calculations per second
export const SCREEN_TICK_RATE = 30;//[hz] screen redraws per second
export const SENSITIVITY = 1;

export let DEBUG_MODE = false
export const IMAGE_PATH = "./images/"

export const WALL_REL_SIZE = 1; //relative to screen size at dist = 1 [m]
export const CLOSEST_REL_WALL_DIST = 0.95;
export const TRANSPARENCY_THRESHOLD = 100; //Max value of Alpha to be considered passable [0-255]
export const MAX_DIST = 200; // Max distance from player to render [m]
export const DETAIL_THRESHOLD = 5//Smallest width view will bother to render details in walls [pixels]
export const WALL_LINE_WIDTH = 3;
export const WALL_ARC_LINE_SCALING_WIDTH = 15;
export const COIN_REL_SIZE = 0.065

export const SHAPES = {
    // SQUARE: "square",  Not yet implemented
    CIRCLE: "circle",
}

export default {GAME_TICK_RATE,SCREEN_TICK_RATE,DEBUG_MODE,IMAGE_PATH,SENSITIVITY}

export const DEBUGVARS = {DEBUG_MODE, setDebugMode : (val) => {DEBUG_MODE = val} };


