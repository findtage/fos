import { setupMovement } from '../world/playerMovement.js';
import { joinRoom, sendPlayerMove } from '../network/socket.js';
import { preloadAvatar, createAvatar } from '../world/avatar.js';
import { initializePlayerManager } from '../world/playerManager.js';
import { createRoomTransitionUI } from '../world/roomTransition.js';
import { createMenu, preloadMenu } from '../world/UIManager.js';

export class Lighthouse extends Phaser.Scene {
    constructor() {
        super({ key: 'Lighthouse' });
    }

    preload() {
        this.sound.stopAll(); 
        preloadMenu(this);
        preloadAvatar(this); // Preload the player's avatar
    }

    async create() {
        const bg = this.add.image(0, 0, 'lighthouse').setOrigin(0, 0);
        bg.setScrollFactor(1); // Make sure it scrolls with the camera

        this.cameras.main.setBounds(0, 0, bg.width, this.scale.height);

        this.player = createAvatar(this);
        this.cameras.main.startFollow(this.player);

        initializePlayerManager(this);

        // Join the networked room
        this.room = await joinRoom(this, 'lighthouse'); // Ensure your server supports this room

        // Create Room Transitions
        createRoomTransitionUI(this, this.player, 'LighthouseInside', '', 582, 261, 141, 147, "Go inside the\nLighthouse");
        createRoomTransitionUI(this, this.player, 'Carnival', 'Carnival', 1364, 94, 423, 188);

        createMenu(this, this.player, this.room);

        this.updateMovement = setupMovement(this, this.player, 200);

        this.beach_music = this.sound.add('beach_music', { loop: true, volume: 0.5 });
        this.beach_music.play();
    }

    update(time, delta) {
        if (this.updateMovement && this.room.connection.isOpen) this.updateMovement(delta);
        
        if (this.room && this.player && this.room.connection.isOpen) {
            sendPlayerMove(this.room, this.player.x, this.player.y, this.player.direction);
        }
    }
    
}

export class LighthouseInside extends Phaser.Scene {
    constructor() {
        super({ key: 'LighthouseInside' });
    }

    preload() {
        preloadMenu(this);
        preloadAvatar(this);
    }

    async create() {
        this.add.image(0, 0, 'lighthouse_inside').setOrigin(0, 0);
        
        this.player = createAvatar(this, 218, 387);
        initializePlayerManager(this);

        this.room = await joinRoom(this, 'lighthouse_inside'); 

        createRoomTransitionUI(this, this.player, 'Lighthouse', '', 76, 188, 126, 148, "Go outside");
        createRoomTransitionUI(this, this.player, 'LighthouseRoof', '', 257, 53, 120, 106, "Go up");

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

export class LighthouseRoof extends Phaser.Scene {
    constructor() {
        super({ key: 'LighthouseRoof' });
    }

    preload() {
        preloadMenu(this);
        preloadAvatar(this); // Preload the player's avatar
    }

    async create() {
        const bg = this.add.image(0, 0, 'lighthouse_roof').setOrigin(0, 0);
        bg.setScrollFactor(1); // Make sure it scrolls with the camera

        this.cameras.main.setBounds(0, 0, bg.width, this.scale.height);

        this.player = createAvatar(this, 508, 310);
        this.cameras.main.startFollow(this.player);

        initializePlayerManager(this);

        // Join the networked room
        this.room = await joinRoom(this, 'lighthouse_roof'); // Ensure your server supports this room

        // Create Room Transitions
        createRoomTransitionUI(this, this.player, 'LighthouseInside', '', 367, 323, 128, 91, "Go down");

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