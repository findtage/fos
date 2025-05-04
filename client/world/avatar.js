
import { assets } from '../assets/data.js';
import { body, avatar_parts,tops, bottoms, shoes, boards } from '../assets/data.js';
import { getPlayerAvatarData } from '../game.js';


export function preloadAvatar(scene) {}

export function createAvatar(scene, startX=300, startY=400, playerDirection = 'left') {
    // Get the player's avatar data from db
    const playerData = getPlayerAvatarData();
    if (!playerData) {
        console.error("❌ No avatar data found!");
        return;
    }
    
    const avatar = scene.add.container(startX, startY); // Create a container for layering

    const tag = scene.add.image(-1, -64, 'shadow').setOrigin(0.5, 0.5);
    const nameTag = scene.add.text(0, 0, playerData.username, { 
        fontSize: '12.5px', 
        fontFamily: 'Arial', 
        color: '#000000', // Black fill color
        stroke: '#EEEEEE', // White outline color
        strokeThickness: 1, // Adjust thickness as needed
        align: 'center'
    }).setOrigin(0.5, 0.5);

    const { base, eyes, lips, brows, head } = createGenderedParts(
        scene, 
        playerData,
        playerDirection
    );

    // Temp default to female to let male avatars somewhat "wear" female clothes 💀
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
    
    // Add the avatar to the center of the scene
    avatar.add([tag, board, head, eyes, lips, brows, hair, base, bottom, shoe, top, nameTag]);

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
    avatar.board = board;

    avatar.base.setInteractive();
    avatar.head.setInteractive();

    avatar.base.on('pointerup', (pointer, localX, localY, event) => {
        event.stopPropagation(); 
        console.log(playerData.username, "has been clicked")
    });

    avatar.head.on('pointerup', (pointer, localX, localY, event) => {
        event.stopPropagation(); 
        console.log(playerData.username, "has been clicked")
    });

    if (playerDirection == 'right'){
        avatar.setScale(-1, 1);
        avatar.nameTag.setScale(-1, 1);
    }

    return avatar;
}

export function createGenderedParts(scene, playerData, playerDirection) {
    const genderPrefix = playerData.gender == "male" ? "m-" : "f-";
    console.log("creating gendered parts...");
    const base = scene.add.sprite(
        body['body']?.[playerData.gender]?.[playerData.body]?.["fitX"], 
        body['body']?.[playerData.gender]?.[playerData.body]?.["fitY"],
        genderPrefix + playerData.body,
        0
    ).setOrigin(0.5, 0.5);
    base.setData('direction', playerDirection); // Add direction data to track facing

    console.log(base);
    const eyes = scene.add.sprite(
        avatar_parts[playerData.gender]?.['eyes'][playerData.eyes]?.["fitX"], 
        avatar_parts[playerData.gender]?.['eyes'][playerData.eyes]?.["fitY"], 
        genderPrefix + playerData.eyes,
        0
    ).setOrigin(0.5, 0.5);
    const lips = scene.add.sprite(
        avatar_parts[playerData.gender]?.['lips']["fitX"], 
        avatar_parts[playerData.gender]?.['lips']["fitY"], 
        genderPrefix + 'lips',
        0
    ).setOrigin(0.5, 0.5);

    const brows = scene.add.sprite(
        avatar_parts[playerData.gender]?.['brows']["fitX"], 
        avatar_parts[playerData.gender]?.['brows']["fitY"], 
        genderPrefix + 'brows',
        0
    ).setOrigin(0.5, 0.5);

    const head = scene.add.image(1, -100, genderPrefix + playerData.head).setOrigin(0.5, 0.5);

    return {
        base,
        eyes,
        lips,
        brows,
        head
    };
}