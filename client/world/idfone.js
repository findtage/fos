import { getPlayerAvatarData } from "../game.js";
import { assets } from '../assets/data.js';
import { body, avatar_parts, heads, tops, bottoms, shoes, boards, outfits, face_acc, body_acc } from '../assets/data.js';
import { performIdles } from "./animations.js";

export function openIdfone(scene, idFoneData){
    const screen_tint = scene.add.rectangle(0, 0, 800, 520).setOrigin(0, 0).setScrollFactor(0).setDepth(2).setInteractive();
		screen_tint.isFilled = true;
		screen_tint.fillColor = 0;
		screen_tint.fillAlpha = 0.4;
		screen_tint.strokeColor = 11184810;

    screen_tint.on('pointerup', (pointer, localX, localY, event) => {
        event.stopPropagation();
    });

    const idfoneBase = scene.add.image(393, 260, "idfoneBase").setScrollFactor(0).setDepth(2).setOrigin(0.5, 0.5);

    // User money display tint
    let displayTint, starsText, text_5, text_4;
    const playerAvatarData = getPlayerAvatarData();
    if (idFoneData.username == playerAvatarData.username){
        displayTint = scene.add.rectangle(94, 83, 565, 30).setScrollFactor(0).setDepth(2);
        displayTint.setOrigin(0, 0);
        displayTint.isFilled = true;
        displayTint.fillColor = 0;
        displayTint.fillAlpha = 0.4;

        starsText = scene.add.image(123, 100, "starIcon").setScrollFactor(0).setDepth(2);
		starsText.scaleX = 0.55;
		starsText.scaleY = 0.55;

        // text_4
		text_4 = scene.add.text(142, 86, "", {}).setScrollFactor(0).setDepth(2);
		text_4.text = ":";
		text_4.setStyle({ "fontFamily": "VAGRounded", "fontSize": "24px", "stroke": "#16547E", "strokeThickness": 2, "shadow.offsetX": 4, "shadow.offsetY": 2, "shadow.color": "#16547E", "resolution": 2 });

		// text_5
		text_5 = scene.add.text(155, 87, "", {}).setScrollFactor(0).setDepth(2);
		text_5.text = playerAvatarData.stars.toLocaleString('en-US');
		text_5.setStyle({ "color": "#f0e145ff", "fontFamily": "VAGRounded", "fontSize": "24px", "stroke": "#00ccffff", "shadow.offsetX": 4, "shadow.offsetY": 2, "shadow.color": "", "resolution": 2 });

    }

    // Username
    const text_1 = scene.add.text(112, 115, "", {}).setScrollFactor(0).setDepth(2).setOrigin(0);
    text_1.text = idFoneData.username;
    text_1.setStyle({ "fontFamily": "VAGRounded", "fontSize": "26px", "stroke": "#16547E", "strokeThickness": 6, "shadow.offsetX": 3, "shadow.offsetY": 2, "shadow.color": "#16547E", "shadow.stroke": true, "shadow.fill": true, "resolution": 2 });

    // Rank
    const text = scene.add.text(112, 148, "", {}).setScrollFactor(0).setDepth(2).setOrigin(0);
    text.text = "ROOKIE ";
    text.setStyle({ "baselineX": 0, "baselineY": 0, "color": "#FEF700", "fontFamily": "AnimeAce", "fontSize": "22px", "stroke": "#773300", "strokeThickness": 6, "shadow.offsetX": 5, "shadow.offsetY": 2, "shadow.color": "#773300", "shadow.stroke": true, "shadow.fill": true });

    // Level text
    const text_2 = scene.add.text(112, 180, "", {}).setScrollFactor(0).setDepth(2).setOrigin(0);
    text_2.text = "Level: ";
    text_2.setStyle({ "fontFamily": "VAGRounded", "fontSize": "24px", "stroke": "#16547E", "strokeThickness": 6, "shadow.offsetX": 4, "shadow.offsetY": 2, "shadow.color": "#16547E", "shadow.stroke": true, "shadow.fill": true, "resolution": 2 });

    // Level Number
    const text_3 = scene.add.text(184, 180, "", {}).setScrollFactor(0).setDepth(2).setOrigin(0);
    text_3.text = "1";
    text_3.setStyle({ "color": "#FE9C00", "fontFamily": "VAGRounded", "fontSize": "24px", "stroke": "#773300", "strokeThickness": 6, "shadow.offsetX": 4, "shadow.offsetY": 2, "shadow.color": "#773300", "shadow.stroke": true, "shadow.fill": true, "resolution": 2 });

    // Add avatar to this container
    const idFoneAvatar = scene.add.container(375, 329).setScrollFactor(0).setDepth(2);

    // Create avatar
    const playerData = idFoneData;

    let base;
    // Player Body
    if (playerData.base){
        base = scene.add.sprite(
            body['body']?.[playerData.gender]?.[playerData.base]?.["fitX"],
            body['body']?.[playerData.gender]?.[playerData.base]?.["fitY"],
            playerData.base,
            0
        ).setOrigin(0.5, 0.5);
    } else if (playerData.body){
        base = scene.add.sprite(
            body['body']?.[playerData.gender]?.[playerData.body]?.["fitX"],
            body['body']?.[playerData.gender]?.[playerData.body]?.["fitY"],
            playerData.body,
            0
        ).setOrigin(0.5, 0.5);
    }
    

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
        heads['head']?.[playerData.gender]?.[playerData.head]?.fitX,
        heads['head']?.[playerData.gender]?.[playerData.head]?.fitY,
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

    // Player Board
    const board = scene.add.image(
        boards['board']?.[playerData.board]?.["fitX"], 
        boards['board']?.[playerData.board]?.["fitY"], 
    playerData.board).setOrigin(0.5, 0.5);

    let faceacc;
    if (playerData.face_acc == "none"){
        faceacc = scene.add.image(0, 0, "faccEmpty").setOrigin(0.5, 0.5);
    } else {
        faceacc = scene.add.image(
            face_acc[playerData.gender]?.[playerData.face_acc]?.["fitX"],
            face_acc[playerData.gender]?.[playerData.face_acc]?.["fitY"],
        playerData.face_acc).setOrigin(0.5, 0.5);
    }
    
    idFoneAvatar.add([board, head, eyes, lips, brows, hair, base, bottom, shoe, top, outfit, faceacc]);
    idFoneAvatar.hair = hair;
    idFoneAvatar.outfit = outfit;
    performIdles(idFoneAvatar);

	const close_button = scene.add.image(770, 35, "closeButton").setInteractive().setScrollFactor(0).setDepth(2);
	close_button.scaleX = 0.75;
	close_button.scaleY = 0.75;

    // Add Buddy
    const addBuddy = scene.add.rectangle(308, 391, 60, 60).setInteractive().setAlpha(0.01).setScrollFactor(0).setDepth(2);
    
    // Go to User Home
    const homeButton = scene.add.rectangle(380, 391, 60, 60).setInteractive().setAlpha(0.01).setScrollFactor(0).setDepth(2);
    
    addBuddy.on('pointerup', (pointer, localX, localY, event) => {
        console.log("Create add buddy logic here");
    })
    
    homeButton.on('pointerup', (pointer, localX, localY, event) => {
        event.stopPropagation();
        screen_tint.destroy();
        idfoneBase.destroy();
        text.destroy();
        text_1.destroy();
        text_2.destroy();
        text_3.destroy();
        idFoneAvatar.destroy();
        homeButton.destroy();
        addBuddy.destroy();
        close_button.destroy();

        if (idFoneData.username == playerAvatarData.username){
            displayTint.destroy();
            starsText.destroy();
            text_4.destroy();
            text_5.destroy();
        }
        
        scene.scene.start('Home', {playerHomeID: idFoneData.username});
    });

    close_button.on('pointerup', (pointer, localX, localY, event) => {
        event.stopPropagation();
        screen_tint.destroy();
        idfoneBase.destroy();
        text.destroy();
        text_1.destroy();
        text_2.destroy();
        text_3.destroy();
        idFoneAvatar.destroy();
        homeButton.destroy();
        addBuddy.destroy();
        close_button.destroy();

        if (idFoneData.username == playerAvatarData.username){
            displayTint.destroy();
            starsText.destroy();
            text_4.destroy();
            text_5.destroy();
        }
        
    });
};