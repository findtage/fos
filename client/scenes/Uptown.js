import { setupMovement } from '../world/playerMovement.js';
import { joinRoom, sendPlayerMove } from '../network/socket.js';
import { preloadAvatar, createAvatar } from '../world/avatar.js';
import { initializePlayerManager } from '../world/playerManager.js';
import { createRoomTransitionUI } from '../world/roomTransition.js';
import { createMenu, preloadMenu } from '../world/UIManager.js';

export class Uptown extends Phaser.Scene {
    constructor() {
        super({ key: 'Uptown' });
    }

    preload() {
        this.sound.stopAll(); 
        preloadMenu(this);
        preloadAvatar(this); // Preload the player's avatar
    }

    async create() {
        const bg = this.add.image(0, 0, 'uptown').setOrigin(0, 0);
        bg.setScrollFactor(1); // Make sure it scrolls with the camera

        this.cameras.main.setBounds(0, 0, bg.width, this.scale.height);
        
        this.player = createAvatar(this, 1436, 407);
        this.cameras.main.startFollow(this.player);

        initializePlayerManager(this);

        // Join the networked room
        this.room = await joinRoom(this, 'uptown'); 

        // Create Room Transitions X,Y and Width, Height
        createRoomTransitionUI(this, this.player, 'Forest', 'Forest', 2341, 180, 133, 143);
        createRoomTransitionUI(this, this.player, 'FurnitureShop', "Ottoman's Furniture", 2115, 211, 193, 140);
        createRoomTransitionUI(this, this.player, 'MissionCenter', 'Mission Center', 1938, 162, 68, 108);
        createRoomTransitionUI(this, this.player, 'MyMall', 'MyMall', 1729, 191, 216, 150); 
        createRoomTransitionUI(this, this.player, 'IDfoneShop', 'IDFone Shop', 1441, 185, 156, 113);
        createRoomTransitionUI(this, this.player, 'Botique', 'PM Botique', 1249, 167, 190, 124);
        createRoomTransitionUI(this, this.player, 'CostumeShop', "Jester's Costumes", 1005, 180, 211, 118);
        createRoomTransitionUI(this, this.player, 'BoardShop', 'Board Shop', 668, 159, 166, 122);
        //createRoomTransitionUI(this, this.player, 'HallofFame', 'Hall of Fame', 218, 166, 354, 194);
        createRoomTransitionUI(this, this.player, 'Downtown', 'Downtown', 56, 450, 111, 140);

        createMenu(this, this.player, this.room);

        this.updateMovement = setupMovement(this, this.player, 200);

        this.uptown_music = this.sound.add('uptown_music', { loop: true, volume: 0.5 });
        this.uptown_music.play();
    }

    update(time, delta) {
        if (this.updateMovement && this.room.connection.isOpen) this.updateMovement(delta);
        
        if (this.room && this.player && this.room.connection.isOpen) {
            sendPlayerMove(this.room, this.player.x, this.player.y, this.player.direction);
        }
    }
}

export class FurnitureShop extends Phaser.Scene {
    constructor() {
        super({ key: 'FurnitureShop' });
    }

    preload() {
        preloadMenu(this);
        preloadAvatar(this);
    }

    async create() {
        this.add.image(0, 0, 'furnitureshop').setOrigin(0, 0);
        
        this.player = createAvatar(this, 506, 331);
        initializePlayerManager(this);

        this.room = await joinRoom(this, 'furnitureshop'); 

        createRoomTransitionUI(this, this.player, 'Uptown', 'Uptown', 426, 158, 177, 154);

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

export class MyMall extends Phaser.Scene {
    constructor() {
        super({ key: 'MyMall' });
    }

    preload() {
        this.sound.stopAll(); 
        preloadMenu(this);
        preloadAvatar(this);
    }

    async create() {
        this.add.image(0, 0, 'mymall').setOrigin(0, 0);
        
        this.player = createAvatar(this, 401, 405);
        initializePlayerManager(this);

        this.room = await joinRoom(this, 'mymall'); 

        createRoomTransitionUI(this, this.player, 'Uptown', 'Uptown', 61, 254, 122, 100);

        createMenu(this, this.player, this.room);
        
        this.updateMovement = setupMovement(this, this.player, 200);

        this.mymall_music = this.sound.add('mymall_music', { loop: true, volume: 0.5 });
        this.mymall_music.play();
    }
    
    update(time, delta) {
        if (this.updateMovement && this.room.connection.isOpen) this.updateMovement(delta);
        
        if (this.room && this.player && this.room.connection.isOpen) {
            sendPlayerMove(this.room, this.player.x, this.player.y, this.player.direction);
        }
    }

}

export class IDfoneShop extends Phaser.Scene {
    constructor() {
        super({ key: 'IDfoneShop' });
    }

    preload() {
        this.sound.stopAll();
        preloadMenu(this);
        preloadAvatar(this);
    }

    async create() {
        this.add.image(0, 0, 'idfoneshop').setOrigin(0, 0);
        
        this.player = createAvatar(this, 407, 410);
        initializePlayerManager(this);

        this.room = await joinRoom(this, 'idfoneshop'); 

        createRoomTransitionUI(this, this.player, 'Uptown', 'Uptown', 468, 217, 166, 156);

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

export class Botique extends Phaser.Scene {
    constructor() {
        super({ key: 'Botique' });
    }

    preload() {
        this.sound.stopAll(); 
        preloadMenu(this);
        preloadAvatar(this);
    }

    async create() {
        this.add.image(0, 0, 'botique').setOrigin(0, 0);
        
        this.player = createAvatar(this, 375, 438);
        initializePlayerManager(this);

        this.room = await joinRoom(this, 'botique'); 

        createRoomTransitionUI(this, this.player, 'Uptown', 'Uptown', 44, 312, 87, 256);

        createMenu(this, this.player, this.room);
        
        this.updateMovement = setupMovement(this, this.player, 200);

        this.botique_music = this.sound.add('botique_music', { loop: true, volume: 0.5 });
        this.botique_music.play();
    }
    
    update(time, delta) {
        if (this.updateMovement && this.room.connection.isOpen) this.updateMovement(delta);
        
        if (this.room && this.player && this.room.connection.isOpen) {
            sendPlayerMove(this.room, this.player.x, this.player.y, this.player.direction);
        }
    }

}

export class CostumeShop extends Phaser.Scene {
    constructor() {
        super({ key: 'CostumeShop' });
    }

    preload() {
        preloadMenu(this);
        preloadAvatar(this);
    }

    async create() {
        this.add.image(0, 0, 'costumeshop').setOrigin(0, 0);
        
        this.player = createAvatar(this, 461, 387);
        initializePlayerManager(this);

        this.room = await joinRoom(this, 'costumeshop'); 

        createRoomTransitionUI(this, this.player, 'Uptown', 'Uptown', 457, 161, 97, 162);

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

export class BoardShop extends Phaser.Scene {
    constructor() {
        super({ key: 'BoardShop' });
    }

    preload() {
        preloadMenu(this);
        preloadAvatar(this);
    }

    async create() {
        this.add.image(0, 0, 'boardshop').setOrigin(0, 0);
        
        this.player = createAvatar(this, 342, 388);
        initializePlayerManager(this);

        this.room = await joinRoom(this, 'boardshop'); 

        createRoomTransitionUI(this, this.player, 'Uptown', 'Uptown', 211, 224, 153, 135);

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

export class MissionCenter extends Phaser.Scene {
    constructor() {
        super({ key: 'MissionCenter' });
    }

    preload() {
        this.sound.stopAll(); 
        preloadMenu(this);
        preloadAvatar(this); // Preload the player's avatar
    }

    async create() {
        const bg = this.add.image(0, 0, 'missioncenter').setOrigin(0, 0);
        bg.setScrollFactor(1); // Make sure it scrolls with the camera

        this.cameras.main.setBounds(0, 0, bg.width, this.scale.height);
        
        this.player = createAvatar(this, 955, 273);
        this.cameras.main.startFollow(this.player);

        initializePlayerManager(this);

        // Join the networked room
        this.room = await joinRoom(this, 'missioncenter'); 

        // Create Room Transitions X,Y and Width, Height
        createRoomTransitionUI(this, this.player, 'Uptown', 'Uptown', 1235, 194, 92, 154);
        createRoomTransitionUI(this, this.player, 'Downtown', 'Downtown', 651, 195, 84, 161);

        createMenu(this, this.player, this.room);

        this.updateMovement = setupMovement(this, this.player, 200);

        this.mission_center_music = this.sound.add('mission_center_music', { loop: true, volume: 0.5 });
        this.mission_center_music.play();
    }

    update(time, delta) {
        if (this.updateMovement && this.room.connection.isOpen) this.updateMovement(delta);
        
        if (this.room && this.player && this.room.connection.isOpen) {
            sendPlayerMove(this.room, this.player.x, this.player.y, this.player.direction);
        }
    }
}

