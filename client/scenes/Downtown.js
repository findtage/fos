import { stepMovementUpdates, setupMovement } from '../world/playerMovement.js';
import { joinRoom } from '../network/socket.js';
import { preloadAvatar, createAvatar} from '../world/avatar.js';
import { initializePlayerManager } from '../world/playerManager.js';
import { createRoomTransitionUI } from '../world/roomTransition.js';
import { createMenu, preloadMenu } from '../world/UIManager.js';
import { createAvatarAnimations, performIdles } from '../world/animations.js';
import { getPlayerAvatarData } from '../game.js';

export class Downtown extends Phaser.Scene {
    constructor() {
        super({ key: 'Downtown' });
    }

    init(data) {
        this.playerXLocation = data.playerXLocation || 908;
        this.playerYLocation = data.playerYLocation || 410; 
        this.playerDirection = data.playerDirection || 'left';
    }

    preload() {
        this.sound.stopAll(); 
        preloadMenu(this);

        const avatarData = getPlayerAvatarData();

        if (!avatarData) {
            console.error("❌ No avatar data found!");
            return;
        }
        preloadAvatar(this); // Preload the player's avatar
    }

    async create() {
        const bg = this.add.image(0, 0, 'downtown').setOrigin(0, 0);
        bg.setScrollFactor(1); // Make sure it scrolls with the camera

        this.cameras.main.setBounds(0, 0, bg.width, this.scale.height);

        this.player = createAvatar(this, this.playerXLocation, this.playerYLocation, this.playerDirection);
        
        createAvatarAnimations(this, this.player);
        performIdles(this.player);

        this.cameras.main.startFollow(this.player);

        initializePlayerManager(this);

        // Join the networked room
        this.room = await joinRoom(this, 'downtown'); // Ensure your server supports this room

        // Create Room Transitions X,Y and Width, Height
        createRoomTransitionUI(this, this.player, 'School', 'Fantage School', 2394, 287, 100, 100);
        createRoomTransitionUI(this, this.player, 'StarCafe', 'Star Cafe', 565, 218, 93, 117, "Enter the\n"); //Enter the Star Cafe
        //createRoomTransitionUI(this, this.player, 'QBlast', 'Q-Blast', 368, 247, 82, 123); Go to Gizmo's Q-Blast 177, 199
        createRoomTransitionUI(this, this.player, 'Beach', 'Beach', 177, 199, 100, 116, "Go to\nthe ");
        createRoomTransitionUI(this, this.player, 'Uptown', 'Uptown', 985, 142, 160, 153);
        createRoomTransitionUI(this, this.player, 'Leshop', 'Le Shop', 1334, 189, 107, 154);
        createRoomTransitionUI(this, this.player, 'Salon', 'Stellar Salon', 1712, 219, 150, 134);
        createRoomTransitionUI(this, this.player, 'MissionCenter', 'Mission Center', 1858, 347, 144, 46);
        createRoomTransitionUI(this, this.player, 'TopModel', 'Top Models', 2074, 215, 188, 146);

        createMenu(this, this.player, this.room);

        this.updateMovement = setupMovement(this);

        this.downtown_music = this.sound.add('downtown_music', { loop: true, volume: 0.5 });
        this.downtown_music.play();
    }

    update(time, delta) {
        if (this.updateMovement && this.room.connection.isOpen) this.updateMovement(delta);

        stepMovementUpdates(this, delta);
    }

}

// Enter the Star Cafe
export class StarCafe extends Phaser.Scene {
    constructor() {
        super({ key: 'StarCafe' });
    }

    init(data) {
        this.playerXLocation = data.playerXLocation || 281;
        this.playerYLocation = data.playerYLocation || 345; 
        this.playerDirection = data.playerDirection || 'left';
    }

    preload() {
        this.sound.stopAll(); 
        preloadMenu(this);
        preloadAvatar(this);
    }

    async create() {
        this.add.image(0, 0, 'starcafe').setOrigin(0, 0);

        this.player = createAvatar(this, this.playerXLocation, this.playerYLocation, this.playerDirection);
        performIdles(this.player);
        initializePlayerManager(this);

        this.room = await joinRoom(this, 'starcafe'); 

        createRoomTransitionUI(this, this.player, 'Downtown', 'Downtown', 629, 159, 93, 151);

        createMenu(this, this.player, this.room);
        
        this.updateMovement = setupMovement(this, this.player, 200);

        this.star_cafe_music = this.sound.add('star_cafe_music', { loop: true, volume: 0.5 });
        this.star_cafe_music.play();
    }
    
    update(time, delta) {
        if (this.updateMovement && this.room.connection.isOpen) this.updateMovement(delta);

        stepMovementUpdates(this, delta);
    }

}

// Go to Le Shop
export class LeShop extends Phaser.Scene {
    constructor() {
        super({ key: 'Leshop' });
    }

    init(data) {
        this.playerXLocation = data.playerXLocation || 370;
        this.playerYLocation = data.playerYLocation || 432; 
        this.playerDirection = data.playerDirection || 'left';
    }

    preload() {
        preloadMenu(this);
        preloadAvatar(this);
    }

    async create() {
        this.add.image(0, 0, 'leshop').setOrigin(0, 0);
        
        this.player = createAvatar(this, this.playerXLocation, this.playerYLocation, this.playerDirection);
        performIdles(this.player);
        initializePlayerManager(this);

        this.room = await joinRoom(this, 'leshop'); 

        createRoomTransitionUI(this, this.player, 'Downtown', 'Downtown', 378, 227, 91, 131);

        createMenu(this, this.player, this.room);
        
        this.updateMovement = setupMovement(this, this.player, 200);
    }
    
    update(time, delta) {
        if (this.updateMovement && this.room.connection.isOpen) this.updateMovement(delta);

        stepMovementUpdates(this, delta);
    }

}

//Visit the Stellar Salon
export class Salon extends Phaser.Scene {
    constructor() {
        super({ key: 'Salon' });
    }

    init(data) {
        this.playerXLocation = data.playerXLocation || 352;
        this.playerYLocation = data.playerYLocation || 310; 
        this.playerDirection = data.playerDirection || 'left';
    }

    preload() {
        preloadMenu(this);
        preloadAvatar(this);
    }

    async create() {
        this.add.image(0, 0, 'salon').setOrigin(0, 0);
        
        this.player = createAvatar(this, this.playerXLocation, this.playerYLocation, this.playerDirection);
        performIdles(this.player);
        initializePlayerManager(this);

        this.room = await joinRoom(this, 'salon'); 

        createRoomTransitionUI(this, this.player, 'Downtown', 'Downtown', 378, 186, 95, 153);

        createMenu(this, this.player, this.room);
        
        this.updateMovement = setupMovement(this, this.player, 200);
    }
    
    update(time, delta) {
        if (this.updateMovement && this.room.connection.isOpen) this.updateMovement(delta);

        stepMovementUpdates(this, delta);
    }

}

export class TopModel extends Phaser.Scene {
    constructor() {
        super({ key: 'TopModel' });
    }

    preload() {
        this.sound.stopAll(); 
        preloadMenu(this);
        preloadAvatar(this);
    }

    init(data) {
        this.playerXLocation = data.playerXLocation || 420;
        this.playerYLocation = data.playerYLocation || 434; 
        this.playerDirection = data.playerDirection || 'left';
    }

    async create() {
        this.add.image(0, 0, 'topmodel').setOrigin(0, 0);
        
        this.player = createAvatar(this, this.playerXLocation, this.playerYLocation, this.playerDirection);
        performIdles(this.player);
        initializePlayerManager(this);

        this.room = await joinRoom(this, 'topmodel'); 

        createRoomTransitionUI(this, this.player, 'Downtown', 'Downtown', 214, 181, 123, 186);
        createRoomTransitionUI(this, this.player, 'TopModelVIP', 'V.I.P Lounge', 488, 147, 155, 193);

        createMenu(this, this.player, this.room);
        
        this.updateMovement = setupMovement(this, this.player, 200);

        this.top_models_music = this.sound.add('top_models_music', { loop: true, volume: 0.5 });
        this.top_models_music.play();
    }
    
    update(time, delta) {
        if (this.updateMovement && this.room.connection.isOpen) this.updateMovement(delta);

        stepMovementUpdates(this, delta);
    }

}

export class TopModelVIP extends Phaser.Scene {
    constructor() {
        super({ key: 'TopModelVIP' });
    }

    preload() {
        this.sound.stopAll(); 
        preloadMenu(this)
        preloadAvatar(this); // Preload the player's avatar
    }

    init(data) {
        this.playerXLocation = data.playerXLocation || 1071;
        this.playerYLocation = data.playerYLocation || 255; 
        this.playerDirection = data.playerDirection || 'left';
    }

    async create() {
        const bg = this.add.image(0, 0, 'topmodelvip').setOrigin(0, 0);
        bg.setScrollFactor(1); // Make sure it scrolls with the camera

        this.cameras.main.setBounds(0, 0, bg.width, this.scale.height);

        this.player = createAvatar(this, this.playerXLocation, this.playerYLocation, this.playerDirection);
        performIdles(this.player);
        this.cameras.main.startFollow(this.player);

        initializePlayerManager(this);

        // Join the networked room
        this.room = await joinRoom(this, 'topmodelvip'); // Ensure your server supports this room

        // Create Room Transitions X,Y and Width, Height
        createRoomTransitionUI(this, this.player, 'TopModel', 'Lobby', 1164, 196, 127, 220);

        createMenu(this, this.player, this.room);

        this.updateMovement = setupMovement(this, this.player, 200);

        this.vip_room_music = this.sound.add('vip_room_music', { loop: true, volume: 0.5 });
        this.vip_room_music.play();
    }

    update(time, delta) {
        if (this.updateMovement && this.room.connection.isOpen) this.updateMovement(delta);

        stepMovementUpdates(this, delta);
    }
    
}