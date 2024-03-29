class BaseScene extends Phaser.Scene {

    constructor(key) {
        super(key);
    }

    preload() {
        this.load.spritesheet('tilesheet', 'assets/tilesheet.png', {
            frameWidth: 64,
            frameHeight: 64,
            margin: 1,
            spacing: 2
        });
    }
    create() {
        //tiles
        let tilesheet = this.tilemap.addTilesetImage('tilesheet');
        this.tilemap.createStaticLayer('background', tilesheet);
        this.placeTileLayer = this.tilemap.createDynamicLayer('placeTiles', tilesheet);

        //variables
        // enemy spawn location
        this.spawnX = -18.00;
        this.spawnY = 258.00;
        // Enemy path points
        this.points = [
            251.00, 255.00,
            350.00, 132.15,
            820.31, 149.13,
            833.29, 446.77,
            1298.73, 457.75
        ];

        this.enemies = this.physics.add.group();

        this.defences = this.physics.add.group();

        this.bullets = this.physics.add.group({
            defaultKey: 'tilesheet',
            defaultFrame: 296
        });
        this.physics.add.overlap(this.bullets, this.enemies, this.bulletHit, null, this);

        //debug spawn enemy
        // this.spawnEnemy();

        this.scene.run('UIScene', {
            gameScene: this
        });
        this.UIScene = this.scene.get("UIScene");

        this.score = 0;
        this.playerHealth = 4;
        this.gameOver = false;

        this.selectedTile;

        this.newEnemyTime;

        // events
        this.input.on('pointerdown', function (pointer) {
            let scene = this.scene;
            if (!scene.scale.isFullscreen) {
                scene.scale.startFullscreen();
            }
            if (!scene.selectedTile) {
                return;
            }
            let pointerX = pointer.worldX;
            let pointerY = pointer.worldY;
            let existingTile = scene.placeTileLayer.getTileAtWorldXY(pointerX, pointerY);
            if (existingTile) {
                scene.placeTileLayer.putTileAt(181, existingTile.x, existingTile.y);
                let tileWorldPos = scene.placeTileLayer.tileToWorldXY(existingTile.x, existingTile.y);
                let newSprite = scene.defences.create(tileWorldPos.x + 32, tileWorldPos.y + 25, 'tilesheet', scene.selectedTile);
                newSprite.spriteCount = scene.defences.getLength();
                scene.selectedTile = null;
                scene.UIScene.unToggleButtons();
            }

        });


    }

    update(time) {
        if (this.gameOver) {
            return;
        }
        for (let defence of this.defences.getChildren()) {
            let nearestEnemy = this.findNearestEnemy(defence);
            if (nearestEnemy) {
                if (!this.tweens.isTweening(defence)) {
                    let targetAngle = Phaser.Math.Angle.Between(defence.x, defence.y, nearestEnemy.x, nearestEnemy.y);
                    let tweenConfig = {
                        targets: defence,
                        props: {
                            rotation: targetAngle
                        },
                        duration: 500,
                        onComplete: function (tween, targets, staticDefence) {
                            staticDefence.lastEnemy = nearestEnemy;
                        },
                        onCompleteParams: [defence]
                    };
                    this.add.tween(tweenConfig);
                }

                if (defence.lastEnemy != nearestEnemy) {
                    continue;
                }
                if (defence.lastFire && time < (defence.lastFire + 2000)) {
                    continue;
                }
                defence.lastFire = time;
                let bullet = this.bullets.get(defence.x, defence.y);
                bullet.setRotation(defence.rotation);
                this.physics.velocityFromRotation(defence.rotation, 700, bullet.body.velocity);

            }
        };
        if (!this.newEnemyTime || time >= this.newEnemyTime) {
            this.spawnEnemy();
            this.newEnemyTime = time + Phaser.Math.RND.between(2000, 7000);
        }
    }

    bulletHit(bullet, enemy) {
        enemy.health -= 1;
        bullet.destroy();
        if (enemy.health <= 0) {
            enemy.removeAllListeners();
            enemy.stopFollow();
            enemy.destroy();
            this.score += 4;
            this.UIScene.updateScore(this.score);
        }
    }

    findNearestEnemy(defence) {
        for (let enemy of this.enemies.getChildren()) {
            if (!enemy.scene) {
                continue;
            }
            let distanceBetween = Phaser.Math.Distance.Between(
                defence.x, defence.y,
                enemy.x, enemy.y
            );
            if (distanceBetween <= 300) {
                return enemy;
            }
        };
    }

    damagePlayer() {
        this.playerHealth -= 1;
        this.UIScene.removeLife();
        if (this.playerHealth <= 0) {
            this.UIScene.displayGameover();
            this.tweens.killAll();
            this.input.removeAllListeners();
            this.gameOver = true;
        }
    }

    spawnEnemy() {
        //local enemy create

        // new path
        let path = new Phaser.Curves.Path(this.spawnX, this.spawnY);
        path.splineTo(this.points);

        let newEnemy = this.add.follower(path, this.spawnX, this.spawnY, 'tilesheet', 245);
        newEnemy.health = 5;
        this.enemies.add(newEnemy);

        newEnemy.startFollow({
            positionOnPath: true,
            duration: 20000,
            yoyo: false,
            repeat: 0,
            rotateToPath: true,
            verticalAdjust: true,
            onComplete: function () {
                newEnemy.destroy();
                this.parent.scene.damagePlayer(1);
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
        this.tilemap = this.make.tilemap({
            key: 'level1Map'
        });
        super.create();
    }
    update(time, delta) {
        super.update(time, delta);
    }
}

class UIScene extends Phaser.Scene {
    constructor(key) {
        super('UIScene');
    }
    init(data) {
        this.gameScene = data.gameScene;
    }
    preload() {
        this.load.image('placementMenuBackground', 'assets/longMenu.png');
        this.load.image('button', 'assets/button.png');
        this.load.image('buttonPressed', 'assets/buttonPressed.png');
        this.load.image('gameOver', 'assets/gameover.png');
        this.load.image('life', 'assets/life.png');
        this.load.image('lifeEmpty', 'assets/lifeEmpty.png');
    }
    create() {
        this.menuBackground = this.add.sprite(564, 576, 'placementMenuBackground');
        this.menuBackground.scaleX = 2;
        this.menuBackground.scaley = 2;
        this.toggledButton = null;
        this.defenceButton = this.add.sprite(560, 576, 'button');
        this.defenceButton.setInteractive();
        this.defenceButton.on('pointerdown', this.defencePressed);
        this.scoreText = this.add.text(this.game.scale.width - 120, 10, 'Score: 0', {
            fontFamily: 'Impact, sans-serif',
            fontSize: '20px'
        });
        this.lives = [
            this.add.sprite(20, 20, 'life'),
            this.add.sprite(50, 20, 'life'),
            this.add.sprite(80, 20, 'life'),
            this.add.sprite(110, 20, 'life'),
        ];
    }
    defencePressed() {
        if (!this.scene.gameScene.selectedTile) {
            this.scene.gameScene.selectedTile = 249;
        } else {
            this.scene.gameScene.selectedTile = null;
        }
        this.scene.toggleButton(this);
    }
    toggleButton(button) {
        if (button.toggledOn) {
            this.toggledButton = null;
            button.setTexture('button');
        } else {
            this.toggledButton = button;
            button.setTexture('buttonPressed');
        }
        button.toggledOn = !button.toggledOn;
    }
    unToggleButtons() {
        this.toggleButton(this.toggledButton);
    }
    updateScore(newScore) {
        this.scoreText.setText('Score: ' + newScore);
    }
    displayGameover() {
        this.gameOverText = this.add.sprite(560, 300, 'gameOver');
        this.defenceButton.removeAllListeners();
    }
    removeLife() {
        if (this.lives.length > 0) {
            let lastLife = this.lives.pop();
            lastLife.setTexture('lifeEmpty');
        }
    }
    update() {

    }
}