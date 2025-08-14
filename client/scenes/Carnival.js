import { stepMovementUpdates, setupMovement } from '../world/playerMovement.js';
import { joinRoom } from '../network/socket.js';
import { preloadAvatar, createAvatar } from '../world/avatar.js';
import { initializePlayerManager } from '../world/playerManager.js';
import { createRoomTransitionUI } from '../world/roomTransition.js';
import { createMenu, preloadMenu } from '../world/UIManager.js';
import { performIdles } from '../world/animations.js';

export class Carnival extends Phaser.Scene {
    constructor() {
        super({ key: 'Carnival' });
    }

    init(data) {
        this.playerXLocation = data.playerXLocation || 707;
        this.playerYLocation = data.playerYLocation || 421; 
        this.playerDirection = data.playerDirection || 'left';
    }

    preload() {
        this.sound.stopAll(); 
        preloadMenu(this)
        preloadAvatar(this); // Preload the player's avatar
    }

    async create() {
        const bg = this.add.image(0, 0, 'carnival').setOrigin(0, 0);
        bg.setScrollFactor(1); // Make sure it scrolls with the camera

        this.cameras.main.setBounds(0, 0, bg.width, this.scale.height);

        this.player = createAvatar(this, this.playerXLocation, this.playerYLocation, this.playerDirection);
        performIdles(this, this.player);
        this.cameras.main.startFollow(this.player);

        initializePlayerManager(this);

        // Join the networked room
        this.room = await joinRoom(this, 'carnival'); 

        // Create Room Transitions
        createRoomTransitionUI(this, this.player, 'Beach', 'Beach', 35, 360, 69, 154);
        createRoomTransitionUI(this, this.player, 'Arcade', 'Arcade', 787, 183, 276, 180);
        createRoomTransitionUI(this, this.player, 'PetTown', 'Pet Town', 2341, 402, 44, 172);

        createMenu(this, this.player, this.room);

        this.updateMovement = setupMovement(this, this.player, 200);   

        this.carnival_music = this.sound.add('carnival_music', { loop: true, volume: 0.5 });
        this.carnival_music.play();
    }

    update(time, delta) {
        if (this.updateMovement && this.room.connection.isOpen) this.updateMovement(delta);
        
        stepMovementUpdates(this, delta);
    }
}

export class Arcade extends Phaser.Scene {
    constructor() {
        super({ key: 'Arcade' });
    }

    init(data) {
        this.playerXLocation = data.playerXLocation || 362;
        this.playerYLocation = data.playerYLocation || 410; 
        this.playerDirection = data.playerDirection || 'left';
    }

    preload() {
        this.sound.stopAll(); 
        preloadMenu(this);
        preloadAvatar(this);
    }

    async create() {
        this.add.image(0, 0, 'arcade').setOrigin(0, 0);
        
        this.player = createAvatar(this, this.playerXLocation, this.playerYLocation, this.playerDirection);
        performIdles(this, this.player);
        initializePlayerManager(this);

        this.room = await joinRoom(this, 'arcade'); 

        createRoomTransitionUI(this, this.player, 'Carnival', 'Carnival', 70, 168, 140, 223);

        createMenu(this, this.player, this.room);
        
        this.updateMovement = setupMovement(this, this.player, 200);

        this.idfone_arcade_music = this.sound.add('idfone_arcade_music', { loop: true, volume: 0.5 });
        this.idfone_arcade_music.play();
    }
    
    update(time, delta) {
        if (this.updateMovement && this.room.connection.isOpen) this.updateMovement(delta);
        
        stepMovementUpdates(this, delta);
    }

}