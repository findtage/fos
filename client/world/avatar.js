
import { assets } from '../assets/data.js';
import { tops, bottoms, shoes, boards, outfits, face_acc, body_acc } from '../assets/data.js';
import { getPlayerAvatarData } from '../game.js';
import { openIdfone } from './idfone.js';


export function preloadAvatar(scene) {}

export function createAvatar(scene, startX=300, startY=400, playerDirection = 'left') {
    // Get the player's avatar data from db
    const playerData = getPlayerAvatarData();
    if (!playerData) {
        console.error("❌ No avatar data found!");
        return;
    }
    
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
    const base = scene.add.sprite(7, -72, playerData.body, 0).setOrigin(0.5, 0.5);
    
    base.setData('direction', playerDirection); // Add direction data to track facing

    // Player Eyes
    const eyes = scene.add.sprite(1, -101, playerData.eyes, 0).setOrigin(0.5, 0.5);

    // Player Lips
    const lips = scene.add.sprite(2, -100, 'lips', 0).setOrigin(0.5, 0.5);

    // Player Brows
    const brows = scene.add.sprite(1, -100, 'brows', 0).setOrigin(0.5, 0.5);

    // Player Head
    const head = scene.add.image(1, -100, playerData.head).setOrigin(0.5, 0.5);
    
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

    // Player Board
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

    // Player Body Accessory
    // Player Face Accessory
    let bodyacc;
    if (playerData.body_acc == "none"){
        bodyacc = scene.add.image(0, 0, 'baccEmpty').setOrigin(0.5, 0.5);
    } else {
        bodyacc = scene.add.sprite(
            body_acc['female']?.[playerData.body_acc]?.["fitX"], 
            body_acc['female']?.[playerData.body_acc]?.["fitY"], 
            playerData.body_acc, 0
        ).setOrigin(0.5, 0.5);
    }
    
    
    // Add the avatar to the center of the scene
    avatar.add([tag, board, head, eyes, lips, brows, hair, faceacc, base, bottom, shoe, top, outfit, bodyacc, nameTag]);

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
    avatar.board = board;
    avatar.top = top;
    avatar.bottom = bottom;
    avatar.outfit = outfit;
    avatar.faceacc = faceacc;
    avatar.bodyacc = bodyacc;
    
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