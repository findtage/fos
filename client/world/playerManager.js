import { assets, tops, bottoms, shoes, boards } from '../assets/data.js';
import { createAvatarAnimations, performIdles } from './animations.js';

export function initializePlayerManager(scene) {
    scene.otherPlayers = {}; // Store other players
    scene.playersTargetPosition = {}; // Store click positions of players to lerp movement.

    scene.addOtherPlayer = (id, playerData, direction) => {
        if (!scene.otherPlayers[id]) {
            const avatar = scene.add.container(playerData.x || 400, playerData.y || 300); // Create a container for layering
            if (direction != 'right' && direction != 'left'){
                direction = playerData.direction;
            }

            const tag = scene.add.image(-1, -64, 'shadow').setOrigin(0.5, 0.5);
            const nameTag = scene.add.text(0, 0, playerData.username, { 
                fontSize: '12.5px', 
                fontFamily: 'Arial', 
                color: '#000000', // Black fill color
                stroke: '#EEEEEE', // White outline color
                strokeThickness: 1, // Adjust thickness as needed
                align: 'center'
            }).setOrigin(0.5, 0.5);

            const base = scene.add.sprite(7, -72, playerData.body, 0).setOrigin(0.5, 0.5);
            const head = scene.add.image(1, -100, playerData.head).setOrigin(0.5, 0.5);
            const eyes = scene.add.sprite(1, -101, playerData.eyes, 0).setOrigin(0.5, 0.5);
            const lips = scene.add.sprite(2, -100, 'lips', 0).setOrigin(0.5, 0.5);
            const brows = scene.add.sprite(1, -100, 'brows', 0).setOrigin(0.5, 0.5);

            const hair = scene.add.sprite(
                assets['hair']?.[playerData.gender]?.[playerData.hair]?.["fitX"],
                assets['hair']?.[playerData.gender]?.[playerData.hair]?.["fitY"],
                playerData.hair,
                0
            ).setOrigin(0.5, 0.5);

            const top = scene.add.sprite(
                tops['top']?.[playerData.gender]?.[playerData.top]?.["fitX"],
                tops['top']?.[playerData.gender]?.[playerData.top]?.["fitY"], 
            playerData.top, 0).setOrigin(0.5, 0.5);
        
            const bottom = scene.add.sprite(
                bottoms['bottom']?.[playerData.gender]?.[playerData.bottom]?.["fitX"],
                bottoms['bottom']?.[playerData.gender]?.[playerData.bottom]?.["fitY"], 
                playerData.bottom, 0
            ).setOrigin(0.5, 0.5);
            
            const shoe = scene.add.sprite(
                shoes['shoe']?.[playerData.gender]?.[playerData.shoes]?.["fitX"],
                shoes['shoe']?.[playerData.gender]?.[playerData.shoes]?.["fitY"], 
                playerData.shoes, 0
            ).setOrigin(0.5, 0.5);
        
            const board = scene.add.image(
                boards['board']?.[playerData.board]?.["fitX"], 
                boards['board']?.[playerData.board]?.["fitY"], 
            playerData.board).setOrigin(0.5, 0.5);

            avatar.add([tag, nameTag, board, head, eyes, lips, brows, hair, base, bottom, shoe, top]);

            avatar.setData('direction', direction);

            avatar.base = base; // Store reference to the base
            avatar.nameTag = nameTag;
            avatar.top = top;
            avatar.lips = lips;
            avatar.bottom = bottom;
            avatar.shoes = shoe;
            avatar.brows = brows;
            avatar.eyes = eyes;
            avatar.head = head;
            avatar.hair = hair;

            if (direction === 'right') {
                avatar.setScale(-1, 1);  // Face right
                avatar.nameTag.setScale(-1, 1);
            } 
            
            const otherPlayer = avatar;
            //otherPlayer.room = room; // Track the player's room
            otherPlayer.setPosition(playerData.x, playerData.y);
            scene.otherPlayers[id] = otherPlayer;
            createAvatarAnimations(scene, otherPlayer);
            performIdles(otherPlayer);
        }
    };

    // Update an existing player's position
    scene.updateOtherPlayer = (id, x, y, direction) => {
        if (scene.otherPlayers[id]) {
            scene.playersTargetPosition[id] = {x, y};
            const otherPlayer = scene.otherPlayers[id];
            //console.log("Other player to coords: "+x+", "+y+" from "+otherPlayer.x+", "+otherPlayer.y);
    
            // Update facing direction
            if (direction === 'left') {
                otherPlayer.setScale(1, 1);
                otherPlayer.nameTag.setScale(1, 1);
            } else if (direction === 'right') {
                otherPlayer.setScale(-1, 1);
                otherPlayer.nameTag.setScale(-1, 1);
            }
        }
    };

    // Remove a player
    scene.removeOtherPlayer = (id) => {
        const player = scene.otherPlayers[id];
    
        if (player) {
            // Remove chat bubble if it exists
            if (player.chatBubble) {
                player.chatBubble.destroy();
                player.chatBubble = null;
            }
            if (player.chatBubbleContainer) {
                player.chatBubbleContainer.destroy();
                player.chatBubbleContainer = null;
            }
    
            // Remove the player
            player.destroy();
            delete scene.otherPlayers[id];
        }
    };
}
