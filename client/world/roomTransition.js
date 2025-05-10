/**
 * Creates a room transition UI element.
 * @param {Phaser.Scene} scene - The current Phaser scene.
 * @param {Phaser.GameObjects.Sprite} player - The player object.
 * @param {string} targetScene - The key of the scene to transition to.
 * @param {string} roomName - The name of the room displayed to the user.
 * @param {number} x - The x-coordinate of the container's starting position.
 * @param {number} y - The y-coordinate of the container's starting position.
 * @param {number} width - The width of the transition container.
 * @param {number} height - The height of the transition container.
 */


export function createRoomTransitionUI(scene, player, targetScene, roomName, x, y, width, height, entranceMessage="Go to\n") {
    const container = scene.add.rectangle(x, y, width, height, 0xaaaaaa).setInteractive();
    container.setOrigin(0.5, 1);
    container.setFillStyle(0xaaaaaa, 0);
    //container.setAlpha(0)

    const popup = scene.add.text(x, y - 20, `${entranceMessage}${roomName}`, {
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

    let isTransitioning = false;

    // Handle click
    container.on('pointerup', () => {
        if (isTransitioning) return; // Ignore clicks if already transitioning
        isTransitioning = true; // Set flag to prevent further clicks
        // Set the player's destination
        player.targetX = x;
        player.targetY = y;

        // Monitor player position in the update loop
        const checkArrival = scene.time.addEvent({
            loop: true,
            delay: 50, // Check every 50ms
            callback: () => {
                // Check if the player has reached the target
                if (
                    Phaser.Math.Distance.Between(player.x, player.y, x, y) <= 20
                ) {
                    // Stop checking
                    checkArrival.remove(false);

                    // Transition to the target scene
                    console.log(`Transitioning to scene: ${targetScene}`);
                    scene.scene.start(targetScene);
                }
            },
        });
    });
}

export function mapTransition(scene, targetScene) {
    console.log(`Transitioning to scene: ${targetScene}`);
    scene.scene.start(targetScene);
}


