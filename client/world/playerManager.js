import { assets, body, tops, bottoms, shoes, boards, outfits, face_acc, body_acc, avatar_parts, heads } from '../assets/data.js';
import { createAvatarAnimations, performIdles } from './animations.js';
import { openIdfone } from './idfone.js';

export function initializePlayerManager(scene) {
    scene.otherPlayers = {}; // Store other players

    scene.addOtherPlayer = (id, playerData, direction) => {
        const metadata = scene.cache.json.get("boards_metadata");
        const boardData = metadata[playerData.board];
        
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
            
            const base = scene.add.sprite(
                body['body']?.[playerData.gender]?.[playerData.body]?.["fitX"],
                body['body']?.[playerData.gender]?.[playerData.body]?.["fitY"],
                playerData.body,
                0
            ).setOrigin(0.5, 0.5);
            
            const eyes = scene.add.sprite(
                avatar_parts[playerData.gender]?.['eyes']?.[playerData.eyes]?.["fitX"],
                avatar_parts[playerData.gender]?.['eyes']?.[playerData.eyes]?.["fitY"],
                playerData.eyes,
                0
            ).setOrigin(0.5, 0.5);

            const lipKey = playerData.gender === 'male' ? 'mlips' : 'lips';
            const lips = scene.add.sprite(
                avatar_parts[playerData.gender]?.[lipKey]?.fitX,
                avatar_parts[playerData.gender]?.[lipKey]?.fitY,
                lipKey,
                0
            ).setOrigin(0.5, 0.5);

            const browsKey = playerData.gender === 'male' ? 'mbrows' : 'brows';
            const brows = scene.add.sprite(
                avatar_parts[playerData.gender]?.[browsKey]?.fitX,
                avatar_parts[playerData.gender]?.[browsKey]?.fitY,
                browsKey,
                0
            ).setOrigin(0.5, 0.5);

            const head = scene.add.image(
                heads['head']?.[playerData.gender]?.[playerData.head]?.fitX,
                heads['head']?.[playerData.gender]?.[playerData.head]?.fitY,
                playerData.head
            ).setOrigin(0.5, 0.5);

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

            let boardBottomFrame;
            let boardTopFrame;

            let board0, board1;

            if (boardData.middleEffect) {
                // If the board has a middle effect, determine the frame based on the layer
                boardBottomFrame = boardData.layerAbove ? 0 : boardData.frames - 1;
                boardTopFrame = boardData.layerAbove ? boardData.frames - 1 : 0;

                board0 = scene.add.sprite(boardData.offsetX, boardData.offsetY, playerData.board, boardBottomFrame).setOrigin(0.5, 0.5);
                board1 = scene.add.sprite(boardData.offsetX, boardData.offsetY, playerData.board, boardTopFrame).setOrigin(0.5, 0.5);
            } else {
                if (boardData.layerAbove) {
                    board1 = scene.add.sprite(boardData.offsetX, boardData.offsetY, playerData.board, 0).setOrigin(0.5, 0.5);
                    board0 = scene.add.sprite(0, 0, 'baccEmpty').setOrigin(0.5, 0.5);
                } else { 
                    board0 = scene.add.sprite(boardData.offsetX, boardData.offsetY, playerData.board, 0).setOrigin(0.5, 0.5);
                    board1 = scene.add.sprite(0, 0, 'baccEmpty').setOrigin(0.5, 0.5);
                }       
            }

            // Player Face Accessory
            let faceacc;
            if (playerData.face_acc == "none"){
                faceacc = scene.add.image(0, 0, 'faccEmpty').setOrigin(0.5, 0.5);
            } else {
                faceacc = scene.add.image(
                    face_acc[playerData.gender]?.[playerData.face_acc]?.["fitX"], 
                    face_acc[playerData.gender]?.[playerData.face_acc]?.["fitY"], 
                playerData.face_acc).setOrigin(0.5, 0.5);
            }

            let bodyacc;
            if (playerData.body_acc == "none"){
                bodyacc = scene.add.image(0, 0, 'baccEmpty').setOrigin(0.5, 0.5);
            } else {
                bodyacc = scene.add.sprite(
                    body_acc[playerData.gender]?.[playerData.body_acc]?.["fitX"],
                    body_acc[playerData.gender]?.[playerData.body_acc]?.["fitY"],
                playerData.body_acc, 0).setOrigin(0.5, 0.5);

            }

            avatar.add([tag, board0, head, eyes, lips, brows, hair, base, bottom, shoe, top, outfit, bodyacc, faceacc, board1, nameTag]);

            avatar.setData('direction', direction);

            avatar.base = base; // Store reference to the base
            avatar.tag = tag;
            avatar.board = board0;
            avatar.boardTop = board1;
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
            avatar.username = playerData.username;

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
