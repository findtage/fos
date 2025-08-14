import { stepMovementUpdates, setupMovement } from '../world/playerMovement.js';
import { joinRoom } from '../network/socket.js';
import { preloadAvatar, createAvatar } from '../world/avatar.js';
import { initializePlayerManager } from '../world/playerManager.js';
import { createRoomTransitionUI } from '../world/roomTransition.js';
import { createMenu, preloadMenu } from '../world/UIManager.js';
import { performIdles } from '../world/animations.js';
import { createPlayGameMessage } from '../minigames/startMiniGame.js';
import { castleCatalog } from '../world/shops.js';

//havent set up correct coordinates

export class Castle extends Phaser.Scene {
    constructor() {
        super({ key: 'Castle' });
    }

    init(data) {
        this.playerXLocation = data.playerXLocation || 382;
        this.playerYLocation = data.playerYLocation || 428; 
        this.playerDirection = data.playerDirection || 'left';
    }

    preload() {
        this.add.image(0, 0, "loading_bg").setOrigin(0);
        this.sound.stopAll(); 
        preloadMenu(this);
        preloadAvatar(this);

        // Load assets for mini-game popups
        this.load.image('mouseOut_popup', '../assets/mini_games/MouseOut/mouseOut_popup.png')
    }

    async create() {
        this.add.image(0, 0, 'castle').setOrigin(0, 0);
        
        this.player = createAvatar(this, this.playerXLocation, this.playerYLocation, this.playerDirection);
        performIdles(this, this.player);
        initializePlayerManager(this);

        this.room = await joinRoom(this, 'castle');
        createRoomTransitionUI(this, this.player, 'PetTown', 'Pet Town', 27, 418, 52, 205);
        createRoomTransitionUI(this, this.player, 'CastleYard', '', 392, 293, 212, 159, "Enter the\n Castle Yard");
        createRoomTransitionUI(this, this.player, 'Mountain', 'Mt. Fantage', 774, 426, 53, 187)
        createPlayGameMessage(this, "Mouse Out", 167, 387, 45, 45, 'mouseOut_popup');

        createMenu(this, this.player, this.room);
        
        this.updateMovement = setupMovement(this, this.player, 200);

        this.castle_music = this.sound.add('castle_music', { loop: true, volume: 0.5 });
        this.castle_music.play();

    }
    
    update(time, delta) {
        if (this.updateMovement && this.room.connection.isOpen) this.updateMovement(delta);
        
        stepMovementUpdates(this, delta);
    }

}

export class CastleYard extends Phaser.Scene {
    constructor() {
        super({ key: 'CastleYard' });
    }

    init(data) {
        this.playerXLocation = data.playerXLocation || 994;
        this.playerYLocation = data.playerYLocation || 409; 
        this.playerDirection = data.playerDirection || 'left';
    }

    preload() {
        this.sound.stopAll(); 
        preloadMenu(this)
        preloadAvatar(this); // Preload the player's avatar

        // Load assets for mini-game popups
        this.load.image('mouseOut_popup', '../assets/mini_games/MouseOut/mouseOut_popup.png')
    }

    async create() {
        const bg = this.add.image(0, 0, 'castleyard').setOrigin(0, 0);
        bg.setScrollFactor(1); // Make sure it scrolls with the camera

        this.cameras.main.setBounds(0, 0, bg.width, this.scale.height);

        this.player = createAvatar(this, this.playerXLocation, this.playerYLocation, this.playerDirection);
        performIdles(this, this.player);
        this.cameras.main.startFollow(this.player);

        initializePlayerManager(this);

        // Join the networked room
        this.room = await joinRoom(this, 'castleyard'); 

        // Create Room Transitions
        createRoomTransitionUI(this, this.player, 'CastleInside', '', 996, 221, 165, 211, "Go inside\nthe Castle");
        createRoomTransitionUI(this, this.player, 'Mountain', 'Mountain', 119, 254, 187, 305);

        createMenu(this, this.player, this.room);

        createPlayGameMessage(this, "Mouse Out", 1076, 193, 60, 60, 'mouseOut_popup');

        this.updateMovement = setupMovement(this, this.player, 200);   

        this.castle_music = this.sound.add('castle_music', { loop: true, volume: 0.5 });
        this.castle_music.play();
    }

    update(time, delta) {
        if (this.updateMovement && this.room.connection.isOpen) this.updateMovement(delta);
        
        stepMovementUpdates(this, delta);
    }
}

export class CastleInside extends Phaser.Scene {
    constructor() {
        super({ key: 'CastleInside' });
    }

    init(data) {
        this.playerXLocation = data.playerXLocation || 677;
        this.playerYLocation = data.playerYLocation || 446;
        this.playerDirection = data.playerDirection || 'left';
    }

    preload() {
        preloadMenu(this)
        preloadAvatar(this); // Preload the player's avatar

        this.sound.stopAll(); 

        this.load.image('typeBoo_popup', '../assets/mini_games/TypeBoo/typeBoo_popup.png')
    }

    async create() {
        const bg = this.add.image(0, 0, 'castleinside').setOrigin(0, 0);
        bg.setScrollFactor(1); // Make sure it scrolls with the camera

        this.cameras.main.setBounds(0, 0, bg.width, this.scale.height);

        this.player = createAvatar(this, this.playerXLocation, this.playerYLocation, this.playerDirection);
        performIdles(this, this.player);
        this.cameras.main.startFollow(this.player);

        initializePlayerManager(this);

        // Join the networked room
        this.room = await joinRoom(this, 'castleinside'); 

        // Create Room Transitions
        createRoomTransitionUI(this, this.player, 'CastleYard', '', 98, 177, 177, 246, 'Exit the\nCastle');

        createPlayGameMessage(this, "Type Boo", 1131, 102, 80, 80, 'typeBoo_popup');

        createMenu(this, this.player, this.room);
        castleCatalog(this, this.player, this.room);

        this.castle_music = this.sound.add('castle_music', { loop: true, volume: 0.5 });
        this.castle_music.play();

        this.updateMovement = setupMovement(this, this.player, 200);   
    }

    update(time, delta) {
        if (this.updateMovement && this.room.connection.isOpen) this.updateMovement(delta);
        
        stepMovementUpdates(this, delta);
    }
}
