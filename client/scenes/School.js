import { setupMovement } from '../world/playerMovement.js';
import { joinRoom, sendPlayerMove } from '../network/socket.js';
import { preloadAvatar, createAvatar } from '../world/avatar.js';
import { initializePlayerManager } from '../world/playerManager.js';
import { createRoomTransitionUI } from '../world/roomTransition.js';
import { createMenu, preloadMenu } from '../world/UIManager.js';
import { performIdles } from '../world/animations.js';

export class School extends Phaser.Scene {
    constructor() {
        super({ key: 'School' });
    }

    init(data) {
        this.playerXLocation = data.playerXLocation || 400;
        this.playerYLocation = data.playerYLocation || 400; 
        this.playerDirection = data.playerDirection || 'left';
    }

    preload() {
        this.sound.stopAll(); 
        preloadMenu(this)
        preloadAvatar(this);
    }

    async create() {
        this.add.image(0, 0, 'school_outside').setOrigin(0, 0);

        this.player = createAvatar(this, this.playerXLocation, this.playerYLocation, this.playerDirection);
        performIdles(this.player);
        initializePlayerManager(this); // Initialize multiplayer logic for this scene
        
        // Join the networked room
        this.room = await joinRoom(this, 'school_outside'); // Dynamically join the "school" room

        createRoomTransitionUI(this, this.player, 'Forest', 'Forest', 29, 273, 57, 87);
        //createRoomTransitionUI(this, this.player, 'ActingAcademy', '', 270, 258, 141, 99);
        createRoomTransitionUI(this, this.player, 'SchoolInside', '', 515, 271, 100, 108, "Enter the school");
        createRoomTransitionUI(this, this.player, 'CreatureArea', 'Creature Area', 752, 428, 96, 137);
        createMenu(this, this.player, this.room);

        this.updateMovement = setupMovement(this, this.player, 200);

        this.school_outside_music = this.sound.add('school_outside_music', { loop: true, volume: 0.5 });
        this.school_outside_music.play();
    }

    update(time, delta) {
        if (this.updateMovement && this.room.connection.isOpen) this.updateMovement(delta);
        
        if (this.room && this.player && this.room.connection.isOpen) {
            sendPlayerMove(this.room, this.player.x, this.player.y, this.player.direction);
        }
    }
    
}

export class SchoolInside extends Phaser.Scene {
    constructor() {
        super({ key: 'SchoolInside' });
    }

    init(data) {
        this.playerXLocation = data.playerXLocation || 364;
        this.playerYLocation = data.playerYLocation || 426; 
        this.playerDirection = data.playerDirection || 'left';
    }

    preload() {
        this.sound.stopAll(); 
        preloadMenu(this)
        preloadAvatar(this);
    }

    async create() {
        this.add.image(0, 0, 'school_inside').setOrigin(0, 0);

        this.player = createAvatar(this, this.playerXLocation, this.playerYLocation, this.playerDirection);
        performIdles(this.player);
        initializePlayerManager(this); // Initialize multiplayer logic for this scene
        
        // Join the networked room
        this.room = await joinRoom(this, 'school_inside'); // Dynamically join the "school" room

        createRoomTransitionUI(this, this.player, 'School', '', 69, 323, 114, 158, 'Exit the school');
        createRoomTransitionUI(this, this.player, 'MathRoom', 'Math Room', 219, 243, 105, 166);
        createRoomTransitionUI(this, this.player, 'EnglishRoom', 'English Room', 440, 234, 110, 140);
        createRoomTransitionUI(this, this.player, 'SchoolUpstairs', '', 618, 251, 109, 141, "Go upstairs");
        //createRoomTransitionUI(this, this.player, 'PrivateClass', 'Private Classroom', 734, 383, 119, 184);
        createMenu(this, this.player, this.room);

        this.updateMovement = setupMovement(this, this.player, 200);

        this.school_inside_music = this.sound.add('school_inside_music', { loop: true, volume: 0.5 });
        this.school_inside_music.play();
    }

    update(time, delta) {
        if (this.updateMovement && this.room.connection.isOpen) this.updateMovement(delta);
        
        if (this.room && this.player && this.room.connection.isOpen) {
            sendPlayerMove(this.room, this.player.x, this.player.y, this.player.direction);
        }
    }
    
}

export class MathRoom extends Phaser.Scene {
    constructor() {
        super({ key: 'MathRoom' });
    }

    init(data) {
        this.playerXLocation = data.playerXLocation || 449;
        this.playerYLocation = data.playerYLocation || 416; 
        this.playerDirection = data.playerDirection || 'left';
    }

    preload() {
        preloadMenu(this)
        preloadAvatar(this);
    }

    async create() {
        this.add.image(0, 0, 'mathroom').setOrigin(0, 0);

        this.player = createAvatar(this, this.playerXLocation, this.playerYLocation, this.playerDirection);
        performIdles(this.player);
        initializePlayerManager(this); // Initialize multiplayer logic for this scene
        
        // Join the networked room
        this.room = await joinRoom(this, 'mathroom'); // Dynamically join the "school" room

        createRoomTransitionUI(this, this.player, 'SchoolInside', '', 76, 227, 99, 163, 'Exit the classroom');
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

export class EnglishRoom extends Phaser.Scene {
    constructor() {
        super({ key: 'EnglishRoom' });
    }

    init(data) {
        this.playerXLocation = data.playerXLocation || 365;
        this.playerYLocation = data.playerYLocation || 412; 
        this.playerDirection = data.playerDirection || 'left';
    }

    preload() {
        preloadMenu(this)
        preloadAvatar(this);
    }

    async create() {
        this.add.image(0, 0, 'englishroom').setOrigin(0, 0);

        this.player = createAvatar(this, this.playerXLocation, this.playerYLocation, this.playerDirection);
        performIdles(this.player);
        initializePlayerManager(this); // Initialize multiplayer logic for this scene
        
        // Join the networked room
        this.room = await joinRoom(this, 'englishroom'); // Dynamically join the "school" room

        createRoomTransitionUI(this, this.player, 'SchoolInside', '', 730, 210, 101, 144, 'Exit the classroom');
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

export class SchoolUpstairs extends Phaser.Scene {
    constructor() {
        super({ key: 'SchoolUpstairs' });
    }

    init(data) {
        this.playerXLocation = data.playerXLocation || 412;
        this.playerYLocation = data.playerYLocation || 412; 
        this.playerDirection = data.playerDirection || 'left';
    }

    preload() {
        preloadMenu(this)
        preloadAvatar(this);
    }

    async create() {
        this.add.image(0, 0, 'school_upstairs').setOrigin(0, 0);

        this.player = createAvatar(this, this.playerXLocation, this.playerYLocation, this.playerDirection);
        performIdles(this.player);
        initializePlayerManager(this); // Initialize multiplayer logic for this scene
        
        // Join the networked room
        this.room = await joinRoom(this, 'school_upstairs'); // Dynamically join the "school" room

        createRoomTransitionUI(this, this.player, 'SchoolInside', 'Lobby', 59, 350, 97, 180);
        createRoomTransitionUI(this, this.player, 'Cafeteria', 'Cafeteria', 163, 270, 103, 136);
        //createRoomTransitionUI(this, this.player, 'MusicRoom', 'Music Room', 312, 268, 83, 145);
        createRoomTransitionUI(this, this.player, 'Gym', 'Gym', 716, 257, 137, 151);
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

export class Cafeteria extends Phaser.Scene {
    constructor() {
        super({ key: 'Cafeteria' });
    }

    init(data) {
        this.playerXLocation = data.playerXLocation || 333;
        this.playerYLocation = data.playerYLocation || 409; 
        this.playerDirection = data.playerDirection || 'left';
    }

    preload() {
        preloadMenu(this)
        preloadAvatar(this);
    }

    async create() {
        this.add.image(0, 0, 'cafeteria').setOrigin(0, 0);

        this.player = createAvatar(this, this.playerXLocation, this.playerYLocation, this.playerDirection);
        performIdles(this.player);
        initializePlayerManager(this); // Initialize multiplayer logic for this scene
        
        // Join the networked room
        this.room = await joinRoom(this, 'cafeteria'); // Dynamically join the "school" room

        createRoomTransitionUI(this, this.player, 'SchoolUpstairs', '', 56, 214, 74, 162, 'Exit the cafeteria');
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

export class Gym extends Phaser.Scene {
    constructor() {
        super({ key: 'Gym' });
    }

    init(data) {
        this.playerXLocation = data.playerXLocation || 379;
        this.playerYLocation = data.playerYLocation || 431; 
        this.playerDirection = data.playerDirection || 'left';
    }

    preload() {
        preloadMenu(this)
        preloadAvatar(this);
    }

    async create() {
        this.add.image(0, 0, 'gym').setOrigin(0, 0);

        this.player = createAvatar(this, this.playerXLocation, this.playerYLocation, this.playerDirection);
        performIdles(this.player);
        initializePlayerManager(this); // Initialize multiplayer logic for this scene
        
        // Join the networked room
        this.room = await joinRoom(this, 'gym'); // Dynamically join the "school" room

        createRoomTransitionUI(this, this.player, 'SchoolUpstairs', '', 719, 219, 137, 171, 'Exit the gym');
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