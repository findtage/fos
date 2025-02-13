import { setupMovement } from '../world/playerMovement.js';
import { joinRoom, sendPlayerMove } from '../network/socket.js';
import { preloadAvatar, createAvatar } from '../world/avatar.js';
import { initializePlayerManager } from '../world/playerManager.js';
import { createRoomTransitionUI } from '../world/roomTransition.js';
import { createMenu, preloadMenu } from '../world/UIManager.js';

export class Beach extends Phaser.Scene {
    constructor() {
        super({ key: 'Beach' });
    }

    preload() {
        this.sound.stopAll(); 
        preloadMenu(this)
        preloadAvatar(this); // Preload the player's avatar
    }

    async create() {
        const bg = this.add.image(0, 0, 'beach').setOrigin(0, 0);
        bg.setScrollFactor(1); // Make sure it scrolls with the camera

        this.cameras.main.setBounds(0, 0, bg.width, this.scale.height);

        this.player = createAvatar(this, 1045, 344+60);
        this.cameras.main.startFollow(this.player);

        initializePlayerManager(this);

        // Join the networked room
        this.room = await joinRoom(this, 'beach'); 

        // Create Room Transitions
        createRoomTransitionUI(this, this.player, 'Lighthouse', 'Lighthouse', 193, 99, 121, 169);
        createRoomTransitionUI(this, this.player, 'Ship', '', 628, 130, 290, 142, "Board the Sea Breeze");
        createRoomTransitionUI(this, this.player, 'Carnival', 'Carnival', 1045, 130, 119, 100);
        createRoomTransitionUI(this, this.player, 'DanceClub', '', 1649, 163, 126, 104, "Enter the Palm");
        createRoomTransitionUI(this, this.player, 'TanStore', 'SunBlock', 2092, 205, 205, 164);
        createRoomTransitionUI(this, this.player, 'Downtown', 'Downtown', 2370, 421, 60, 196);

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

export class DanceClub extends Phaser.Scene {
    constructor() {
        super({ key: 'DanceClub' });
    }

    preload() {
        this.sound.stopAll(); 
        preloadMenu(this);
        preloadAvatar(this);
    }

    async create() {
        this.add.image(0, 0, 'danceclub').setOrigin(0, 0);
        
        this.player = createAvatar(this, 400, 351);
        initializePlayerManager(this);

        this.room = await joinRoom(this, 'danceclub'); 

        createRoomTransitionUI(this, this.player, 'Beach', 'Beach', 749, 223, 91, 177);

        createMenu(this, this.player, this.room);
        
        this.updateMovement = setupMovement(this, this.player, 200);

        this.palm_music = this.sound.add('palm_music', { loop: true, volume: 0.5 });
        this.palm_music.play();
    }
    
    update(time, delta) {
        if (this.updateMovement && this.room.connection.isOpen) this.updateMovement(delta);
        
        if (this.room && this.player && this.room.connection.isOpen) {
            sendPlayerMove(this.room, this.player.x, this.player.y, this.player.direction);
        }
    }

}

export class TanStore extends Phaser.Scene {
    constructor() {
        super({ key: 'TanStore' });
    }

    preload() {
        this.sound.stopAll(); 
        preloadMenu(this);
        preloadAvatar(this);
    }

    async create() {
        this.add.image(0, 0, 'tanstore').setOrigin(0, 0);
        
        this.player = createAvatar(this, 215, 323);
        initializePlayerManager(this);

        this.room = await joinRoom(this, 'tanstore'); 

        createRoomTransitionUI(this, this.player, 'Beach', 'Beach', 168, 167, 114, 179);

        createMenu(this, this.player, this.room);
        
        this.updateMovement = setupMovement(this, this.player, 200);

        this.sun_block_music = this.sound.add('sun_block_music', { loop: true, volume: 0.5 });
        this.sun_block_music.play();
    }
    
    update(time, delta) {
        if (this.updateMovement && this.room.connection.isOpen) this.updateMovement(delta);
        
        if (this.room && this.player && this.room.connection.isOpen) {
            sendPlayerMove(this.room, this.player.x, this.player.y, this.player.direction);
        }
    }

}
