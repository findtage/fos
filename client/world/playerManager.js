import { assets, tops, bottoms, shoes, boards } from '../assets/data.js';
import { createAvatarAnimations, performIdles } from './animations.js';

export function initializePlayerManager(scene) {
    scene.otherPlayers = {}; // Store other players

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

            // Temp default to female to let male avatars somewhat "wear" female clothes
            const hair = scene.add.sprite(
                assets['hair']?.['female']?.[playerData.hair]?.["fitX"],
                assets['hair']?.['female']?.[playerData.hair]?.["fitY"],
                playerData.hair,
                0
            ).setOrigin(0.5, 0.5);

            const top = scene.add.sprite(
                tops['top']?.['female']?.[playerData.top]?.["fitX"],
                tops['top']?.['female']?.[playerData.top]?.["fitY"], 
            playerData.top, 0).setOrigin(0.5, 0.5);
        
            const bottom = scene.add.sprite(
                bottoms['bottom']?.['female']?.[playerData.bottom]?.["fitX"],
                bottoms['bottom']?.['female']?.[playerData.bottom]?.["fitY"], 
                playerData.bottom, 0
            ).setOrigin(0.5, 0.5);
            
            const shoe = scene.add.sprite(
                shoes['shoe']?.['female']?.[playerData.shoes]?.["fitX"],
                shoes['shoe']?.['female']?.[playerData.shoes]?.["fitY"], 
                playerData.shoes, 0
            ).setOrigin(0.5, 0.5);
        
            const board = scene.add.image(
                boards['board']?.[playerData.board]?.["fitX"], 
                boards['board']?.[playerData.board]?.["fitY"], 
            playerData.board).setOrigin(0.5, 0.5);

            avatar.add([tag, nameTag, board, head, eyes, lips, brows, hair, base, bottom, shoe, top]);

            avatar.setData('direction', direction);

            avatar.gender = playerData.gender;
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
            scene.otherPlayers[id] = otherPlayer;
            createAvatarAnimations(scene, otherPlayer);
            performIdles(otherPlayer);
        }
    };

    // Update an existing player's position
    scene.updateOtherPlayer = (id, x, y, direction) => {
        if (scene.otherPlayers[id]) {
            const otherPlayer = scene.otherPlayers[id];
            otherPlayer.setPosition(x, y);
    
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
