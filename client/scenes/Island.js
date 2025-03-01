import { setupMovement } from '../world/playerMovement.js';
import { joinRoom, sendPlayerMove } from '../network/socket.js';
import { preloadAvatar, createAvatar } from '../world/avatar.js';
import { initializePlayerManager } from '../world/playerManager.js';
import { createRoomTransitionUI } from '../world/roomTransition.js';
import { createMenu, preloadMenu } from '../world/UIManager.js';

export class Island extends Phaser.Scene {
    constructor() {
        super({ key: 'Island' });
    }

    preload() {
        this.sound.stopAll(); 
        preloadMenu(this)
        preloadAvatar(this); // Preload the player's avatar
    }

    async create() {
        const bg = this.add.image(0, 0, 'island').setOrigin(0, 0);
        bg.setScrollFactor(1); // Make sure it scrolls with the camera

        this.cameras.main.setBounds(0, 0, bg.width, this.scale.height);

        this.player = createAvatar(this, 206, 334);
        this.cameras.main.startFollow(this.player);

        initializePlayerManager(this);

        // Join the networked room
        this.room = await joinRoom(this, 'island'); 

        // Create Room Transitions
        //createRoomTransitionUI(this, this.player, 'UnderwaterTunnel', 'Underwater Tunnel', 104, 358, 162, 274);
        createRoomTransitionUI(this, this.player, 'Spa', 'Spa', 512, 166, 176, 161);
        createRoomTransitionUI(this, this.player, 'Resort', 'Resort', 933, 133, 315, 117);
        createRoomTransitionUI(this, this.player, 'IslandStore', 'High Tide', 1643, 250, 127, 108);
        //createRoomTransitionUI(this, this.player, 'PhotoBooth', 'Photo Booth', 2312, 184, 150, 233);
        //createRoomTransitionUI(this, this.player, 'UnderwaterTunnel', 'Underwater Tunnel', 2828, 363, 193, 276);

        createMenu(this, this.player, this.room);

        this.updateMovement = setupMovement(this, this.player, 200);   

        this.island_music = this.sound.add('island_music', { loop: true, volume: 0.5 });
        this.island_music.play();
    }

    update(time, delta) {
        if (this.updateMovement && this.room.connection.isOpen) this.updateMovement(delta);
        
        if (this.room && this.player && this.room.connection.isOpen) {
            sendPlayerMove(this.room, this.player.x, this.player.y, this.player.direction);
        }
    }
}

export class Spa extends Phaser.Scene {
    constructor() {
        super({ key: 'Spa' });
    }

    preload() {
        this.sound.stopAll(); 
        preloadMenu(this);
        preloadAvatar(this);
    }

    async create() {
        this.add.image(0, 0, 'spa').setOrigin(0, 0);
        
        this.player = createAvatar(this, 229, 407);
        initializePlayerManager(this);

        this.room = await joinRoom(this, 'spa'); 

        createRoomTransitionUI(this, this.player, 'Island', 'Island', 334, 136, 122, 129);

        createMenu(this, this.player, this.room);
        
        this.updateMovement = setupMovement(this, this.player, 200);

        this.spa_music = this.sound.add('spa_music', { loop: true, volume: 0.5 });
        this.spa_music.play();
    }
    
    update(time, delta) {
        if (this.updateMovement && this.room.connection.isOpen) this.updateMovement(delta);
        
        if (this.room && this.player && this.room.connection.isOpen) {
            sendPlayerMove(this.room, this.player.x, this.player.y, this.player.direction);
        }
    }

}

export class Resort extends Phaser.Scene {
    constructor() {
        super({ key: 'Resort' });
    }

    preload() {
        this.sound.stopAll(); 
        preloadMenu(this);
        preloadAvatar(this);
    }

    async create() {
        this.add.image(0, 0, 'resort').setOrigin(0, 0);
        
        this.player = createAvatar(this, 466, 420);
        initializePlayerManager(this);

        this.room = await joinRoom(this, 'resort'); 

        createRoomTransitionUI(this, this.player, 'Island', 'Island', 498, 188, 194, 124);

        createMenu(this, this.player, this.room);
        
        this.updateMovement = setupMovement(this, this.player, 200);

        this.resort_music = this.sound.add('resort_music', { loop: true, volume: 0.5 });
        this.resort_music.play();
    }
    
    update(time, delta) {
        if (this.updateMovement && this.room.connection.isOpen) this.updateMovement(delta);
        
        if (this.room && this.player && this.room.connection.isOpen) {
            sendPlayerMove(this.room, this.player.x, this.player.y, this.player.direction);
        }
    }

}

export class IslandStore extends Phaser.Scene {
    constructor() {
        super({ key: 'IslandStore' });
    }

    preload() {
        this.sound.stopAll(); 
        preloadMenu(this);
        preloadAvatar(this);
    }

    async create() {
        this.add.image(0, 0, 'islandstore').setOrigin(0, 0);
        
        this.player = createAvatar(this, 400, 368);
        initializePlayerManager(this);

        this.room = await joinRoom(this, 'islandstore'); 

        createRoomTransitionUI(this, this.player, 'Island', 'Island', 397, 110, 188, 220);

        createMenu(this, this.player, this.room);
        
        this.updateMovement = setupMovement(this, this.player, 200);

        this.island_store_music = this.sound.add('island_store_music', { loop: true, volume: 0.5 });
        this.island_store_music.play();
    }
    
    update(time, delta) {
        if (this.updateMovement && this.room.connection.isOpen) this.updateMovement(delta);
        
        if (this.room && this.player && this.room.connection.isOpen) {
            sendPlayerMove(this.room, this.player.x, this.player.y, this.player.direction);
        }
    }

}