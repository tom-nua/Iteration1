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

        this.spawnX = -18.00;
        this.spawnY = 258.00;

        this.points = [
            251.00, 255.00,
            256.99, 132.15,
            820.31, 149.13,
            833.29, 446.77,
            1298.73, 457.75
        ];

        this.enemies = this.physics.add.group();
        
        this.spawnEnemy();
        
    }
    update(){

    }

    spawnEnemy(){
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
            verticalAdjust: true
        });

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
