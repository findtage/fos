import { Downtown, LeShop, Salon, StarCafe, TopModel, TopModelVIP } from './scenes/Downtown.js';
import { BoardShop, Botique, CostumeShop, FurnitureShop, IDfoneShop, MissionCenter, MyMall, Uptown } from './scenes/Uptown.js';
import { CreatureArea, CreatureShop, Forest, Grotto, GrottoSecretOne, GrottoSecretTwo, Wizard } from './scenes/Forest.js';
import { Beach, DanceClub, TanStore } from './scenes/Beach.js';
import { Restaurant, Ship } from './scenes/Ship.js';
import { Cabin, Mountain } from './scenes/Mountain.js';
import { Lighthouse, LighthouseInside, LighthouseRoof } from './scenes/Lighthouse.js';
import { Castle, CastleInside, CastleYard } from './scenes/Castle.js';
import { Arcade, Carnival } from './scenes/Carnival.js';
import { PetClass, PetSchool, PetShop, PetTown } from './scenes/PetTown.js';
import { Island, IslandStore, Resort, Spa } from './scenes/Island.js';
import { Dock, Oasis } from './scenes/Oasis.js';
import { Cafeteria, EnglishRoom, Gym, MathRoom, School, SchoolInside, SchoolUpstairs } from './scenes/School.js';
import { Preloader } from './scenes/Preloader.js';
import { Home } from './scenes/Home.js';

import { MouseOut } from './minigames/mouseOut.js';
import { TypeBoo } from './minigames/typeBoo.js';
import { RuffleScene } from './minigames/ruffleGame.js';
import { publicURL } from './env.js';

let playerAvatarData = null; // Store user avatar data globally

async function checkAuth() {
    try {
        const response = await fetch(publicURL+"/api/user/me", {
            method: "GET",
            credentials: "include"
        });

        const data = await response.json();
        //console.log("🔍 Server Response:", data); // ✅ Debugging log

        if (!data.success) {
            console.log("❌ Unauthorized access. Redirecting...");
            window.location.href = "index.html";
        } else {
            console.log(`✅ Logged in as: ${data.username}`);

            // Store avatar data globally
            playerAvatarData = data;
        }
    } catch (error) {
        console.error("❌ Authentication check failed:", error);
        window.location.href = "index.html";
    }
}

// Logout function
async function logout() {
    await fetch(publicURL+"/api/auth/logout", { method: "POST", credentials: "include" });
    console.log("✅ Logged out.");
    window.location.href = "index.html";
}

export function updateLocalAvatarData(newData) {
    if (playerAvatarData) {
        Object.assign(playerAvatarData, newData); // ✅ Update the in-memory avatar data
    }
}

export function getPlayerAvatarData() {
    return playerAvatarData;
}

checkAuth();

//export const username = userData.username;//getUsernameFromURL();

const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: 800,
    height: 520,
    "transparent": true,
    antialias: false,
    // All scenes
    scene: [
        Preloader, // Load every asset here
        Downtown, StarCafe, LeShop, Salon, TopModel, TopModelVIP, MissionCenter,
        Uptown, FurnitureShop, MyMall, IDfoneShop, CostumeShop, BoardShop, Botique,
        Carnival, Arcade,
        PetTown, PetShop, PetClass, PetSchool,
        Forest, Wizard, Grotto, GrottoSecretOne, GrottoSecretTwo, CreatureArea, CreatureShop,
        School, SchoolInside, SchoolUpstairs, MathRoom, EnglishRoom, Cafeteria, Gym,
        Beach, TanStore, DanceClub,
        Ship, Restaurant,
        Mountain, Cabin,
        Lighthouse, LighthouseInside, LighthouseRoof,
        Castle, CastleInside, CastleYard,
        Island, Spa, Resort, IslandStore,
        Oasis, Dock,
        MouseOut, TypeBoo,
        Home,
        RuffleScene
    ],
};

const game = new Phaser.Game(config);

const canvas = game.canvas;
const ctx = canvas.getContext('2d', { willReadFrequently: true });


// Some Notes
/*
Map is at a depth of 2 (higher layer)
Chat text is at 1
Chat bubble & most default is at 0

Honestly chat bubble needs a barrier / border

game breaks even after reconnecting so changed 50 seconds to 30 seconds
*/


// Lead user back to index.html after game loses connection to server for 30 seconds
let connectionLost = false;

export function showConnectionLostMessage() {
    const message = document.createElement("div");
    message.id = "connection-lost";
    message.innerText = "⚠️ Lost connection to server. Trying to reconnect...";
    message.style.position = "absolute";
    message.style.top = "10px";
    message.style.left = "50%";
    message.style.transform = "translateX(-50%)";
    message.style.padding = "10px";
    message.style.backgroundColor = "red";
    message.style.color = "white";
    message.style.fontSize = "16px";
    message.style.borderRadius = "5px";
    document.body.appendChild(message);
}

function hideConnectionLostMessage() {
    const message = document.getElementById("connection-lost");
    if (message) {
        message.remove();
    }
}

export function resetConnectionCheck() {
    connectionLost = false;
    hideConnectionLostMessage();
}

let reconnectAttempts = 0;

function checkServerConnection() {
    fetch(publicURL+"/api/ping", { method: "GET", credentials: "include" })
        .then(response => {
            if (!response.ok) throw new Error("Server unreachable");
            if (connectionLost) {
                console.log("✅ Reconnected to server.");
                connectionLost = false;
                hideConnectionLostMessage();
            }
        })
        .catch(() => {
            if (!connectionLost) {
                console.error("❌ Lost connection to the server!");
                connectionLost = true;
                showConnectionLostMessage();
            }

            reconnectAttempts++;
            if (reconnectAttempts >= 2) { // 2 failed attempts (30 seconds)
                console.error("🚨 Could not reconnect. Redirecting...");
                window.location.href = "index.html"; // Redirect to login
            }
        });
}

setInterval(checkServerConnection, 15000);
