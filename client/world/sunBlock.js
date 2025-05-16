import { saveOutfitChangesToDB } from "./inventory.js";
import { body, heads, avatar_parts } from '../assets/data.js';

export function sunBlockLogic(scene, player, room){
    // Store Logic
    let shopIcon = scene.add.image(766, 36, 'shopIcon').setOrigin(0.5, 0.5).setDepth(1.5).setInteractive();

    shopIcon.on('pointerup', (pointer, localX, localY, event) => {
        event.stopPropagation();
        sunBlockMenu(scene, player, room)
    });
}

function sunBlockMenu(scene, player, room){
    const storeMenu = scene.add.image(0, 0, 'sunBlockMenu').setOrigin(0, 0).setScrollFactor(0).setInteractive().setDepth(2);
    const closeMenu = scene.add.ellipse(779, 19, 30, 30, 0xffffff, 0).setInteractive().setScrollFactor(0).setDepth(2);
    const eyeButton = scene.add.rectangle(102, 197, 60, 20, 0xffffff, 0).setInteractive().setScrollFactor(0).setDepth(2);
    const skinButton = scene.add.rectangle(185, 197, 60, 20, 0xffffff, 0).setInteractive().setScrollFactor(0).setDepth(2);
    const transformButton = scene.add.rectangle(683, 451, 145, 37, 0xffffff, 0).setInteractive().setScrollFactor(0).setDepth(2);

    const initialAvatarData = { 
        eyes: player.eyes.texture.key, 
        body: player.base.texture.key,
        head: player.head.texture.key
    };

    // Create closet avatar
    const previewPlayer = scene.add.container(670, 385).setDepth(2).setScrollFactor(0);

    let previewParts = [];
    let previewEyes = null; 
    let previewHead = null; 
    let previewBase = null;

    let gender = player.head.texture.key.startsWith('m') ? 'male' : 'female';

    // Make a preview character for inventory
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
            
            if (!part.visible){
                clonedPart.setVisible(false);
            }

            if (part === player.eyes) {
                previewEyes = clonedPart;
            } else if (part == player.head) {
                previewHead = clonedPart;
            } else if (part == player.base){
                previewBase = clonedPart;
            } 
        }
    });

    previewPlayer.eyes = previewEyes; 
    previewPlayer.head = previewHead;
    previewPlayer.base = previewBase; 

    storeMenu.on('pointerup', (pointer, localX, localY, event) => {
        event.stopPropagation();
    });

    closeMenu.on('pointerup', async (pointer, localX, localY, event) => {
        event.stopPropagation();
        storeMenu.destroy();
        eyeButton.destroy();
        skinButton.destroy();
        closeMenu.destroy();  
        previewPlayer.destroy();
        pageSelection.destroy();

        scene.scene.start(scene.scene.key, { playerXLocation: player.x, playerYLocation: player.y, playerDirection: player.direction });
    });

    transformButton.on('pointerup', async (pointer, localX, localY, event) => {
        event.stopPropagation();

        // Save eyes
        let eyeIndex = player.getIndex(player.eyes); // Get the layer index of the hair
        player.eyes.destroy();

        player.eyes = scene.add.sprite(
            avatar_parts[gender]?.['eyes']?.[previewPlayer.eyes.texture.key]?.["fitX"],
            avatar_parts[gender]?.['eyes']?.[previewPlayer.eyes.texture.key]?.["fitY"],
            previewPlayer.eyes.texture.key,
            0
        ).setOrigin(0.5, 0.5);
        player.addAt(player.eyes, eyeIndex);

        // Save head
        let headIndex = player.getIndex(player.head); // Get the layer index of the hair
        player.head.destroy();

        player.head = scene.add.image(
            heads['head']?.[gender]?.[previewPlayer.head.texture.key]?.['fitX'],
            heads['head']?.[gender]?.[previewPlayer.head.texture.key]?.['fitY'],
            previewPlayer.head.texture.key
        ).setOrigin(0.5, 0.5);
        player.addAt(player.head, headIndex);

        // Save body
        let bodyIndex = player.getIndex(player.base); // Get the layer index of the hair
        let playerDirection = player.base.direction;
        player.base.destroy();

        player.base = scene.add.sprite(
            body['body']?.[gender]?.[previewPlayer.base.texture.key]?.["fitX"],
            body['body']?.[gender]?.[previewPlayer.base.texture.key]?.["fitY"],
            previewPlayer.base.texture.key,
            0
        ).setOrigin(0.5, 0.5);
        player.base.setData('direction', playerDirection);
        player.addAt(player.base, bodyIndex);

        // Notify other players about outfit change
        room.send("appearanceChange", {playerId: player.id,
            playerGender: gender,
            eyesKey: player.eyes.texture.key, 
            bodyKey: player.base.texture.key,
            headKey: player.head.texture.key
        });

        let updatedData = { 
            eyes: player.eyes.texture.key, 
            body: player.base.texture.key,
            head: player.head.texture.key,
        };
        
        // ✅ Check if the outfit was changed before saving
        if (JSON.stringify(updatedData) !== JSON.stringify(initialAvatarData)) {
            console.log("📝 Appearance changed! Saving...");
            await saveOutfitChangesToDB(updatedData);
            //scene.scene.start(scene.scene.key, { playerXLocation: player.x, playerYLocation: player.y, playerDirection: player.direction });
        } else {
            console.log("🔹 No changes detected, not saving.");
        }

    });

    eyeButton.on('pointerup', (pointer, localX, localY, event) => {
        event.stopPropagation();
        if (current_page != "eyes"){
            current_page = "eyes";
            pageSelection.destroy();
            pageSelection = new EyeSelection(scene, player, previewPlayer);
        }
    });

    skinButton.on('pointerup', (pointer, localX, localY, event) => {
        event.stopPropagation();
        if (current_page != "skin"){
            current_page = "skin";
            pageSelection.destroy();
            pageSelection = new SkinSelection(scene, player, previewPlayer);
        }
    });

    let current_page = "eyes";
    let pageSelection = new EyeSelection(scene, player, previewPlayer);
}

class EyeSelection {
    constructor(scene, player, previewPlayer) {
        this.scene = scene;
        this.player = player;
        this.gender = player.head.texture.key.startsWith('m') ? 'male' : 'female';
        this.previewPlayer = previewPlayer;
        this.page = 0;
        this.eyesPerPage = 8; // 4 rows × 2 columns
        this.columns = 4;
        this.rows = 2;
        //this.eyeKeys = Array.from({ length: 14 }, (_, i) => `eyes${i}`);
        this.eyeKeys = Array.from({ length: 14 }, (_, i) => `${this.gender === 'male' ? 'meyes' : 'eyes'}${i}`);
        this.hairKey = this.gender === 'male' ? 'mhair0' : 'hair23';
        this.headKey = this.gender === 'male' ? 'mhead0' : 'head0';
        this.container = this.scene.add.container(112, 279);
        this.displayEyes();
        this.createNavigationButtons();
    }

    displayEyes() {
        this.container.removeAll(true); // Clear previous page

        // Get current page's items
        const startIndex = this.page * this.eyesPerPage;
        const pageItems = this.eyeKeys.slice(startIndex, startIndex + this.eyesPerPage);

        let x = 0, y = 0;
        let hairOffset = this.gender === 'male' ? -23 : -9;
        let hairOffsetX = this.gender === 'male' ? -3 : 0;
        let spacingX = 122; // Adjust spacing
        let spacingY = 110;

        pageItems.forEach((eyeKey, index) => {
            let shopBlock = this.scene.add.image(x, y, 'sunBlockContainer').setOrigin(0.5, 0.5);
            let face = this.scene.add.image(x, y - 18, this.headKey).setOrigin(0.5, 0.5);
            let hair = this.scene.add.image(x + hairOffsetX, y + hairOffset, this.hairKey).setOrigin(0.5, 0.5);
            let eyes = this.scene.add.image(x, y - 19, eyeKey).setInteractive().setOrigin(0.5, 0.5);

            // Handle click to select hair
            eyes.on('pointerdown', () => {
                this.selectEyes(eyeKey);
            });
            eyes.on('pointerup', (pointer, localX, localY, event) => {
                event.stopPropagation();
            });

            this.container.add([shopBlock, face, hair, eyes]);
            this.container.setDepth(2);

            // Arrange in rows/columns
            x += spacingX;
            if ((index + 1) % this.columns === 0) {
                x = 0;
                y += spacingY;
            }
        });
    }

    createNavigationButtons() {
        // Next Page Button
        this.nextButton = this.scene.add.ellipse(578, 241, 20, 20, 0xffffff, 0)
            .setInteractive()
            .setScrollFactor(0)
            .on('pointerdown', () => this.changePage(1))
            .on('pointerup', (pointer, localX, localY, event) => {
                event.stopPropagation();
            })
            .setDepth(2);

        // Previous Page Button
        this.prevButton = this.scene.add.ellipse(578, 436, 20, 20, 0xffffff, 0)
            .setInteractive()
            .setScrollFactor(0)
            .on('pointerdown', () => this.changePage(-1))
            .on('pointerup', (pointer, localX, localY, event) => {
                event.stopPropagation();
            })
            .setDepth(2);

        this.scene.add.existing(this.nextButton);
        this.scene.add.existing(this.prevButton);
    }

    changePage(direction) {
        let maxPage = Math.ceil(this.eyeKeys.length / this.eyesPerPage) - 1;
        this.page = Phaser.Math.Clamp(this.page + direction, 0, maxPage);
        this.displayEyes();
    }

    selectEyes(eyeKey) {
            console.log("Eye selected:", eyeKey);

            const eyeIndex = this.previewPlayer.getIndex(this.previewPlayer.eyes);
    
            // Remove previous hair sprite from preview player
            if (this.previewPlayer.eyes) {
                this.previewPlayer.eyes.destroy();
            }
        
            // Create new hair sprite
            this.previewPlayer.eyes = this.scene.add.sprite(
                avatar_parts[this.gender]?.['eyes']?.[eyeKey]?.["fitX"],
                avatar_parts[this.gender]?.['eyes']?.[eyeKey]?.["fitY"],
                eyeKey,
                0
            ).setOrigin(0.5, 0.5);
    
            // Add new hair to previewPlayer
            this.previewPlayer.addAt(this.previewPlayer.eyes, eyeIndex);
        }

    destroy() {
        this.container.destroy();
        this.nextButton.destroy();
        this.prevButton.destroy();
    }
}

class SkinSelection {
    constructor(scene, player, previewPlayer) {
        this.scene = scene;
        this.player = player;
        this.gender = player.head.texture.key.startsWith('m') ? 'male' : 'female';
        this.previewPlayer = previewPlayer;
        this.page = 0;
        this.eyesPerPage = 8; // 4 rows × 2 columns
        this.columns = 4;
        this.rows = 2;
        //this.eyeKeys = Array.from({ length: 6 }, (_, i) => `head${i}`); 
        this.eyeKeys = Array.from({ length: 6 }, (_, i) => `${this.gender === 'male' ? 'mhead' : 'head'}${i}`);
        this.hairKey = this.gender === 'male' ? 'mhair0' : 'hair23';
        this.container = this.scene.add.container(112, 279);
        this.displayEyes();
        this.createNavigationButtons();
    }

    displayEyes() {
        this.container.removeAll(true); // Clear previous page

        // Get current page's items
        const startIndex = this.page * this.eyesPerPage;
        const pageItems = this.eyeKeys.slice(startIndex, startIndex + this.eyesPerPage);

        let x = 0, y = 0;
        let hairOffset = this.gender === 'male' ? -23 : -9;
        let hairOffsetX = this.gender === 'male' ? -3 : 0;
        let spacingX = 122; // Adjust spacing
        let spacingY = 110;

        pageItems.forEach((eyeKey, index) => {
            let shopBlock = this.scene.add.image(x, y, 'sunBlockContainer').setOrigin(0.5, 0.5);
            let eyes = this.scene.add.image(x, y - 18, eyeKey).setInteractive().setOrigin(0.5, 0.5);
            let hair = this.scene.add.image(x + hairOffsetX, y + hairOffset, this.hairKey).setOrigin(0.5, 0.5);

            // Handle click to select hair
            eyes.on('pointerdown', () => {
                this.selectEyes(eyeKey, index);
            });
            eyes.on('pointerup', (pointer, localX, localY, event) => {
                event.stopPropagation();
            });

            this.container.add([shopBlock, eyes, hair]);
            this.container.setDepth(2);

            // Arrange in rows/columns
            x += spacingX;
            if ((index + 1) % this.columns === 0) {
                x = 0;
                y += spacingY;
            }
        });
    }

    createNavigationButtons() {
        // Next Page Button
        this.nextButton = this.scene.add.ellipse(578, 241, 20, 20, 0xffffff, 0)
            .setInteractive()
            .setScrollFactor(0)
            .on('pointerdown', () => this.changePage(1))
            .on('pointerup', (pointer, localX, localY, event) => {
                event.stopPropagation();
            })
            .setDepth(2);

        // Previous Page Button
        this.prevButton = this.scene.add.ellipse(578, 436, 20, 20, 0xffffff, 0)
            .setInteractive()
            .setScrollFactor(0)
            .on('pointerdown', () => this.changePage(-1))
            .on('pointerup', (pointer, localX, localY, event) => {
                event.stopPropagation();
            })
            .setDepth(2);

        this.scene.add.existing(this.nextButton);
        this.scene.add.existing(this.prevButton);
    }

    changePage(direction) {
        let maxPage = Math.ceil(this.eyeKeys.length / this.eyesPerPage) - 1;
        this.page = Phaser.Math.Clamp(this.page + direction, 0, maxPage);
        this.displayEyes();
    }

    selectEyes(eyeKey, index) {
            console.log("Head selected:", eyeKey);

            let bodyKey = this.gender === 'male' ? "mbody"+index : "body"+index;

            const eyeIndex = this.previewPlayer.getIndex(this.previewPlayer.head);
            const bodyIndex = this.previewPlayer.getIndex(this.previewPlayer.base);
    
            // Remove previous hair sprite from preview player
            if (this.previewPlayer.head) {
                this.previewPlayer.head.destroy();
            }

            if (this.previewPlayer.base) {
                this.previewPlayer.base.destroy();
            }
        
            // Create new head sprite
            this.previewPlayer.head = this.scene.add.image(
                heads['head']?.[this.gender]?.[eyeKey]?.fitX,
                heads['head']?.[this.gender]?.[eyeKey]?.fitY,
                eyeKey
            ).setOrigin(0.5, 0.5);
            
            // Create new body sprite
            this.previewPlayer.base = this.scene.add.sprite(
                body['body']?.[this.gender]?.[bodyKey]?.["fitX"],
                body['body']?.[this.gender]?.[bodyKey]?.["fitY"],
                bodyKey,
                0
            ).setOrigin(0.5, 0.5);
            this.previewPlayer.base.setData('direction', this.player.base.direction); // Add direction data to track facing

            // Add new hair to previewPlayer
            this.previewPlayer.addAt(this.previewPlayer.head, eyeIndex);
            this.previewPlayer.addAt(this.previewPlayer.base, bodyIndex);
        }

    destroy() {
        this.container.destroy();
        this.nextButton.destroy();
        this.prevButton.destroy();
    }
}

export function preloadSunBlockAssets(scene){
    scene.load.image('sunBlockMenu', '../assets/ui/shops/sun_block_empty.png')
    scene.load.image('sunBlockContainer', '../assets/ui/shops/sun_block_container.png')
}