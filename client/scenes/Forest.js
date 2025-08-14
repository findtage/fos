import { stepMovementUpdates, setupMovement } from '../world/playerMovement.js';
import { joinRoom } from '../network/socket.js';
import { preloadAvatar, createAvatar } from '../world/avatar.js';
import { initializePlayerManager } from '../world/playerManager.js';
import { createRoomTransitionUI } from '../world/roomTransition.js';
import { createMenu, preloadMenu } from '../world/UIManager.js';
import { performIdles } from '../world/animations.js';

export class Forest extends Phaser.Scene {
    constructor() {
        super({ key: 'Forest' });
    }

    init(data) {
        this.playerXLocation = data.playerXLocation || 328;
        this.playerYLocation = data.playerYLocation || 446; 
        this.playerDirection = data.playerDirection || 'left';
    }

    preload() {
        this.sound.stopAll(); 
        preloadMenu(this);
        preloadAvatar(this); // Preload the player's avatar
    }

    async create() {
        const bg = this.add.image(0, 0, 'forest').setOrigin(0, 0);
        bg.setScrollFactor(1); // Make sure it scrolls with the camera

        this.cameras.main.setBounds(0, 0, bg.width, this.scale.height);

        this.player = createAvatar(this, this.playerXLocation, this.playerYLocation, this.playerDirection);
        performIdles(this, this.player);
        this.cameras.main.startFollow(this.player);

        initializePlayerManager(this);

        // Join the networked room
        this.room = await joinRoom(this, 'forest'); 

        // Create Room Transitions
        createRoomTransitionUI(this, this.player, 'Castle', 'Castle', 130, 276, 184, 228);
        createRoomTransitionUI(this, this.player, 'Wizard', "Orion's Rare Finds", 424, 186, 259, 187);
        createRoomTransitionUI(this, this.player, 'Grotto', 'Enchanted Grotto', 1187, 221, 131, 150);
        //createRoomTransitionUI(this, this.player, 'LuckyBob', "Lucky Bob's Trading", 1555, 160, 261, 186);
        createRoomTransitionUI(this, this.player, 'School', 'Fantage School', 1516, 473, 180, 94);
        createRoomTransitionUI(this, this.player, 'CreatureArea', 'Creature Area', 1865, 161, 181, 164);

        createMenu(this, this.player, this.room);

        this.updateMovement = setupMovement(this, this.player, 200);

        this.forest_music = this.sound.add('forest_music', { loop: true, volume: 0.5 });
        this.forest_music.play();
    }

    update(time, delta) {
        if (this.updateMovement && this.room.connection.isOpen) this.updateMovement(delta);
        
        stepMovementUpdates(this, delta);
    }
}

export class Wizard extends Phaser.Scene {
    constructor() {
        super({ key: 'Wizard' });
    }

    init(data) {
        this.playerXLocation = data.playerXLocation || 454;
        this.playerYLocation = data.playerYLocation || 365; 
        this.playerDirection = data.playerDirection || 'left';
    }

    preload() {
        this.sound.stopAll(); 
        preloadMenu(this);
        preloadAvatar(this);
    }

    async create() {
        this.add.image(0, 0, 'wizard').setOrigin(0, 0);
        
        this.player = createAvatar(this, this.playerXLocation, this.playerYLocation, this.playerDirection);
        performIdles(this, this.player);
        initializePlayerManager(this);

        this.room = await joinRoom(this, 'wizard'); 

        createRoomTransitionUI(this, this.player, 'Forest', 'Forest', 416, 154, 106, 143);

        createMenu(this, this.player, this.room);
        
        this.updateMovement = setupMovement(this, this.player, 200);

        this.wizard_music = this.sound.add('wizard_music', { loop: true, volume: 0.5 });
        this.wizard_music.play();
    }
    
    update(time, delta) {
        if (this.updateMovement && this.room.connection.isOpen) this.updateMovement(delta);
        
        stepMovementUpdates(this, delta);
    }

}

export class Grotto extends Phaser.Scene {
    constructor() {
        super({ key: 'Grotto' });
    }

    init(data) {
        this.playerXLocation = data.playerXLocation || 410;
        this.playerYLocation = data.playerYLocation || 253+60; 
        this.playerDirection = data.playerDirection || 'left';
    }

    preload() {
        preloadMenu(this);
        preloadAvatar(this);
    }

    async create() {
        this.add.image(0, 0, 'grotto').setOrigin(0, 0);
        
        this.player = createAvatar(this, this.playerXLocation, this.playerYLocation, this.playerDirection);
        performIdles(this, this.player);
        initializePlayerManager(this);

        this.room = await joinRoom(this, 'grotto'); 

        createRoomTransitionUI(this, this.player, 'Forest', 'Forest', 101, 103, 98, 129);
        createRoomTransitionUI(this, this.player, 'GrottoSecretOne', '', 673, 413, 164, 155, "Travel to the\nSecret Fairyland");

        createMenu(this, this.player, this.room);
        
        this.updateMovement = setupMovement(this, this.player, 200);
    }
    
    update(time, delta) {
        if (this.updateMovement && this.room.connection.isOpen) this.updateMovement(delta);
        
        stepMovementUpdates(this, delta);
    }

}

export class GrottoSecretOne extends Phaser.Scene {
    constructor() {
        super({ key: 'GrottoSecretOne' });
    }

    init(data) {
        this.playerXLocation = data.playerXLocation || 292;
        this.playerYLocation = data.playerYLocation || 317+60; 
        this.playerDirection = data.playerDirection || 'left';
    }

    preload() {
        preloadMenu(this);
        preloadAvatar(this); // Preload the player's avatar
    }

    async create() {
        const bg = this.add.image(0, 0, 'grotto_secret_one').setOrigin(0, 0);
        bg.setScrollFactor(1); // Make sure it scrolls with the camera

        this.cameras.main.setBounds(0, 0, bg.width, this.scale.height);

        this.player = createAvatar(this, this.playerXLocation, this.playerYLocation, this.playerDirection);
        performIdles(this, this.player);
        this.cameras.main.startFollow(this.player);

        initializePlayerManager(this);

        // Join the networked room
        this.room = await joinRoom(this, 'grotto_secret_one'); 

        // Create Room Transitions
        createRoomTransitionUI(this, this.player, 'Grotto', '', 145, 396, 162, 140, "Go back to\nthe Grotto");
        createRoomTransitionUI(this, this.player, 'GrottoSecretTwo', '', 576, 77, 221, 147, 'Go up');

        createMenu(this, this.player, this.room);

        this.updateMovement = setupMovement(this, this.player, 200);
    }

    update(time, delta) {
        if (this.updateMovement && this.room.connection.isOpen) this.updateMovement(delta);
        
        stepMovementUpdates(this, delta);
    }
}

export class GrottoSecretTwo extends Phaser.Scene {
    constructor() {
        super({ key: 'GrottoSecretTwo' });
    }

    init(data) {
        this.playerXLocation = data.playerXLocation || 145;
        this.playerYLocation = data.playerYLocation || 288+60; 
        this.playerDirection = data.playerDirection || 'left';
    }

    preload() {
        preloadMenu(this);
        preloadAvatar(this); // Preload the player's avatar
    }

    async create() {
        const bg = this.add.image(0, 0, 'grotto_secret_two').setOrigin(0, 0);
        bg.setScrollFactor(1); // Make sure it scrolls with the camera

        this.cameras.main.setBounds(0, 0, bg.width, this.scale.height);

        this.player = createAvatar(this, this.playerXLocation, this.playerYLocation, this.playerDirection);
        performIdles(this, this.player);
        this.cameras.main.startFollow(this.player);

        initializePlayerManager(this);

        // Join the networked room
        this.room = await joinRoom(this, 'grotto_secret_two'); 

        // Create Room Transitions
        createRoomTransitionUI(this, this.player, 'GrottoSecretOne', '', 534, 459, 303, 121, 'Go down');

        createMenu(this, this.player, this.room);

        this.updateMovement = setupMovement(this, this.player, 200);
    }

    update(time, delta) {
        if (this.updateMovement && this.room.connection.isOpen) this.updateMovement(delta);
        
        stepMovementUpdates(this, delta);
    }
}

export class CreatureArea extends Phaser.Scene {
    constructor() {
        super({ key: 'CreatureArea' });
    }

    init(data) {
        this.playerXLocation = data.playerXLocation || 561;
        this.playerYLocation = data.playerYLocation || 290+60; 
        this.playerDirection = data.playerDirection || 'left';
    }

    preload() {
        this.sound.stopAll(); 
        preloadMenu(this);
        preloadAvatar(this); // Preload the player's avatar
    }

    async create() {
        const bg = this.add.image(0, 0, 'creaturearea').setOrigin(0, 0);
        bg.setScrollFactor(1); // Make sure it scrolls with the camera

        this.cameras.main.setBounds(0, 0, bg.width, this.scale.height);

        this.player = createAvatar(this, this.playerXLocation, this.playerYLocation, this.playerDirection);
        performIdles(this, this.player);
        this.cameras.main.startFollow(this.player);

        initializePlayerManager(this);

        // Join the networked room
        this.room = await joinRoom(this, 'creaturearea'); 

        // Create Room Transitions
        createRoomTransitionUI(this, this.player, 'Downtown', 'Downtown', 71, 222, 117, 150);
        createRoomTransitionUI(this, this.player, 'CreatureShop', "Creature Shop", 434, 204, 122, 135);
        createRoomTransitionUI(this, this.player, 'School', 'Fantage School', 917, 115, 205, 171);
        //createRoomTransitionUI(this, this.player, 'CreatureArena', 'Arena Portal', 1832, 234, 264, 302);

        createMenu(this, this.player, this.room);

        this.updateMovement = setupMovement(this, this.player, 200);

        this.forest_music = this.sound.add('forest_music', { loop: true, volume: 0.5 });
        this.forest_music.play();
    }

    update(time, delta) {
        if (this.updateMovement && this.room.connection.isOpen) this.updateMovement(delta);
        
        stepMovementUpdates(this, delta);
    }
}

export class CreatureShop extends Phaser.Scene {
    constructor() {
        super({ key: 'CreatureShop' });
    }

    init(data) {
        this.playerXLocation = data.playerXLocation || 352;
        this.playerYLocation = data.playerYLocation || 270+60; 
        this.playerDirection = data.playerDirection || 'left';
    }

    preload() {
        preloadMenu(this);
        preloadAvatar(this);
    }

    async create() {
        this.add.image(0, 0, 'creatureshop').setOrigin(0, 0);
        
        this.player = createAvatar(this, this.playerXLocation, this.playerYLocation, this.playerDirection);
        performIdles(this, this.player);
        initializePlayerManager(this);

        this.room = await joinRoom(this, 'creatureshop'); 

        createRoomTransitionUI(this, this.player, 'CreatureArea', 'Creature Area', 165, 172, 141, 174);

        createMenu(this, this.player, this.room);
        
        this.updateMovement = setupMovement(this, this.player, 200);
    }
    
    update(time, delta) {
        if (this.updateMovement && this.room.connection.isOpen) this.updateMovement(delta);
        
        stepMovementUpdates(this, delta);
    }

}