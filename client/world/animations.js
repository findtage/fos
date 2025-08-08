import { assets, outfits, tops } from "../assets/data.js";
let saveScene = null;

export function createAvatarAnimations(scene, player) {
    const metadata = scene.cache.json.get("boards_metadata");
    helperSaveScene(scene);
    const gender = player.head.texture.key.startsWith('m') ? 'male' : 'female';

    // Function to create animations dynamically per player
    function createAnimation(key, texture, frames, frameRate = 2.5) {
        const animationKey = `${key}-${texture}`;

        if (!scene.anims.exists(animationKey)) { // Prevent duplicate animations
            scene.anims.create({
                key: animationKey,
                frames: scene.anims.generateFrameNumbers(texture, { frames: frames }),
                frameRate: frameRate,
                repeat: 0,
            });
        }
    }

    // Hair Idles
    if (assets['hair']?.[gender]?.[player.hair.texture.key]?.["type"] == "sprite"){
        const hairanimationKey = `idle-${player.hair.texture.key}`;

        if (!scene.anims.exists(hairanimationKey)) { // Prevent duplicate animations
            scene.anims.create({
                key: hairanimationKey,
                frames: scene.anims.generateFrameNumbers(player.hair.texture.key, { frames: [0, 1, 2, 3] }),
                frameRate: 2.5,
                repeat: -1,
            });
        } 
    }  

    // Outfit Idles
    if (outfits?.[gender]?.[player.outfit.texture.key]?.["type"] == "sprite"){
        const outfitanimationKey = `idle-${player.outfit.texture.key}`;

        if (outfits?.[gender]?.[player.outfit.texture.key]?.['frames'] == 8){
            if (!scene.anims.exists(outfitanimationKey)) { // Prevent duplicate animations
                scene.anims.create({
                    key: outfitanimationKey,
                    frames: scene.anims.generateFrameNumbers(player.outfit.texture.key, { frames: [0, 6, 7] }),
                    frameRate: 2.5,
                    repeat: -1,
                });
            }
        } else {
            if (!scene.anims.exists(outfitanimationKey)) { // Prevent duplicate animations
                scene.anims.create({
                    key: outfitanimationKey,
                    frames: scene.anims.generateFrameNumbers(player.outfit.texture.key, { frames: [0, 6] }),
                    frameRate: 2.5,
                    repeat: -1,
                });
            }
        }
        
    }

    // Board Idles
    const boardTextureKey = player.board.texture.key === "baccEmpty" ? player.boardTop.texture.key : player.board.texture.key;
    const boardData = metadata[boardTextureKey];

    if ((boardData.frames > 2 && boardData.middleEffect) || (boardData.frames >= 2 && !boardData.middleEffect)) {
        createBoardIdleAnimations(scene, player, boardData);
    }

    // Top Idles
    if (tops?.top?.female?.[player.top.texture.key]?.["frames"] == 7){
        const topanimationKey = `idle-${player.top.texture.key}`;

        if (!scene.anims.exists(topanimationKey)) { // Prevent duplicate animations
            scene.anims.create({
                key: topanimationKey,
                frames: scene.anims.generateFrameNumbers(player.top.texture.key, { frames: [0, 6] }),
                frameRate: 2.5,
                repeat: -1,
            });
        } 
    }

    // Get unique asset names for this player
    const bodyTexture = player.base.texture.key;
    const topTexture = player.top.texture.key;
    const bottomTexture = player.bottom.texture.key;
    const shoeTexture = player.shoes.texture.key;
    const eyesTexture = player.eyes.texture.key;
    const browsTexture = player.brows.texture.key;
    const lipsTexture = player.lips.texture.key;
    const outfitTexture = player.outfit.texture.key;
    

    if (player.bodyacc.texture.key != "baccEmpty"){
        const bodyAccTexture = player.bodyacc.texture.key;
        createAnimation("wave", bodyAccTexture, [1, 2, 1, 2, 1, 0]);
        createAnimation("jump", bodyAccTexture, [0, 5, 0, 5, 0]);
        createAnimation("cry", bodyAccTexture, [3, 4, 3, 4, 3, 4, 0]);
    }

    // Define animations for this texture only
    // Create wave animations
    createAnimation("wave", bodyTexture, [1, 2, 1, 2, 1, 0]);
    createAnimation("wave", topTexture, [1, 2, 1, 2, 1, 0]);
    createAnimation("wave", lipsTexture, [1, 1, 1, 1, 1, 0]);
    createAnimation("wave", outfitTexture, [1, 2, 1, 2, 1, 0]);

    // Create jump animations
    createAnimation("jump", bodyTexture, [0, 5, 0, 5, 0]);
    createAnimation("jump", topTexture, [0, 5, 0, 5, 0]);
    createAnimation("jump", bottomTexture, [0, 1, 0, 1, 0]);
    createAnimation("jump", shoeTexture, [0, 1, 0, 1, 0]);
    createAnimation("jump", lipsTexture, [0, 1, 1, 1, 0]);
    createAnimation("jump", outfitTexture, [0, 5, 0, 5, 0]);

    // Create cry animations
    createAnimation("cry", bodyTexture, [3, 4, 3, 4, 3, 4, 0]);
    createAnimation("cry", topTexture, [3, 4, 3, 4, 3, 4, 0]);
    createAnimation("cry", browsTexture, [1, 1, 1, 1, 1, 1, 0]);
    createAnimation("cry", eyesTexture, [1, 1, 1, 1, 1, 1, 0]);
    createAnimation("cry", outfitTexture, [3, 4, 3, 4, 3, 4, 0]);
    if (gender == 'male'){
        createAnimation("cry", lipsTexture, [2, 3, 2, 3, 2, 3, 0]);
    }

    // Create wink animations
    if (gender == 'female'){
        createAnimation("wink", eyesTexture, [1, 0, 1, 0, 2, 0, 3, 0]);
        createAnimation("wink", lipsTexture, [0, 0, 0, 0, 1, 0]);
    } else {
        createAnimation("wink", eyesTexture, [0, 1, 0, 2, 0, 3, 0]);
        createAnimation("wink", lipsTexture, [0, 0, 0, 1, 0, 0, 0]);
    } 
    
}

let emotePopup = null;
let actionButtons = null;
export function toggleEmotePopup(scene, player, room) {
    if (emotePopup) {
        emotePopup.destroy(); // Hide the popup if it exists
        emotePopup = null;
        if (actionButtons != null){
            actionButtons.forEach((button) => button.destroy());
        }

           
    } else {
        // Create the popup image
        emotePopup = scene.add.image(257, 376, 'actionmenu').setOrigin(0.5, 0.5).setScrollFactor(0);
        emotePopup.setDepth(2); // Ensure it's above other UI elements

        const buttonConfigs = [
            { name: 'wave', x: 238, y: 301, width: 30, height: 30 },
            { name: 'cry', x: 276, y: 301, width: 30, height: 30},
            { name: 'jump', x: 238, y: 339, width: 30, height: 30 },
            { name: 'wink', x: 277, y: 339, width: 30, height: 30 },
            //{ name: 'blush', x: 13, y: 9, width: 30, height: 30 },
            //{ name: 'surprised', x: 13, y: 9, width: 30, height: 30 },
            //{ name: 'laugh', x: 13, y: 9, width: 30, height: 30 },
            //{ name: 'embarassed', x: 13, y: 9, width: 30, height: 30 },
            //{ name: 'inLove', x: 13, y: 9, width: 30, height: 30 },
            //{ name: 'kawaii', x: 13, y: 9, width: 30, height: 30 }
        ];

        actionButtons = buttonConfigs.map(({ name, x, y, width, height }) => {
        
            const button = scene.add
            .rectangle(x, y, width, height, 0xffffff, 0) // Invisible interactive rectangle
            .setInteractive()
            .setScrollFactor(0); // Fix to the camera view
        
            button.setDepth(2)
        
            // Add pointerdown event
            button.on('pointerdown', (pointer, x, y, event) => {
            console.log(`You clicked on ${name}`);
            //event.stopPropagation(); // Prevent clicks from propagating
            });
        
            button.on('pointerup', (pointer, localX, localY, event) => {
                if (name == "wave"){
                    event.stopPropagation();
                    performWave(player)
                    room.send("playAnimation", { animationKey: "wave"});
                    emotePopup.destroy();
                    emotePopup = null;
                    actionButtons.forEach((button) => button.destroy());
                } else if (name == "jump"){
                    event.stopPropagation();
                    performJump(player)
                    room.send("playAnimation", { animationKey: "jump"});
                    emotePopup.destroy();
                    emotePopup = null;
                    actionButtons.forEach((button) => button.destroy());
                } else if (name == "cry"){
                    event.stopPropagation();
                    performCry(player)
                    room.send("playAnimation", { animationKey: "cry"});
                    emotePopup.destroy();
                    emotePopup = null;
                    actionButtons.forEach((button) => button.destroy());
                } else if (name == "wink"){
                    event.stopPropagation();
                    performWink(player)
                    room.send("playAnimation", { animationKey: "wink"});
                    emotePopup.destroy();
                    emotePopup = null;
                    actionButtons.forEach((button) => button.destroy());
                }
            });
            // Optional hover effect
            button.on('pointerover', () => {
                button.setFillStyle(0x2D2D2D, 0.3); // Add slight highlight on hover
            });
            button.on('pointerout', () => {
                button.setFillStyle(0xffffff, 0); // Remove highlight
            });
        
            return button;
        });

        // Close popup when clicking outside
        scene.input.once('pointerup', () => {
            if (emotePopup) {
                emotePopup.destroy();
                emotePopup = null;
                if (actionButtons != null && actionButtons){
                    actionButtons.forEach((button) => button.destroy());
                }
                console.log("Closing popup and destroying buttons");
            }
        });
  }
}

export function performWave(player){
    player.base.play(`wave-${player.base.texture.key}`);
    player.lips.play(`wave-${player.lips.texture.key}`);
    player.top.play(`wave-${player.top.texture.key}`);
    player.outfit.play(`wave-${player.outfit.texture.key}`);

    if (player.bodyacc.texture.key != "baccEmpty"){
        player.bodyacc.play(`wave-${player.bodyacc.texture.key}`);
    }

    player.base.once('animationcomplete', () => {
        performIdles(player);
    });
    
}

export function performJump(player) {
    let jumped = [false, false, false, false];
    player.isJumping = true;
    
    player.base.play(`jump-${player.base.texture.key}`);

    player.base.on('animationupdate', (anim, frame) => {
        if (anim.key === `jump-${player.base.texture.key}`) {
            if (frame.index === 2 || frame.index === 4) {
                if (!jumped[frame.index + 2]) {
                    player.y -= 5;
                    player.tag.y += 5;
                    player.nameTag.y += 5;
                    player.board.y +=5;
                    player.boardTop.y +=5;
                    jumped[frame.index + 2] = true;
                }
            } else if (frame.index === 3 || frame.index === 5) {
                if (!jumped[frame.index + 2]) {
                    player.y += 5;
                    player.tag.y -= 5;
                    player.nameTag.y -= 5;
                    player.board.y -=5;
                    player.boardTop.y -=5;
                    jumped[frame.index + 2] = true;
                }
            }
        }
    });

    player.lips.play(`jump-${player.lips.texture.key}`);
    player.top.play(`jump-${player.top.texture.key}`);
    player.bottom.play(`jump-${player.bottom.texture.key}`);
    player.shoes.play(`jump-${player.shoes.texture.key}`);
    player.outfit.play(`jump-${player.outfit.texture.key}`);

    if (player.bodyacc.texture.key != "baccEmpty"){
        player.bodyacc.play(`jump-${player.bodyacc.texture.key}`);
    }

    player.base.once('animationcomplete', () => {
        player.isJumping = false; // Re-enable movement when jump animation finishes
        performIdles(player);
    });
}

export function performCry(player) {
    player.base.play(`cry-${player.base.texture.key}`);
    player.top.play(`cry-${player.top.texture.key}`);
    player.outfit.play(`cry-${player.outfit.texture.key}`);
    player.brows.play(`cry-${player.brows.texture.key}`);
    player.eyes.play(`cry-${player.eyes.texture.key}`);
    if (player.head.texture.key.startsWith('m')){
        player.lips.play(`cry-${player.lips.texture.key}`);
    };

    if (player.bodyacc.texture.key != "baccEmpty"){
        player.bodyacc.play(`cry-${player.bodyacc.texture.key}`);
    }

    let bopped = [false, false, false, false, false, false];
    player.isCrying = true;

    player.base.on('animationupdate', (anim, frame) => {
        if (anim.key === `cry-${player.base.texture.key}`) {
            if (frame.index === 2 || frame.index === 4 || frame.index === 6) {
                if (!bopped[frame.index + 2]) {
                    player.head.y += 1;
                    player.hair.y += 1;
                    player.brows.y += 1;
                    player.eyes.y += 1;
                    player.faceacc.y += 1;

                    player.head.x -= 1;
                    player.hair.x -= 1;
                    player.brows.x -= 1;
                    player.eyes.x -= 1;
                    player.faceacc.x -= 1;

                    bopped[frame.index + 2] = true;
                }
            } else if (frame.index === 3 || frame.index === 5 || frame.index === 7) {
                if (!bopped[frame.index + 2]) {
                    player.head.y -= 1;
                    player.hair.y -= 1;
                    player.brows.y -= 1;
                    player.eyes.y -= 1;
                    player.faceacc.y -= 1;

                    player.head.x += 1;
                    player.hair.x += 1;
                    player.brows.x += 1;
                    player.eyes.x += 1;
                    player.faceacc.x += 1;

                    bopped[frame.index + 2] = true;
                }
            }
        }
    });

    player.base.once('animationcomplete', () => {
        player.isCrying = false; // Re-enable movement when cry animation finishes
        performIdles(player);
    });
}

export function performWink(player) {
    player.lips.play(`wink-${player.lips.texture.key}`);
    player.eyes.play(`wink-${player.eyes.texture.key}`);
}

function createBoardIdleAnimations(scene, player, boardData) {
    const totalFrames = boardData.frames;
    const key = player.board.texture.key;
    const topKey = player.boardTop.texture.key;

    // middleEffect present
    if (boardData.middleEffect) {
        if (boardData.layerAbove) {
            // Use board sprite with frames 0 to n-2
            scene.anims.create({
                key: `idle-${key}`,
                frames: scene.anims.generateFrameNumbers(key, { start: 0, end: totalFrames - 2 }),
                frameRate: 2.5,
                repeat: -1,
            });
        } else {
            // Use boardTop sprite with frames 0 to n-2
            scene.anims.create({
                key: `idle-${topKey}`,
                frames: scene.anims.generateFrameNumbers(topKey, { start: 0, end: totalFrames - 2 }),
                frameRate: 2.5,
                repeat: -1,
            });
        }
    }
    // no middleEffect
    else {
        if (boardData.layerAbove) {
            // Use boardTop sprite with frames 0 to n-1
            scene.anims.create({
                key: `idle-${topKey}`,
                frames: scene.anims.generateFrameNumbers(topKey, { start: 0, end: totalFrames - 1 }),
                frameRate: 2.5,
                repeat: -1,
            });
        } else {
            // Use board sprite with frames 0 to n-1
            scene.anims.create({
                key: `idle-${key}`,
                frames: scene.anims.generateFrameNumbers(key, { start: 0, end: totalFrames - 1 }),
                frameRate: 2.5,
                repeat: -1,
            });
        }
    }
}

function helperSaveScene(scene){
    saveScene = scene;
}

function getScene(){
    return saveScene;
}

export function performIdles(player) {
    const scene = getScene();
    const metadata = scene.cache.json.get("boards_metadata");
    const gender = player.hair.texture.key.startsWith('m') ? 'male' : 'female';
    const boardTextureKey = player.board.texture.key === "baccEmpty" ? player.boardTop.texture.key : player.board.texture.key;
    const boardData = metadata[boardTextureKey];

    if (assets['hair']?.[gender]?.[player.hair.texture.key]?.["type"] == "sprite"){
        player.hair.play(`idle-${player.hair.texture.key}`);
    }

    if (outfits?.[gender]?.[player.outfit.texture.key]?.["type"] == "sprite"){
        player.outfit.play(`idle-${player.outfit.texture.key}`);
    }

    if (tops?.top?.[gender]?.[player.top.texture.key]?.["frames"] == 7){
        player.top.play(`idle-${player.top.texture.key}`);
    }

    if ((boardData.frames > 2 && boardData.middleEffect) || (boardData.frames >= 2 && !boardData.middleEffect)) {
        if (boardData.middleEffect) {
            if (boardData.layerAbove) {
                player.board.play(`idle-${player.board.texture.key}`);
            } else {
                player.boardTop.play(`idle-${player.boardTop.texture.key}`);
            }
        } else {
            if (boardData.layerAbove) {
                player.boardTop.play(`idle-${player.boardTop.texture.key}`);
            } else {
                player.board.play(`idle-${player.board.texture.key}`);
            }
        }
    }
}
