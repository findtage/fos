export class MouseOut extends Phaser.Scene {
    constructor() {
        super({ key: "MouseOut" });
    }

    preload() {
        this.load.image('intro_scene_MouseOut', '../assets/mini_games/MouseOut/intro_screen.png');
        this.load.image('difficulty_scene_MouseOut', '../assets/mini_games/MouseOut/difficulty_screen.png');
        this.load.image('game_scene_MouseOut', '../assets/mini_games/MouseOut/game_scene.png');
        this.load.image('easy_button_MouseOut', '../assets/mini_games/MouseOut/easy.png');
        this.load.image('med_button_MouseOut', '../assets/mini_games/MouseOut/med.png');
        this.load.image('hard_button_MouseOut', '../assets/mini_games/MouseOut/hard.png');
        this.load.image('hex_MouseOut', '../assets/mini_games/MouseOut/hex.png');
        this.load.image('end_game_MouseOut', '../assets/mini_games/MouseOut/end_game.png');
        this.load.spritesheet('mouse_MouseOut', '../assets/mini_games/MouseOut/mouse.png', {
            frameWidth: 38,
            frameHeight: 35
        });
        this.load.spritesheet('wall_MouseOut', '../assets/mini_games/MouseOut/trap.png', {
            frameWidth: 41,
            frameHeight: 131
        });

        this.load.audio('winningSound_MouseOut', '../assets/mini_games/MouseOut/1_MouseOutWinningSound.mp3');
        this.load.audio('moveSound_MouseOut',    '../assets/mini_games/MouseOut/2_MouseOutMoveSound.mp3');
        this.load.audio('raiseSound_MouseOut',   '../assets/mini_games/MouseOut/3_MouseOutSoundRaise.mp3');
        this.load.audio('gameOverSound_MouseOut','../assets/mini_games/MouseOut/4_MouseOutGameOverSound.mp3');
    }

    create() {
        // Start with Intro
        this.currentMode = 'intro';
        this.mouseOnEdge = false;
        this.isGameOver = false;
        this.showIntro();
        
    }

    /* ------------------------------------------------
     * INTRO SCREEN
     * ------------------------------------------------ */
    showIntro() {
        this.introBG = this.add.image(-4, 0, 'intro_scene_MouseOut').setOrigin(0).setScale(1.008, 1.008);

        // Start button (invisible ellipse over the region)
        this.startButton = this.add.ellipse(136, 399, 95, 95, 0xffffff, 0).setOrigin(0.5).setInteractive();
        console.log("Adding start button")
        this.startButton.on('pointerdown', () => {
            this.introBG.destroy();
            this.startButton.destroy();

            // Go to difficulty
            this.currentMode = 'difficulty';
            this.showDifficulty();
        });
    }

    /* ------------------------------------------------
     * DIFFICULTY SELECTION
     * ------------------------------------------------ */
    showDifficulty() {
        // Background
        this.diffBG = this.add
            .image(-23, -61, 'difficulty_scene_MouseOut')
            .setOrigin(0)
            .setScale(0.9, 0.9);
    
        // Easy button
        this.easyBtn = this.add
            .image(209, 316, 'easy_button_MouseOut')
            .setInteractive()
            .setScale(0.9, 0.9);
    
        this.easyBtn.on('pointerdown', () => {
            this.selectDifficulty('Easy');
        });
    
        // Medium button
        this.medBtn = this.add
            .image(409, 316, 'med_button_MouseOut')
            .setInteractive()
            .setScale(0.9, 0.9);
    
        this.medBtn.on('pointerdown', () => {
            this.selectDifficulty('Medium');
        });
    
        // Hard button
        this.hardBtn = this.add
            .image(606, 316, 'hard_button_MouseOut')
            .setInteractive()
            .setScale(0.9, 0.9);
    
        this.hardBtn.on('pointerdown', () => {
            this.selectDifficulty('Hard');
        });
    }
    
    // A separate helper to destroy and start game
    selectDifficulty(level) {
        this.selectedDifficulty = level;
    
        // Destroy BG
        this.diffBG.destroy();
    
        // Destroy all difficulty buttons
        this.easyBtn.destroy();
        this.medBtn.destroy();
        this.hardBtn.destroy();
    
        // Go to game
        this.currentMode = 'game';
        this.startGame();
    }

    /* ------------------------------------------------
     * START GAME
     * ------------------------------------------------ */
    startGame() {
        this.gameBG = this.add.image(632, 255, 'game_scene_MouseOut').setOrigin(0.5, 0.5);

        // Grid/hex offsets
        this.gridSize = 11;
        this.evenRowStartX = 284;  // for row % 2 == 0
        this.oddRowStartX = 304;   // for row % 2 == 1
        this.colSpacing = 40;      // horizontal gap
        this.rowSpacing = 34;      // vertical gap
        this.baseY = 98;           // starting Y

        this.walls = new Set();
        // Mouse in center => (5,5)
        this.mousePos = { x: 5, y: 5 };
        this.turnCount = 0;

        // Build hex grid
        this.createHexGrid();
        // Difficulty walls
        this.placeWallsBasedOnDifficulty(this.selectedDifficulty);
        // Draw mouse
        this.drawMouse();

        // On click => place a wall
        this.input.on('pointerdown', this.handleWallPlacement, this);
    }

    /* ------------------------------------------------
     * CREATE HEX GRID
     * ------------------------------------------------ */
    createHexGrid() {
        this.hexagons = [];
        for (let row = 0; row < this.gridSize; row++) {
            // even row => row%2=0 => x=284
            // odd row => row%2=1  => x=304
            const rowStartX = (row % 2 === 0) ? this.evenRowStartX : this.oddRowStartX;
            const y = this.baseY + row * this.rowSpacing;

            for (let col = 0; col < this.gridSize; col++) {
                const x = rowStartX + col * this.colSpacing;
                // Place the hex
                let tileSprite = this.add.image(x, y, 'hex_MouseOut');
                tileSprite.setInteractive();

                let previewSprite = this.add
                .image(x, y + 19, 'wall_MouseOut')
                .setAlpha(1)
                .setVisible(false);

                let tileData = {
                    row,
                    col,
                    x,
                    y,
                    hasWall: false,
                    tileSprite: tileSprite,
                    previewSprite: previewSprite
                };

                tileSprite.on('pointerover', () => {
                    const isMouseTile = (tileData.row === this.mousePos.x && tileData.col === this.mousePos.y);
                    if (!tileData.hasWall && !isMouseTile) {
                        tileData.previewSprite.setVisible(true);
                    }
                });
    
                // Hover out: always hide the preview
                tileSprite.on('pointerout', () => {
                    tileData.previewSprite.setVisible(false);
                });

                // Store for reference
                this.hexagons.push(tileData);
            }
        }
    }

    /* ------------------------------------------------
     * PLACE WALLS PER DIFFICULTY
     * ------------------------------------------------ */
    placeWallsBasedOnDifficulty(level) {
        const wallCountMap = { Easy: 23, Medium: 18, Hard: 5 };
        let wallCount = wallCountMap[level] || 5;

        while (wallCount > 0) {
            const rx = Phaser.Math.Between(0, 10);
            const ry = Phaser.Math.Between(0, 10);

            if (!(rx === 5 && ry === 5) && !this.walls.has(`${rx},${ry}`)) {
                this.walls.add(`${rx},${ry}`);
                const idx = rx * this.gridSize + ry;
                const hexRef = this.hexagons[idx];
                // Place wall at (x, y+19)
                this.add.sprite(hexRef.x, hexRef.y + 19, 'wall_MouseOut', 15).setDepth(hexRef.y+19);
                wallCount--;
            }
        }
    }

    /* ------------------------------------------------
     * DRAW MOUSE
     * ------------------------------------------------ */
    drawMouse() {
        if (this.mouseSprite) {
            this.mouseSprite.destroy();
        }
        const idx = this.mousePos.x * this.gridSize + this.mousePos.y;
        const hexRef = this.hexagons[idx];
        this.mouseSprite = this.add.sprite(hexRef.x, hexRef.y - 14, 'mouse_MouseOut', 0).setDepth(hexRef.y-14);
        this.createAnimations();
        this.mouseSprite.play('mouseIdle');
    }

    createAnimations(){
        this.anims.create({
            key: 'mouseIdle',
            frames: this.anims.generateFrameNumbers('mouse_MouseOut', { frames: [0, 1, 3, 4, 0, 1, 3, 4, 5] }),
            frameRate: 12,
            repeat: -1,
        });

        let trap_frames = [...Array(16).keys()];
        this.anims.create({
            key: 'createWall',
            frames: this.anims.generateFrameNumbers('wall_MouseOut', { frames: trap_frames }),
            frameRate: 16,
            repeat: 0,
        });
    }

    /* ------------------------------------------------
     * WALL PLACEMENT (pointerdown)
     * ------------------------------------------------ */
    handleWallPlacement(pointer) {
        

        // Find the closest hex
        const nearestHex = this.hexagons.reduce((prev, curr) => {
            const dCurr = Phaser.Math.Distance.Between(pointer.x, pointer.y, curr.x, curr.y);
            const dPrev = Phaser.Math.Distance.Between(pointer.x, pointer.y, prev.x, prev.y);
            return dCurr < dPrev ? curr : prev;
        });

        if (nearestHex.row === this.mousePos.x && nearestHex.col === this.mousePos.y) {
            // Optionally play an error sound, or show a \"can't place here\" message
            return;
        }

        const idx = this.hexagons.indexOf(nearestHex);
        const rx = Math.floor(idx / this.gridSize);
        const ry = idx % this.gridSize;

        if (!this.walls.has(`${rx},${ry}`)) {
            this.walls.add(`${rx},${ry}`);

            nearestHex.hasWall = true;
            nearestHex.previewSprite.setVisible(false);

            // Place wall (x, y+19)
            let wall = this.add.sprite(nearestHex.x, nearestHex.y + 19, 'wall_MouseOut', 0).setDepth(nearestHex.y+19);
            wall.play('createWall');
            this.input.off('pointerdown', this.handleWallPlacement, this);
            this.sound.play('raiseSound_MouseOut');      

            wall.on('animationcomplete', () => {
                // This code will run only after the animation is complete
                this.turnCount++;
                if (this.mouseOnEdge) {
                    const { dx, dy } = this.getEscapeOffset(this.mousePos.x, this.mousePos.y);
        
                    this.tweens.add({
                        targets: this.mouseSprite,
                        x: this.mouseSprite.x + dx,
                        y: this.mouseSprite.y + dy,
                        alpha: 0,
                        duration: 1000,
                        ease: 'Power1',
                        onComplete: () => {
                            this.gameOver("Mouse Escaped!");
                        }
                    });
                    return;
                } else {
                    this.moveMouse();
                    if (this.isGameOver == false)
                        this.input.on('pointerdown', this.handleWallPlacement, this);
                }
                
            });
        }
    }

    /* ------------------------------------------------
     * MOUSE MOVEMENT
     * ------------------------------------------------ */
    moveMouse() {
        // BFS for next step
        const nextStep = this.findNextStepToExit();
        if (nextStep) {
            // Move one step
            this.mousePos.x = nextStep.x;
            this.mousePos.y = nextStep.y;
            this.drawMouse();

            // If on edge => escape
            if (this.isMouseAtEdge()) {
                this.mouseOnEdge = true;
            }
        } else {
            // No path => random among 6 neighbors
            this.moveMouseRandomly();
        }
        this.sound.play('moveSound_MouseOut');
    }

    /* ------------------------------------------------
     * BFS: find path to nearest open edge
     * Return only the next step
     * ------------------------------------------------ */
    findNextStepToExit() {
        const start = { x: this.mousePos.x, y: this.mousePos.y };
        const visited = new Set();
        const queue = [];
        const parentMap = {};

        function key(pos) {
            return `${pos.x},${pos.y}`;
        }
        queue.push(start);
        visited.add(key(start));
        parentMap[key(start)] = null;

        let foundEdge = null;

        // BFS
        while (queue.length > 0) {
            const current = queue.shift();
            if (this.isEdge(current.x, current.y)) {
                foundEdge = current;
                break;
            }
            // Check 6 neighbors
            const neighbors = this.getHexNeighbors(current.x, current.y);
            for (let n of neighbors) {
                const k = key(n);
                // not visited + not a wall
                if (!visited.has(k) && !this.walls.has(k)) {
                    visited.add(k);
                    parentMap[k] = current;
                    queue.push(n);
                }
            }
        }

        if (!foundEdge) {
            return null;
        }

        // Reconstruct path
        const path = [];
        let p = foundEdge;
        while (p) {
            path.unshift(p);
            p = parentMap[key(p)];
        }
        // path[0] => start, path[path.length-1] => nearest edge
        // We want next step => path[1], if it exists
        if (path.length > 1) {
            return path[1];
        }
        return null;
    }

    /* ------------------------------------------------
     * Move randomly among 6 neighbors if no BFS path
     * ------------------------------------------------ */
    moveMouseRandomly() {
        const neighbors = this.getHexNeighbors(this.mousePos.x, this.mousePos.y);
        // Filter out walls
        const open = neighbors.filter(n => !this.walls.has(`${n.x},${n.y}`));
        if (open.length > 0) {
            const move = Phaser.Math.RND.pick(open);
            this.mousePos.x = move.x;
            this.mousePos.y = move.y;
            this.drawMouse();
        } else {
            // No moves => trapped
            this.gameOver('Mouse Trapped!');
        }
    }

    /* ------------------------------------------------
     * HEX-BASED NEIGHBORS: 6 directions
     * For \"odd-r horizontal layout\"
     * row%2=0 => even row => offsetsEven
     * row%2=1 => odd row => offsetsOdd
     * ------------------------------------------------ */
    getHexNeighbors(rx, ry) {
        const rowParity = rx % 2;
        // Even row offsets (row%2==0)
        const offsetsEven = [
            { dx: -1, dy: 0 }, // NW
            { dx: -1, dy: -1 },// NE
            { dx: 0,  dy: -1 },// E
            { dx: 0,  dy: 1 }, // W
            { dx: 1,  dy: 0 }, // SW
            { dx: 1,  dy: -1 } // SE
        ];
        // Odd row offsets (row%2==1)
        const offsetsOdd = [
            { dx: -1, dy: 0 }, // NW
            { dx: -1, dy: 1 }, // NE
            { dx: 0,  dy: -1 },// E
            { dx: 0,  dy: 1 }, // W
            { dx: 1,  dy: 0 }, // SW
            { dx: 1,  dy: 1 }  // SE
        ];

        const offsets = (rowParity === 0) ? offsetsEven : offsetsOdd;
        const neighbors = [];
        for (let o of offsets) {
            const nx = rx + o.dx;
            const ny = ry + o.dy;
            // in-bounds
            if (nx >= 0 && nx < this.gridSize && ny >= 0 && ny < this.gridSize) {
                neighbors.push({ x: nx, y: ny });
            }
        }
        return neighbors;
    }

    /* ------------------------------------------------
     * EDGE CHECK
     * ------------------------------------------------ */
    isMouseAtEdge() {
        return (
            this.mousePos.x === 0 ||
            this.mousePos.x === this.gridSize - 1 ||
            this.mousePos.y === 0 ||
            this.mousePos.y === this.gridSize - 1
        );
    }
    isEdge(rx, ry) {
        return rx === 0 || rx === (this.gridSize - 1) || ry === 0 || ry === (this.gridSize - 1);
    }

    getEscapeOffset(rx, ry) {
        // If BFS says rx=0 => that's top in layout
        if (rx === 0) {
            // Move screen sprite up
            return { dx: 0, dy: -50 };
        }
        // If BFS says rx=10 => bottom in layout
        if (rx === this.gridSize - 1) {
            return { dx: 0, dy: 50 };
        }
        // If BFS says ry=0 => left
        if (ry === 0) {
            return { dx: -50, dy: 0 };
        }
        // If BFS says ry=10 => right
        if (ry === this.gridSize - 1) {
            return { dx: 50, dy: 0 };
        }
        return { dx: 0, dy: 0 };
    }

    /* ------------------------------------------------
     * SCORING & GAME OVER
     * ------------------------------------------------ */
    gameOver(msg) {
        // No more walls
        this.input.off('pointerdown', this.handleWallPlacement, this);
        this.isGameOver = true;

        let score = Math.max(0, 121 - this.turnCount);
        if (msg == 'Mouse Trapped!'){
            if (this.selectedDifficulty == 'Easy'){
                score += 20;
            } else if (this.selectedDifficulty == 'Medium'){
                score += 35;
            } else {
                score += 50;
            }
            this.sound.play('winningSound_MouseOut');
        } else {
            if (this.selectedDifficulty == 'Easy'){
                score = this.turnCount-23;
            } else if (this.selectedDifficulty == 'Medium'){
                score = this.turnCount-18;
            } else {
                score = this.turnCount-5;
            }
            score = this.turnCount;
            this.sound.play('gameOverSound_MouseOut');
        }

        let stars = Math.floor(score/2)
        
        const screen_tint = this.add.rectangle(0, 0, 800, 520).setOrigin(0, 0).setScrollFactor(0).setDepth(600);
		screen_tint.isFilled = true;
		screen_tint.fillColor = 0;
		screen_tint.fillAlpha = 0.4;
		screen_tint.strokeColor = 11184810;

        this.add.image(0, 0, 'end_game_MouseOut').setOrigin(0).setDepth(600);

        const score_text = this.add.text(575, 143, "", {}).setDepth(600);
		score_text.text = score;
		score_text.setStyle({ "align": "right", "fontFamily": "Arial", "fontStyle": "bold" });

		const stars_earned = this.add.text(541, 173, "", {}).setDepth(600);
		stars_earned.text = stars+" Stars";
		stars_earned.setStyle({ "align": "right", "fontFamily": "Arial", "fontStyle": "bold" });

        const exit_button = this.add.rectangle(400, 308, 84, 27, 0xffffff, 0).setInteractive().setDepth(600);
        
        exit_button.on('pointerup', (pointer, localX, localY, event) => {
            this.scene.start('Castle');
        });
    }
}
