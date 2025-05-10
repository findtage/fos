export class RuffleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'RuffleScene' });
    }

    init(data){
        this.swfName = data.gameName;
        this.gameStarted = false;
    }

    preload() {
        // Load any assets needed for this scene
        this.load.image('end_game', 'assets/mini_games/end_game.png');
    }

    create() {
        this.scene.pause(); // Pause the current Phaser scene
        this.launchSWFGame();
    }

    launchSWFGame() {
        console.log('Launching SWF game...'); // Debug log
    
        // Create a container for the SWF game
        const swfContainer = document.createElement('div');
        swfContainer.id = 'swf-container';
        swfContainer.style.position = 'absolute';
        swfContainer.style.top = '0';
        swfContainer.style.left = '0';
        swfContainer.style.width = '800px';
        swfContainer.style.height = '520px';
        swfContainer.style.zIndex = '3'; // Ensure SWF is above Phaser canvas
    
        // Append the SWF container to the Phaser game container
        const gameContainer = document.getElementById('game-container');
        if (!gameContainer) {
            console.error('Game container not found!');
            return;
        }
        gameContainer.appendChild(swfContainer);
        this.gameStarted = true;
    
        // Load the SWF file using Ruffle
        const objectTag = document.createElement('object');
        objectTag.setAttribute('width', '800');
        objectTag.setAttribute('height', '520');
        objectTag.setAttribute('data', 'assets/mini_games/'+this.swfName+'.swf');
        objectTag.setAttribute('type', 'application/x-shockwave-flash');
        swfContainer.appendChild(objectTag);
    
        // Listen for the score from the SWF game
        window.handleScore = (score) => {
            if (this.gameStarted){
                this.score = score;
                this.gameStarted = false;
                
                swfContainer.style.zIndex = '2'; // Ensure SWF is above Phaser canvas
                // Resume the Phaser scene
                this.scene.resume();

                let stars = Math.round(this.score / 150);

                this.add.image(0, 0, 'end_game').setOrigin(0).setDepth(600);

                const score_text = this.add.text(560, 143, "", {}).setDepth(600);
                score_text.text = this.score;
                score_text.setStyle({ "align": "right", "fontFamily": "Arial", "fontStyle": "bold" });

                const stars_earned = this.add.text(535, 173, "", {}).setDepth(600);
                stars_earned.text = stars+" Stars";
                stars_earned.setStyle({ "align": "right", "fontFamily": "Arial", "fontStyle": "bold" });

                const exit_button = this.add.rectangle(400, 308, 84, 27, 0xffffff, 0).setInteractive().setDepth(600);
                
                exit_button.on('pointerup', (pointer, localX, localY, event) => {
                    gameContainer.removeChild(swfContainer);
                    exit_button.destroy();
                    this.scene.start('CreatureArea');
                });

                swfContainer.style.pointerEvents = 'none';
            }
            
        };
    }
}