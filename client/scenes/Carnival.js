import { setupMovement } from '../world/playerMovement.js';
import { joinRoom, sendPlayerMove } from '../network/socket.js';
import { preloadAvatar, createAvatar } from '../world/avatar.js';
import { initializePlayerManager } from '../world/playerManager.js';
import { createRoomTransitionUI } from '../world/roomTransition.js';
import { createMenu, preloadMenu } from '../world/UIManager.js';

export class Carnival extends Phaser.Scene {
    constructor() {
        super({ key: 'Carnival' });
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

        this.player = createAvatar(this, 707, 421);
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
        
        if (this.room && this.player && this.room.connection.isOpen) {
            sendPlayerMove(this.room, this.player.x, this.player.y, this.player.direction);
        }
    }
}

export class Arcade extends Phaser.Scene {
    constructor() {
        super({ key: 'Arcade' });
    }

    preload() {
        this.sound.stopAll(); 
        preloadMenu(this);
        preloadAvatar(this);
    }

    async create() {
        this.add.image(0, 0, 'arcade').setOrigin(0, 0);
        
        this.player = createAvatar(this, 362, 410);
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
        
        if (this.room && this.player && this.room.connection.isOpen) {
            sendPlayerMove(this.room, this.player.x, this.player.y, this.player.direction);
        }
    }

}