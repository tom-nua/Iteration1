class BaseScene extends Phaser.Scene {

    constructor(key) {
        super(key);
    }

    preload() {
        this.load.spritesheet('tilesheet', 'assets/tilesheet.png', {
            frameWidth: 64, frameHeight: 64, margin: 1, spacing: 2
        });
    }
    create() {
        //variables
        let camera = this.cameras.main
        //tiles
        let tilesheet = this.tilemap.addTilesetImage('tilesheet');
        this.tilemap.createStaticLayer('background', tilesheet);
        this.placeTileLayer = this.tilemap.createDynamicLayer('placeTiles', tilesheet);

        // enemy spawn location
        this.spawnX = -18.00;
        this.spawnY = 258.00;
        // Enemy path points
        this.points = [
            251.00, 255.00,
            256.99, 132.15,
            820.31, 149.13,
            833.29, 446.77,
            1298.73, 457.75
        ];

        this.enemies = this.physics.add.group();

        this.defences = this.physics.add.group();

        //debug spawn enemy
        this.spawnEnemy();

        this.scene.run('UIScene',{gameScene: this});
        this.UIScene = this.scene.get("UIScene");

        this.selectedTile;

        // events
        this.input.on('pointerdown', function (pointer) {
            let scene = this.scene;
            if(!scene.selectedTile){
                return;
            }
            let pointerX = pointer.worldX;
            let pointerY = pointer.worldY
            let existingTile = scene.placeTileLayer.getTileAtWorldXY(pointerX, pointerY);
            if (existingTile) {
                scene.placeTileLayer.putTileAt(181, existingTile.x, existingTile.y);
                let tileWorldPos = scene.placeTileLayer.tileToWorldXY(existingTile.x, existingTile.y);
                let newDefence = scene.defences.create(tileWorldPos.x + 32, tileWorldPos.y + 25, 'tilesheet', scene.selectedTile);
                scene.selectedTile = null;
                scene.UIScene.unToggleButtons();
            }

        });
    }

    update() {
        for (const defence of this.defences.getChildren()) {
            let nearestEnemy = this.findNearestEnemy(defence);
            if (nearestEnemy) {
                console.log("fire!");
            }
        };
    }

    findNearestEnemy(defence) {
        for (const enemy of this.enemies.getChildren()) {
            let distanceBetween = Phaser.Math.Distance.Between
                (
                    defence.x, defence.y,
                    enemy.x, enemy.y
                )
            if (distanceBetween <= 200) {
                return enemy;
            }
        };
    }

    spawnEnemy() {
        //local enemy create

        // new path
        let path = new Phaser.Curves.Path(this.spawnX, this.spawnY);
        path.splineTo(this.points);

        let newEnemy = this.add.follower(path, this.spawnX, this.spawnY, 'tilesheet', 245);
        this.enemies.add(newEnemy);

        newEnemy.startFollow({
            positionOnPath: true,
            duration: 10000,
            yoyo: false,
            repeat: 0,
            rotateToPath: true,
            verticalAdjust: true,
            onComplete: function () {
                newEnemy.destroy();
            }
        });

    }


}

class Level1 extends BaseScene {

    constructor(key) {
        super('Level1');
    }

    preload() {
        this.load.tilemapTiledJSON('level1Map', 'assets/level1Map.json');
        super.preload();
    }
    create() {
        this.tilemap = this.make.tilemap({ key: 'level1Map' });
        super.create();
    }
    update() {
        super.update();
    }
}

class UIScene extends Phaser.Scene {
    constructor(key) {
        super('UIScene');
    }
    init(data){
        this.gameScene = data.gameScene;
    }
    preload() {
        this.load.image('placementMenuBackground', 'assets/longMenu.png');
        this.load.image('button', 'assets/button.png');
        this.load.image('buttonPressed', 'assets/buttonPressed.png');
    }
    create() {
        this.menuBackground = this.add.sprite(564, 576, 'placementMenuBackground');
        this.menuBackground.scaleX = 2;
        this.menuBackground.scaley = 2;
        this.toggledButton = null;
        this.defenceButton = this.add.sprite(560, 576, 'button');
        this.defenceButton.setInteractive();
        this.defenceButton.on('pointerdown', this.defencePressed);
    }
    defencePressed(){
        if(!this.scene.gameScene.selectedTile){
            this.scene.gameScene.selectedTile = 249;
        }
        else{
            this.scene.gameScene.selectedTile = null;
        }
        this.scene.toggleButton(this);
    }
    toggleButton(button){
        if (button.toggledOn){
            this.toggledButton = null;
            button.setTexture('button');
        }
        else{
            this.toggledButton = button;
            button.setTexture('buttonPressed');
        }
        button.toggledOn = !button.toggledOn;
    }
    unToggleButtons(){
        this.toggleButton(this.toggledButton);
    }
    update() {

    }
}