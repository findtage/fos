export class TypeBoo extends Phaser.Scene {
    constructor() {
        super({ key: 'TypeBoo' });
    }

    preload() {
        this.sound.stopAll(); 

        // Load assets if not already loaded in another scene
        this.load.image('end_game', 'assets/mini_games/TypeBoo/end_game.png');
        this.load.image('gameBackdrop_typeBoo', 'assets/mini_games/TypeBoo/gameBackdrop_TypeBoo.png');
        this.load.image('gameOverMsg_typeBoo', 'assets/mini_games/TypeBoo/gameOverMsg_typeBoo.png');
        this.load.image('game_screen_typeBoo', 'assets/mini_games/TypeBoo/gameScene_TypeBoo.png');

        this.load.spritesheet('ghost1_typeBoo', 'assets/mini_games/TypeBoo/ghost1_TypeBoo.png', {
            frameWidth: 163,
            frameHeight: 184,
        });
        this.load.spritesheet('ghost2_typeBoo', 'assets/mini_games/TypeBoo/ghost2_TypeBoo.png', {
            frameWidth: 171,
            frameHeight: 253,
        });
        this.load.spritesheet('ghost3_typeBoo', 'assets/mini_games/TypeBoo/ghost3_TypeBoo.png', {
            frameWidth: 84,
            frameHeight: 85,
        });
        this.load.spritesheet('lives_typeBoo', 'assets/mini_games/TypeBoo/lives_TypeBoo.png', {
            frameWidth: 160,
            frameHeight: 47,
        });

        this.load.image('introScene_typeBoo', 'assets/mini_games/TypeBoo/introScene_TypeBoo.png');
        this.load.image('lifeFlash_typeBoo', 'assets/mini_games/TypeBoo/lifeFlash_TypeBoo.png');

        this.load.audio('rightLetter_typeBoo', '../assets/mini_games/TypeBoo/right_letter.mp3');
        this.load.audio('wrongLetter_typeBoo', '../assets/mini_games/TypeBoo/wrong_letter.mp3');
        this.load.audio('wordMissed_typeBoo', '../assets/mini_games/TypeBoo/word_missed.mp3');
        this.load.audio('ghost1_destroyed_typeBoo', '../assets/mini_games/TypeBoo/ghost1_destroyed.mp3');
        this.load.audio('ghost2_destroyed_typeBoo', '../assets/mini_games/TypeBoo/ghost2_destroyed.mp3');
        this.load.audio('ghost3_destroyed_typeBoo', '../assets/mini_games/TypeBoo/ghost3_destroyed.mp3');
        this.load.audio('bgMusic_typeBoo', '../assets/mini_games/TypeBoo/bgMusic.mp3');
        
    }

    create() {
        this.isGameOver = false;
        this.onIntro = true;
        this.wordSpeed = 0.001;
        this.scoreScale = 0;
        this.sound.play('bgMusic_typeBoo', { loop: true, volume: 0.5}); 

        // Intro 
        let intro = this.add.image(444, 95, 'introScene_typeBoo').setOrigin(0.5, 0.5);
        this.startButton = this.add.ellipse(398, 423, 100, 100, 0xffffff, 0).setOrigin(0.5).setInteractive();

        this.startButton.on('pointerdown', () => {
            intro.destroy();
            this.startButton.destroy();
            this.onIntro = false;

            // Background
            this.add.image(0, -67, 'gameBackdrop_typeBoo').setOrigin(0.13934182141624724, 0.31577596567207944).setScale(1.002, 1.002);
            this.add.rectangle(336, 30, 170, 58).setOrigin(0.5, 0.5).setFillStyle(0x2f2f2f, 0.47);
            this.add.image(0, 0, 'game_screen_typeBoo').setOrigin(0.13934182141624724, 0.31577596567207944).setScale(1.002, 1.002);

            // Lives
            this.lives = 4;
            this.livesSprite = this.add.sprite(331, 31, 'lives_typeBoo', 0).setScale(1.002, 1.002);

            // Score
            this.score = 0;
            this.scoreText = this.add.text(540, 16, `${this.score}`);
            this.scoreText.setStyle({ "fontFamily": "arial", "fontSize": "30px", "fontStyle": "bold", "color": "#ffff00", "stroke": "#000", "strokeThickness": 4});

            // Word pool
            this.wordList = getWordList();
            this.ghosts = [];

            // Spawn first set of ghosts
            this.spawnGhost();
            this.spawnGhost();
            this.spawnGhost();

            // Input
            this.input.keyboard.on('keydown', this.handleKeyPress, this);      
        });
    }

    spawnGhost() {
        if (this.isGameOver) {
            return; // Prevent new ghosts from spawning
        }
        
        if (this.ghosts.length >= 3) return;
    
        // Choose a ghost type that is not already present
        let availableTypes = ['ghost1_typeBoo', 'ghost2_typeBoo', 'ghost3_typeBoo'].filter(type => 
            !this.ghosts.some(g => g.sprite.texture.key === type)
        );
    
        if (availableTypes.length === 0) return; // No available types left
    
        let ghostType = Phaser.Utils.Array.GetRandom(availableTypes);
        let word = Phaser.Utils.Array.GetRandom(this.wordList);
    
        // Spawn at a random position anywhere on screen
        let x = Phaser.Math.Between(82, 722);
        let y = Phaser.Math.Between(80, 445);
    
        let ghost = {
            sprite: this.add.sprite(x, y, ghostType).setScale(0.1),
            text: this.add.text(x, y+25, word, { fontSize: '16px', fill: '#ffff00', fontFamily: "arial" }).setOrigin(0.5).setStyle({
                "color": "#ffff00", 
                "fontFamily": "arial", 
                "fontSize": "16px", 
                "fontStyle": "bold", 
                "stroke": "#000", 
                "strokeThickness": 4, 
                "shadow.offsetX": 2222, 
                "shadow.fill": true
            }), // Word above ghost
            word,
            typed: '',
            scaleSpeed: this.wordSpeed
        };
    
        this.ghosts.push(ghost);
    }
    

    handleKeyPress(event) {
        let key = event.key.toLowerCase();
        if (!/^[a-z ]$/.test(key) && key !== 'backspace') return;
    
        let activeGhost = this.ghosts.find(g => g.typed.length > 0); // Find currently typed ghost
    
        // If no active ghost, allow the player to start typing any word
        if (!activeGhost) {
            activeGhost = this.ghosts.find(g => g.word.startsWith(key));

            if (!activeGhost) {
                this.score -= 10;
                this.sound.play('wrongLetter_typeBoo'); 
                this.updateScore();
                return;
            }
        }

        if (!activeGhost) return; // If no valid word, ignore input
    
        if (key === 'backspace') {
            activeGhost.typed = '';
            activeGhost.text.setText(activeGhost.word); // Reset word display
            this.score -= 10;
            this.sound.play('wrongLetter_typeBoo'); 
            this.updateScore();
            return;
        }
    
        if (activeGhost.word.startsWith(activeGhost.typed + key)) {
            this.sound.play('rightLetter_typeBoo'); 

            activeGhost.typed += key;
            this.score += 10;
            this.updateScore();
    
            // Remove typed letters from the displayed word
            activeGhost.text.setText(activeGhost.word.slice(activeGhost.typed.length));
    
            if (activeGhost.typed === activeGhost.word) {
                this.ghosts = this.ghosts.filter(g => g !== activeGhost);
                activeGhost.sprite.destroy();
                activeGhost.text.destroy(); // Remove the word
                this.score += 100;

                if (activeGhost.sprite.texture.key === 'ghost1_typeBoo') {
                    this.sound.play('ghost1_destroyed_typeBoo'); 
                } else if (activeGhost.sprite.texture.key === 'ghost2_typeBoo') {
                    this.sound.play('ghost2_destroyed_typeBoo'); 
                } else if (activeGhost.sprite.texture.key === 'ghost3_typeBoo') {
                    this.sound.play('ghost3_destroyed_typeBoo'); 
                }

                this.updateScore();
                this.spawnGhost();
            }
        } else {
            this.score -= 10;
            this.sound.play('wrongLetter_typeBoo'); 
            this.updateScore();
        }
    }

    // Fix later
    updateScore() {
        this.scoreText.setText(`${this.score}`);

        // Scale based on score
        if (this.scoreScale + 5000 < this.score && this.scoreScale < 30000){
            this.scoreScale += 5000;
            console.log("Score scale is now", this.scoreScale)
            this.wordSpeed += 0.0005;
            console.log("Current speed is:", this.wordSpeed);
        }
    }

    update(time, delta) {

        if (this.isGameOver){
            return;
        }
        if (this.onIntro){
            return;
        }
        
        this.ghosts.forEach(ghost => {
            let scaleAdjustment = ghost.scaleSpeed * (delta / 16.67); // Normalize for 60 FPS
            ghost.sprite.setScale(ghost.sprite.scale + scaleAdjustment);

            if (ghost.sprite.scale >= 1) {
                this.loseLife();
                this.sound.play('wordMissed_typeBoo'); 
    
                // Destroy both the ghost and its word
                ghost.sprite.destroy();
                ghost.text.destroy();

                if (!this.isGameOver){
                    this.ghosts = this.ghosts.filter(g => g !== ghost);
                    this.spawnGhost();
                }
            }
        });
    }

    loseLife() {
        this.lives--;

        let flash = this.add.image(403, 259, 'lifeFlash_typeBoo').setOrigin(0.5, 0.5).setScale(1.002, 1.002).setAlpha(0.5);
    
        this.tweens.add({
            targets: flash,
            alpha: 0, // Fade out
            duration: 1000, // 1 second
            onComplete: () => {
                flash.destroy(); // Remove the flash after fading out
            }
        });
    
        if (this.lives >= 0) {
            this.livesSprite.setFrame(4 - this.lives); // Update sprite to match lives left
        }
    
        if (this.lives <= 0) {
            this.livesSprite.destroy();
            this.gameOver();
        }
    }
    
    gameOver() {
        if (this.isGameOver) return; // Prevent multiple gameOver triggers
    
        this.isGameOver = true;
    
        // Ensure all ghosts and words are completely removed
        this.ghosts.forEach(ghost => {
            if (ghost.sprite) ghost.sprite.destroy();
            if (ghost.text) ghost.text.destroy();
        });
    
        // Completely clear the ghosts array
        this.ghosts = [];
    
        // Stop all game updates and prevent new ghosts from spawning
        this.time.removeAllEvents(); // Stops any scheduled events
        this.input.keyboard.removeAllListeners(); // Disable player input
        
        // Display "Game Over" text
        let gameOverMsg = this.add.image(435, 290, 'gameOverMsg_typeBoo').setOrigin(0.5, 0.5);

        
    
        this.tweens.add({
            targets: gameOverMsg,
            alpha: 0, // Fade out
            duration: 1000, // 1 second
            onComplete: () => {
                this.showPoints(); // 
            }
        });
    }

    showPoints(){
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
            this.scene.start('CastleInside');
        });
    }
}



function getWordList(){
    const standardwords = ["a","an","able","about","artifact","aliens","across","act","addition","adjustment","advertisement","after","against","again","agreement","air","all","almost","among","amount","amusement","and","angle","animal","answer","ant","any","apparatus","apple","approval","arch","arm","art","cub","attempt","attention","pirates","at","authority","automatic","awake","a","baby","back","ninjas","bag","balance","ball","band","bank","base","basin","basket","beautiful","because","bee","before","behavior","belief","bell","bent","berry","between","be","bird","bitter","bit","blade","blue","board","boat","book","boot","box","brain","brake","branch","brass","bread","breath","brick","bridge","bright","broken","brother","koala","brush","bucket","building","bulb","panda","burst","business","butter","button","but","by","cake","camera","canvas","card","care","carriage","cart","cat","cause","certain","chain","chalk","chance","change","cheese","chief","chin","circle","clean","clear","clock"
        ,"cloth","cloud","coal","coat","cold","collar","colour","comb","comfort","scientist","common","company","pancakes","competition","complete","complex","condition","connection","conscious","control","cook","copper","copy","cord","cork","cotton","cough","country","cover","cow","credit","cry","cup","current","curtain","curve","cushion","gopher","danger","dark","day","dear","fox","decision","degree","delicate","dependent","design","gnome","detail","waffles","different","agent","direction","discovery","discussion","distance","kitten","division","dog","door","doubt","down","do","drain","drawer","dress","driving","drop","dry","dust","early","earth","ear","east","edge","education","effect","egg","elastic","electric","else","end","engine","enough","equal","error","event","even","every","ever","example","exchange","expansion","experience","expert","eye","face","fact","fall","false","family","farm","far","magician","fear","feather","feelings","fiction","field","fire","first","fish","fixed","flag","flame"
        ,"flat","flight","floor","flower","fly","fold","food","foolish","foot","force","fork","form","forward","for","fowl","frame","free","frequent","friend","from","front","fruit","full","future","garden","general","get","give","glass","glove","goat","gold","good","go","got","grain","grass","great","green","grey","grip","group","growth","guide","hair","hammer","hand","welcome","happy","harbor","harmony","hat","have","healthy","hearing","heart","hear","heat","help","he","history","hole","hollow","hook","hope","horse","hospital","hour","house","how","humour","ice","idea","if","important","impulse","increase","fantastic","ink","insect","instrument","magic","interest","invention","in","iron","island","jewel","join","journey","judge","jump","keep","kettle","key","kick","kind","knee","knot","knowledge","lamp","land","language","last","late","laugh","law","lead","leaf","learning","leather","left","leg","letter","let","level","library","lift","light","like","limit","linen","line","liquid","list","little"
        ,"living","lock","long","look","loose","loss","loud","wallpaper","low","machine","make","costume","manager","man","map","market","mark","mass","match","material","may","me","meal","measure","static","medical","meeting","memory","metal","middle","milk","mind","mine","minute","mist","mixed","money","monkey","month","moon","morning","puppy","motion","mountain","move","much","muscle","music","nail","name","narrow","nation","natural","near","necessary","neck","need","nerve","net","news","new","night","noise","normal","north","nose","note","not","now","no","number","kangaroo","offer","office","off","of","oil","old","only","on","open","ice cream","opinion","opposite","orange","order","vacation","ornament","or","other","out","oven","over","owner","page","paint","arena","paper","parallel","gifts","part","paste","past","cereal","peace","pencil","pen","person","orb","picture","pig","pin","place","plane","plant","plate","play","please","blog","pocket","point","polish","poor","pop","pasta","chocolate"
        ,"possible","potato","wizard","power","present","price","print","christmas","thanksgiving","halloween","comic","property","voting","pull","helicopter","purpose","push","put","quality","question","quick","quiet","quite","rail","rain","range","rate","rat","ray","reaction","reading","ready","reason","receipt","record","red","regret","regular","request","respect","responsible","rest","reward","rhythm","rice","right","ring","river","road","roll","roof","room","root","round","rub","rule","run","sad","safe","sail","salt","same","sand","say","scale","school","science","scissors","seat","sea","second","secret","seed","seem","see","selection","self","send","sense","separate","weird","shade","shake","shame","sharp","sheep","shelf","ship","shirt","shock","shoe","short","side","sign","silk","silver","simple","sister","size","skin","skirt","sky","sleep","slip","slope","slow","small","smell","smile","smooth","snake","sneeze","snow","soap","sock","soft","solid","some","song","son","sort","sound","soup"
        ,"south","so","space","spade","special","sponge","spoon","spring","square","stage","stamp","start","star","pizza","station","steam","steel","stem","step","still","stitch","stocking","stomach","stone","stop","store","story","straight","strange","street","stretch","strong","supreme","super","such","sudden","sugar","suggestion","summer","sun","support","surprise","sweet","swim","system","table","tail","take","talk","tall","tax","teaching","tendency","test","than","that","the","then","they","theory","there","thing","thin","this","thought","thread","through","thumb","thunder","ticket","tight","till","time","tin","tired","toe","together","tomorrow","tooth","top","town","to","trade","train","transport","tray","tree","trick","trouble","true","turn","twist","umbrella","under","unit","up","use","value","verse","very","vessel","view","voice","waiting","walk","wall","warm","wash","waste","watch","water","wave","wax","way","weather","week","weight","well","west","wheel","when","where","while","whistle"
        ,"who","why","wide","will","window","wind","wing","winter","wire","wise","with","wood","wool","word","work","worm","writing","wrong","year","yellow","yesterday","yes","young","you"];
        
    
    const relatedwords = ["dr finkelstein","officer russell","alby","conal","truffle","hopper","jelly","memory mixup","saguaro","tori","gobbles","umi","pye","ursa","macaroni","quackers","alpine","bricks breaking","creature arena","pegleg pete","mission center","musa","scarlet","jelly fishin","snack tac toe","top models inc.","rex","bobo fish","orion","fruit stack","stella","stellar salon","michelle","le shop","loco boardz","star cafe","michael","uptown","jesters","clara","idfone","ottomans","buzzer beater","candy swap","grotto","bubble bug","magic pop","staries","type boo","mouse out","snow day","yeti","galaxy hero","pearly pop","whack a veggie","rocket board","moodies","go cart","arcade","theme park","fan art","putt putt","stickers","comet","kawaii","sun block","lighthouse","carnival","castle","boxy","splash","forest","beach","creature","weatherbot","downtown","jigsaw jigsaw","fantage"];
    
    return standardwords.concat(relatedwords);
    
}
    
