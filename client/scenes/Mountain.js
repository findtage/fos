import { stepMovementUpdates, setupMovement } from '../world/playerMovement.js';
import { joinRoom } from '../network/socket.js';
import { preloadAvatar, createAvatar } from '../world/avatar.js';
import { initializePlayerManager } from '../world/playerManager.js';
import { createRoomTransitionUI } from '../world/roomTransition.js';
import { createMenu, preloadMenu } from '../world/UIManager.js';
import { performIdles } from '../world/animations.js';

export class Mountain extends Phaser.Scene {
    constructor() {
        super({ key: 'Mountain' });
    }

    init(data) {
        this.playerXLocation = data.playerXLocation || 955;
        this.playerYLocation = data.playerYLocation || 402; 
        this.playerDirection = data.playerDirection || 'left';
    }

    preload() {
        this.sound.stopAll(); 
        preloadMenu(this);
        preloadAvatar(this); // Preload the player's avatar
    }

    async create() {
        const bg = this.add.image(0, 0, 'mountain').setOrigin(0, 0);
        bg.setScrollFactor(1); // Make sure it scrolls with the camera

        this.cameras.main.setBounds(0, 0, bg.width, this.scale.height);

        this.player = createAvatar(this, this.playerXLocation, this.playerYLocation, this.playerDirection);
        performIdles(this.player);
        this.cameras.main.startFollow(this.player);

        initializePlayerManager(this);

        // Join the networked room
        this.room = await joinRoom(this, 'mountain'); 

        // Create Room Transitions
        createRoomTransitionUI(this, this.player, 'CastleYard', 'Castle Yard', 1956, 450, 88, 141, "Go to the\n");
        createRoomTransitionUI(this, this.player, 'Cabin', 'Cabin', 1287, 98, 156, 108);
        //createRoomTransitionUI(this, this.player, 'ReporterHQ', 'Comet & Co.', 513, 189, 94, 118);

        createMenu(this, this.player, this.room);

        this.updateMovement = setupMovement(this, this.player, 200);

        this.mtfantage_music = this.sound.add('mtfantage_music', { loop: true, volume: 0.25 });
        this.mtfantage_music.play();
    }

    update(time, delta) {
        if (this.updateMovement && this.room.connection.isOpen) this.updateMovement(delta);
        
        stepMovementUpdates(this, delta);
    }
}

export class Cabin extends Phaser.Scene {
    constructor() {
        super({ key: 'Cabin' });
    }

    init(data) {
        this.playerXLocation = data.playerXLocation || 250;
        this.playerYLocation = data.playerYLocation || 403; 
        this.playerDirection = data.playerDirection || 'left';
    }

    preload() {
        preloadMenu(this);
        preloadAvatar(this);
    }

    async create() {
        this.add.image(0, 0, 'cabin').setOrigin(0, 0);
        
        this.player = createAvatar(this, this.playerXLocation, this.playerYLocation, this.playerDirection);
        performIdles(this.player);
        initializePlayerManager(this);

        this.room = await joinRoom(this, 'cabin'); 

        createRoomTransitionUI(this, this.player, 'Mountain', 'Mt. Fantage', 61, 284, 109, 182);

        createMenu(this, this.player, this.room);
        
        this.updateMovement = setupMovement(this, this.player, 200);
    }
    
    update(time, delta) {
        if (this.updateMovement && this.room.connection.isOpen) this.updateMovement(delta);
        
        stepMovementUpdates(this, delta);
    }

}