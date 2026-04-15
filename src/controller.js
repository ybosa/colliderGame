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

        let initialTouch = null;

        canvas.addEventListener("touchstart", function (event) {
            if (event.touches.length === 1) {
                initialTouch = {x: event.touches[0].clientX, y: event.touches[0].clientY};
            }
        });

        canvas.addEventListener("touchmove", function (event) {
            if (event.touches.length === 1 && initialTouch) {
                const deltaX = event.touches[0].clientX - initialTouch.x;
                const deltaY = event.touches[0].clientY - initialTouch.y;

                playerPos.x += deltaX * SENSITIVITY;
                playerPos.y += deltaY * SENSITIVITY;

                const dist = Math.sqrt(playerPos.x * playerPos.x + playerPos.y * playerPos.y);
                if (dist > MaxDist * CLOSEST_REL_WALL_DIST) {
                    playerPos.x = playerPos.x / dist * MaxDist * CLOSEST_REL_WALL_DIST;
                    playerPos.y = playerPos.y / dist * MaxDist * CLOSEST_REL_WALL_DIST;
                }

                initialTouch = {x: event.touches[0].clientX, y: event.touches[0].clientY};
            }
        });

        canvas.addEventListener("touchend", function () {
            initialTouch = null;
        });


    }
}

export default Controller
