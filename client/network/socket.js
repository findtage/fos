import { assets, tops } from "../assets/data.js";
import { getPlayerAvatarData, showConnectionLostMessage, resetConnectionCheck } from "../game.js";

const { Client } = window.Colyseus;

const client = new Client('ws://localhost:3000'); // Ensure this matches your server address

// Private hosting
//const client = new Client("wss://");

let currentRoom = null;
let switchingRooms = false;
import { performWave, performJump, performCry, performWink, createAvatarAnimations } from "../world/animations.js";
import { displayChatBubble } from "../world/UIManager.js";
/**
 * Join a Colyseus room dynamically.
 * @param {Phaser.Scene} scene - The current Phaser scene.
 * @param {string} roomName - The name of the Colyseus room to join.
 * @returns {Promise} - The joined room.
 */
export async function joinRoom(scene, roomName) {
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

        currentRoom.onMessage("outfitChange", (data) => {
            const otherPlayer = scene.otherPlayers[data.playerId]; // Get the affected player

            if (otherPlayer) {
                let hairIndex = otherPlayer.getIndex(otherPlayer.hair); // Get the layer index

                // Remove old hair
                if (otherPlayer.hair) {
                    otherPlayer.hair.destroy();
                }
        
                // Add new hair in the correct layer
                otherPlayer.hair = scene.add.image(
                    assets['hair']?.["female"]?.[data.hairKey]?.["fitX"], 
                    assets['hair']?.["female"]?.[data.hairKey]?.["fitY"], 
                    data.hairKey
                ).setOrigin(0.5, 0.5);
                
                console.log("Hair is being added at index", hairIndex);
                otherPlayer.addAt(otherPlayer.hair, hairIndex); // Add new hair at the correct index

                let topIndex = otherPlayer.getIndex(otherPlayer.top); // Get the layer index

                // Remove old top
                if (otherPlayer.top) {
                    otherPlayer.top.destroy();
                }
            
                // Add new top in the correct layer
                otherPlayer.top = scene.add.sprite(
                    tops['top']?.["female"]?.[data.topKey]?.["fitX"], 
                    tops['top']?.["female"]?.[data.topKey]?.["fitY"], 
                    data.topKey, 0
                ).setOrigin(0.5, 0.5);
                
                console.log("Top is being added at index", topIndex);
                otherPlayer.addAt(otherPlayer.top, topIndex); // Add new hair at the correct index
                createAvatarAnimations(scene, otherPlayer);
            }
        });
        

        return currentRoom;
    } catch (error) {
        console.error(`Failed to join room: ${roomName}`, error);
        throw error;
    }
}

/**
 * Send player movement updates to the server.
 * @param {Room} room - The Colyseus room.
 * @param {number} x - The player's x-coordinate.
 * @param {number} y - The player's y-coordinate.
 */
export function sendPlayerMove(room, x, y, direction) {
    if (room) {
        room.send('move', { x, y, direction });
    }
}
