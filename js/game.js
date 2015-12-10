GameStates.Game = function (game) {
	this.weapons = [];
	this.currentWeapon = 0;
};

var Enemy = function (game, key) {
	
	Phaser.Sprite.call(this, game, 0, 0, key);
	
	//this.texture.baseTexture.scaleMode = PIXI.scaleModes.NEAREST;
	
	//this.anchor.set(0.5);
	
	this.checkWorldBounds = true;
	this.outOfBoundsKill = true;
	this.exists = false;
	
	this.tracking = false;
	this.scaleSpeed = 0;
	
};

var Bullet = function (game, key) {

	Phaser.Sprite.call(this, game, 0, 0, key);

	this.texture.baseTexture.scaleMode = PIXI.scaleModes.NEAREST;

	this.anchor.set(0.5);

	this.checkWorldBounds = true;
	this.outOfBoundsKill = true;
	this.exists = false;

	this.tracking = false;
	this.scaleSpeed = 0;

};

Bullet.prototype = Object.create(Phaser.Sprite.prototype);
Bullet.prototype.constructor = Bullet;

Bullet.prototype.fire = function (x, y, angle, speed, gx, gy) {

	gx = gx || 0;
	gy = gy || 0;

	this.reset(x, y);
	this.scale.set(1);

	this.game.physics.arcade.velocityFromAngle(angle, speed, this.body.velocity);

	this.angle = angle;

	this.body.gravity.set(gx, gy);

};

Bullet.prototype.update = function () {

	if (this.tracking)
	{
		this.rotation = Math.atan2(this.body.velocity.y, this.body.velocity.x);
	}

	if (this.scaleSpeed > 0)
	{
		this.scale.x += this.scaleSpeed;
		this.scale.y += this.scaleSpeed;
	}

};
var Weapon = {};

Weapon.SingleBullet = function (game) {

	Phaser.Group.call(this, game, game.world, 'Single Bullet', false, true, Phaser.Physics.ARCADE);

	this.nextFire = 0;
	this.bulletSpeed = 600;
	this.fireRate = 110;

	for (var i = 0; i < 64; i++)
	{
		this.add(new Bullet(game, 'bullet'), true);
	}

	return this;

};

Weapon.SingleBullet.prototype = Object.create(Phaser.Group.prototype);
Weapon.SingleBullet.prototype.constructor = Weapon.SingleBullet;

Weapon.SingleBullet.prototype.fire = function (source) {

	if (this.game.time.time < this.nextFire) { return; }


	var x = source.x + 115;
	var y = source.y + 80;

	this.getFirstExists(false).fire(x, y, 0, this.bulletSpeed, 0, 0);

	this.nextFire = this.game.time.time + this.fireRate;

	return true;
};


GameStates.Game.prototype = {
    preload: function() {
      this.time.advancedTiming = true;
    },

	create: function () {
        this.background = this.add.sprite(0, 0, 'background');


        this.physics.startSystem(Phaser.Physics.ARCADE);

        this.weapons.push(new Weapon.SingleBullet(this.game));

        this.currentWeapon = 0;

        for (var i = 1; i < this.weapons.length; i++)
        {
            this.weapons[i].visible = false;
        }

        this.player = this.add.sprite(80, 80, 'player');
        this.physics.arcade.enable(this.player);
        this.player.body.collideWorldBounds = true;
        this.player.body.gravity.y = 800;

        this.input.keyboard.addKeyCapture([ Phaser.Keyboard.SPACEBAR ]);

        var changeKey = this.input.keyboard.addKey(Phaser.Keyboard.ENTER);
        changeKey.onDown.add(this.nextWeapon, this);


		this.sound = this.add.audio('laser');
		this.music = this.add.audio('music');
		this.music.play();


        this.add.sprite(50, 25, 'health.bg');
        this.healthBar = this.add.sprite(118, 45, 'health.bar');


		this.barWidth = this.healthBar.width;

        this.add.sprite(375, 25, 'energy.bg');
        this.energyBar = this.add.sprite(443, 45, 'energy.bar');

        
        this.add.sprite(700, 25, 'ammo');
        this.add.sprite(900, 25, 'score');

        style = {
            font: "24px SaranaiGame",
            fill: "#f4a222"
        }
        
        this.ammoText = this.add.text(790, 50, "0", style);
        this.scoreText = this.add.text(990, 50, "0", style);
        this.fpsText = this.add.text(1150, 45, "-- FPS", { fill: "#FFF"});


        this.character = {
        	maxHealth: 100,
        	health: 100,
        	maxEnergy: 1000,
        	energy: 1000,
        	removeEnergy: function() {
        		this.energy -= 3;
        		if(this.energy < 0) this.energy = 0;
        	},
        	addEnergy: function() {
        		this.energy += 1;
        		if(this.energy > this.maxEnergy) this.energy = this.maxEnergy;
        	}
        }

        this.score = 0;

        /*this.filter = this.add.filter('Fire', 800, 600);
		this.filter.alpha = 0.0;


		  this.background.filters = [this.filter];*/

    },

    render: function() {
        this.fpsText.setText(this.time.fps + ' FPS');

    },

	nextWeapon: function () {

		//  Tidy-up the current weapon
		if (this.currentWeapon > 9)
		{
			this.weapons[this.currentWeapon].reset();
		}
		else
		{
			this.weapons[this.currentWeapon].visible = false;
			this.weapons[this.currentWeapon].callAll('reset', null, 0, 0);
			this.weapons[this.currentWeapon].setAll('exists', false);
		}

		//  Activate the new one
		this.currentWeapon++;

		if (this.currentWeapon === this.weapons.length)
		{
			this.currentWeapon = 0;
		}

		this.weapons[this.currentWeapon].visible = true;

	},

	update: function () {
		// Mise a jour score & munitions arme secondaire
		//if(this.filter) this.filter.update();

        this.ammoText.setText(0);
        this.scoreText.setText(this.score);
        this.score++;

        this.healthBar.crop(new Phaser.Rectangle(0, 0, (this.character.health / this.character.maxHealth) * this.barWidth, this.healthBar.height));
        this.energyBar.crop(new Phaser.Rectangle(0, 0, (this.character.energy / this.character.maxEnergy) * this.barWidth, this.energyBar.height));


		cursors = this.input.keyboard.createCursorKeys();

		if (cursors.left.isDown)
		{
			this.player.body.gravity.x = -1000;
		}
		else if (cursors.right.isDown)
		{
			this.player.body.gravity.x = 1000;
		}
		else {
			this.player.body.gravity.x = 0;
			this.player.body.velocity.x = this.player.body.velocity.x / 1.1;
		}

		if (cursors.up.isDown  && this.player.worldPosition.y > 40)
		{
			if (this.player.body.velocity.y > -600) {
				this.player.body.gravity.y = -2000;
			}
			else {
				this.player.body.gravity.y = 0;
			}
		}
		else if (cursors.down.isDown && this.player.worldPosition.y < 560)
		{
			if (this.player.body.velocity.y < 600) {
				this.player.body.gravity.y = 2000;
			}
			else {
				this.player.body.gravity.y = 0;
			}
		}
		else {
			if (this.player.body.velocity.y > 150) {
				this.player.body.gravity.y = -2000;
			}
			else if (this.player.body.velocity.y > 90) {
				this.player.body.gravity.y = -300;
			}
			if (this.player.body.velocity.y < -150) {
				this.player.body.gravity.y = 2000;
			}
			else if (this.player.body.velocity.y < -90) {
				this.player.body.gravity.y = 300;
			}
		}

		if (this.input.keyboard.isDown(Phaser.Keyboard.ESC)) {
  //var gray = this.add.filter('Gray');

//this.game.paused = true;

		}


		if (this.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR))
		{
			if(this.character.energy > 0) {
				if(this.weapons[this.currentWeapon].fire(this.player)) this.sound.play();

				this.character.removeEnergy();
			}
			
		} else {

			this.character.addEnergy();
		}


	}
};
