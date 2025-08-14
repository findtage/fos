import { stepMovementUpdates, setupMovement } from '../world/playerMovement.js';
import { joinRoom } from '../network/socket.js';
import { preloadAvatar, createAvatar } from '../world/avatar.js';
import { initializePlayerManager } from '../world/playerManager.js';
import { createRoomTransitionUI } from '../world/roomTransition.js';
import { createMenu, preloadMenu } from '../world/UIManager.js';
import { performIdles } from '../world/animations.js';

export class Ship extends Phaser.Scene {
    constructor() {
        super({ key: 'Ship' });
    }

    init(data) {
        this.playerXLocation = data.playerXLocation || 770;
        this.playerYLocation = data.playerYLocation || 404; 
        this.playerDirection = data.playerDirection || 'left';
    }

    preload() {
        this.sound.stopAll(); 
        preloadMenu(this);
        preloadAvatar(this); // Preload the player's avatar
    }

    async create() {
        const bg = this.add.image(0, 0, 'ship').setOrigin(0, 0);
        bg.setScrollFactor(1); // Make sure it scrolls with the camera

        this.cameras.main.setBounds(0, 0, bg.width, this.scale.height);

        this.player = createAvatar(this, this.playerXLocation, this.playerYLocation, this.playerDirection);
        performIdles(this.player);
        this.cameras.main.startFollow(this.player);

        initializePlayerManager(this);

        // Join the networked room
        this.room = await joinRoom(this, 'ship'); 

        // Create Room Transitions
        createRoomTransitionUI(this, this.player, 'Beach', '', 1566, 218, 211, 148, "Exit to\nthe beach");
        createRoomTransitionUI(this, this.player, 'Restaurant', '', 94, 288, 153, 264, "Go to the\n Restaurant");

        createMenu(this, this.player, this.room);

        this.updateMovement = setupMovement(this, this.player, 200);

        this.ship_music = this.sound.add('ship_music', { loop: true, volume: 0.5 });
        this.ship_music.play();
        
    }

    update(time, delta) {
        if (this.updateMovement && this.room.connection.isOpen) this.updateMovement(delta);
        
        stepMovementUpdates(this, delta);
    }
}

export class Restaurant extends Phaser.Scene {
    constructor() {
        super({ key: 'Restaurant' });
    }

    init(data) {
        this.playerXLocation = data.playerXLocation || 486;
        this.playerYLocation = data.playerYLocation || 391; 
        this.playerDirection = data.playerDirection || 'left';
    }

    preload() {
        this.sound.stopAll(); 
        preloadMenu(this);
        preloadAvatar(this); // Preload the player's avatar
    }

    async create() {
        const bg = this.add.image(0, 0, 'restaurant').setOrigin(0, 0);
        bg.setScrollFactor(1); // Make sure it scrolls with the camera

        this.cameras.main.setBounds(0, 0, bg.width, this.scale.height);

        this.player = createAvatar(this, this.playerXLocation, this.playerYLocation, this.playerDirection);
        performIdles(this.player);
        this.cameras.main.startFollow(this.player);

        initializePlayerManager(this);

        // Join the networked room
        this.room = await joinRoom(this, 'restaurant'); 

        // Create Room Transitions
        createRoomTransitionUI(this, this.player, 'Ship', '', 504, 187, 108, 97, "Exit to\nthe restaurant");

        createMenu(this, this.player, this.room);

        this.updateMovement = setupMovement(this, this.player, 200);

        this.chez_music = this.sound.add('chez_music', { loop: true, volume: 0.5 });
        this.chez_music.play();
        
    }

    update(time, delta) {
        if (this.updateMovement && this.room.connection.isOpen) this.updateMovement(delta);
        
        stepMovementUpdates(this, delta);
    }
}