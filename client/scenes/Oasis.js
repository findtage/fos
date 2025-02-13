import { setupMovement } from '../world/playerMovement.js';
import { joinRoom, sendPlayerMove } from '../network/socket.js';
import { preloadAvatar, createAvatar } from '../world/avatar.js';
import { initializePlayerManager } from '../world/playerManager.js';
import { createRoomTransitionUI } from '../world/roomTransition.js';
import { createMenu, preloadMenu } from '../world/UIManager.js';

export class Oasis extends Phaser.Scene {
    constructor() {
        super({ key: 'Oasis' });
    }

    preload() {
        this.sound.stopAll(); 
        preloadMenu(this)
        preloadAvatar(this); // Preload the player's avatar
    }

    async create() {
        const bg = this.add.image(0, 0, 'oasis').setOrigin(0, 0);
        bg.setScrollFactor(1); // Make sure it scrolls with the camera

        this.cameras.main.setBounds(0, 0, bg.width, this.scale.height);

        this.player = createAvatar(this, 900, 335);
        this.cameras.main.startFollow(this.player);

        initializePlayerManager(this);

        // Join the networked room
        this.room = await joinRoom(this, 'oasis'); 

        // Create Room Transitions
        createRoomTransitionUI(this, this.player, 'Dock', '', 1371, 384, 360, 224, 'Go to the Dock');

        createMenu(this, this.player, this.room);

        this.updateMovement = setupMovement(this, this.player, 200);   
    }

    update(time, delta) {
        if (this.updateMovement && this.room.connection.isOpen) this.updateMovement(delta);
        
        if (this.room && this.player && this.room.connection.isOpen) {
            sendPlayerMove(this.room, this.player.x, this.player.y, this.player.direction);
        }
    }
}

export class Dock extends Phaser.Scene {
    constructor() {
        super({ key: 'Dock' });
    }

    preload() {
        this.sound.stopAll(); 
        preloadMenu(this);
        preloadAvatar(this);
    }

    async create() {
        this.add.image(0, 0, 'dock').setOrigin(0, 0);
        
        this.player = createAvatar(this, 404, 259);
        initializePlayerManager(this);

        this.room = await joinRoom(this, 'dock'); 

        createRoomTransitionUI(this, this.player, 'Downtown', 'Downtown', 378, 124, 204, 122);

        createMenu(this, this.player, this.room);
        
        this.updateMovement = setupMovement(this, this.player, 200);
    }
    
    update(time, delta) {
        if (this.updateMovement && this.room.connection.isOpen) this.updateMovement(delta);
        
        if (this.room && this.player && this.room.connection.isOpen) {
            sendPlayerMove(this.room, this.player.x, this.player.y, this.player.direction);
        }
    }

}