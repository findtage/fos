import { assets, tops, bottoms, shoes, boards, outfits, face_acc, body_acc } from '../assets/data.js';
import { createAvatarAnimations, performIdles } from './animations.js';
import { openIdfone } from './idfone.js';

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
                fontSize: '14px', 
                fontFamily: 'Arial', 
                color: '#000000', // Black fill color
                stroke: '#EEEEEE', // White outline color
                strokeThickness: 2, // Adjust thickness as needed
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

            let top, bottom, outfit;

            if (playerData.outfit == "none"){
                // Player Top
                top = scene.add.sprite(
                    tops['top']?.[playerData.gender]?.[playerData.top]?.["fitX"],
                    tops['top']?.[playerData.gender]?.[playerData.top]?.["fitY"], 
                playerData.top, 0).setOrigin(0.5, 0.5);
            
                // Player Bottom
                bottom = scene.add.sprite(
                    bottoms['bottom']?.[playerData.gender]?.[playerData.bottom]?.["fitX"],
                    bottoms['bottom']?.[playerData.gender]?.[playerData.bottom]?.["fitY"], 
                    playerData.bottom, 0
                ).setOrigin(0.5, 0.5);
        
                // Invisible Outfit Layer
                outfit = scene.add.sprite(
                    outfits?.[playerData.gender]?.["outfit0"]?.["fitX"],
                    outfits?.[playerData.gender]?.["outfit0"]?.["fitY"], 
                    "outfit0", 0
                ).setOrigin(0.5, 0.5).setVisible(false);
            } else {
                // Player Outfit
                outfit = scene.add.sprite(
                    outfits?.[playerData.gender]?.[playerData.outfit]?.["fitX"],
                    outfits?.[playerData.gender]?.[playerData.outfit]?.["fitY"], 
                    playerData.outfit, 0
                ).setOrigin(0.5, 0.5);
        
                // Invisible Top / Bottom Layer
                // Player Top
                top = scene.add.sprite(
                    tops['top']?.[playerData.gender]?.["top0"]?.["fitX"],
                    tops['top']?.[playerData.gender]?.["top0"]?.["fitY"], 
                "top0", 0).setOrigin(0.5, 0.5).setVisible(false);
            
                // Player Bottom
                bottom = scene.add.sprite(
                    bottoms['bottom']?.[playerData.gender]?.["bottom0"]?.["fitX"],
                    bottoms['bottom']?.[playerData.gender]?.["bottom0"]?.["fitY"], 
                    "bottom0", 0
                ).setOrigin(0.5, 0.5).setVisible(false);
            }
            
            const shoe = scene.add.sprite(
                shoes['shoe']?.[playerData.gender]?.[playerData.shoes]?.["fitX"],
                shoes['shoe']?.[playerData.gender]?.[playerData.shoes]?.["fitY"], 
                playerData.shoes, 0
            ).setOrigin(0.5, 0.5);
        
            const board = scene.add.image(
                boards['board']?.[playerData.board]?.["fitX"], 
                boards['board']?.[playerData.board]?.["fitY"], 
            playerData.board).setOrigin(0.5, 0.5);

            // Player Face Accessory
            let faceacc;
            if (playerData.face_acc == "none"){
                faceacc = scene.add.image(0, 0, 'faccEmpty').setOrigin(0.5, 0.5);
            } else {
                faceacc = scene.add.image(
                    face_acc['female']?.[playerData.face_acc]?.["fitX"], 
                    face_acc['female']?.[playerData.face_acc]?.["fitY"], 
                playerData.face_acc).setOrigin(0.5, 0.5);
            }

            let bodyacc;
            if (playerData.body_acc == "none"){
                bodyacc = scene.add.image(0, 0, 'baccEmpty').setOrigin(0.5, 0.5);
            } else {
                bodyacc = scene.add.sprite(
                    body_acc['female']?.[playerData.body_acc]?.["fitX"],
                    body_acc['female']?.[playerData.body_acc]?.["fitY"],
                playerData.body_acc, 0).setOrigin(0.5, 0.5);

            }

            avatar.add([tag, board, head, eyes, lips, brows, hair, faceacc, base, bottom, shoe, top, outfit, bodyacc, nameTag]);

            avatar.setData('direction', direction);

            avatar.base = base; // Store reference to the base
            avatar.tag = tag;
            avatar.nameTag = nameTag;
            avatar.top = top;
            avatar.lips = lips;
            avatar.bottom = bottom;
            avatar.shoes = shoe;
            avatar.brows = brows;
            avatar.eyes = eyes;
            avatar.head = head;
            avatar.hair = hair;
            avatar.outfit = outfit;
            avatar.faceacc = faceacc;
            avatar.bodyacc = bodyacc;

            avatar.base.setInteractive();
            avatar.head.setInteractive();

            if (direction === 'right') {
                avatar.setScale(-1, 1);  // Face right
                avatar.nameTag.setScale(-1, 1);
            } 
            
            const otherPlayer = avatar;
            //otherPlayer.room = room; // Track the player's room
            scene.otherPlayers[id] = otherPlayer;
            createAvatarAnimations(scene, otherPlayer);
            performIdles(otherPlayer);

            avatar.base.on('pointerup', (pointer, localX, localY, event) => {
                    event.stopPropagation();
                    openIdfone(scene, playerData);
            });
        
            avatar.head.on('pointerup', (pointer, localX, localY, event) => {
                event.stopPropagation();
                openIdfone(scene, playerData);
            });
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
