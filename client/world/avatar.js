
import { assets } from '../assets/data.js';
import { tops, bottoms, shoes, boards } from '../assets/data.js';
import { getPlayerAvatarData } from '../game.js';


export function preloadAvatar(scene) {}

export function createAvatar(scene, startX=300, startY=400) {
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

    const base = scene.add.sprite(7, -72, playerData.body, 0).setOrigin(0.5, 0.5);
    base.setData('direction', 'left'); // Add direction data to track facing

    const eyes = scene.add.sprite(1, -101, playerData.eyes, 0).setOrigin(0.5, 0.5);
    const lips = scene.add.sprite(2, -100, 'lips', 0).setOrigin(0.5, 0.5);
    const brows = scene.add.sprite(1, -100, 'brows', 0).setOrigin(0.5, 0.5);

    const head = scene.add.image(1, -100, playerData.head).setOrigin(0.5, 0.5);
    
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
        shoes['shoe']?.[playerData.gender]?.[playerData.shoe]?.["fitX"],
        shoes['shoe']?.[playerData.gender]?.[playerData.shoe]?.["fitY"], 
        playerData.shoe, 0
    ).setOrigin(0.5, 0.5);

    const board = scene.add.image(
        boards['board']?.[playerData.board]?.["fitX"], 
        boards['board']?.[playerData.board]?.["fitY"], 
    playerData.board).setOrigin(0.5, 0.5);
    
    // Add the avatar to the center of the scene
    avatar.add([tag, nameTag, board, head, eyes, lips, brows, hair, base, bottom, shoe, top]);

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


    return avatar;
}