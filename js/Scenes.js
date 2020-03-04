class BaseScene extends Phaser.Scene {

    constructor(key){
        super(key);
    }

    preload(){
        this.load.spritesheet('tilesheet', 'assets/tilesheet.png', {frameWidth: 64, frameHeight: 64});
    }
    create(){
        let tilesheet = this.tilemap.addTilesetImage('tilesheet','tilesheet');
        this.tilemap.createStaticLayer('background', tilesheet);
        this.tilemap.createStaticLayer('placeTiles', tilesheet);

        this.enemies = this.physics.add.group();
        let origin = new Phaser.Math.Vector2(
            -18.00, 258.00
        );
        let target = new Phaser.Math.Vector2(
            251.00, 255.00
        )
        let path = new Phaser.Curves.Line(origin, target);
        let newEnemy = this.add.follower(path, -18.00, 258.00, 'tilesheet', 245);
        this.enemies.add(newEnemy);
        newEnemy.startFollow();
    }
    update(){

    }
}

class Level1 extends BaseScene {
    
    constructor(key){
        super(key);
    }

    preload(){
        this.load.tilemapTiledJSON('level1Map', 'assets/level1Map.json');
        super.preload();
    }
    create(){
        this.tilemap = this.make.tilemap({key: 'level1Map'});
        super.create();
    }
    update(){
        super.update();
    }
}