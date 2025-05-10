/**
 * Creates a room transition UI element.
 * @param {Phaser.Scene} scene - The current Phaser scene.
 * @param {string} gameName - The name of the room displayed to the user.
 * @param {number} x - The x-coordinate of the container's starting position.
 * @param {number} y - The y-coordinate of the container's starting position.
 * @param {number} width - The width of the transition container.
 * @param {number} height - The height of the transition container.
 */

import { joinRoom } from '../network/socket.js';
import { getPlayerAvatarData, updateLocalAvatarData } from '../game.js';
import { publicURL } from '../env.js';


export function createPlayGameMessage(scene, gameName, x, y, width, height, texture_Name, fileName = "") {
    const container = scene.add.ellipse(x, y, width, height, 0xaaaaaa).setInteractive();
    container.setOrigin(0.5);
    container.setFillStyle(0xaaaaaa, 0);

    const popup = scene.add.text(x, y - 20, `Play ${gameName}`, {
        fontSize: '12.5px',
        color: '#000000',
        backgroundColor: '#FFFDCD',
        fontFamily: 'Verdana',
        padding: { left: 5, right: 5, top: 2, bottom: 2 },
    }).setOrigin(0.5).setVisible(false);

    popup.setAlign('center');

    // Calculate text bounds to size the background
    const textBounds = popup.getBounds();
    const backgroundWidth = textBounds.width;
    const backgroundHeight = textBounds.height;

    // Add a graphics object for the border rectangle
    const popupBg = scene.add.graphics();
    popupBg.fillStyle('#FFFDCD', 1); 
    popupBg.lineStyle(0.5, '#000000', 1); // Thin black border
    popupBg.fillRect(
        textBounds.x, // Position adjusted for padding
        textBounds.y,
        backgroundWidth,
        backgroundHeight,
    );
    
    popupBg.strokeRect(
        textBounds.x, // Position adjusted for padding
        textBounds.y,
        backgroundWidth,
        backgroundHeight,
    );
    
    
    // Ensure the text appears above the background
    scene.children.bringToTop(popup);

    // Initially hide both the text and background
    popupBg.setVisible(false);


    // Show popup when hovering
    container.on('pointerover', () => popup.setVisible(true));
    container.on('pointerover', () => popupBg.setVisible(true));
    container.on('pointerout', () => popup.setVisible(false));
    container.on('pointerout', () => popupBg.setVisible(false));

    // Handle click
    container.on('pointerup', (pointer, localX, localY, event) => {
        event.stopPropagation();

        // Add screen tint
		const screen_tint = scene.add.rectangle(0, 0, 800, 520).setOrigin(0, 0).setScrollFactor(0).setDepth(2).setInteractive();
		screen_tint.isFilled = true;
		screen_tint.fillColor = 0;
		screen_tint.fillAlpha = 0.4;
		screen_tint.strokeColor = 11184810;

        screen_tint.on('pointerup', (pointer, localX, localY, event) => {
            event.stopPropagation();
        });
        

        // Add popup
        const game_popup = scene.add.image(0, 0, texture_Name).setScrollFactor(0).setDepth(2);
		game_popup.setOrigin(0, 0);

        // Add 2 buttons for yes and no
        const yes_button = scene.add.rectangle(335, 293, 100, 25, 0xffffff, 0).setInteractive().setScrollFactor(0).setDepth(2);
        const no_button = scene.add.rectangle(448, 293, 100, 25, 0xffffff, 0).setInteractive().setScrollFactor(0).setDepth(2);
    
        // If no is pressed remove popup and tint and kill buttons
        no_button.on('pointerup', (pointer, localX, localY, event) => {
            event.stopPropagation();
            screen_tint.destroy();
            game_popup.destroy();
            yes_button.destroy();
            no_button.destroy();
        });

        // If yes is pressed switch to game scene
        yes_button.on('pointerup', async (pointer, localX, localY, event) => {
            event.stopPropagation();
            // Start 
            await joinRoom(this, 'minigame'); 
            if (gameName == "Mouse Out"){
                scene.scene.start('MouseOut');
            } else if (gameName == 'Type Boo'){
                scene.scene.start('TypeBoo');
            } else {
                scene.scene.start('RuffleScene', {gameName: fileName});
            }
        });

    });
}

export async function incrementStarsInDB(starsToAdd) {
    const updatedData = {stars: starsToAdd+getPlayerAvatarData().stars}
    try {
            const response = await fetch(publicURL+"/api/user/update", {
                
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(updatedData)
            });
    
            const data = await response.json();
            if (data.success) {
                console.log("✅ Changes saved successfully!");
                updateLocalAvatarData(updatedData); // ✅ Also update locally so changes persist between scenes
                console.log("Updated local data:", getPlayerAvatarData())
            } else {
                console.error("❌ Failed to save changes:", data.message);
            }
        } catch (error) {
            console.error("❌ Error saving changes:", error);
        }
}
