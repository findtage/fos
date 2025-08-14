import { assets, tops, bottoms, shoes, boards } from '../assets/data.js';
import { createAvatarAnimations, performIdles } from './animations.js';
import { getPlayerAvatarData, updateLocalAvatarData } from "../game.js";

const BASE_DEPTH = 16535;

export function openInventory(scene, player, room){
    //const { width, height } = scene.cameras.main;
    const inventory = scene.add.image(0, 0, 'inventorybg').setOrigin(0, 0).setScrollFactor(0).setInteractive().setDepth(BASE_DEPTH+2);

    // Store initial outfit for comparison
    const initialAvatarData = { 
        hair: player.hair.texture.key, 
        top: player.top.texture.key,
        bottom: player.bottom.texture.key,
        shoes: player.shoes.texture.key,
        board: player.board.texture.key
    };

    inventory.on('pointerup', (pointer, localX, localY, event) => {
        event.stopPropagation();
    });

    // Create closet avatar
    const previewPlayer = scene.add.container(694, 350).setDepth(BASE_DEPTH+2).setScrollFactor(0);

    let previewParts = [];
    let previewHair = null; // Store hair separately
    let previewTop = null; // Store top separately
    let previewBottom = null; // Store bottom separately
    let previewShoes = null; // Store shoes separately
    let previewBoard = null; // // Store board separately

    // Make a preview character for inventory
    player.list.forEach(part => {
        if (part.texture.key != null) {  // Ensure it's a visible part
            let clonedPart = scene.add.image(part.x, part.y, part.texture.key)
                .setOrigin(part.originX, part.originY)
                .setScale(part.scaleX, part.scaleY)
                .setDepth(BASE_DEPTH+3);
            if (clonedPart) {
                previewParts.push(clonedPart);
                previewPlayer.add(clonedPart);
            }

            // If this part is the hair, store it separately
            if (part === player.hair) {
                previewHair = clonedPart;
            } else if (part == player.top) {
                previewTop = clonedPart;
            } else if (part == player.bottom){
                previewBottom = clonedPart;
            } else if (part == player.shoes){
                previewShoes = clonedPart;
            } else if (part == player.board){
                previewBoard = clonedPart;
            }
        }
    });

    previewPlayer.hair = previewHair; // Store reference to initial hair
    previewPlayer.top = previewTop; // Store reference to initial top
    previewPlayer.bottom = previewBottom; // Store reference to initial bottom
    previewPlayer.shoes = previewShoes; // Store reference to initial shoes
    previewPlayer.board = previewBoard;
    
    // Create a close button
    const closeInventory = scene.add.ellipse(778, 21, 30, 30, 0xffffff, 0).setInteractive().setScrollFactor(0).setDepth(BASE_DEPTH+2);

    closeInventory.on('pointerup', async (pointer, localX, localY, event) => {
        // Save hair
        let hairIndex = player.getIndex(player.hair); // Get the layer index of the hair
        player.hair.destroy();
        player.hair = scene.add.sprite(
        assets['hair']?.["female"]?.[previewPlayer.hair.texture.key]?.["fitX"], 
        assets['hair']?.["female"]?.[previewPlayer.hair.texture.key]?.["fitY"], 
        previewPlayer.hair.texture.key, 0).setOrigin(0.5, 0.5);
        player.addAt(player.hair, hairIndex);

        // Save top
        let topIndex = player.getIndex(player.top); // Get the layer index of the top
        player.top.destroy();
        player.top = scene.add.sprite(
        tops['top']?.["female"]?.[previewPlayer.top.texture.key]?.["fitX"], 
        tops['top']?.["female"]?.[previewPlayer.top.texture.key]?.["fitY"],
        previewPlayer.top.texture.key,
        0).setOrigin(0.5, 0.5);
        player.addAt(player.top, topIndex);

        // Save bottom
        let bottomIndex = player.getIndex(player.bottom); // Get the layer index of the bottom
        player.bottom.destroy();
        player.bottom = scene.add.sprite(
        bottoms['bottom']?.["female"]?.[previewPlayer.bottom.texture.key]?.["fitX"], 
        bottoms['bottom']?.["female"]?.[previewPlayer.bottom.texture.key]?.["fitY"],
        previewPlayer.bottom.texture.key,
        0).setOrigin(0.5, 0.5);
        player.addAt(player.bottom, bottomIndex);

        // Save shoes
        let shoeIndex = player.getIndex(player.shoes); // Get the layer index of the shoes
        player.shoes.destroy();
        player.shoes = scene.add.sprite(
        shoes['shoe']?.["female"]?.[previewPlayer.shoes.texture.key]?.["fitX"], 
        shoes['shoe']?.["female"]?.[previewPlayer.shoes.texture.key]?.["fitY"],
        previewPlayer.shoes.texture.key,
        0).setOrigin(0.5, 0.5);
        player.addAt(player.shoes, shoeIndex);

        // Save board
        let boardIndex = player.getIndex(player.board); // Get the layer index of the board
        player.board.destroy();
        player.board = scene.add.image(
        boards['board']?.[previewPlayer.board.texture.key]?.["fitX"], 
        boards['board']?.[previewPlayer.board.texture.key]?.["fitY"], 
        previewPlayer.board.texture.key,
        0).setOrigin(0.5, 0.5);
        player.addAt(player.board, boardIndex);

        // Notify other players about outfit change
        room.send("outfitChange", {playerId: player.id, 
            hairKey: player.hair.texture.key, 
            topKey: player.top.texture.key, 
            bottomKey: player.bottom.texture.key,
            shoeKey: player.shoes.texture.key,
            boardKey: player.board.texture.key
        });
        event.stopPropagation();

        let updatedData = { 
            hair: player.hair.texture.key, 
            top: player.top.texture.key, 
            bottom: player.bottom.texture.key,
            shoes: player.shoes.texture.key,
            board: player.board.texture.key
        };
        
        // ✅ Check if the outfit was changed before saving
        if (JSON.stringify(updatedData) !== JSON.stringify(initialAvatarData)) {
            console.log("📝 Outfit changed! Saving...");
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
        switchToHairs.destroy();
        switchToClothes.destroy();
        switchToTops.destroy();
        switchToBottoms.destroy();
        switchToShoes.destroy();
        switchToBoards.destroy();
        clothingSelection.destroy();
        previewPlayer.destroy();

        createAvatarAnimations(scene, player);
        performIdles(scene, player);
    });

    closeInventory.on('pointerover', () => {
      closeInventory.setFillStyle(0x808080, 0.15); // Highlight the area slightly 0x2D2D2D 0xaaaaaa
    });
    closeInventory.on('pointerout', () => {
      closeInventory.setFillStyle(0xffffff, 0); // Remove highlight
    });

    // Create switch to hairs button
    const switchToHairs = scene.add.rectangle(46, 73, 72, 29, 0xffffff, 0).setInteractive().setScrollFactor(0).setDepth(BASE_DEPTH+2).setOrigin(0.5, 0.5);

    switchToHairs.on('pointerup', (pointer, localX, localY, event) => {
        event.stopPropagation(); 
        if (currentPage != "hair"){
            clothingSelection.destroy();

            sideBar.setVisible(false);
            switchToTops.setVisible(false);
            switchToBottoms.setVisible(false);
            switchToShoes.setVisible(false);

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

    // Create switch to tops button
    const switchToClothes = scene.add.rectangle(139, 73, 104, 28, 0xffffff, 0).setInteractive().setScrollFactor(0).setDepth(BASE_DEPTH+2).setOrigin(0.5, 0.5);

    switchToClothes.on('pointerup', (pointer, localX, localY, event) => {
        event.stopPropagation(); 
        if (currentPage != "tops" && currentPage != "bottoms" && currentPage != "shoes"){
            clothingSelection.destroy();
            clothingSelection = new TopSelection(scene, player, previewPlayer); // Store instance

            sideBar.setVisible(true);
            switchToTops.setVisible(true);
            switchToBottoms.setVisible(true);
            switchToShoes.setVisible(true);

            currentPage = "tops";
        } 
        
    });
    switchToClothes.on('pointerover', () => {
        switchToClothes.setFillStyle(0x808080, 0.15); // Highlight the area slightly 0x2D2D2D 0xaaaaaa
      });
    switchToClothes.on('pointerout', () => {
        switchToClothes.setFillStyle(0xffffff, 0); // Remove highlight
    });

    const switchToTops = scene.add.rectangle(98, 97, 33, 15, 0xffffff, 0).setInteractive().setScrollFactor(0).setDepth(BASE_DEPTH+3).setOrigin(0.5, 0.5).setVisible(false);
    const switchToBottoms = scene.add.rectangle(165, 97, 60, 15, 0xffffff, 0).setInteractive().setScrollFactor(0).setDepth(BASE_DEPTH+3).setOrigin(0.5, 0.5).setVisible(false);
    
    //const switchToOutfits = scene.add.rectangle(244, 97, 55, 15, 0xffffff, 0).setInteractive().setScrollFactor(0).setDepth(BASE_DEPTH+3).setOrigin(0.5, 0.5).setVisible(false);
    //const switchToCostumes = scene.add.rectangle(331, 97, 70, 15, 0xffffff, 0).setInteractive().setScrollFactor(0).setDepth(BASE_DEPTH+3).setOrigin(0.5, 0.5).setVisible(false);
    const switchToShoes = scene.add.rectangle(413, 97, 45, 15, 0xffffff, 0).setInteractive().setScrollFactor(0).setDepth(BASE_DEPTH+3).setOrigin(0.5, 0.5).setVisible(false);
    
    switchToTops.on('pointerup', (pointer, localX, localY, event) => {
        event.stopPropagation(); 
        if (currentPage != "tops"){
            clothingSelection.destroy();
            // wtf is this shit make it all the same variable since it needs to be fucking destroyed anyway? 
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


    const switchToBoards = scene.add.rectangle(235, 73, 90, 28, 0xffffff, 0).setInteractive().setScrollFactor(0).setDepth(BASE_DEPTH+2).setOrigin(0.5, 0.5);
    switchToBoards.on('pointerup', (pointer, localX, localY, event) => {
        event.stopPropagation(); 
        if (currentPage != "boards"){
            clothingSelection.destroy();
            clothingSelection = new BoardSelection(scene, player, previewPlayer); // Store instance

            sideBar.setVisible(false);
            switchToTops.setVisible(false);
            switchToBottoms.setVisible(false);
            switchToShoes.setVisible(false);

            currentPage = "boards";
        } 
        
    });
    switchToBoards.on('pointerover', () => {
        switchToBoards.setFillStyle(0x808080, 0.15); // Highlight the area slightly 0x2D2D2D 0xaaaaaa
      });
    switchToBoards.on('pointerout', () => {
        switchToBoards.setFillStyle(0xffffff, 0); // Remove highlight
    });

    // Start inventory at hairs
    let clothingSelection = new HairSelection(scene, player, previewPlayer);
    let currentPage = "hair";
    let sideBar = scene.add.image(400, 96, 'clothSelectionSideBar').setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(BASE_DEPTH+2).setVisible(false);
}

class HairSelection {
    constructor(scene, player, previewPlayer) {
        this.scene = scene;
        this.player = player;
        this.previewPlayer = previewPlayer;
        this.hairKeys = Object.keys(assets.hair.female); // Store hair asset keys
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
            if (assets['hair']?.["female"]?.[hairKey]?.["type"] == "image"){
                var hairSprite = this.scene.add.image(x, y, hairKey).setInteractive().setScrollFactor(0).setScale(.9, .9);
            } else if (assets['hair']?.["female"]?.[hairKey]?.["type"] == "sprite") {
                var hairSprite = this.scene.add.sprite(x+5, y, hairKey, 0).setInteractive().setScrollFactor(0).setScale(.8, .8);
            }
            this.container.add(hairSprite);
            this.container.setDepth(BASE_DEPTH+2);

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
            .setDepth(BASE_DEPTH+2);
    
        // Previous Page Button (Up Arrow)
        this.prevButton = this.scene.add.text(546, 154, '▲', { fontSize: '32px', fill: '#fff' })
            .setInteractive()
            .setScrollFactor(0)
            .setAlpha(0.00001)
            .on('pointerdown', () => this.changePage(-1))
            .on('pointerup', (pointer, localX, localY, event) => {
                event.stopPropagation();
            })
            .setDepth(BASE_DEPTH+2);
    
        this.scene.add.existing(this.nextButton);
        this.scene.add.existing(this.prevButton);
    }

    changePage(direction) {
        let maxPage = Math.ceil(this.hairKeys.length / this.hairsPerPage) - 1;
        this.page = Phaser.Math.Clamp(this.page + direction, 0, maxPage);
        this.displayHairs();
    }

    selectHair(hairKey) {
        console.log("Hair selected:", hairKey, "\nHair path is:\n", assets['hair']?.["female"]?.[hairKey]?.["path"]);
        
        const hairIndex = this.previewPlayer.getIndex(this.previewPlayer.hair);
        let hairScale = 1;

        if (assets['hair']?.["female"]?.[hairKey]?.["scale"]){
            hairScale = assets['hair']?.["female"]?.[hairKey]?.["scale"];
            console.log("Hair scale is:", hairScale);
        }
    

        // Remove previous hair sprite from preview player
        if (this.previewPlayer.hair) {
            this.previewPlayer.hair.destroy();
        }
    
        // Create new hair sprite
        this.previewPlayer.hair = this.scene.add.image(
            assets['hair']?.["female"]?.[hairKey]?.["fitX"], 
            assets['hair']?.["female"]?.[hairKey]?.["fitY"], 
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
        this.previewPlayer = previewPlayer;
        this.topKeys = Object.keys(tops.top.female); // Store hair asset keys
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
            
            if (tops['top']?.["female"]?.[topKey]?.["type"] == "image"){
                var topSprite = this.scene.add.image(x, y, topKey).setInteractive().setScrollFactor(0).setScale(1, 1);
            } else if (tops['top']?.["female"]?.[topKey]?.["type"] == "sprite") {
                var topSprite = this.scene.add.sprite(x, y, topKey, 0).setInteractive().setScrollFactor(0).setScale(1, 1);
            }
            this.container.add(topSprite);
            this.container.setDepth(BASE_DEPTH+2);

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
            .setDepth(BASE_DEPTH+2);
    
        // Previous Page Button (Up Arrow)
        this.prevButton = this.scene.add.text(546, 154, '▲', { fontSize: '32px', fill: '#fff' })
            .setInteractive()
            .setScrollFactor(0)
            .setAlpha(0.00001)
            .on('pointerdown', () => this.changePage(-1))
            .on('pointerup', (pointer, localX, localY, event) => {
                event.stopPropagation();
            })
            .setDepth(BASE_DEPTH+2);
    
        this.scene.add.existing(this.nextButton);
        this.scene.add.existing(this.prevButton);
    }

    changePage(direction) {
        let maxPage = Math.ceil(this.topKeys.length / this.topsPerPage) - 1;
        this.page = Phaser.Math.Clamp(this.page + direction, 0, maxPage);
        this.displayTops();
    }

    selectTop(topKey) {
        console.log("Top selected:", topKey, "\nTop path is:\n", tops['top']?.["female"]?.[topKey]?.["path"]);

        const topIndex = this.previewPlayer.getIndex(this.previewPlayer.top);
        let topScale = 1;

        if (tops['top']?.["female"]?.[topKey]?.["scale"]){
            topScale = tops['top']?.["female"]?.[topKey]?.["scale"];
            console.log("Top scale is:", topScale);
        }
    

        // Remove previous top sprite from preview player
        if (this.previewPlayer.top) {
            this.previewPlayer.top.destroy();
        }
    
        // Create new top sprite
        this.previewPlayer.top = this.scene.add.sprite(
            tops['top']?.["female"]?.[topKey]?.["fitX"], 
            tops['top']?.["female"]?.[topKey]?.["fitY"], 
            topKey,
            0
        ).setOrigin(0.5, 0.5).setScale(topScale, topScale);

        
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
        this.previewPlayer = previewPlayer;
        this.bottomKeys = Object.keys(bottoms.bottom.female); // Store bottom asset keys
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
            if (bottoms['bottom']?.["female"]?.[bottomKey]?.["type"] == "image") {
                bottomSprite = this.scene.add.image(x, y, bottomKey)
                    .setInteractive()
                    .setScrollFactor(0)
                    .setScale(1, 1);
            } else if (bottoms['bottom']?.["female"]?.[bottomKey]?.["type"] == "sprite") {
                bottomSprite = this.scene.add.sprite(x, y, bottomKey, 0)
                    .setInteractive()
                    .setScrollFactor(0)
                    .setScale(1, 1);
            }

            this.container.add(bottomSprite);
            this.container.setDepth(BASE_DEPTH+2);

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
            .setDepth(BASE_DEPTH+2);
    
        // Previous Page Button (Up Arrow)
        this.prevButton = this.scene.add.text(546, 154, '▲', { fontSize: '32px', fill: '#fff' })
            .setInteractive()
            .setScrollFactor(0)
            .setAlpha(0.00001)
            .on('pointerdown', () => this.changePage(-1))
            .on('pointerup', (pointer, localX, localY, event) => {
                event.stopPropagation();
            })
            .setDepth(BASE_DEPTH+2);
    
        this.scene.add.existing(this.nextButton);
        this.scene.add.existing(this.prevButton);
    }

    changePage(direction) {
        let maxPage = Math.ceil(this.bottomKeys.length / this.bottomsPerPage) - 1;
        this.page = Phaser.Math.Clamp(this.page + direction, 0, maxPage);
        this.displayBottoms();
    }

    selectBottom(bottomKey) {
        console.log("Bottom selected:", bottomKey, "\nBottom path is:\n", bottoms['bottom']?.["female"]?.[bottomKey]?.["path"]);

        const bottomIndex = this.previewPlayer.getIndex(this.previewPlayer.bottom);
        let bottomScale = 1;

        if (bottoms['bottom']?.["female"]?.[bottomKey]?.["scale"]) {
            bottomScale = bottoms['bottom']?.["female"]?.[bottomKey]?.["scale"];
            console.log("Bottom scale is:", bottomScale);
        }
    
        // Remove previous bottom sprite from preview player
        if (this.previewPlayer.bottom) {
            this.previewPlayer.bottom.destroy();
        }
    
        // Create new bottom sprite
        this.previewPlayer.bottom = this.scene.add.sprite(
            bottoms['bottom']?.["female"]?.[bottomKey]?.["fitX"], 
            bottoms['bottom']?.["female"]?.[bottomKey]?.["fitY"], 
            bottomKey,
            0
        ).setOrigin(0.5, 0.5).setScale(bottomScale, bottomScale);

        // Add new bottom to previewPlayer
        this.previewPlayer.addAt(this.previewPlayer.bottom, bottomIndex);
    }

    destroy() {
        this.container.destroy(); // Remove all bottom images
        this.nextButton.destroy(); // Remove next page button
        this.prevButton.destroy(); // Remove previous page button
    }
}

class ShoeSelection {
    constructor(scene, player, previewPlayer) {
        this.scene = scene;
        this.player = player;
        this.previewPlayer = previewPlayer;
        this.shoeKeys = Object.keys(shoes.shoe.female); // Store shoe asset keys
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
            if (shoes['shoe']?.["female"]?.[shoeKey]?.["type"] == "image") {
                shoeSprite = this.scene.add.image(x, y, shoeKey)
                    .setInteractive()
                    .setScrollFactor(0)
                    .setScale(1, 1);
            } else if (shoes['shoe']?.["female"]?.[shoeKey]?.["type"] == "sprite") {
                shoeSprite = this.scene.add.sprite(x, y, shoeKey, 0)
                    .setInteractive()
                    .setScrollFactor(0)
                    .setScale(1, 1);
            }

            this.container.add(shoeSprite);
            this.container.setDepth(BASE_DEPTH+2);

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
            .setDepth(BASE_DEPTH+2);
    
        // Previous Page Button (Up Arrow)
        this.prevButton = this.scene.add.text(546, 154, '▲', { fontSize: '32px', fill: '#fff' })
            .setInteractive()
            .setScrollFactor(0)
            .setAlpha(0.00001)
            .on('pointerdown', () => this.changePage(-1))
            .on('pointerup', (pointer, localX, localY, event) => {
                event.stopPropagation();
            })
            .setDepth(BASE_DEPTH+2);
    
        this.scene.add.existing(this.nextButton);
        this.scene.add.existing(this.prevButton);
    }

    changePage(direction) {
        let maxPage = Math.ceil(this.shoeKeys.length / this.shoesPerPage) - 1;
        this.page = Phaser.Math.Clamp(this.page + direction, 0, maxPage);
        this.displayShoes();
    }

    selectShoe(shoeKey) {
        console.log("Shoe selected:", shoeKey, "\nShoe path is:\n", shoes['shoe']?.["female"]?.[shoeKey]?.["path"]);

        const shoeIndex = this.previewPlayer.getIndex(this.previewPlayer.shoes);
        let shoeScale = 1;

        if (shoes['shoe']?.["female"]?.[shoeKey]?.["scale"]) {
            shoeScale = shoes['shoe']?.["female"]?.[shoeKey]?.["scale"];
            console.log("Shoe scale is:", shoeScale);
        }
    
        // Remove previous shoe sprite from preview player
        if (this.previewPlayer.shoes) {
            this.previewPlayer.shoes.destroy();
        }
    
        // Create new shoe sprite
        this.previewPlayer.shoes = this.scene.add.sprite(
            shoes['shoe']?.["female"]?.[shoeKey]?.["fitX"], 
            shoes['shoe']?.["female"]?.[shoeKey]?.["fitY"], 
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
        this.hairKeys = Object.keys(boards.board); // Store hair asset keys
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
            if (boards['board']?.[hairKey]?.["type"] == "image"){
                var hairSprite = this.scene.add.image(x, y, hairKey).setInteractive().setScrollFactor(0);
            }
            this.container.add(hairSprite);
            this.container.setDepth(BASE_DEPTH+2);

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
            .setDepth(BASE_DEPTH+2);
    
        // Previous Page Button (Up Arrow)
        this.prevButton = this.scene.add.text(546, 154, '▲', { fontSize: '32px', fill: '#fff' })
            .setInteractive()
            .setScrollFactor(0)
            .setAlpha(0.00001)
            .on('pointerdown', () => this.changePage(-1))
            .on('pointerup', (pointer, localX, localY, event) => {
                event.stopPropagation();
            })
            .setDepth(BASE_DEPTH+2);
    
        this.scene.add.existing(this.nextButton);
        this.scene.add.existing(this.prevButton);
    }

    changePage(direction) {
        let maxPage = Math.ceil(this.hairKeys.length / this.hairsPerPage) - 1;
        this.page = Phaser.Math.Clamp(this.page + direction, 0, maxPage);
        this.displayHairs();
    }

    selectHair(hairKey) {
        console.log("Board selected:", hairKey, "\nBoard path is:\n", boards['board']?.[hairKey]?.["path"]);
        
        const hairIndex = this.previewPlayer.getIndex(this.previewPlayer.board);
        console.log("Board index is "+hairIndex);
    
        // Remove previous hair sprite from preview player
        if (this.previewPlayer.board) {
            this.previewPlayer.board.destroy();
        }
    
        // Create new hair sprite
        this.previewPlayer.board = this.scene.add.image(
            boards['board']?.[hairKey]?.["fitX"], 
            boards['board']?.[hairKey]?.["fitY"], 
            hairKey
        ).setOrigin(0.5, 0.5);

        
        // Add new hair to previewPlayer
        this.previewPlayer.addAt(this.previewPlayer.board, hairIndex);
    }
    

    destroy() {
        this.container.destroy(); // Remove all hair images
        this.nextButton.destroy(); // Remove next page button
        this.prevButton.destroy(); // Remove previous page button
    }
}


export async function saveOutfitChangesToDB(updatedData) {
    try {
        //const response = await fetch("https://c99a-98-14-219-221.ngrok-free.app/api/user/update", {
        const response = await fetch("http://localhost:3000/api/user/update", {
            
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