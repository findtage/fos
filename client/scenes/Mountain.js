import { setupMovement } from '../world/playerMovement.js';
import { joinRoom, sendPlayerMove } from '../network/socket.js';
import { preloadAvatar, createAvatar } from '../world/avatar.js';
import { initializePlayerManager } from '../world/playerManager.js';
import { createRoomTransitionUI } from '../world/roomTransition.js';
import { createMenu, preloadMenu } from '../world/UIManager.js';

export class Mountain extends Phaser.Scene {
    constructor() {
        super({ key: 'Mountain' });
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

        this.player = createAvatar(this, 955, 402);
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
        
        if (this.room && this.player && this.room.connection.isOpen) {
            sendPlayerMove(this.room, this.player.x, this.player.y, this.player.direction);
        }
    }
}

export class Cabin extends Phaser.Scene {
    constructor() {
        super({ key: 'Cabin' });
    }

    preload() {
        preloadMenu(this);
        preloadAvatar(this);
    }

    async create() {
        this.add.image(0, 0, 'cabin').setOrigin(0, 0);
        
        this.player = createAvatar(this, 250, 403);
        initializePlayerManager(this);

        this.room = await joinRoom(this, 'cabin'); 

        createRoomTransitionUI(this, this.player, 'Mountain', 'Mt. Fantage', 61, 284, 109, 182);

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