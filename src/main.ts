import Phaser, { Math } from "phaser";

export default class MainScene extends Phaser.Scene {
    vaseRosesOffsetX: number = 520;
    vaseRosesOffsetY: number = 485;
    vaseOffset: number = 65;
    imageBg: Phaser.GameObjects.Image | null = null;
    rosesAmountOneColor: number = 5;

    pannel: Phaser.GameObjects.Image | null = null;
    pannelTaskDescriptionOffsetX: number = 100;
    pannelTaskDescriptionGapX: number = -10;
    pannelTaskDescriptionContainer: Phaser.GameObjects.Container | null = null;
    pannelTaskDescriptionStyle:{} = {
        fontSize: 64, 
        fontFamily: 'Arial',
        fontStyle: 'bold',
        color: '#ffffff',
        strokeThickness: 2,
    };

    pannelStatisticContainer: Phaser.GameObjects.Container | null = null;
    statisticTextCorrect = "Вірних відповідей ";
    statisticTextAll = "Всього відповідей ";

    level: Phaser.GameObjects.Image | null = null;

    taskDescription = "Збери букет із";
    taskDescription2 = "та";
    taskRaund: {redRoses: number,whiteRoses: number} = {
        redRoses: Phaser.Math.Between(1, 4), 
        whiteRoses: Phaser.Math.Between(1, 4)
    };

    insideVaseRectangle: Phaser.Geom.Rectangle = new Phaser.Geom.Rectangle(751, 290, 430, 450);

    whiteRoses: Phaser.GameObjects.Image[] = [];
    redRoses: Phaser.GameObjects.Image[] = [];

    buttonSubmit: Phaser.GameObjects.Image | null = null;
    attempts: number = 0;
    maxAttempts:number = 1;
    currentLevel: number = 1;
    levelCorrectAnswers: number = 0;
    buttonSubmitOffsetX: number = 200;
    levelAmount: number = 5;

    buttonNext: Phaser.GameObjects.Container | null = null;
    butonNexText = "Далі";
    buttonNextOffsetX: number = 300;

    private readonly startPositionRed: { x: number; y: number }[] = Array.from({ length: 5 }, () => ({ x: 0, y: 0 }));
    private readonly startPositionWhite: { x: number; y: number }[] = Array.from({ length: 5 }, () => ({ x: 0, y: 0 }));

    private readonly correctPositionWhite: { x: number; y: number }[] = [
        { x: 1088, y: 357 },
        { x: 1062, y: 359 },
        { x: 1022, y: 347 },
        { x: 984, y: 340 },
        { x: 932, y: 336 },
    ];
    private readonly correctPositionRed: { x: number; y: number }[] = [
        { x: 784, y: 370 },
        { x: 841, y: 343 },
        { x: 906, y: 352 },
        { x: 939, y: 328 },
        { x: 990, y: 365 },
    ];

    rosesPositions: {
        white: { correct: { x: number; y: number }[]; start: { x: number; y: number }[]; };
        red: { correct: { x: number; y: number }[]; start: { x: number; y: number }[]; };
    } = {
        white: { correct: this.correctPositionWhite, start: this.startPositionWhite },
        red: { correct: this.correctPositionRed, start: this.startPositionRed },
    };


    layers = {
        background: 0,
        vaseRoses: 50,
        vase: 100,
        messages: 500,
    };

    spriteNames = {
        red_rose: "red_rose",
        white_rose: "white_rose",
        red_preview: "red_preview",
        white_preview: "white_preview",

        pannel: "pannel",
        pannel_message: "pannel_message",

        button_close_yellow: "button_close_yellow",
        button_submit: "button_submit",
        button_sound: "button_sound",
        button_close: "button_close",
        button_text: "button_text",

        level_1: "level_1",
        level_2: "level_2",
        level_3: "level_3",
        level_4: "level_4",
        level_5: "level_5",
    };

    soundNames = {
        fail: "fail",
        success: "success",
    }

    constructor() {
        super({
            key: "MainScne",
        });

    }

    preload() {
        this.load.audio(this.soundNames.fail, "./public/audio/fail.wav");
        this.load.audio(this.soundNames.success, "./public/audio/success.wav");

        this.load.image("background", "./public/images/bg.png");
        this.load.image("vases", "./public/images/fg.png");

        this.load.image(this.spriteNames.red_rose, "./public/images/red_rose.svg");
        this.load.image(this.spriteNames.white_rose, "./public/images/white_rose.svg");
        this.load.image(this.spriteNames.red_preview, "./public/images/red_preview.svg");
        this.load.image(this.spriteNames.white_preview, "./public/images/white_preview.svg");

        this.load.image(this.spriteNames.pannel, "./public/images/pannel.svg");
        this.load.image(this.spriteNames.pannel_message, "./public/images/pannel_message.svg");

        this.load.image(this.spriteNames.button_close_yellow, "./public/images/button_close_yellow.svg");
        this.load.image(this.spriteNames.button_submit, "./public/images/button_submit.svg");
        this.load.image(this.spriteNames.button_sound, "./public/images/button_sound.svg");
        this.load.image(this.spriteNames.button_close, "./public/images/button_close.svg");
        this.load.image(this.spriteNames.button_text, "./public/images/button_text.svg");

        this.load.image(this.spriteNames.level_1, "./public/images/level_1.svg");
        this.load.image(this.spriteNames.level_2, "./public/images/level_2.svg");
        this.load.image(this.spriteNames.level_3, "./public/images/level_3.svg");
        this.load.image(this.spriteNames.level_4, "./public/images/level_4.svg");
        this.load.image(this.spriteNames.level_5, "./public/images/level_5.svg");
    }

    create() {
        this.imageBg = this.add
            .image(this.scale.width / 2, this.scale.height / 2, "background")
            .setDepth(this.layers.background);

        this.createVases();

        this.createRosesAll();

        this.createPannel();
    }
    
    createVases() {
        this.add.image(this.scale.width / 2, this.scale.height / 2 + this.vaseOffset, "vases").setDepth(this.layers.vase);

        this.setUpRosesPositions();
    }

    setUpRosesPositions() {
        let offsets = [
            { x: 0, y: -100},
            {x: 100, y: -70},
            {x: -100, y: -70},
            {x: 50, y: -50},
            {x: -50, y: -50},
        ];
    
        for (let isRed = 0; isRed < 2; isRed++) {
            let x = isRed ? -this.vaseRosesOffsetX : this.vaseRosesOffsetX;
            let color = isRed ? 'red' : 'white';
    
            for (let offsetIndex = 0; offsetIndex < offsets.length; offsetIndex++) {
                this.rosesPositions[color].start[offsetIndex].x = this.scale.width / 2 + (x + offsets[offsetIndex].x);
                this.rosesPositions[color].start[offsetIndex].y = this.vaseRosesOffsetY + offsets[offsetIndex].y;
            }
        }

    }
    
    createRosesAll() {
        this.createRoses(true);
        this.createRoses(false);

        this.setRosesPositionsToStart();
    }

    setRosesPositionsToStart() {
        for (let roseIndex = 0; roseIndex < this.rosesAmountOneColor; roseIndex++) {
            this.tweens.add({
                targets: this.redRoses[roseIndex],
                x: this.rosesPositions.red.start[roseIndex].x,
                y: this.rosesPositions.red.start[roseIndex].y,
                duration: 1000,
                ease: 'Power2.easeInOut',
                onStart: function () { },
                onComplete: function () { },
            });
    
            this.tweens.add({
                targets: this.whiteRoses[roseIndex],
                x: this.rosesPositions.white.start[roseIndex].x,
                y: this.rosesPositions.white.start[roseIndex].y,
                duration: 1000,
                ease: 'Power2.easeInOut',
                onStart: function () { },
                onComplete: function () { },
            });
        }
    }
    
    setRosesToCorrectPositions() {
        ['red', 'white'].forEach(colorKey => {
            let roses = this[colorKey + 'Roses'];
            let correctPositions = this.rosesPositions[colorKey].correct;
            let startPositions = this.rosesPositions[colorKey].start;
            let amountToPlace = this.taskRaund[colorKey + 'Roses'];
    
            let placed = 0;
            for (let i = 0; i < roses.length; i++) {
    
                let newPosition = startPositions[i];
                if (placed < amountToPlace) {
                    newPosition = correctPositions[i];
                }
    
                placed++;
    
                this.tweens.add({
                    targets: roses[i],
                    x: newPosition.x,
                    y: newPosition.y,
                    duration: 1000,
                    ease: 'Power2.easeInOut',
                    onStart: function () { },
                    onComplete: function () { },
                });
            }
        });
    }

    createRoses(isRedRose: boolean) {
        let spriteName = isRedRose ? this.spriteNames.red_rose : this.spriteNames.white_rose;

        for (let roseIndex = 0; roseIndex < this.rosesAmountOneColor; roseIndex++) {

            let rose = this.add.image(this.scale.width/2, 0, spriteName);

            if (isRedRose) {
                this.redRoses.push(rose);
            }else{
                this.whiteRoses.push(rose);
            }

            this.handleRose(rose);
        }

    }

    handleRose(rose: Phaser.GameObjects.Image) {
        rose.setDepth(this.layers.vaseRoses);

        rose.setInteractive({ draggable: true });

        rose.on('dragstart', function (pointer)
        {
            this.setTint(0x555555);
        });   

        rose.on('drag', function (pointer, dragX, dragY)
        {
            this.x = dragX;
            this.y = dragY;
        });

        rose.on('dragend', function (pointer)
        {
            this.clearTint();
        });
    }

    createPannel() {
        this.pannel = this.add.image(this.scale.width / 2, this.scale.height, "pannel");
        this.pannel.setOrigin(0.5, 1);

        this.createTaskDescription();
        this.createOrSetLevel(1);
        this.createButtonSubmit();
        this.createButtonNext();
    }

    createTaskDescription() {
        this.pannelTaskDescriptionContainer?.destroy();
        this.pannelTaskDescriptionContainer = this.add.container(this.pannelTaskDescriptionOffsetX, this.scale.height - this.pannel.height/2);

        let buttonCloseYellow = this.add.image(0, 0, this.spriteNames.button_close_yellow);
        this.pannelTaskDescriptionContainer.add(buttonCloseYellow);

        let descriptionRed = this.taskDescription + " " + this.taskRaund.redRoses;
        let taskDescriptionRed = this.add.text(
            this.getPositionToRight(buttonCloseYellow, this.pannelTaskDescriptionGapX), 
            0,
            descriptionRed, 
            this.pannelTaskDescriptionStyle)
            .setOrigin(0, 0.5)
            .setShadow(0, 4, '#333333', 2, false, true);;
        this.pannelTaskDescriptionContainer.add(taskDescriptionRed);

        let rosePreviewRed = this.add.image(
            this.getPositionToRight(taskDescriptionRed, 
                this.pannelTaskDescriptionGapX), 
                0, 
                this.spriteNames.red_preview);
        this.pannelTaskDescriptionContainer.add(rosePreviewRed);

        let descriptionWhite = this.taskDescription2 + " " + this.taskRaund.whiteRoses;
        let taskDescriptionWhite = this.add.text(
            this.getPositionToRight(rosePreviewRed, this.pannelTaskDescriptionGapX) , 
            0, 
            descriptionWhite, 
            this.pannelTaskDescriptionStyle)
            .setOrigin(0, 0.5)
            .setShadow(0, 4, '#333333', 2, false, true);;
        this.pannelTaskDescriptionContainer.add(taskDescriptionWhite);

        let rosePreviewWhite = this.add.image(
            this.getPositionToRight(taskDescriptionWhite, this.pannelTaskDescriptionGapX), 
            0, 
            this.spriteNames.white_preview);
        this.pannelTaskDescriptionContainer.add(rosePreviewWhite);
    }

    createOrSetLevel(level: number) {
        this.level?.destroy();

        let spriteName = this.spriteNames.level_1;
        if (level === 2) {
            spriteName = this.spriteNames.level_2;
        }else if (level === 3) {
            spriteName = this.spriteNames.level_3;
        }else if (level === 4) {
            spriteName = this.spriteNames.level_4;
        }else if (level === 5) {
            spriteName = this.spriteNames.level_5;
        }

        this.level = this.add.image(this.scale.width / 2, this.scale.height - this.pannel.height + 20, spriteName);
    }

    createButtonSubmit() {
        this.buttonSubmit = this.add.image(
            this.scale.width - this.buttonSubmitOffsetX, 
            this.scale.height - this.pannel.height/2,
            this.spriteNames.button_submit);

        this.buttonSubmit.setInteractive();
        this.buttonSubmit.on('pointerdown', this.onSubmit, this);
    }

    createButtonNext() {
        this.buttonNext = this.add.container(
            this.scale.width - this.buttonNextOffsetX, 
            this.scale.height - this.pannel.height/2,            
        );
        
        let image = this.add.image(0, 0, this.spriteNames.button_text)
            .setInteractive();

        image.on('pointerdown', this.onButtonNext, this);

        this.buttonNext.add(image);

        let text = this.add.text(0, 0, this.butonNexText, this.pannelTaskDescriptionStyle)
            .setOrigin(0.5, 0.5)
            .setShadow(0, 4, '#333333', 2, false, true);

        this.buttonNext.add(text);

        this.buttonNext.setVisible(false);
    }

    onSubmit(pointer: Phaser.Input.Pointer) {
        let rosesInVase = this.rosesInVase();
        if (this.taskRaund.redRoses === rosesInVase.redRoses &&
            this.taskRaund.whiteRoses === rosesInVase.whiteRoses) {
            
            this.handleCorrectSubmit();
        }else{
            this.handleWrongSubmit();
        }

        if (this.currentLevel > this.levelAmount) {
            this.handleEndGame();
        }

    }

    handleCorrectSubmit() {
        this.levelCorrectAnswers++;
        this.currentLevel++;
        this.attempts = 0;
        this.sound.play(this.soundNames.success);

        this.createOrSetLevel(this.currentLevel);

        this.freshRaund();
    }

    handleWrongSubmit() {
        this.sound.play(this.soundNames.fail);

        if (this.attempts >= this.maxAttempts) {
            this.attempts = 0;

            this.currentLevel++;

            this.setRosesToCorrectPositions();

            this.buttonNextShow();

            this.buttonSubmitHide();
        }else{
            this.attempts++;

            this.shakeImage(this.buttonSubmit);
        }
    }

    buttonSubmitHide() {
        this.buttonSubmit.setVisible(false);
        this.buttonSubmit.disableInteractive();
    }

    buttonSubmitShow() {
        this.buttonSubmit.setVisible(true);
        this.buttonSubmit.setInteractive();
    }

    buttonNextHide() {
        this.buttonNext.setVisible(false);
        this.buttonNext.disableInteractive();

        const firstImage = this.buttonNext.list.find(child => child.type === 'Image');

        if (firstImage) {
            firstImage.disableInteractive();
        }
    }
    
    buttonNextShow() {
        this.buttonNext.setVisible(true);
        this.buttonNext.setInteractive();

        const firstImage = this.buttonNext.list.find(child => child.type === 'Image');

        if (firstImage) {
            firstImage.setInteractive();
        }
    }

    handleEndGame() {
        this.showStatistic();
            
        this.currentLevel = 1;
        this.attempts = 0;
        this.levelCorrectAnswers = 0;
        
        this.createOrSetLevel(this.currentLevel);
        
        this.freshRaund();

        this.buttonSubmitHide();
        this.buttonNextHide();
    }

    onButtonNext() {
        this.buttonNextHide();
        this.buttonSubmitShow();

        this.freshRaund();

        this.createOrSetLevel(this.currentLevel);
    }

    shakeImage(image: Phaser.GameObjects.Image, duration: number = 100) {
        this.tweens.add({
            targets: image,
            x: { from: image.x - 5, to: image.x + 5 },
            duration: duration,
            ease: 'Linear',
            yoyo: true,
            repeat: 10,
            onStart: function () { },
            onComplete: function () { },
        });
    }
    
    freshRaund() {
        this.taskRaund = {        
            redRoses: Phaser.Math.Between(1, 4), 
            whiteRoses: Phaser.Math.Between(1, 4)
        };

        this.createTaskDescription();
        this.setRosesPositionsToStart();
    }

    showStatistic() {
        this.pannelStatisticContainer?.destroy();
        this.pannelStatisticContainer = this.add.container(this.scale.width/2, this.scale.height/2)
            .setDepth(this.layers.messages);

        let pannelBg = this.add.image(0, 0, this.spriteNames.pannel_message);
        this.pannelStatisticContainer.add(pannelBg);

        let textCorrect = this.statisticTextCorrect + 
            Phaser.Math.RoundTo(((this.levelCorrectAnswers/this.levelAmount) * 100), 0) + 
            "%";

        let messageCorrect = this.add.text(0, -100, textCorrect, this.pannelTaskDescriptionStyle)
            .setOrigin(0.5, 0.5);
        this.pannelStatisticContainer.add(messageCorrect);

        let buttonSubmit = this.add.image(0, 100, this.spriteNames.button_submit);
        this.pannelStatisticContainer.add(buttonSubmit);

        pannelBg.setInteractive();
        pannelBg.on('pointerdown', ()=>{
            this.tweens.add({
                targets: buttonSubmit,
                scale: { from: 1, to: 1.2},
                duration: 500,
                ease: 'Linear',
                yoyo: true,
                repeat: 0,
            });
        }, this);

        buttonSubmit.setInteractive();
        buttonSubmit.on('pointerdown', () => {
            this.pannelStatisticContainer?.destroy();
            this.buttonSubmitShow();
            this.freshRaund();
        }, this);
    }

    /**
     * @returns { redRoses: number, whiteRoses: number }
     */
    rosesInVase() {
        let redRoses: number = 0;
        let whiteRoses: number = 0;

        for(let redRose of this.redRoses) {
            if (this.insideVaseRectangle.contains(redRose.x, redRose.y)) {
                redRoses++;
            }
        }
        for(let whiteRose of this.whiteRoses) {
            if (this.insideVaseRectangle.contains(whiteRose.x, whiteRose.y)) {
                whiteRoses++;
            }
        }

        return { redRoses: redRoses, whiteRoses: whiteRoses};
    }

    update() {
    }

    getPositionToRight(object, offsetX = 0) {
        let objectWidth = 0;
        let objectX = 0;
        if (object instanceof Phaser.GameObjects.Text) {
            let bounds = object.getBounds();
            objectWidth = bounds.width;
            objectX = bounds.x;
        } else if (object instanceof Phaser.GameObjects.Image) {
            objectWidth = object.width * object.scaleX;
            objectX = object.x;
        }

        return objectX + objectWidth + offsetX;
    }

}

const configMainScene = {
    type: Phaser.AUTO,
    backgroundColor: "#000000",
    parent: "game_container",
    scene: [MainScene],
    width: 1920,
    height: 1080,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
};

const game = new Phaser.Game(configMainScene);
