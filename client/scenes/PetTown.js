import { setupMovement } from '../world/playerMovement.js';
import { joinRoom, sendPlayerMove } from '../network/socket.js';
import { preloadAvatar, createAvatar } from '../world/avatar.js';
import { initializePlayerManager } from '../world/playerManager.js';
import { createRoomTransitionUI } from '../world/roomTransition.js';
import { createMenu, preloadMenu } from '../world/UIManager.js';

export class PetTown extends Phaser.Scene {
    constructor() {
        super({ key: 'PetTown' });
    }

    preload() {
        this.sound.stopAll(); 
        preloadMenu(this)
        preloadAvatar(this); // Preload the player's avatar
    }

    async create() {
        const bg = this.add.image(0, 0, 'pet_town').setOrigin(0, 0);
        bg.setScrollFactor(1); // Make sure it scrolls with the camera

        this.cameras.main.setBounds(0, 0, bg.width, this.scale.height);

        this.player = createAvatar(this, 308, 410);
        this.cameras.main.startFollow(this.player);

        initializePlayerManager(this);

        // Join the networked room
        this.room = await joinRoom(this, 'pet_town'); 

        // Create Room Transitions
        createRoomTransitionUI(this, this.player, 'Carnival', 'Carnival', 45, 450, 87, 139);
        createRoomTransitionUI(this, this.player, 'PetShop', 'Pet Shop', 533, 225, 95, 118);
        createRoomTransitionUI(this, this.player, 'PetSchool', 'Pet Academy', 884, 186, 122, 108);
        createRoomTransitionUI(this, this.player, 'Castle', 'Castle', 1555, 443, 96, 148);

        createMenu(this, this.player, this.room);

        this.updateMovement = setupMovement(this, this.player, 200);

        this.pet_town_music = this.sound.add('pet_town_music', { loop: true, volume: 0.5 });
        this.pet_town_music.play();
    }

    update(time, delta) {
        if (this.updateMovement && this.room.connection.isOpen) this.updateMovement(delta);
        
        if (this.room && this.player && this.room.connection.isOpen) {
            sendPlayerMove(this.room, this.player.x, this.player.y, this.player.direction);
        }
    }
}

export class PetShop extends Phaser.Scene {
    constructor() {
        super({ key: 'PetShop' });
    }

    preload() {
        preloadMenu(this);
        preloadAvatar(this);
    }

    async create() {
        this.add.image(0, 0, 'petshop').setOrigin(0, 0);
        
        this.player = createAvatar(this, 388, 310);
        initializePlayerManager(this);

        this.room = await joinRoom(this, 'petshop');
        createRoomTransitionUI(this, this.player, 'PetTown', 'Pet Town', 180, 209, 113, 172);

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

export class PetSchool extends Phaser.Scene {
    constructor() {
        super({ key: 'PetSchool' });
    }

    preload() {
        preloadMenu(this);
        preloadAvatar(this);
    }

    async create() {
        this.add.image(0, 0, 'petschool').setOrigin(0, 0);
        
        this.player = createAvatar(this, 234, 392);
        initializePlayerManager(this);

        this.room = await joinRoom(this, 'petschool');
        createRoomTransitionUI(this, this.player, 'PetTown', 'Pet Town', 42, 263, 83, 266);
        createRoomTransitionUI(this, this.player, 'PetClass', 'Classroom', 363, 162, 133, 137);

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

export class PetClass extends Phaser.Scene {
    constructor() {
        super({ key: 'PetClass' });
    }

    preload() {
        preloadMenu(this);
        preloadAvatar(this);
    }

    async create() {
        this.add.image(0, 0, 'petclass').setOrigin(0, 0);
        
        this.player = createAvatar(this, 653, 269);
        initializePlayerManager(this);

        this.room = await joinRoom(this, 'petclass');
        createRoomTransitionUI(this, this.player, 'PetSchool', 'Pet Academy', 741, 193, 92, 225);

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