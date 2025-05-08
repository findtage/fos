/**
 * The click handler for movement in a room.
 * 
 * @param {*} scene Target scene
 */
export function setupMovement(scene) {
    let player = scene.player;
    
    scene.input.on('pointerup', (pointer) => {
        if (pointer.event.defaultPrevented) return;
        if (player.isJumping || player.isCrying) return;
        scene.playersTargetPosition[scene.room.sessionId] = { x: pointer.worldX, y: pointer.worldY }; // Store target position
        if (scene.room) {
            // Determine direction initially. Quick n dirty fix but *shrug*
            const targetPosition = scene.playersTargetPosition[scene.room.sessionId];
            const angle = Phaser.Math.Angle.Between(player.x, player.y, targetPosition.x, targetPosition.y);
            const velocityX = Math.cos(angle);
            const direction = velocityX > 0 ? 'right' : 'left';

            scene.room.send('move', { x: pointer.worldX, y: pointer.worldY, direction}); //direction: player.base.getData('direction') 
        }
    });
}

/**
 * A function that goes through the list of players actively moving and updates their position.
 * When the player reaches the target position, they get removed from the update array.
 * 
 * @param {*} scene Target scene 
 * @param {*} delta Delta time 
 */
export function stepMovementUpdates(scene, delta) {
    if (scene.room && scene.player && scene.room.connection.isOpen) {
        // If local player is in a valid room, cycle through updates and lerp the position.
        for(var id in scene.playersTargetPosition) {
            let curPlayer = scene.room.sessionId == id ? scene.player : scene.otherPlayers[id];
            lerpMovement(scene, id, curPlayer, scene.playersTargetPosition[id], delta);
        }
    }
}

// The function that lerps the player's current position to the target position.
function lerpMovement(scene, id, player, targetPosition, delta) {
    let moveSpeed = 250;
    
    if (targetPosition) {
        if(player == null) {
            scene.playersTargetPosition[id] = null;
            return;
        }

        // Calculate distance to the target
        const distance = Phaser.Math.Distance.Between(player.x, player.y, targetPosition.x, targetPosition.y);

        if (distance < 4) {
            // Stop moving when close enough
            player.setPosition(targetPosition.x, targetPosition.y);
            scene.playersTargetPosition[id] = null;
        } else {
            // Calculate angle and move the player
            const angle = Phaser.Math.Angle.Between(player.x, player.y, targetPosition.x, targetPosition.y);
            const velocityX = Math.cos(angle) * (moveSpeed * (delta / 1000));
            const velocityY = Math.sin(angle) * (moveSpeed * (delta / 1000));

            // Flip the avatar container based on movement direction
            if (velocityX > 0 && player.base.getData('direction') !== 'right') {
                // Moving right: flip to face right
                player.setScale(-1, 1);
                // Keep name tag facing the same direction
                player.nameTag.setScale(-1, 1);
                player.base.setData('direction', 'right');
                player.direction = 'right';
            } else if (velocityX < 0 && player.base.getData('direction') !== 'left') {
                // Moving left: keep the initial left-facing direction
                player.setScale(1, 1);
                player.nameTag.setScale(1, 1);
                player.base.setData('direction', 'left');
                player.direction = 'left';
            }

            player.x += velocityX;
            player.y += velocityY;

            
        }
    }
    
}
