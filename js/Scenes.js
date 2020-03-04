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

        this.pointsX = [251.00];
        this.pointsY = [255.00];

        this.enemies = this.physics.add.group();   
                
        this.spawnEnemy()
        
    }
    update(){

    }

    spawnEnemy(){
        //local enemy create
        let newEnemy = this.add.follower(null, -18.00, 258.00, 'tilesheet', 245);
        newEnemy.currentPoint = 0;
        this.enemies.add(newEnemy);

        // new path
        let path = new Phaser.Curves.Line(
            new Phaser.Math.Vector2(
                -18.00, 258.00
            ), 
            new Phaser.Math.Vector2(
                this.pointsX[newEnemy.currentPoint], this.pointsY[newEnemy.currentPoint]
            )
        );

        newEnemy.path = path;
        newEnemy.startFollow({duration: 1000, onComplete: function(){
            console.log(this);
            this.parent.scene.pathEnd(newEnemy);
        }});
    }

    pathEnd(enemy){
        enemy.currentPoint =+ 1;
        let newPath = new Phaser.Curves.Line(
            origin, 
            new Phaser.Math.Vector2(
                this.pointsX[enemy.currentPoint], this.pointsY[enemy.currentPoint]
            )
        );

        enemy.path = newPath;
        enemy.startFollow({duration: 5000, onComplete: this.pathEnd});
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
