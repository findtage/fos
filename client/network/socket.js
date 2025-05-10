import { assets, tops, bottoms, shoes, boards, outfits, face_acc, body_acc } from "../assets/data.js";
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
export async function joinRoom(scene, roomName, targetHome=null) {
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

        if (roomName == 'home' && targetHome != null){
            playerAvatarData.homeID = targetHome;
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
                otherPlayer.hair = scene.add.sprite(
                    assets['hair']?.["female"]?.[data.hairKey]?.["fitX"], 
                    assets['hair']?.["female"]?.[data.hairKey]?.["fitY"], 
                    data.hairKey, 0
                ).setOrigin(0.5, 0.5);
                
                otherPlayer.addAt(otherPlayer.hair, hairIndex); // Add new hair at the correct index

                let topIndex = otherPlayer.getIndex(otherPlayer.top); // Get the layer index

                // Remove old top
                if (otherPlayer.top) {
                    otherPlayer.top.destroy();
                }

                if (data.topKey != "none"){
                    otherPlayer.top = scene.add.sprite(
                        tops['top']?.["female"]?.[data.topKey]?.["fitX"], 
                        tops['top']?.["female"]?.[data.topKey]?.["fitY"], 
                        data.topKey, 0
                    ).setOrigin(0.5, 0.5);
                } else {
                    otherPlayer.top = scene.add.sprite(
                        tops['top']?.["female"]?.["top0"]?.["fitX"], 
                        tops['top']?.["female"]?.["top0"]?.["fitY"], 
                        "top0", 0
                    ).setOrigin(0.5, 0.5).setVisible(false);
                }
            
                // Add new top in the correct layer
                otherPlayer.addAt(otherPlayer.top, topIndex); // Add new top at the correct index

                let bottomIndex = otherPlayer.getIndex(otherPlayer.bottom); // Get the layer index

                // Remove old bottom
                if (otherPlayer.bottom) {
                    otherPlayer.bottom.destroy();
                }
                
                if (data.bottomKey != "none"){
                    otherPlayer.bottom = scene.add.sprite(
                        bottoms['bottom']?.["female"]?.[data.bottomKey]?.["fitX"], 
                        bottoms['bottom']?.["female"]?.[data.bottomKey]?.["fitY"], 
                        data.bottomKey, 0
                    ).setOrigin(0.5, 0.5);
                } else {
                    otherPlayer.bottom = scene.add.sprite(
                        bottoms['bottom']?.["female"]?.["bottom0"]?.["fitX"], 
                        bottoms['bottom']?.["female"]?.["bottom0"]?.["fitY"], 
                        "bottom0", 0
                    ).setOrigin(0.5, 0.5).setVisible(false);
                }

                // Add new bottom in the correct layer
                otherPlayer.addAt(otherPlayer.bottom, bottomIndex); // Add new bottom at the correct index


                let outfitIndex = otherPlayer.getIndex(otherPlayer.outfit); // Get the layer index

                // Remove old outfit
                if (otherPlayer.outfit) {
                    otherPlayer.outfit.destroy();
                }
                
                if (data.outfitKey != "none"){
                    otherPlayer.outfit = scene.add.sprite(
                        outfits?.["female"]?.[data.outfitKey]?.["fitX"], 
                        outfits?.["female"]?.[data.outfitKey]?.["fitY"], 
                        data.outfitKey, 0
                    ).setOrigin(0.5, 0.5);
                } else {
                    otherPlayer.outfit = scene.add.sprite(
                        outfits?.["female"]?.["outfit0"]?.["fitX"], 
                        outfits?.["female"]?.["outfit0"]?.["fitY"], 
                        "outfit0", 0
                    ).setOrigin(0.5, 0.5).setVisible(false);
                }

                // Add new outfit in the correct layer
                otherPlayer.addAt(otherPlayer.outfit, outfitIndex); // Add new bottom at the correct index


                let shoeIndex = otherPlayer.getIndex(otherPlayer.shoes); // Get the layer index

                // Remove old top
                if (otherPlayer.shoes) {
                    otherPlayer.shoes.destroy();
                }
            
                // Add new top in the correct layer
                otherPlayer.shoes = scene.add.sprite(
                    shoes['shoe']?.["female"]?.[data.shoeKey]?.["fitX"], 
                    shoes['shoe']?.["female"]?.[data.shoeKey]?.["fitY"], 
                    data.shoeKey, 0
                ).setOrigin(0.5, 0.5);
                
                otherPlayer.addAt(otherPlayer.shoes, shoeIndex); // Add new shoes at the correct index


                let boardIndex = otherPlayer.getIndex(otherPlayer.board); // Get the layer index

                // Remove old board
                if (otherPlayer.board) {
                    otherPlayer.board.destroy();
                }
            
                // Add new board in the correct layer
                otherPlayer.board = scene.add.image(
                    boards['board']?.[data.boardKey]?.["fitX"], 
                    boards['board']?.[data.boardKey]?.["fitY"], 
                    data.boardKey
                ).setOrigin(0.5, 0.5);
                otherPlayer.addAt(otherPlayer.board, boardIndex); // Add new shoes at the correct index

                // Replace face acc
                let faceAccIndex = otherPlayer.getIndex(otherPlayer.faceacc);
                if (otherPlayer.faceacc) {
                    otherPlayer.faceacc.destroy();
                }
                if (data.faceAccKey == "faccEmpty"){
                    otherPlayer.faceacc = scene.add.image(0, 0, "faccEmpty").setOrigin(0.5, 0.5);
                } else {
                    otherPlayer.faceacc = scene.add.image(
                        face_acc['female']?.[data.faceAccKey]?.["fitX"], 
                        face_acc['female']?.[data.faceAccKey]?.["fitY"], 
                        data.faceAccKey
                    ).setOrigin(0.5, 0.5);
                }
                otherPlayer.addAt(otherPlayer.faceacc, faceAccIndex);

                // Replace body acc
                let bodyAccIndex = otherPlayer.getIndex(otherPlayer.bodyacc); // Get the layer index
                if (otherPlayer.bodyacc) {
                    otherPlayer.bodyacc.destroy();
                }
                if (data.bodyAccKey == "baccEmpty"){
                    otherPlayer.bodyacc = scene.add.image(0, 0, "baccEmpty").setOrigin(0.5, 0.5);
                } else {
                    otherPlayer.bodyacc = scene.add.sprite(
                        body_acc['female']?.[data.bodyAccKey]?.["fitX"], 
                        body_acc['female']?.[data.bodyAccKey]?.["fitY"], 
                        data.bodyAccKey, 0
                    ).setOrigin(0.5, 0.5);
                }
                otherPlayer.addAt(otherPlayer.bodyacc, bodyAccIndex); // Add new shoes at the correct index

                // Create animations for the new avatar
                createAvatarAnimations(scene, otherPlayer);
                performIdles(otherPlayer);
            }
        });

        currentRoom.onMessage("appearanceChange", (data) => {
            const otherPlayer = scene.otherPlayers[data.playerId]; // Get the affected player

            if (otherPlayer) {
                let eyesIndex = otherPlayer.getIndex(otherPlayer.eyes); // Get the layer index
                if (otherPlayer.eyes) {
                    otherPlayer.eyes.destroy();
                }
                otherPlayer.eyes = scene.add.sprite(1, -101,
                data.eyesKey, 0
                ).setOrigin(0.5, 0.5);
                otherPlayer.addAt(otherPlayer.eyes, eyesIndex);

                let headIndex = otherPlayer.getIndex(otherPlayer.head); // Get the layer index
                if (otherPlayer.head) {
                    otherPlayer.head.destroy();
                }
                otherPlayer.head = scene.add.image(1, -100,
                data.headKey,
                ).setOrigin(0.5, 0.5);
                otherPlayer.addAt(otherPlayer.head, headIndex);

                let bodyIndex = otherPlayer.getIndex(otherPlayer.base); // Get the layer index
                let playerDirection = otherPlayer.base.direction;
                if (otherPlayer.base) {
                    otherPlayer.base.destroy();
                }
                otherPlayer.base = scene.add.sprite(7, -72,
                data.bodyKey, 0
                ).setOrigin(0.5, 0.5);
                otherPlayer.base.setData('direction', playerDirection);
                otherPlayer.addAt(otherPlayer.base, bodyIndex);

                // Create animations for the new avatar
                createAvatarAnimations(scene, otherPlayer);
                performIdles(otherPlayer);
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
