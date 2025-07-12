import { joinRoom, sendPlayerMove } from './roomHandler.js';
import { preloadAvatar, createAvatar, createStaticAvatar} from '../world/avatar.js';
import { initializePlayerManager } from '../world/playerManager.js';
import { createMenu, preloadMenu } from '../world/UIManager.js';
import { createAvatarAnimations, performIdles } from '../world/animations.js';
import { getPlayerAvatarData } from '../game.js';

// Waiting for players
// Host is selecting theme, 10 seconds
// Theme selected is THEME
// Start round1 duration / aka changing time
// FOR CLIENT ONLY WHILE ROUND1 DURATION IS RUNNING, SHOW INVIDIUAL SCORE
// Round1 duration ends, show round1 outfit results, 10 seconds
// Posing phase starts, 36 seconds, 8 second intervals
// Show round results after posing, each winner one by one for 5 seconds each (33% of players out)
// Host select theme for round 2, 10 seconds
// Start round2 duration / aka changing time
// FOR CLIENT ONLY WHILE ROUND2 DURATION IS RUNNING, SHOW INVIDIUAL SCORE
// Round2 duration ends, show round2 outfit results, 10 seconds
// Posing phase starts, 36 seconds, 8 second intervals
// Show round results after posing, each winner one by one for 5 seconds each (3 left)
// Round 3 auto outfit selection
// Start round3 duration / aka changing time
// FOR CLIENT ONLY WHILE ROUND3 DURATION IS RUNNING, SHOW INVIDIUAL SCORE
// Round3 duration ends, show round3 outfit results, 10 seconds
// Posing phase starts, 36 seconds, 8 second intervals
// Show round results after posing, final winner (20 seconds)
// Show full results and stars earned

// MOVED TO SERVER SIDE
/*
const boyNames = ['noah','liam','jacob','william','mason','ethan','michael','alexander','james','elijah','benjamin','daniel','aiden','logan','jayden','matthew','lucas','david','jackson','joseph','anthony','samuel','joshua','gabriel','andrew','john','christopher','oliver','dylan','carter','isaac','luke','henry','owen','ryan','nathan','wyatt','caleb','sebastian','jack','christian','jonathan','julian','landon','levi','isaiah','hunter','aaron','thomas','charles'];
const girlNames = ['emma', 'mila', 'olivia','sophia','isabella','ava','mia','abigail','emily','charlotte','madison','elizabeth','amelia','evelyn','ella','chloe','harper','avery','sofia','grace','victoria','addison','lily','natalie','aubrey','zoey','lillian','hannah','layla','brooklyn','scarlett','zoe','camila','samantha','riley','leah','aria','savannah','audrey','anna','allison','gabriella','hailey','claire','penelope','aaliyah','sarah','nevaeh','kaylee','stella'];
const categoriesByGender = {
  female: {
    hair:    530,
    top:     383,
    bottom:  176,
    shoe:    378,
    outfit:  231,
    facc:    127,
    bacc:    373,
  },
  male: {
    mhair:   148,
    mtop:    109,
    mbottom:  72,
    mshoe:    69,
    moutfit: 103,
    mfacc:    24,
    mbacc:    35,
  },
  shared: {
    body:      5,
    eyes:     13,
  }
};
*/

export const MAX_PLAYERS = 10;
export const ROUND_TIMERS = {
    ROUND1_DURATION: 70,
    ROUND1_RESULTS: 10,
    POSE_INTERVAL: 10,
    POSE_PHASE: 36,
    ROUND2_DURATION: 80,
    ROUND2_RESULTS: 10,
    ROUND3_DURATION: 100
};

export const RUNWAY_ZONES = [new Phaser.Geom.Rectangle(395 - 650/2, 407 - 95/2, 650, 95), new Phaser.Geom.Rectangle(124 -  90/2, 351 - 180/2,  90, 180), new Phaser.Geom.Rectangle(676 -  90/2, 351 - 180/2,  90, 180), new Phaser.Geom.Ellipse(725, 362, 128, 190), new Phaser.Geom.Ellipse( 77, 356, 128, 165)];
export const HOST_ZONE = new Phaser.Geom.Rectangle(411 - 650/2, 234 - 40/2, 650, 40);
export const ELIM_ZONE = new Phaser.Geom.Rectangle(405 - 350/2, 304 -  80/2, 350, 80);

export class FashionShowScene extends Phaser.Scene {
    constructor() {
        super({ key: 'FashionShowScene' });
    }

    init(data) {
        this.playerXLocation = data.playerXLocation || 400;
        this.playerYLocation = data.playerYLocation || 450; 
        this.playerDirection = data.playerDirection || 'left';
        this.isHost = data.isHost || true;

        if (this.isHost) {
            this.roomID = data.roomID || getPlayerAvatarData().username; // Default to a unique room ID based on username
        } else {
            this.roomID = data.roomID || 'any'; // Fallback
        }
    }

    preload() {
        preloadMenu(this);
        const avatarData = getPlayerAvatarData();
        console.log('Ex avatarData: ', avatarData);
        if (!avatarData) {
            console.error("❌ No avatar data found!");
            return;
        }
        preloadAvatar(this); // Preload the player's avatar
    }

    async create() {
        // add the pre-loaded background
        this.add.image(427, 283, 'fashionShowBg').setOrigin(0.5, 0.5);

        this.player = createAvatar(this, this.playerXLocation, this.playerYLocation, this.playerDirection);

        this.spawnSelf();

        createAvatarAnimations(this, this.player);
        performIdles(this.player);
        initializePlayerManager(this);

        this.room = await joinRoom(this, 'fashionShow', 'fashionShow'+this.roomID); // Ensure your server supports this room

        createMenu(this, this.player, this.room);

        const movementZones = this.isHost ? [ HOST_ZONE ] : RUNWAY_ZONES;
        this.updateMovement = setupMovement(this, this.player, 275, movementZones);
    }


    update(time, delta) {
        if (this.updateMovement && this.room.connection.isOpen) this.updateMovement(delta);
        if (this.room && this.player && this.room.connection.isOpen) {
            sendPlayerMove(this.room, this.player.x, this.player.y, this.player.direction);
        }
    }

    getRandomPointInZone(shape) {
        if (shape instanceof Phaser.Geom.Rectangle) {
            return Phaser.Geom.Rectangle.Random(shape);
        } else {
            return Phaser.Geom.Ellipse.Random(shape);
        }
    }

    spawnSelf() {
        let shape = this.isHost
            ? HOST_ZONE
            : Phaser.Utils.Array.GetRandom(RUNWAY_ZONES);

        const pt = this.getRandomPointInZone(shape);
        this.player.setPosition(pt.x, pt.y);
    }

    // MOVED TO SERVER SIDE
    /* 
    spawnPlayerBots(){
        for (let i = 0; i <= 4; i++) {
            const botData = generateRandomCharacter(this);
            const pt = this.getRandomPointInZone(RUNWAY_ZONES[i]);
            createStaticAvatar(this, pt.x, pt.y, 'left', botData);
            console.log('Spawning bot: ', botData.username, 'with data:', botData);
        }
    }
    */
    

}

export function setupMovement(scene, player, moveSpeed, boundaryZones = []) {
    let targetPosition = null;
    moveSpeed = moveSpeed || 275;
    let preciseX = player.x;
    let preciseY = player.y;

    scene.input.on('pointerup', pointer => {
        if (pointer.event.defaultPrevented) return;
        if (player.isJumping || player.isCrying) return;
        targetPosition = { x: pointer.worldX, y: pointer.worldY };
    });

    return (delta) => {
        if (!targetPosition) return;

        const distance = Phaser.Math.Distance.Between(
            preciseX, preciseY,
            targetPosition.x, targetPosition.y
        );

        if (distance < 4) {
            // snap to target
            preciseX = targetPosition.x;
            preciseY = targetPosition.y;
            if (insideZones(preciseX, preciseY, boundaryZones)) {
                player.setPosition(Math.round(preciseX), Math.round(preciseY));
            }
            targetPosition = null;
        } else {
            // compute velocity
            const angle = Phaser.Math.Angle.Between(
                preciseX, preciseY,
                targetPosition.x, targetPosition.y
            );
            const vx = Math.cos(angle) * (moveSpeed * (delta/1000));
            const vy = Math.sin(angle) * (moveSpeed * (delta/1000));
            const newX = preciseX + vx;
            const newY = preciseY + vy;

            // only update if inside at least one boundary zone
            if (boundaryZones.length === 0 || insideZones(newX, newY, boundaryZones)) {
                preciseX = newX;
                preciseY = newY;
                player.setPosition(Math.round(preciseX), Math.round(preciseY));

                // direction flipping
                if (vx > 0 && player.base.getData('direction') !== 'right') {
                    player.setScale(-1, 1);
                    player.nameTag.setScale(-1, 1);
                    player.base.setData('direction', 'right');
                    player.direction = 'right';
                } else if (vx < 0 && player.base.getData('direction') !== 'left') {
                    player.setScale(1, 1);
                    player.nameTag.setScale(1, 1);
                    player.base.setData('direction', 'left');
                    player.direction = 'left';
                }

                // network update
                if (scene.room) {
                    scene.room.send('move', {
                        x: player.x,
                        y: player.y,
                        direction: player.direction
                    });
                }
            }
            // else: you could cancel targetPosition here if you want to stop at boundary
        }
    };
}

function insideZones(x, y, zones) {
    return zones.some(zone => {
        if (zone instanceof Phaser.Geom.Rectangle) {
            return Phaser.Geom.Rectangle.Contains(zone, x, y);
        }
        if (zone instanceof Phaser.Geom.Ellipse) {
            return Phaser.Geom.Ellipse.Contains(zone, x, y);
        }
        return false;
    });
}

// MOVED TO SERVER SIDE
/*
function generateRandomUsername(gender) {
  const names = gender == 'male' ? boyNames : girlNames;
  
  // Pick a random name
  const name = names[Math.floor(Math.random() * names.length)];
  
  // Generate 2–6 random digits
  const digitCount = Math.floor(Math.random() * 5) + 2; // 2 to 6
  let numbers = '';
  for (let i = 0; i < digitCount; i++) {
    numbers += Math.floor(Math.random() * 10);
  }
  
  return name + numbers;
}

function randInt(max) {
  return Math.floor(Math.random() * (max + 1));
}

function pickRandomBoard(scene) {
  const metadata = scene.cache.json.get("boards_metadata");
  const boardIds = Object.keys(metadata);
  return boardIds[Math.floor(Math.random() * boardIds.length)];
}

function generateRandomCharacter(scene) {
  const gender = Math.random() < 0.5 ? 'male' : 'female';
  const username = generateRandomUsername(gender);
  const board = pickRandomBoard(scene);
  const useOutfit = Math.random() < 0.5;
  const result = { username, gender, board };

  const bodyMax = categoriesByGender.shared.body;
  const eyesMax = categoriesByGender.shared.eyes;
  const bodyIdx = randInt(bodyMax);
  const eyesIdx = randInt(eyesMax);
  const bodyPrefix = gender === 'male' ? 'mbody' : 'body';
  const headPrefix = gender === 'male' ? 'mhead' : 'head';
  const eyesPrefix = gender === 'male' ? 'meyes' : 'eyes';
  result.body = `${bodyPrefix}${bodyIdx}`;
  result.head = `${headPrefix}${bodyIdx}`;
  result.eyes = `${eyesPrefix}${eyesIdx}`;

  const hairKey = gender === 'male' ? 'mhair' : 'hair';
  result.hair = `${hairKey}${randInt(categoriesByGender[gender][hairKey])}`;

  if (useOutfit) {
    const outfitKey = gender === 'male' ? 'moutfit' : 'outfit';
    result.outfit = `${outfitKey}${randInt(categoriesByGender[gender][outfitKey])}`;
    result.top = 'none';
    result.bottom = 'none';
  } else {
    const topKey = gender === 'male' ? 'mtop' : 'top';
    const bottomKey = gender === 'male' ? 'mbottom' : 'bottom';
    result.outfit = 'none';
    result.top = `${topKey}${randInt(categoriesByGender[gender][topKey])}`;
    result.bottom = `${bottomKey}${randInt(categoriesByGender[gender][bottomKey])}`;
  }

  const shoeKey = gender === 'male' ? 'mshoe' : 'shoe';
  result.shoes = `${shoeKey}${randInt(categoriesByGender[gender][shoeKey])}`;

  const faccKey = gender === 'male' ? 'mfacc' : 'facc';
  result.face_acc = Math.random() < 0.3
    ? `${faccKey}${randInt(categoriesByGender[gender][faccKey])}`
    : 'none';

  const baccKey = gender === 'male' ? 'mbacc' : 'bacc';
  result.body_acc = Math.random() < 0.4
    ? `${baccKey}${randInt(categoriesByGender[gender][baccKey])}`
    : 'none';

  return result;
}
*/
