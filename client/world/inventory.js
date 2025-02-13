import { assets, tops } from '../assets/data.js';
import { createAvatarAnimations } from './animations.js';
import { updateLocalAvatarData } from "../game.js";

export function openInventory(scene, player, room){
    //const { width, height } = scene.cameras.main;
    const inventory = scene.add.image(0, 0, 'inventorybg').setOrigin(0, 0).setScrollFactor(0).setInteractive();
    inventory.setDepth(2);

    // ✅ Store initial outfit for comparison
    const initialAvatarData = { 
        hair: player.hair.texture.key, 
        top: player.top.texture.key 
    };

    inventory.on('pointerup', (pointer, localX, localY, event) => {
        event.stopPropagation();
    });

    // Create closet avatar
    const previewPlayer = scene.add.container(694, 350).setDepth(2).setScrollFactor(0);

    let previewParts = [];
    let previewHair = null; // Store hair separately
    let previewTop = null; // Store top separately

    player.list.forEach(part => {
        if (part.texture.key != null) {  // Ensure it's a visible part
            let clonedPart = scene.add.image(part.x, part.y, part.texture.key)
                .setOrigin(part.originX, part.originY)
                .setScale(part.scaleX, part.scaleY)
                .setDepth(3);
            if (clonedPart) {
                previewParts.push(clonedPart);
                previewPlayer.add(clonedPart);
            }

            // If this part is the hair, store it separately
            if (part === player.hair) {
                previewHair = clonedPart;
            } else if (part == player.top) {
                previewTop = clonedPart;
            }
        }
    });

    previewPlayer.hair = previewHair; // Store reference to initial hair
    previewPlayer.top = previewTop; // Store reference to initial top

    const closeInventory = scene.add.ellipse(778, 21, 30, 30, 0xffffff, 0)
            .setInteractive()
            .setScrollFactor(0)
            .setDepth(2);

    closeInventory.on('pointerup', async (pointer, localX, localY, event) => {
        // Save Clothes
        let hairIndex = player.getIndex(player.hair); // Get the layer index of the hair
        player.hair.destroy();

        player.hair = scene.add.image(
        assets['hair']?.["female"]?.[previewPlayer.hair.texture.key]?.["fitX"], 
        assets['hair']?.["female"]?.[previewPlayer.hair.texture.key]?.["fitY"], 
        previewPlayer.hair.texture.key).setOrigin(0.5, 0.5);

        player.addAt(player.hair, hairIndex);

        let topIndex = player.getIndex(player.top); // Get the layer index of the hair
        player.top.destroy();

        player.top = scene.add.sprite(
        tops['top']?.["female"]?.[previewPlayer.top.texture.key]?.["fitX"], 
        tops['top']?.["female"]?.[previewPlayer.top.texture.key]?.["fitY"],
        previewPlayer.top.texture.key,
        0
        ).setOrigin(0.5, 0.5);

        player.addAt(player.top, topIndex);

        // Notify other players about outfit change
        room.send("outfitChange", {playerId: player.id, hairKey: player.hair.texture.key, topKey: player.top.texture.key})
        event.stopPropagation();

        let updatedData = { hair: player.hair.texture.key, top: player.top.texture.key };
        
        // ✅ Check if the outfit was changed before saving
        if (JSON.stringify(updatedData) !== JSON.stringify(initialAvatarData)) {
            console.log("📝 Outfit changed! Saving...");
            await saveOutfitChangesToDB(updatedData);
        } else {
            console.log("🔹 No changes detected, not saving.");
        }
        
        
        inventory.destroy();
        closeInventory.destroy();
        if (currentPage == "hair"){
            hairSelection.destroy();
        } else if (currentPage == "tops"){
            topSelection.destroy();
        }

        previewPlayer.destroy();
        createAvatarAnimations(scene, player);
    });

    // Optional hover effect
    closeInventory.on('pointerover', () => {
      closeInventory.setFillStyle(0x808080, 0.15); // Highlight the area slightly 0x2D2D2D 0xaaaaaa
    });
    closeInventory.on('pointerout', () => {
      closeInventory.setFillStyle(0xffffff, 0); // Remove highlight
    });

    const switchToTops = scene.add.rectangle(139, 73, 104, 28, 0xffffff, 0)
            .setInteractive()
            .setScrollFactor(0)
            .setDepth(2)
            .setOrigin(0.5, 0.5);

    switchToTops.on('pointerup', (pointer, localX, localY, event) => {
        // Save Clothes 
        event.stopPropagation();  
        hairSelection.destroy();
        topSelection = new TopSelection(scene, player, previewPlayer); // Store instance
        currentPage = "tops";
        
    });
    switchToTops.on('pointerover', () => {
        switchToTops.setFillStyle(0x808080, 0.15); // Highlight the area slightly 0x2D2D2D 0xaaaaaa
      });
    switchToTops.on('pointerout', () => {
        switchToTops.setFillStyle(0xffffff, 0); // Remove highlight
    });


    let hairSelection = new HairSelection(scene, player, previewPlayer); // Store instance
    let topSelection = null;
    let currentPage = "hair";
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

async function saveOutfitChangesToDB(updatedData) {
    try {
        const response = await fetch("http://localhost:3000/api/user/update", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(updatedData)
        });

        const data = await response.json();
        if (data.success) {
            console.log("✅ Outfit changes saved successfully!");
            updateLocalAvatarData(updatedData); // ✅ Also update locally so changes persist between scenes
        } else {
            console.error("❌ Failed to save outfit changes:", data.message);
        }
    } catch (error) {
        console.error("❌ Error saving outfit changes:", error);
    }
}