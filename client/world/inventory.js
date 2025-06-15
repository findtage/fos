import { assets, tops, bottoms, shoes, outfits, boards, face_acc, body_acc } from '../assets/data.js';
import { createAvatarAnimations, performIdles } from './animations.js';
import { getPlayerAvatarData, updateLocalAvatarData } from "../game.js";
import { publicURL } from '../env.js';
import { createAvatar } from './avatar.js';

export function openInventory(scene, player, room){
    //const { width, height } = scene.cameras.main;
    const inventory = scene.add.image(0, 0, 'inventorybg').setOrigin(0, 0).setScrollFactor(0).setInteractive().setDepth(2);
    const avatarData = getPlayerAvatarData();
    let gender = avatarData.gender;

    // Store initial outfit for comparison
    const initialAvatarData = { 
        hair: player.hair.texture.key, 
        top: player.top.visible ? player.top.texture.key : "none",
        bottom: player.bottom.visible ? player.bottom.texture.key : "none",
        shoes: player.shoes.texture.key,
        board: (player.board.texture.key === "baccEmpty") ? player.boardTop.texture.key : player.board.texture.key,
        outfit: player.outfit.visible ? player.outfit.texture.key : "none",
        face_acc: player.faceacc.texture.key === 'faccEmpty' ? 'none' : player.faceacc.texture.key,
        body_acc: player.bodyacc.texture.key === 'baccEmpty' ? 'none' : player.bodyacc.texture.key
    };

    inventory.on('pointerup', (pointer, localX, localY, event) => {
        event.stopPropagation();
    });

    // Create closet avatar
    const previewPlayer = createAvatar(scene, 694, 350).setDepth(2).setScrollFactor(0);
    
    
    // Create a close button
    const closeInventory = scene.add.ellipse(778, 21, 30, 30, 0xffffff, 0).setInteractive().setScrollFactor(0).setDepth(2);

    closeInventory.on('pointerup', async (pointer, localX, localY, event) => {
    
        // Notify other players about outfit change IF ANY CHANGES FIX LATER
        room.send("outfitChange", {playerId: player.id,
            playerGender: gender,
            hairKey: previewPlayer.hair.texture.key, 
            topKey: previewPlayer.top.visible ? player.top.texture.key : "none",
            bottomKey: previewPlayer.bottom.visible ? previewPlayer.bottom.texture.key : "none",
            outfitKey: previewPlayer.outfit.visible ? previewPlayer.outfit.texture.key : "none",
            shoeKey: previewPlayer.shoes.texture.key,
            boardKey: (previewPlayer.board.texture.key === "baccEmpty") ? previewPlayer.boardTop.texture.key : previewPlayer.board.texture.key,
            faceAccKey: previewPlayer.faceacc.texture.key,
            bodyAccKey: previewPlayer.bodyacc.texture.key
        });
        event.stopPropagation();

        let updatedData = { 
            hair: previewPlayer.hair.texture.key, 
            top: previewPlayer.top.visible ? previewPlayer.top.texture.key : "none",
            bottom: previewPlayer.bottom.visible ? previewPlayer.bottom.texture.key : "none",
            shoes: previewPlayer.shoes.texture.key,
            board: (previewPlayer.board.texture.key === "baccEmpty") ? previewPlayer.boardTop.texture.key : previewPlayer.board.texture.key,
            outfit: previewPlayer.outfit.visible ? previewPlayer.outfit.texture.key : "none",
            face_acc: previewPlayer.faceacc.texture.key != "faccEmpty" ? previewPlayer.faceacc.texture.key : "none",
            body_acc: previewPlayer.bodyacc.texture.key != "baccEmpty" ? previewPlayer.bodyacc.texture.key : "none"
        };
        
        // ✅ Check if the outfit was changed before saving
        if (JSON.stringify(updatedData) !== JSON.stringify(initialAvatarData)) {

            console.log("Here is updated data:", JSON.stringify(updatedData), "\nHere is inital Data:", JSON.stringify(initialAvatarData),
            "\n📝 Outfit changed! Saving...");
            await saveOutfitChangesToDB(updatedData);

            const avatarData = getPlayerAvatarData();
            avatarData.direction = player.direction; 

            scene.scene.start(scene.scene.key, { playerXLocation: player.x, playerYLocation: player.y, playerDirection: player.direction });
        } else {
            console.log("🔹 No changes detected, not saving.");
        }
        
        // Clean up
        inventory.destroy();
        closeInventory.destroy();
        sideBar.destroy();
        accSideBar.destroy();
        switchToHairs.destroy();
        switchToClothes.destroy();
        switchToTops.destroy();
        switchToBottoms.destroy();
        switchToOutfits.destroy();
        switchToShoes.destroy();
        switchToBoards.destroy();
        switchToAcc.destroy();
        switchToBodyAcc.destroy();
        switchToEarrings.destroy();
        switchToMoodies.destroy();
        switchToHairAcc.destroy();
        switchToFaceAcc.destroy();
        clothingSelection.destroy();
        previewPlayer.destroy();

        createAvatarAnimations(scene, player);
        performIdles(player);
    });

    closeInventory.on('pointerover', () => {
      closeInventory.setFillStyle(0x808080, 0.15); // Highlight the area slightly 0x2D2D2D 0xaaaaaa
    });
    closeInventory.on('pointerout', () => {
      closeInventory.setFillStyle(0xffffff, 0); // Remove highlight
    });

    // Handle Hair Button
    const switchToHairs = scene.add.rectangle(46, 73, 72, 29, 0xffffff, 0).setInteractive().setScrollFactor(0).setDepth(2).setOrigin(0.5, 0.5);

    switchToHairs.on('pointerup', (pointer, localX, localY, event) => {
        event.stopPropagation(); 
        if (currentPage != "hair"){
            clothingSelection.destroy();

            sideBar.setVisible(false);
            switchToTops.setVisible(false);
            switchToBottoms.setVisible(false);
            switchToOutfits.setVisible(false);
            switchToShoes.setVisible(false);
            accSideBar.setVisible(false);
            switchToBodyAcc.setVisible(false);
            switchToEarrings.setVisible(false);
            switchToMoodies.setVisible(false);
            switchToHairAcc.setVisible(false);
            switchToFaceAcc.setVisible(false);

            clothingSelection = new HairSelection(scene, player, previewPlayer); // Store instance
            currentPage = "hair";
        }
        
    });
    switchToHairs.on('pointerover', () => {
        switchToHairs.setFillStyle(0x808080, 0.15); // Highlight the area slightly 0x2D2D2D 0xaaaaaa
      });
    switchToHairs.on('pointerout', () => {
        switchToHairs.setFillStyle(0xffffff, 0); // Remove highlight
    });

    // Handle Clothing Button
    const switchToClothes = scene.add.rectangle(139, 73, 104, 28, 0xffffff, 0).setInteractive().setScrollFactor(0).setDepth(2).setOrigin(0.5, 0.5);

    switchToClothes.on('pointerup', (pointer, localX, localY, event) => {
        event.stopPropagation(); 
        if (currentPage != "tops" && currentPage != "bottoms" && currentPage != "shoes"){
            clothingSelection.destroy();
            clothingSelection = new TopSelection(scene, player, previewPlayer); // Store instance

            sideBar.setVisible(true);
            switchToTops.setVisible(true);
            switchToBottoms.setVisible(true);
            switchToShoes.setVisible(true);
            switchToOutfits.setVisible(true);
            accSideBar.setVisible(false);
            switchToBodyAcc.setVisible(false);
            switchToEarrings.setVisible(false);
            switchToMoodies.setVisible(false);
            switchToHairAcc.setVisible(false);
            switchToFaceAcc.setVisible(false);

            currentPage = "tops";
        } 
        
    });
    switchToClothes.on('pointerover', () => {
        switchToClothes.setFillStyle(0x808080, 0.15); // Highlight the area slightly 0x2D2D2D 0xaaaaaa
      });
    switchToClothes.on('pointerout', () => {
        switchToClothes.setFillStyle(0xffffff, 0); // Remove highlight
    });

    // Clothing sub category buttons
    const switchToTops = scene.add.rectangle(98, 97, 33, 15, 0xffffff, 0).setInteractive().setScrollFactor(0).setDepth(3).setOrigin(0.5, 0.5).setVisible(false);
    const switchToBottoms = scene.add.rectangle(165, 97, 60, 15, 0xffffff, 0).setInteractive().setScrollFactor(0).setDepth(3).setOrigin(0.5, 0.5).setVisible(false);
    const switchToOutfits = scene.add.rectangle(244, 97, 55, 15, 0xffffff, 0).setInteractive().setScrollFactor(0).setDepth(3).setOrigin(0.5, 0.5).setVisible(false);
    //const switchToCostumes = scene.add.rectangle(331, 97, 70, 15, 0xffffff, 0).setInteractive().setScrollFactor(0).setDepth(3).setOrigin(0.5, 0.5).setVisible(false);
    const switchToShoes = scene.add.rectangle(413, 97, 45, 15, 0xffffff, 0).setInteractive().setScrollFactor(0).setDepth(3).setOrigin(0.5, 0.5).setVisible(false);
    
    // Handle Tops Button
    switchToTops.on('pointerup', (pointer, localX, localY, event) => {
        event.stopPropagation(); 
        if (currentPage != "tops"){
            clothingSelection.destroy();
            clothingSelection = new TopSelection(scene, player, previewPlayer); // Store instance
            currentPage = "tops";
        } 
        
    });
    switchToTops.on('pointerover', () => {
        switchToTops.setFillStyle(0x275A8C, 0.1); // Highlight the area slightly 0x2D2D2D 0xaaaaaa
      });
    switchToTops.on('pointerout', () => {
        switchToTops.setFillStyle(0xffffff, 0); // Remove highlight
    });

    // Handle Bottoms Button
    switchToBottoms.on('pointerup', (pointer, localX, localY, event) => {
        event.stopPropagation(); 
        if (currentPage != "bottoms"){
            clothingSelection.destroy();
            clothingSelection = new BottomSelection(scene, player, previewPlayer); // Store instance
            currentPage = "bottoms";
        } 
        
    });

    switchToBottoms.on('pointerover', () => {
        switchToBottoms.setFillStyle(0x275A8C, 0.1); // Highlight the area slightly 0x2D2D2D 0xaaaaaa
      });
    switchToBottoms.on('pointerout', () => {
        switchToBottoms.setFillStyle(0xffffff, 0); // Remove highlight
    });

    // Handle Outfit Button
    switchToOutfits.on('pointerup', (pointer, localX, localY, event) => {
        event.stopPropagation(); 
        if (currentPage != "outfits"){
            clothingSelection.destroy();
            clothingSelection = new OutfitSelection(scene, player, previewPlayer); // Store instance
            currentPage = "outfits";
        } 
        
    });
    switchToOutfits.on('pointerover', () => {
        switchToOutfits.setFillStyle(0x275A8C, 0.1); // Highlight the area slightly 0x2D2D2D 0xaaaaaa
    });
    switchToOutfits.on('pointerout', () => {
        switchToOutfits.setFillStyle(0xffffff, 0); // Remove highlight
    });


    // Handle Shoe Button
    switchToShoes.on('pointerup', (pointer, localX, localY, event) => {
        event.stopPropagation(); 
        if (currentPage != "shoes"){
            clothingSelection.destroy();
            clothingSelection = new ShoeSelection(scene, player, previewPlayer); // Store instance
            currentPage = "shoes";
        } 
        
    });

    switchToShoes.on('pointerover', () => {
        switchToShoes.setFillStyle(0x275A8C, 0.1); // Highlight the area slightly 0x2D2D2D 0xaaaaaa
      });
    switchToShoes.on('pointerout', () => {
        switchToShoes.setFillStyle(0xffffff, 0); // Remove highlight
    });

    // Handle Board Button
    const switchToBoards = scene.add.rectangle(235, 73, 90, 28, 0xffffff, 0).setInteractive().setScrollFactor(0).setDepth(2).setOrigin(0.5, 0.5);
    switchToBoards.on('pointerup', (pointer, localX, localY, event) => {
        event.stopPropagation(); 
        if (currentPage != "boards"){
            clothingSelection.destroy();
            clothingSelection = new BoardSelection(scene, player, previewPlayer); // Store instance

            sideBar.setVisible(false);
            switchToTops.setVisible(false);
            switchToBottoms.setVisible(false);
            switchToShoes.setVisible(false);
            switchToOutfits.setVisible(false);
            accSideBar.setVisible(false);
            switchToBodyAcc.setVisible(false);
            switchToEarrings.setVisible(false);
            switchToMoodies.setVisible(false);
            switchToHairAcc.setVisible(false);
            switchToFaceAcc.setVisible(false);

            currentPage = "boards";
        } 
        
    });
    switchToBoards.on('pointerover', () => {
        switchToBoards.setFillStyle(0x808080, 0.15); // Highlight the area slightly 0x2D2D2D 0xaaaaaa
      });
    switchToBoards.on('pointerout', () => {
        switchToBoards.setFillStyle(0xffffff, 0); // Remove highlight
    });

    // Handle Accessory Button
    const switchToAcc = scene.add.rectangle(343, 73, 125, 28, 0xffffff, 0).setInteractive().setScrollFactor(0).setDepth(2).setOrigin(0.5, 0.5);
    switchToAcc.on('pointerup', (pointer, localX, localY, event) => {
        event.stopPropagation();
        if (currentPage != "bodyacc" && currentPage != "faceacc" && currentPage != "hairacc" && currentPage != "moodies" && currentPage != "earrings"){
            clothingSelection.destroy();
            clothingSelection = new BodyAccSelection(scene, player, previewPlayer); // Store instance

            sideBar.setVisible(false);
            switchToTops.setVisible(false);
            switchToBottoms.setVisible(false);
            switchToShoes.setVisible(false);
            switchToOutfits.setVisible(false);
            accSideBar.setVisible(true);
            switchToBodyAcc.setVisible(true);
            switchToEarrings.setVisible(true);
            switchToMoodies.setVisible(true);
            switchToHairAcc.setVisible(true);
            switchToFaceAcc.setVisible(true);

            currentPage = "bodyacc";
            switchToBodyAcc.setStyle({"color": "#203E80"});
            switchToFaceAcc.setStyle({"color": "#A8D8FC"});
            switchToEarrings.setStyle({"color": "#A8D8FC"});
            switchToMoodies.setStyle({"color": "#A8D8FC"});
            switchToHairAcc.setStyle({"color": "#A8D8FC"});
        } 
    });
    switchToAcc.on('pointerover', () => {
        switchToAcc.setFillStyle(0x808080, 0.15); // Highlight the area slightly 0x2D2D2D 0xaaaaaa
      });
    switchToAcc.on('pointerout', () => {
        switchToAcc.setFillStyle(0xffffff, 0); // Remove highlight
    });

    // Accessory Sub Category Button
    // Body Acc
    const switchToBodyAcc = scene.add.text(83, 90, "", {}).setInteractive().setScrollFactor(0).setDepth(3).setVisible(false);
    switchToBodyAcc.text = "BODY";
	switchToBodyAcc.setStyle({ "color": "#A8D8FC", "fontFamily": "VAGRounded", "fontSize": "12px" });
    switchToBodyAcc.on('pointerup', (pointer, localX, localY, event) => {
        event.stopPropagation();
        if (currentPage != "bodyacc"){
            clothingSelection.destroy();
            clothingSelection = new BodyAccSelection(scene, player, previewPlayer); // Store instance

            currentPage = "bodyacc";
            switchToBodyAcc.setStyle({"color": "#203E80"});
            switchToFaceAcc.setStyle({"color": "#A8D8FC"});
            switchToEarrings.setStyle({"color": "#A8D8FC"});
            switchToMoodies.setStyle({"color": "#A8D8FC"});
            switchToHairAcc.setStyle({"color": "#A8D8FC"});
        } 
    });
    switchToBodyAcc.on('pointerover', () => {
        switchToBodyAcc.setStyle({"color": "#203E80"}); // Highlight the area slightly 0x2D2D2D 0xaaaaaa
    });
    switchToBodyAcc.on('pointerout', () => {
        if (currentPage != "bodyacc"){
            switchToBodyAcc.setStyle({"color": "#A8D8FC"}); // Remove highlight
        }
    });

    // Face Acc
    const switchToFaceAcc = scene.add.text(155, 90, "", {}).setInteractive().setScrollFactor(0).setDepth(3).setVisible(false);
    switchToFaceAcc.text = "FACE";
	switchToFaceAcc.setStyle({ "color": "#A8D8FC", "fontFamily": "VAGRounded", "fontSize": "12px" });
    switchToFaceAcc.on('pointerup', (pointer, localX, localY, event) => {
        event.stopPropagation();
        if (currentPage != "faceacc"){
            clothingSelection.destroy();
            clothingSelection = new FaceAccSelection(scene, player, previewPlayer); // Store instance

            currentPage = "faceacc";
            switchToFaceAcc.setStyle({"color": "#203E80"});
            switchToBodyAcc.setStyle({"color": "#A8D8FC"});
            switchToEarrings.setStyle({"color": "#A8D8FC"});
            switchToMoodies.setStyle({"color": "#A8D8FC"});
            switchToHairAcc.setStyle({"color": "#A8D8FC"});
        } 
    });
    switchToFaceAcc.on('pointerover', () => {
        switchToFaceAcc.setStyle({"color": "#203E80"}); // Highlight the area slightly 0x2D2D2D 0xaaaaaa
      });
      switchToFaceAcc.on('pointerout', () => {
        if (currentPage != "faceacc"){
            switchToFaceAcc.setStyle({"color": "#A8D8FC"}); // Remove highlight
        }
    });

    // Hair Acc
    const switchToHairAcc = scene.add.text(223, 90, "", {}).setInteractive().setScrollFactor(0).setDepth(3).setVisible(false);
    switchToHairAcc.text = "HAIR";
	switchToHairAcc.setStyle({ "color": "#A8D8FC", "fontFamily": "VAGRounded", "fontSize": "12px" });
    switchToHairAcc.on('pointerover', () => {
        switchToHairAcc.setStyle({"color": "#203E80"}); // Highlight the area slightly 0x2D2D2D 0xaaaaaa
      });
      switchToHairAcc.on('pointerout', () => {
        switchToHairAcc.setStyle({"color": "#A8D8FC"}); // Remove highlight
    });

    // Moodies
    const switchToMoodies = scene.add.text(278, 90, "", {}).setInteractive().setScrollFactor(0).setDepth(3).setVisible(false);
    switchToMoodies.text = "MOODIES";
	switchToMoodies.setStyle({ "color": "#A8D8FC", "fontFamily": "VAGRounded", "fontSize": "12px" });
    switchToMoodies.on('pointerover', () => {
        switchToMoodies.setStyle({"color": "#203E80"}); // Highlight the area slightly 0x2D2D2D 0xaaaaaa
      });
      switchToMoodies.on('pointerout', () => {
        switchToMoodies.setStyle({"color": "#A8D8FC"}); // Remove highlight
    });

    // Earrings
    const switchToEarrings = scene.add.text(360, 90, "", {}).setInteractive().setScrollFactor(0).setDepth(3).setVisible(false);
    switchToEarrings.text = "EARRINGS";
	switchToEarrings.setStyle({ "color": "#A8D8FC", "fontFamily": "VAGRounded", "fontSize": "12px" });
    switchToEarrings.on('pointerover', () => {
        switchToEarrings.setStyle({"color": "#203E80"}); // Highlight the area slightly 0x2D2D2D 0xaaaaaa
      });
      switchToEarrings.on('pointerout', () => {
        switchToEarrings.setStyle({"color": "#A8D8FC"}); // Remove highlight
    });


    // Start inventory at hairs
    let clothingSelection = new HairSelection(scene, player, previewPlayer);
    let currentPage = "hair";
    let sideBar = scene.add.image(400, 96, 'clothSelectionSideBar').setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(2).setVisible(false);
    let accSideBar = scene.add.image(400, 96, 'accSelectionSideBar').setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(2).setVisible(false);
}

class HairSelection {
    constructor(scene, player, previewPlayer) {
        this.scene = scene;
        this.player = player;
        this.gender = getPlayerAvatarData().gender;
        this.previewPlayer = previewPlayer;
        this.hairKeys = Object.keys(assets.hair[this.gender]);
        this.page = 0;
        this.hairsPerPage = 24;
        this.columns = 8;
        this.rows = 3;
        this.container = this.scene.add.container(69, 210).setScrollFactor(0); // Adjust position as needed
        this.displayHairs();
        this.createNavigationButtons();
    }

    displayHairs() {
        // Clear previous hairs
        this.container.removeAll(true);

        // Get the current page's hair items
        const startIndex = this.page * this.hairsPerPage;
        const pageItems = this.hairKeys.slice(startIndex, startIndex + this.hairsPerPage);

        let x = 0, y = 0;
        let spacingX = 65; // Adjust spacing
        let spacingY = 100;

        pageItems.forEach((hairKey, index) => {
            if (assets['hair']?.[this.gender]?.[hairKey]?.["type"] == "image"){
                var hairSprite = this.scene.add.image(x, y, hairKey).setInteractive().setScrollFactor(0).setScale(.9, .9);
            } else if (assets['hair']?.[this.gender]?.[hairKey]?.["type"] == "sprite") {
                var hairSprite = this.scene.add.sprite(x+5, y, hairKey, 0).setInteractive().setScrollFactor(0).setScale(.8, .8);
            }
            this.container.add(hairSprite);
            this.container.setDepth(2);

            // Arrange in rows and columns
            x += spacingX;
            if ((index + 1) % this.columns === 0) {
                x = 0;
                y += spacingY;
            }

            // Handle click to select hair
            hairSprite.on('pointerdown', () => {
                this.selectHair(hairKey);
            });
            hairSprite.on('pointerup', (pointer, localX, localY, event) => {
                event.stopPropagation();
            });

        });
    }

    createNavigationButtons() {
        // Next Page Button (Down Arrow)
        this.nextButton = this.scene.add.text(546, 452, '▼', { fontSize: '32px', fill: '#fff', })
            .setInteractive()
            .setScrollFactor(0)
            .setAlpha(0.00001)
            .on('pointerdown', () => this.changePage(1))
            .on('pointerup', (pointer, localX, localY, event) => {
                event.stopPropagation();
            })
            .setDepth(2);
    
        // Previous Page Button (Up Arrow)
        this.prevButton = this.scene.add.text(546, 154, '▲', { fontSize: '32px', fill: '#fff' })
            .setInteractive()
            .setScrollFactor(0)
            .setAlpha(0.00001)
            .on('pointerdown', () => this.changePage(-1))
            .on('pointerup', (pointer, localX, localY, event) => {
                event.stopPropagation();
            })
            .setDepth(2);
    
        this.scene.add.existing(this.nextButton);
        this.scene.add.existing(this.prevButton);
    }

    changePage(direction) {
        let maxPage = Math.ceil(this.hairKeys.length / this.hairsPerPage) - 1;
        this.page = Phaser.Math.Clamp(this.page + direction, 0, maxPage);
        this.displayHairs();
    }

    selectHair(hairKey) {
        console.log("Hair selected:", hairKey, "\nHair path is:\n", assets['hair']?.[this.gender]?.[hairKey]?.["path"]);
        
        const hairIndex = this.previewPlayer.getIndex(this.previewPlayer.hair);
        let hairScale = 1;

        if (assets['hair']?.[this.gender]?.[hairKey]?.["scale"]){
            hairScale = assets['hair']?.[this.gender]?.[hairKey]?.["scale"];
            console.log("Hair scale is:", hairScale);
        }
    

        // Remove previous hair sprite from preview player
        if (this.previewPlayer.hair) {
            this.previewPlayer.hair.destroy();
        }
    
        // Create new hair sprite
        this.previewPlayer.hair = this.scene.add.image(
            assets['hair']?.[this.gender]?.[hairKey]?.["fitX"], 
            assets['hair']?.[this.gender]?.[hairKey]?.["fitY"], 
            hairKey
        ).setOrigin(0.5, 0.5).setScale(hairScale, hairScale);

        
        // Add new hair to previewPlayer
        this.previewPlayer.addAt(this.previewPlayer.hair, hairIndex);
    }
    

    destroy() {
        this.container.destroy(); // Remove all hair images
        this.nextButton.destroy(); // Remove next page button
        this.prevButton.destroy(); // Remove previous page button
    }
}

class TopSelection {
    constructor(scene, player, previewPlayer) {
        this.scene = scene;
        this.player = player;
        this.gender = getPlayerAvatarData().gender;
        this.previewPlayer = previewPlayer;
        this.topKeys = Object.keys(tops.top[this.gender]); // Store hair asset keys
        this.page = 0;
        this.topsPerPage = 40;
        this.columns = 8;
        this.rows = 5;
        this.container = this.scene.add.container(65, 260).setScrollFactor(0); // Adjust position as needed
        this.displayTops();
        this.createNavigationButtons();
    }

    displayTops() {
        // Clear previous tops
        this.container.removeAll(true);

        // Get the current page's hair items
        const startIndex = this.page * this.topsPerPage;
        const pageItems = this.topKeys.slice(startIndex, startIndex + this.topsPerPage);

        let x = 7, y = -65;
        let spacingX = 65; // Adjust spacing
        let spacingY = 65;

        pageItems.forEach((topKey, index) => {
            
            if (tops['top']?.[this.gender]?.[topKey]?.["type"] == "image"){
                var topSprite = this.scene.add.image(x, y, topKey).setInteractive().setScrollFactor(0).setScale(1, 1);
            } else if (tops['top']?.[this.gender]?.[topKey]?.["type"] == "sprite") {
                var topSprite = this.scene.add.sprite(x, y, topKey, 0).setInteractive().setScrollFactor(0).setScale(1, 1);
            }
            this.container.add(topSprite);
            this.container.setDepth(2);

            // Arrange in rows and columns
            x += spacingX;
            if ((index + 1) % this.columns === 0) {
                x = 0;
                y += spacingY;
            }

            // Handle click to select hair
            topSprite.on('pointerdown', () => {
                this.selectTop(topKey);
            });
            topSprite.on('pointerup', (pointer, localX, localY, event) => {
                event.stopPropagation();
            });

        });
    }

    createNavigationButtons() {
        // Next Page Button (Down Arrow)
        this.nextButton = this.scene.add.text(546, 452, '▼', { fontSize: '32px', fill: '#fff', })
            .setInteractive()
            .setScrollFactor(0)
            .setAlpha(0.00001)
            .on('pointerdown', () => this.changePage(1))
            .on('pointerup', (pointer, localX, localY, event) => {
                event.stopPropagation();
            })
            .setDepth(2);
    
        // Previous Page Button (Up Arrow)
        this.prevButton = this.scene.add.text(546, 154, '▲', { fontSize: '32px', fill: '#fff' })
            .setInteractive()
            .setScrollFactor(0)
            .setAlpha(0.00001)
            .on('pointerdown', () => this.changePage(-1))
            .on('pointerup', (pointer, localX, localY, event) => {
                event.stopPropagation();
            })
            .setDepth(2);
    
        this.scene.add.existing(this.nextButton);
        this.scene.add.existing(this.prevButton);
    }

    changePage(direction) {
        let maxPage = Math.ceil(this.topKeys.length / this.topsPerPage) - 1;
        this.page = Phaser.Math.Clamp(this.page + direction, 0, maxPage);
        this.displayTops();
    }

    selectTop(topKey) {
        console.log("Top selected:", topKey, "\nTop path is:\n", tops['top']?.[this.gender]?.[topKey]?.["path"]);

        let topIndex;
        
        // Remove previous top sprite from preview player
        if (this.previewPlayer.top && this.previewPlayer.top.visible) {
            topIndex = this.previewPlayer.getIndex(this.previewPlayer.top)
            this.previewPlayer.top.destroy();
        } else if (this.previewPlayer.top){
            topIndex = this.previewPlayer.getIndex(this.previewPlayer.top)

            this.previewPlayer.outfit.setVisible(false);
            this.previewPlayer.top.setVisible(true);
            this.previewPlayer.bottom.setVisible(true);

            this.previewPlayer.top.destroy();
            this.previewPlayer.bottom.destroy();

            const defaultBottomKey = this.gender === 'male' ? 'mbottom0' : 'bottom0';

            this.previewPlayer.bottom = this.scene.add.sprite(
                bottoms['bottom']?.[this.gender]?.[defaultBottomKey]?.["fitX"], 
                bottoms['bottom']?.[this.gender]?.[defaultBottomKey]?.["fitY"], 
                defaultBottomKey,
                0
            ).setOrigin(0.5, 0.5);

            this.previewPlayer.addAt(this.previewPlayer.bottom, topIndex-1)
        }
    
        // Create new top sprite
        this.previewPlayer.top = this.scene.add.sprite(
            tops['top']?.[this.gender]?.[topKey]?.["fitX"], 
            tops['top']?.[this.gender]?.[topKey]?.["fitY"], 
            topKey,
            0
        ).setOrigin(0.5, 0.5);

        
        // Add new hair to previewPlayer
        this.previewPlayer.addAt(this.previewPlayer.top, topIndex);
        
    }
    

    destroy() {
        this.container.destroy(); // Remove all hair images
        this.nextButton.destroy(); // Remove next page button
        this.prevButton.destroy(); // Remove previous page button
    }
}

class BottomSelection {
    constructor(scene, player, previewPlayer) {
        this.scene = scene;
        this.player = player;
        this.gender = getPlayerAvatarData().gender;
        this.previewPlayer = previewPlayer;
        this.bottomKeys = Object.keys(bottoms.bottom[this.gender]); // Store bottom asset keys
        this.page = 0;
        this.bottomsPerPage = 40;
        this.columns = 8;
        this.rows = 5;
        this.container = this.scene.add.container(65, 260).setScrollFactor(0); // Adjust position as needed
        this.displayBottoms();
        this.createNavigationButtons();
    }

    displayBottoms() {
        // Clear previous bottoms
        this.container.removeAll(true);

        // Get the current page's bottom items
        const startIndex = this.page * this.bottomsPerPage;
        const pageItems = this.bottomKeys.slice(startIndex, startIndex + this.bottomsPerPage);

        let x = 7, y = -65;
        let spacingX = 65; // Adjust spacing
        let spacingY = 65;

        pageItems.forEach((bottomKey, index) => {
            
            let bottomSprite;
            if (bottoms['bottom']?.[this.gender]?.[bottomKey]?.["type"] == "image") {
                bottomSprite = this.scene.add.image(x, y, bottomKey)
                    .setInteractive()
                    .setScrollFactor(0)
                    .setScale(1, 1);
            } else if (bottoms['bottom']?.[this.gender]?.[bottomKey]?.["type"] == "sprite") {
                bottomSprite = this.scene.add.sprite(x, y, bottomKey, 0)
                    .setInteractive()
                    .setScrollFactor(0)
                    .setScale(1, 1);
            }

            this.container.add(bottomSprite);
            this.container.setDepth(2);

            // Arrange in rows and columns
            x += spacingX;
            if ((index + 1) % this.columns === 0) {
                x = 0;
                y += spacingY;
            }

            // Handle click to select bottom
            bottomSprite.on('pointerdown', () => {
                this.selectBottom(bottomKey);
            });
            bottomSprite.on('pointerup', (pointer, localX, localY, event) => {
                event.stopPropagation();
            });

        });
    }

    createNavigationButtons() {
        // Next Page Button (Down Arrow)
        this.nextButton = this.scene.add.text(546, 452, '▼', { fontSize: '32px', fill: '#fff' })
            .setInteractive()
            .setScrollFactor(0)
            .setAlpha(0.00001)
            .on('pointerdown', () => this.changePage(1))
            .on('pointerup', (pointer, localX, localY, event) => {
                event.stopPropagation();
            })
            .setDepth(2);
    
        // Previous Page Button (Up Arrow)
        this.prevButton = this.scene.add.text(546, 154, '▲', { fontSize: '32px', fill: '#fff' })
            .setInteractive()
            .setScrollFactor(0)
            .setAlpha(0.00001)
            .on('pointerdown', () => this.changePage(-1))
            .on('pointerup', (pointer, localX, localY, event) => {
                event.stopPropagation();
            })
            .setDepth(2);
    
        this.scene.add.existing(this.nextButton);
        this.scene.add.existing(this.prevButton);
    }

    changePage(direction) {
        let maxPage = Math.ceil(this.bottomKeys.length / this.bottomsPerPage) - 1;
        this.page = Phaser.Math.Clamp(this.page + direction, 0, maxPage);
        this.displayBottoms();
    }

    selectBottom(bottomKey) {
        console.log("Bottom selected:", bottomKey, "\nBottom path is:\n", bottoms['bottom']?.[this.gender]?.[bottomKey]?.["path"]);

        let bottomIndex;
        
        // Remove previous bottom sprite from preview player
        if (this.previewPlayer.bottom && this.previewPlayer.bottom.visible) {
            bottomIndex = this.previewPlayer.getIndex(this.previewPlayer.bottom);
            this.previewPlayer.bottom.destroy();
        } else if (this.previewPlayer.bottom){
            bottomIndex = this.previewPlayer.getIndex(this.previewPlayer.bottom);

            this.previewPlayer.outfit.setVisible(false);
            this.previewPlayer.top.setVisible(true);
            this.previewPlayer.bottom.setVisible(true);

            this.previewPlayer.top.destroy();
            this.previewPlayer.bottom.destroy();

            const defaultTopKey = this.gender === 'male' ? 'mtop0' : 'top0';

            this.previewPlayer.top= this.scene.add.sprite(
                tops['top']?.[this.gender]?.[defaultTopKey]?.["fitX"], 
                tops['top']?.[this.gender]?.[defaultTopKey]?.["fitY"], 
                defaultTopKey,
                0
            ).setOrigin(0.5, 0.5);
    
            this.previewPlayer.addAt(this.previewPlayer.top, bottomIndex+1);
        }
    
        // Create new bottom sprite
        this.previewPlayer.bottom = this.scene.add.sprite(
            bottoms['bottom']?.[this.gender]?.[bottomKey]?.["fitX"], 
            bottoms['bottom']?.[this.gender]?.[bottomKey]?.["fitY"], 
            bottomKey,
            0
        ).setOrigin(0.5, 0.5);

        // Add new bottom to previewPlayer
        this.previewPlayer.addAt(this.previewPlayer.bottom, bottomIndex);
    }

    destroy() {
        this.container.destroy(); // Remove all bottom images
        this.nextButton.destroy(); // Remove next page button
        this.prevButton.destroy(); // Remove previous page button
    }
}

class OutfitSelection {
    constructor(scene, player, previewPlayer) {
        this.scene = scene;
        this.player = player;
        this.gender = getPlayerAvatarData().gender;
        this.previewPlayer = previewPlayer;
        this.hairKeys = Object.keys(outfits[this.gender]); // Store hair asset keys
        this.page = 0;
        this.hairsPerPage = 18;
        this.columns = 6;
        this.rows = 3;
        this.container = this.scene.add.container(69, 210).setScrollFactor(0); // Adjust position as needed
        this.displayHairs();
        this.createNavigationButtons();
        this.coordinatesText = this.scene.add.text(450, 100, `Outfit X: 0, Y: 0`, {
            fontSize: '20px',
            fill: '#ffffff'
        });
    }

    displayHairs() {
        // Clear previous hairs
        this.container.removeAll(true);

        // Get the current page's hair items
        const startIndex = this.page * this.hairsPerPage;
        const pageItems = this.hairKeys.slice(startIndex, startIndex + this.hairsPerPage);

        let x = 0, y = 0;
        let spacingX = 85; // Adjust spacing
        let spacingY = 100;

        pageItems.forEach((hairKey, index) => {
            var hairSprite = this.scene.add.sprite(x, y, hairKey, 0).setInteractive().setScrollFactor(0);
            this.container.add(hairSprite);
            this.container.setDepth(2);

            // Arrange in rows and columns
            x += spacingX;
            if ((index + 1) % this.columns === 0) {
                x = 0;
                y += spacingY;
            }

            // Handle click to select hair
            hairSprite.on('pointerdown', () => {
                this.selectHair(hairKey);
            });
            hairSprite.on('pointerup', (pointer, localX, localY, event) => {
                event.stopPropagation();
            });

        });
    }

    createNavigationButtons() {
        // Next Page Button (Down Arrow)
        this.nextButton = this.scene.add.text(546, 452, '▼', { fontSize: '32px', fill: '#fff', })
            .setInteractive()
            .setScrollFactor(0)
            .setAlpha(0.00001)
            .on('pointerdown', () => this.changePage(1))
            .on('pointerup', (pointer, localX, localY, event) => {
                event.stopPropagation();
            })
            .setDepth(2);
    
        // Previous Page Button (Up Arrow)
        this.prevButton = this.scene.add.text(546, 154, '▲', { fontSize: '32px', fill: '#fff' })
            .setInteractive()
            .setScrollFactor(0)
            .setAlpha(0.00001)
            .on('pointerdown', () => this.changePage(-1))
            .on('pointerup', (pointer, localX, localY, event) => {
                event.stopPropagation();
            })
            .setDepth(2);
    
        this.scene.add.existing(this.nextButton);
        this.scene.add.existing(this.prevButton);
    }

    changePage(direction) {
        let maxPage = Math.ceil(this.hairKeys.length / this.hairsPerPage) - 1;
        this.page = Phaser.Math.Clamp(this.page + direction, 0, maxPage);
        this.displayHairs();
    }

    selectHair(hairKey) {
        console.log("Outfit selected:", hairKey, "\nOutfit path is:\n", outfits?.[this.gender]?.[hairKey]?.["path"]);
        
        let outfitIndex;

        // Remove previous hair sprite from preview player
        if (this.previewPlayer.outfit && this.previewPlayer.outfit.visible) {
            console.log("Outfit exists and is visible")
            outfitIndex = this.previewPlayer.getIndex(this.previewPlayer.outfit);
            this.previewPlayer.outfit.destroy();
        } else if (this.previewPlayer.outfit) {
            console.log("Outfit exists and is not visible, meaning player is wearing top")
            this.previewPlayer.top.setVisible(false);
            this.previewPlayer.bottom.setVisible(false);
            this.previewPlayer.outfit.setVisible(true);
            outfitIndex = this.previewPlayer.getIndex(this.previewPlayer.outfit);
            this.previewPlayer.outfit.destroy();
        }
    
        // Create new hair sprite
        this.previewPlayer.outfit = this.scene.add.sprite(
            outfits?.[this.gender]?.[hairKey]?.["fitX"], 
            outfits?.[this.gender]?.[hairKey]?.["fitY"], 
            hairKey, 0
        ).setOrigin(0.5, 0.5);
        
        /*this.coordinatesText.setDepth(3);

        this.previewPlayer.outfit.setInteractive();

        this.scene.input.setDraggable(this.previewPlayer.outfit);

        this.previewPlayer.outfit.on('drag', (pointer, dragX, dragY) => {
            // Now `this` refers to the instance of HairSelection because of the arrow function
            this.previewPlayer.outfit.setPosition(dragX, dragY);  // Move the hair sprite
            // Update the coordinates text
            this.coordinatesText.setText(`Outfit X: ${Math.round(dragX)}, Y: ${Math.round(dragY)}`);
        });
        */

        
        // Add new hair to previewPlayer
        this.previewPlayer.addAt(this.previewPlayer.outfit, outfitIndex);
    }
    

    destroy() {
        this.container.destroy(); // Remove all hair images
        this.nextButton.destroy(); // Remove next page button
        this.prevButton.destroy(); // Remove previous page button
        this.coordinatesText.destroy();
    }
}

class ShoeSelection {
    constructor(scene, player, previewPlayer) {
        this.scene = scene;
        this.player = player;
        this.gender = getPlayerAvatarData().gender;
        this.previewPlayer = previewPlayer;
        this.shoeKeys = Object.keys(shoes.shoe[this.gender]); // Store shoe asset keys
        this.page = 0;
        this.shoesPerPage = 40;
        this.columns = 8;
        this.rows = 5;
        this.container = this.scene.add.container(65, 260).setScrollFactor(0); // Adjust position as needed
        this.displayShoes();
        this.createNavigationButtons();
    }

    displayShoes() {
        // Clear previous shoes
        this.container.removeAll(true);

        // Get the current page's shoe items
        const startIndex = this.page * this.shoesPerPage;
        const pageItems = this.shoeKeys.slice(startIndex, startIndex + this.shoesPerPage);

        let x = 7, y = -65;
        let spacingX = 65; // Adjust spacing
        let spacingY = 65;

        pageItems.forEach((shoeKey, index) => {
            
            let shoeSprite;
            if (shoes['shoe']?.[this.gender]?.[shoeKey]?.["type"] == "image") {
                shoeSprite = this.scene.add.image(x, y, shoeKey)
                    .setInteractive()
                    .setScrollFactor(0)
                    .setScale(1, 1);
            } else if (shoes['shoe']?.[this.gender]?.[shoeKey]?.["type"] == "sprite") {
                shoeSprite = this.scene.add.sprite(x, y, shoeKey, 0)
                    .setInteractive()
                    .setScrollFactor(0)
                    .setScale(1, 1);
            }

            this.container.add(shoeSprite);
            this.container.setDepth(2);

            // Arrange in rows and columns
            x += spacingX;
            if ((index + 1) % this.columns === 0) {
                x = 0;
                y += spacingY;
            }

            // Handle click to select shoe
            shoeSprite.on('pointerdown', () => {
                this.selectShoe(shoeKey);
            });
            shoeSprite.on('pointerup', (pointer, localX, localY, event) => {
                event.stopPropagation();
            });

        });
    }

    createNavigationButtons() {
        // Next Page Button (Down Arrow)
        this.nextButton = this.scene.add.text(546, 452, '▼', { fontSize: '32px', fill: '#fff' })
            .setInteractive()
            .setScrollFactor(0)
            .setAlpha(0.00001)
            .on('pointerdown', () => this.changePage(1))
            .on('pointerup', (pointer, localX, localY, event) => {
                event.stopPropagation();
            })
            .setDepth(2);
    
        // Previous Page Button (Up Arrow)
        this.prevButton = this.scene.add.text(546, 154, '▲', { fontSize: '32px', fill: '#fff' })
            .setInteractive()
            .setScrollFactor(0)
            .setAlpha(0.00001)
            .on('pointerdown', () => this.changePage(-1))
            .on('pointerup', (pointer, localX, localY, event) => {
                event.stopPropagation();
            })
            .setDepth(2);
    
        this.scene.add.existing(this.nextButton);
        this.scene.add.existing(this.prevButton);
    }

    changePage(direction) {
        let maxPage = Math.ceil(this.shoeKeys.length / this.shoesPerPage) - 1;
        this.page = Phaser.Math.Clamp(this.page + direction, 0, maxPage);
        this.displayShoes();
    }

    selectShoe(shoeKey) {
        console.log("Shoe selected:", shoeKey, "\nShoe path is:\n", shoes['shoe']?.[this.gender]?.[shoeKey]?.["path"]);

        const shoeIndex = this.previewPlayer.getIndex(this.previewPlayer.shoes);
        let shoeScale = 1;

        if (shoes['shoe']?.[this.gender]?.[shoeKey]?.["scale"]) {
            shoeScale = shoes['shoe']?.[this.gender]?.[shoeKey]?.["scale"];
            console.log("Shoe scale is:", shoeScale);
        }
    
        // Remove previous shoe sprite from preview player
        if (this.previewPlayer.shoes) {
            this.previewPlayer.shoes.destroy();
        }
    
        // Create new shoe sprite
        this.previewPlayer.shoes = this.scene.add.sprite(
            shoes['shoe']?.[this.gender]?.[shoeKey]?.["fitX"], 
            shoes['shoe']?.[this.gender]?.[shoeKey]?.["fitY"], 
            shoeKey,
            0
        ).setOrigin(0.5, 0.5).setScale(shoeScale, shoeScale);

        // Add new shoe to previewPlayer
        this.previewPlayer.addAt(this.previewPlayer.shoes, shoeIndex);
    }

    destroy() {
        this.container.destroy(); // Remove all shoe images
        this.nextButton.destroy(); // Remove next page button
        this.prevButton.destroy(); // Remove previous page button
    }
}

class BoardSelection {
    constructor(scene, player, previewPlayer) {
        this.scene = scene;
        this.player = player;
        this.previewPlayer = previewPlayer;

        // Load the JSON metadata from Phaser's cache
        this.metadata = this.scene.cache.json.get("boards_metadata");

        // Get all the keys for the boards
        this.boardKeys = Object.keys(this.metadata);

        // Pagination setup
        this.page = 0;
        this.boardsPerPage = 12;
        this.columns = 4;
        this.rows = 3;

        // Display container
        this.container = this.scene.add.container(0, 0).setScrollFactor(0);

        // Create board previews and UI buttons
        this.displayBoards();
        this.createNavigationButtons();
    }

    displayBoards() {
        this.container.removeAll(true); // Clear previous previews

        const bounds = {
            x: 286,
            y: 345,
            width: 500,
            height: 325
        };

        // mid and not layerabove = first frame top layer, last frame bottom layer
        // mid and layerabove = last frame top layer, first frame bottom layer
        // not mid and layerabove = first frame top layer (only one sprite)
        // not mid and not layerabove = first frame bottom layer (only one sprite)

        const itemsPerPage = this.boardsPerPage;
        const columns = this.columns; // Assume already set (e.g. 4)
        const rows = Math.ceil(itemsPerPage / columns);
        const cellWidth = bounds.width / columns;
        const cellHeight = bounds.height / rows;

        const startX = bounds.x - bounds.width / 2 + cellWidth / 2;
        const startY = bounds.y - bounds.height / 2 + cellHeight / 2;

        const startIndex = this.page * itemsPerPage;
        const pageItems = this.boardKeys.slice(startIndex, startIndex + itemsPerPage);

        pageItems.forEach((boardKey, index) => {
            if (!this.scene.textures.exists(boardKey)) {
                console.warn(`Texture ${boardKey} does not exist`);
                return;
            }

            const meta = this.metadata[boardKey];
            const col = index % columns;
            const row = Math.floor(index / columns);

            const containerX = startX + col * cellWidth;
            const containerY = startY + row * cellHeight;
            const boardContainer = this.scene.add.container(containerX, containerY);
            boardContainer.setScrollFactor(0);

            const firstFrame = meta.middleEffect ? (meta.layerAbove ? meta.frames - 1 : 0) : 0;

            const lastFrame = meta.middleEffect ? (meta.layerAbove ? 0 : meta.frames - 1) : null;

            let sprite1 = this.scene.add.sprite(0, 0, boardKey, firstFrame).setOrigin(0.5).setScrollFactor(0);
            let sprite2 = null;

            if (lastFrame !== null) {
                sprite2 = this.scene.add.sprite(0, 0, boardKey, lastFrame).setOrigin(0.5).setScrollFactor(0);
                boardContainer.add(sprite2);
            }

            boardContainer.add(sprite1);

            // === Apply metadata-based positioning ===
            if (meta.offsetX) sprite1.x += meta.offsetX;
            if (meta.offsetY) sprite1.y += meta.offsetY;
            if (sprite2) {
                if (meta.offsetX) sprite2.x += meta.offsetX;
                if (meta.offsetY) sprite2.y += meta.offsetY;
            }

            // === Scale to fit in the cell ===
            const baseWidth = sprite1.width || meta.splitX;
            const baseHeight = sprite1.height || meta.splitY;
            const scaleX = cellWidth / baseWidth;
            const scaleY = cellHeight / baseHeight;
            const scale = Math.min(1, scaleX, scaleY); // Clamp to max 1x

            boardContainer.setScale(scale);

            // === Click interactions ===
            const clickTarget = sprite2 || sprite1;
            clickTarget.setInteractive();

            clickTarget.on('pointerdown', () => {
                this.selectBoard(boardKey);
            });

            clickTarget.on('pointerup', (pointer, localX, localY, event) => {
                event.stopPropagation();
            });

            this.container.add(boardContainer);
        });

        this.container.setDepth(2);
    }

    createNavigationButtons() {
        this.nextButton = this.scene.add.text(546, 452, '▼', { fontSize: '32px', fill: '#fff' })
            .setInteractive().setScrollFactor(0).setAlpha(0.00001)
            .on('pointerdown', () => this.changePage(1))
            .on('pointerup', (pointer, localX, localY, event) => event.stopPropagation())
            .setDepth(2);

        this.prevButton = this.scene.add.text(546, 154, '▲', { fontSize: '32px', fill: '#fff' })
            .setInteractive().setScrollFactor(0).setAlpha(0.00001)
            .on('pointerdown', () => this.changePage(-1))
            .on('pointerup', (pointer, localX, localY, event) => event.stopPropagation())
            .setDepth(2);

        this.scene.add.existing(this.nextButton);
        this.scene.add.existing(this.prevButton);
    }

    changePage(direction) {
        const maxPage = Math.ceil(this.boardKeys.length / this.boardsPerPage) - 1;
        this.page = Phaser.Math.Clamp(this.page + direction, 0, maxPage);
        this.displayBoards();
    }

        selectBoard(boardKey) {
        const meta = this.metadata[boardKey];
        console.log("Board selected:", boardKey, "\nBoard path is:\n", meta.path);

        // Get current index of the bottom board sprite in the previewPlayer
        const boardIndex = this.previewPlayer.getIndex(this.previewPlayer.board);
        const boardTopIndex = this.previewPlayer.getIndex(this.previewPlayer.boardTop);

        // Remove old bottom layer board sprite (if any)
        if (this.previewPlayer.board) {
            this.previewPlayer.board.destroy();
            this.previewPlayer.board = null;
        }

        // Remove old top layer board sprite (if any)
        if (this.previewPlayer.boardTop) {
            this.previewPlayer.boardTop.destroy();
            this.previewPlayer.boardTop = null;
        }

        if (meta.middleEffect) {
            // Determine frame order
            
            const bottomFrame = meta.layerAbove ? 0 : meta.frames - 1;
            const topFrame = meta.layerAbove ? meta.frames - 1 : 0;

            // Bottom sprite
            const bottomSprite = this.scene.add.image(meta.offsetX, meta.offsetY, boardKey, bottomFrame).setOrigin(0.5);
            this.previewPlayer.board = bottomSprite;
            this.previewPlayer.addAt(bottomSprite, boardIndex);

            // Top sprite
            const topSprite = this.scene.add.image(meta.offsetX, meta.offsetY, boardKey, topFrame).setOrigin(0.5);
            this.previewPlayer.boardTop = topSprite;
            this.previewPlayer.addAt(topSprite, boardTopIndex);
        
        } else {
            const sprite = this.scene.add.image(meta.offsetX, meta.offsetY, boardKey, 0).setOrigin(0.5);
            let boardFakeSprite = this.scene.add.image(meta.offsetX, meta.offsetY, 'baccEmpty', 0).setOrigin(0.5);
            if (meta.layerAbove) {
                // Add top-only board
                this.previewPlayer.boardTop = sprite;
                this.previewPlayer.board = boardFakeSprite;
                this.previewPlayer.addAt(sprite, boardTopIndex);
                this.previewPlayer.addAt(boardFakeSprite, boardIndex)
            } else {
                // Add bottom-only board at correct index
                this.previewPlayer.board = sprite;
                this.previewPlayer.boardTop = boardFakeSprite;
                this.previewPlayer.addAt(sprite, boardIndex);
                this.previewPlayer.addAt(boardFakeSprite, boardTopIndex)
            }
        }

        // Save selected key
        this.previewPlayer.selectedBoardKey = boardKey;
    }

    destroy() {
        this.container.destroy();
        this.nextButton.destroy();
        this.prevButton.destroy();
    }
}

class FaceAccSelection {
    constructor(scene, player, previewPlayer) {
        this.scene = scene;
        this.player = player;
        this.gender = getPlayerAvatarData().gender;
        this.previewPlayer = previewPlayer;
        this.hairKeys = Object.keys(face_acc[this.gender]); // Store hair asset keys
        this.page = 0;
        this.hairsPerPage = 12;
        this.columns = 4;
        this.rows = 3;
        this.container = this.scene.add.container(100, 210).setScrollFactor(0); // Adjust position as needed
        this.displayHairs();
        this.createNavigationButtons();
    }

    displayHairs() {
        // Clear previous hairs
        this.container.removeAll(true);

        // Get the current page's hair items
        const startIndex = this.page * this.hairsPerPage;
        const pageItems = this.hairKeys.slice(startIndex, startIndex + this.hairsPerPage);

        let x = 0, y = 0;
        let spacingX = 130; // Adjust spacing
        let spacingY = 110;

        pageItems.forEach((hairKey, index) => {
            if (face_acc?.[this.gender]?.[hairKey]?.["type"] == "image"){
                var hairSprite = this.scene.add.image(x, y, hairKey).setInteractive().setScrollFactor(0);
            }
            this.container.add(hairSprite);
            this.container.setDepth(2);

            // Arrange in rows and columns
            x += spacingX;
            if ((index + 1) % this.columns === 0) {
                x = 0;
                y += spacingY;
            }

            // Handle click to select hair
            hairSprite.on('pointerdown', () => {
                this.selectHair(hairKey);
            });
            hairSprite.on('pointerup', (pointer, localX, localY, event) => {
                event.stopPropagation();
            });

        });
    }

    createNavigationButtons() {
        // Next Page Button (Down Arrow)
        this.nextButton = this.scene.add.text(546, 452, '▼', { fontSize: '32px', fill: '#fff', })
            .setInteractive()
            .setScrollFactor(0)
            .setAlpha(0.00001)
            .on('pointerdown', () => this.changePage(1))
            .on('pointerup', (pointer, localX, localY, event) => {
                event.stopPropagation();
            })
            .setDepth(2);
    
        // Previous Page Button (Up Arrow)
        this.prevButton = this.scene.add.text(546, 154, '▲', { fontSize: '32px', fill: '#fff' })
            .setInteractive()
            .setScrollFactor(0)
            .setAlpha(0.00001)
            .on('pointerdown', () => this.changePage(-1))
            .on('pointerup', (pointer, localX, localY, event) => {
                event.stopPropagation();
            })
            .setDepth(2);
    
        this.scene.add.existing(this.nextButton);
        this.scene.add.existing(this.prevButton);
    }

    changePage(direction) {
        let maxPage = Math.ceil(this.hairKeys.length / this.hairsPerPage) - 1;
        this.page = Phaser.Math.Clamp(this.page + direction, 0, maxPage);
        this.displayHairs();
    }

    selectHair(hairKey) {
        console.log("Face acc selected:", hairKey, "\nFace acc path is:\n", face_acc[this.gender]?.[hairKey]?.["path"]);
        
        const hairIndex = this.previewPlayer.getIndex(this.previewPlayer.faceacc);

        if (hairKey == this.previewPlayer.faceacc.texture.key){
            this.previewPlayer.faceacc.destroy();
            this.previewPlayer.faceacc = this.scene.add.image(0, 0, 'faccEmpty').setOrigin(0.5, 0.5);
            this.previewPlayer.addAt(this.previewPlayer.faceacc, hairIndex)
        } else {
            // Remove previous hair sprite from preview player
            if (this.previewPlayer.faceacc) {
                this.previewPlayer.faceacc.destroy();
            }
        
            // Create new hair sprite
            this.previewPlayer.faceacc = this.scene.add.image(
                face_acc[this.gender]?.[hairKey]?.["fitX"], 
                face_acc[this.gender]?.[hairKey]?.["fitY"], 
                hairKey
            ).setOrigin(0.5, 0.5);

            
            // Add new hair to previewPlayer
            this.previewPlayer.addAt(this.previewPlayer.faceacc, hairIndex);
        }
    }
    
    destroy() {
        this.container.destroy(); // Remove all hair images
        this.nextButton.destroy(); // Remove next page button
        this.prevButton.destroy(); // Remove previous page button
    }
}

class BodyAccSelection {
    constructor(scene, player, previewPlayer) {
        this.scene = scene;
        this.player = player;
        this.gender = getPlayerAvatarData().gender
        this.previewPlayer = previewPlayer;
        this.hairKeys = Object.keys(body_acc[this.gender]); // Store hair asset keys
        this.page = 0;
        this.hairsPerPage = 12;
        this.columns = 4;
        this.rows = 3;
        this.container = this.scene.add.container(80, 210).setScrollFactor(0); // Adjust position as needed
        this.displayHairs();
        this.createNavigationButtons();
    }

    displayHairs() {
        // Clear previous hairs
        this.container.removeAll(true);

        // Get the current page's hair items
        const startIndex = this.page * this.hairsPerPage;
        const pageItems = this.hairKeys.slice(startIndex, startIndex + this.hairsPerPage);

        let x = 0, y = 0;
        let spacingX = 130; // Adjust spacing
        let spacingY = 110;

        pageItems.forEach((hairKey, index) => {
            if (body_acc?.[this.gender]?.[hairKey]?.["type"] == "image"){
                var hairSprite = this.scene.add.sprite(x, y, hairKey, 0).setInteractive().setScrollFactor(0);
            }
            this.container.add(hairSprite);
            this.container.setDepth(2);

            // Arrange in rows and columns
            x += spacingX;
            if ((index + 1) % this.columns === 0) {
                x = 0;
                y += spacingY;
            }

            // Handle click to select hair
            hairSprite.on('pointerdown', () => {
                this.selectHair(hairKey);
            });
            hairSprite.on('pointerup', (pointer, localX, localY, event) => {
                event.stopPropagation();
            });

        });
    }

    createNavigationButtons() {
        // Next Page Button (Down Arrow)
        this.nextButton = this.scene.add.text(546, 452, '▼', { fontSize: '32px', fill: '#fff', })
            .setInteractive()
            .setScrollFactor(0)
            .setAlpha(0.00001)
            .on('pointerdown', () => this.changePage(1))
            .on('pointerup', (pointer, localX, localY, event) => {
                event.stopPropagation();
            })
            .setDepth(2);
    
        // Previous Page Button (Up Arrow)
        this.prevButton = this.scene.add.text(546, 154, '▲', { fontSize: '32px', fill: '#fff' })
            .setInteractive()
            .setScrollFactor(0)
            .setAlpha(0.00001)
            .on('pointerdown', () => this.changePage(-1))
            .on('pointerup', (pointer, localX, localY, event) => {
                event.stopPropagation();
            })
            .setDepth(2);
    
        this.scene.add.existing(this.nextButton);
        this.scene.add.existing(this.prevButton);
    }

    changePage(direction) {
        let maxPage = Math.ceil(this.hairKeys.length / this.hairsPerPage) - 1;
        this.page = Phaser.Math.Clamp(this.page + direction, 0, maxPage);
        this.displayHairs();
    }

    selectHair(hairKey) {
        console.log("Body acc selected:", hairKey, "\nBody acc path is:\n", body_acc[this.gender]?.[hairKey]?.["path"]);
        
        const hairIndex = this.previewPlayer.getIndex(this.previewPlayer.bodyacc);

        if (hairKey == this.previewPlayer.bodyacc.texture.key){
            this.previewPlayer.bodyacc.destroy();
            this.previewPlayer.bodyacc = this.scene.add.image(0, 0, 'baccEmpty').setOrigin(0.5, 0.5);
            this.previewPlayer.addAt(this.previewPlayer.bodyacc, hairIndex)
        } else {
            // Remove previous hair sprite from preview player
            if (this.previewPlayer.bodyacc) {
                this.previewPlayer.bodyacc.destroy();
            }
        
            // Create new hair sprite
            this.previewPlayer.bodyacc = this.scene.add.sprite(
                body_acc[this.gender]?.[hairKey]?.["fitX"], 
                body_acc[this.gender]?.[hairKey]?.["fitY"], 
                hairKey,
                0
            ).setOrigin(0.5, 0.5);

            
            // Add new hair to previewPlayer
            this.previewPlayer.addAt(this.previewPlayer.bodyacc, hairIndex);
        }
    }
    
    destroy() {
        this.container.destroy(); // Remove all hair images
        this.nextButton.destroy(); // Remove next page button
        this.prevButton.destroy(); // Remove previous page button
    }
}

export async function saveOutfitChangesToDB(updatedData) {
    try {
        const response = await fetch(publicURL+"/api/user/update", {
            
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(updatedData)
        });

        const data = await response.json();
        if (data.success) {
            console.log("✅ Changes saved successfully!");
            updateLocalAvatarData(updatedData); // ✅ Also update locally so changes persist between scenes
        } else {
            console.error("❌ Failed to save changes:", data.message);
        }
    } catch (error) {
        console.error("❌ Error saving changes:", error);
    }
}
