
import { assets } from '../assets/data.js';
import { body, avatar_parts, heads, tops, bottoms, shoes, boards, outfits, face_acc, body_acc } from '../assets/data.js';
import { getPlayerAvatarData } from '../game.js';
import { openIdfone } from './idfone.js';


export function preloadAvatar(scene) {}

export function createAvatar(scene, startX=300, startY=400, playerDirection = 'left') {
    const metadata = scene.cache.json.get("boards_metadata");

    // Get the player's avatar data from db
    const playerData = getPlayerAvatarData();
    if (!playerData) {
        console.error("❌ No avatar data found!");
        return;
    }

    const boardData = metadata[playerData.board];
    
    const avatar = scene.add.container(startX, startY); // Create a container for layering

    // Shadow
    const tag = scene.add.image(-1, -64, 'shadow').setOrigin(0.5, 0.5);

    // Username
    const nameTag = scene.add.text(0, 0, playerData.username, { 
        fontSize: '14px', 
        fontFamily: 'Arial', 
        color: '#000000',
        stroke: '#EEEEEE', 
        strokeThickness: 2, 
        align: 'center'
    }).setOrigin(0.5, 0.5);

    // Player Body
    const base = scene.add.sprite(
        body['body']?.[playerData.gender]?.[playerData.body]?.["fitX"],
        body['body']?.[playerData.gender]?.[playerData.body]?.["fitY"],
        playerData.body,
        0
    ).setOrigin(0.5, 0.5);
    
    base.setData('direction', playerDirection); // Add direction data to track facing

    // Player Eyes
    const eyes = scene.add.sprite(
        avatar_parts[playerData.gender]?.['eyes']?.[playerData.eyes]?.["fitX"],
        avatar_parts[playerData.gender]?.['eyes']?.[playerData.eyes]?.["fitY"],
        playerData.eyes,
        0
    ).setOrigin(0.5, 0.5);

    // Player Lips
    const lipKey = playerData.gender === 'male' ? 'mlips' : 'lips';
    const lips = scene.add.sprite(
        avatar_parts[playerData.gender]?.[lipKey]?.fitX,
        avatar_parts[playerData.gender]?.[lipKey]?.fitY,
        lipKey,
        0
    ).setOrigin(0.5, 0.5);

    // Player Brows
    const browsKey = playerData.gender === 'male' ? 'mbrows' : 'brows';
    const brows = scene.add.sprite(
        avatar_parts[playerData.gender]?.[browsKey]?.fitX,
        avatar_parts[playerData.gender]?.[browsKey]?.fitY,
        browsKey,
        0
    ).setOrigin(0.5, 0.5);

    // Player Head
    const head = scene.add.image(
        heads['head']?.[playerData.gender]?.[playerData.head]?.['fitX'],
        heads['head']?.[playerData.gender]?.[playerData.head]?.['fitY'],
        playerData.head
    ).setOrigin(0.5, 0.5);
    
    // Player Hair
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
    
    // Player Shoes
    const shoe = scene.add.sprite(
        shoes['shoe']?.[playerData.gender]?.[playerData.shoes]?.["fitX"],
        shoes['shoe']?.[playerData.gender]?.[playerData.shoes]?.["fitY"], 
        playerData.shoes, 0
    ).setOrigin(0.5, 0.5);

    /*
    // Player Board 
    const board = scene.add.image(
        boards['board']?.[playerData.board]?.["fitX"], 
        boards['board']?.[playerData.board]?.["fitY"], 
    playerData.board).setOrigin(0.5, 0.5);
    */

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
        } else { 
            board0 = scene.add.sprite(boardData.offsetX, boardData.offsetY, playerData.board, 0).setOrigin(0.5, 0.5);
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

    // Player Body Accessory
    // Player Face Accessory
    let bodyacc;
    if (playerData.body_acc == "none"){
        bodyacc = scene.add.image(0, 0, 'baccEmpty').setOrigin(0.5, 0.5);
    } else {
        bodyacc = scene.add.sprite(
            body_acc[playerData.gender]?.[playerData.body_acc]?.["fitX"], 
            body_acc[playerData.gender]?.[playerData.body_acc]?.["fitY"], 
            playerData.body_acc, 0
        ).setOrigin(0.5, 0.5);
    }
    
    
    // Add the avatar to the center of the scene
    avatar.add([tag, board0, head, eyes, lips, brows, hair, faceacc, base, bottom, shoe, top, outfit, bodyacc, board1, nameTag]);

    // Store references to each body part
    avatar.base = base;
    avatar.tag = tag;
    avatar.nameTag = nameTag;
    avatar.lips = lips;
    avatar.shoes = shoe;
    avatar.brows = brows;
    avatar.eyes = eyes;
    avatar.head = head;
    avatar.hair = hair;
    avatar.board = board0 || board1; // Use either board0 or board1 based on the board data
    avatar.top = top;
    avatar.bottom = bottom;
    avatar.outfit = outfit;
    avatar.faceacc = faceacc;
    avatar.bodyacc = bodyacc;
    avatar.username = playerData.username;
    
    // Make body clickable for IDfone
    avatar.base.setInteractive();
    avatar.head.setInteractive();
    
    // Open Idfone if clicked
    avatar.base.on('pointerup', (pointer, localX, localY, event) => {
        event.stopPropagation(); 
        openIdfone(scene, playerData);
    });

    avatar.head.on('pointerup', (pointer, localX, localY, event) => {
        event.stopPropagation(); 
        openIdfone(scene, playerData);
    });

    // Set player direction
    if (playerDirection == 'right'){
        avatar.setScale(-1, 1);
        avatar.nameTag.setScale(-1, 1);
    }

    return avatar;
}