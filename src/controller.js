"use strict";
import {DEBUGVARS, DEBUG_MODE,SENSITIVITY,CLOSEST_REL_WALL_DIST} from "./config.js";

class Controller{
    constructor(playerPos, canvas,MaxDist) {
        canvas.addEventListener("click", () => {
            canvas.requestPointerLock();
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "i") {
                DEBUGVARS.setDebugMode(!DEBUG_MODE)
            }
        });

        document.addEventListener("keyup", (e) => {

        });

        document.addEventListener("mousemove", function (event) {
            playerPos.x += event.movementX * SENSITIVITY;
            playerPos.y += event.movementY * SENSITIVITY;

            const dist = Math.sqrt(playerPos.x*playerPos.x + playerPos.y*playerPos.y)
            if(dist > MaxDist * CLOSEST_REL_WALL_DIST) {
                playerPos.x = playerPos.x / dist * MaxDist * CLOSEST_REL_WALL_DIST;
                playerPos.y = playerPos.y / dist * MaxDist * CLOSEST_REL_WALL_DIST;
            }
        });


    }
}

export default Controller
