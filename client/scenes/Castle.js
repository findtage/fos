import { setupMovement } from '../world/playerMovement.js';
import { joinRoom, sendPlayerMove } from '../network/socket.js';
import { preloadAvatar, createAvatar } from '../world/avatar.js';
import { initializePlayerManager } from '../world/playerManager.js';
import { createRoomTransitionUI } from '../world/roomTransition.js';
import { createMenu, preloadMenu } from '../world/UIManager.js';

//havent set up correct coordinates

export class Castle extends Phaser.Scene {
    constructor() {
        super({ key: 'Castle' });
    }

    preload() {
        this.sound.stopAll(); 
        preloadMenu(this);
        preloadAvatar(this);
    }

    async create() {
        this.add.image(0, 0, 'castle').setOrigin(0, 0);
        
        this.player = createAvatar(this, 382, 428);
        initializePlayerManager(this);

        this.room = await joinRoom(this, 'castle');
        createRoomTransitionUI(this, this.player, 'PetTown', 'Pet Town', 27, 418, 52, 205);
        createRoomTransitionUI(this, this.player, 'CastleYard', '', 392, 293, 212, 159, "Enter the\n Castle Yard");
        createRoomTransitionUI(this, this.player, 'Mountain', 'Mt. Fantage', 774, 426, 53, 187)

        createMenu(this, this.player, this.room);
        
        this.updateMovement = setupMovement(this, this.player, 200);

        this.castle_music = this.sound.add('castle_music', { loop: true, volume: 0.5 });
        this.castle_music.play();

    }
    
    update(time, delta) {
        if (this.updateMovement && this.room.connection.isOpen) this.updateMovement(delta);
        
        if (this.room && this.player && this.room.connection.isOpen) {
            sendPlayerMove(this.room, this.player.x, this.player.y, this.player.direction);
        }
    }

}

export class CastleYard extends Phaser.Scene {
    constructor() {
        super({ key: 'CastleYard' });
    }

    preload() {
        this.sound.stopAll(); 
        preloadMenu(this)
        preloadAvatar(this); // Preload the player's avatar
    }

    async create() {
        const bg = this.add.image(0, 0, 'castleyard').setOrigin(0, 0);
        bg.setScrollFactor(1); // Make sure it scrolls with the camera

        this.cameras.main.setBounds(0, 0, bg.width, this.scale.height);

        this.player = createAvatar(this, 994, 409);
        this.cameras.main.startFollow(this.player);

        initializePlayerManager(this);

        // Join the networked room
        this.room = await joinRoom(this, 'castleyard'); 

        // Create Room Transitions
        createRoomTransitionUI(this, this.player, 'CastleInside', '', 996, 221, 165, 211, "Go inside\nthe Castle");
        createRoomTransitionUI(this, this.player, 'Mountain', 'Mountain', 119, 254, 187, 305)

        createMenu(this, this.player, this.room);

        this.updateMovement = setupMovement(this, this.player, 200);   

        this.castle_music = this.sound.add('castle_music', { loop: true, volume: 0.5 });
        this.castle_music.play();
    }

    update(time, delta) {
        if (this.updateMovement && this.room.connection.isOpen) this.updateMovement(delta);
        
        if (this.room && this.player && this.room.connection.isOpen) {
            sendPlayerMove(this.room, this.player.x, this.player.y, this.player.direction);
        }
    }
}

export class CastleInside extends Phaser.Scene {
    constructor() {
        super({ key: 'CastleInside' });
    }

    preload() {
        preloadMenu(this)
        preloadAvatar(this); // Preload the player's avatar
    }

    async create() {
        const bg = this.add.image(0, 0, 'castleinside').setOrigin(0, 0);
        bg.setScrollFactor(1); // Make sure it scrolls with the camera

        this.cameras.main.setBounds(0, 0, bg.width, this.scale.height);

        this.player = createAvatar(this, 677, 446);
        this.cameras.main.startFollow(this.player);

        initializePlayerManager(this);

        // Join the networked room
        this.room = await joinRoom(this, 'castleinside'); 

        // Create Room Transitions
        createRoomTransitionUI(this, this.player, 'CastleYard', '', 98, 177, 177, 246, 'Exit the\nCastle');

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
