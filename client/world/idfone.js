import { getPlayerAvatarData } from "../game.js";
import { performIdles } from "./animations.js";
import { createStaticAvatar } from "./avatar.js";

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

    // Create avatar
    const playerData = idFoneData;
    const idFoneAvatar = createStaticAvatar(scene, 375, 329, 'left', playerData).setScrollFactor(0).setDepth(2);
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