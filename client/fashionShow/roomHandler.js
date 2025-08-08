import { assets, tops, bottoms, shoes, boards, outfits, face_acc, body_acc, avatar_parts, heads, body } from "../assets/data.js";
import { getPlayerAvatarData, showConnectionLostMessage, resetConnectionCheck } from "../game.js";
import { webSocketURL } from "../env.js";

const { Client } = window.Colyseus;
const client = new Client(webSocketURL); // Ensure this matches your server address

let currentRoom = null;
let switchingRooms = false;
import { performWave, performJump, performCry, performWink, performIdles, createAvatarAnimations } from "../world/animations.js";
import { displayChatBubble } from "../world/UIManager.js";
/**
 * Join a Colyseus room dynamically.
 * @param {Phaser.Scene} scene - The current Phaser scene.
 * @param {string} roomName - The name of the Colyseus room to join.
 * @returns {Promise} - The joined room.
 */
export async function joinRoom(scene, roomName, fashionShowID=null, callbacks={}) {
    if (currentRoom) {
        console.log(`Leaving room: ${currentRoom.name}`);
        switchingRooms = true;
        await currentRoom.leave(); // Leave the current room before joining a new one
        switchingRooms = false;
    }

    console.log(`Attempting to join room: ${roomName}`);
    try {
        let playerAvatarData = getPlayerAvatarData(); // Get the player's avatar data
        if (!playerAvatarData) {
            console.error("❌ No avatar data found!");
            return;
        }

        if (roomName == 'fashionShow' && fashionShowID != null){
            playerAvatarData.fashionShowID = fashionShowID;
        }

        currentRoom = await client.joinOrCreate(roomName, playerAvatarData); // Join the room
        
        resetConnectionCheck(); // Reset the connection check
        console.log(`Successfully joined room: ${roomName}`);

        currentRoom.onLeave(() => {
            if (!switchingRooms) {
                console.error("❌ Lost connection to the game server!");
                showConnectionLostMessage();
            }
        });

        // Handle new players joining
        currentRoom.onMessage('newPlayer', (data) => {
            if (data.id !== currentRoom.sessionId) { // Exclude the local player
                scene.addOtherPlayer(data.id, data);
                console.log(`New player ${data.id} added to the room.`);
            }
        });

        // Handle player movements
        currentRoom.onMessage('playerMoved', (data) => {
            scene.updateOtherPlayer(data.id, data.x, data.y, data.direction);
        });

        // Handle players leaving
        currentRoom.onMessage('playerLeft', (data) => {
            const leavingPlayer = scene.otherPlayers[data.id];

            if (leavingPlayer) {
                // Remove chat bubble if it exists
                if (leavingPlayer.chatBubble) {
                    leavingPlayer.chatBubble.destroy();
                }
                if (leavingPlayer.chatBubbleContainer) {
                    leavingPlayer.chatBubbleContainer.destroy();
                }

                // Remove player from the scene
                scene.removeOtherPlayer(data.id);
                console.log(`Player ${data.id} left the room.`);
            }
        });

        // Handle the current state of the room (when joining)
        currentRoom.onMessage('currentPlayers', (players) => {
            players.forEach((player) => {
                if (player.id !== currentRoom.sessionId) { // Exclude the local player
                    scene.addOtherPlayer(player.id, player, player.direction); // or left
                }
            });
        });

        currentRoom.onMessage("chat", (data) => {
            const { id, message } = data;

            // Find the player associated with the message
            const sender = id === scene.player.id ? scene.player : scene.otherPlayers[id];
          
            // Display the message for the corresponding player
            if (sender) {
                displayChatBubble(scene, sender, message);
            }
        });

        currentRoom.onMessage("playAnimation", (data) => {
            const { id, animationKey } = data;
            const otherPlayer = scene.otherPlayers[id];

            if (otherPlayer && otherPlayer.base) {
    
                if (animationKey === 'jump') {
                    performJump(otherPlayer);
                }

                if (animationKey === 'wave') {
                    performWave(otherPlayer);
                }

                if (animationKey === 'cry'){
                    performCry(otherPlayer);
                }

                if (animationKey == 'wink'){
                    performWink(otherPlayer);
                }
            }
        });

        currentRoom.onMessage("readyToStart", () => {
            if (callbacks.readyToStart) {
                callbacks.readyToStart();
            }
        });

        currentRoom.onMessage("notReadyToStart", () => {
            
        });

        currentRoom.onMessage("startRoundOne", (themes) => {
            if (callbacks.startRoundOne) {
                callbacks.startRoundOne(themes);
            }
        });

        currentRoom.onMessage("relayRoundOneTheme", (theme) => {
            if (callbacks.relayRoundOneTheme) {
                callbacks.relayRoundOneTheme(theme);
            }
        })

        currentRoom.onMessage("roundOneChangingOver", () => {
            if (callbacks.roundOneChangingOver) {
                callbacks.roundOneChangingOver();
            }
        });

        return currentRoom;
    } catch (error) {
        console.error(`Failed to join room: ${roomName}`, error);
        throw error;
    }
}

export function sendPlayerMove(room, x, y, direction) {
    if (room) {
        room.send('move', { x, y, direction });
    }
}
