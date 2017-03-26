var AI_Game = AI_Game || {};

//title screen
AI_Game.Game = function(){};
var outerMap ;
AI_Game.Game.prototype = {

  create: function() {
    this.map = this.game.add.tilemap('jsonMap');
    this.playerFlag = true;
    this.finnishFlag = true;
    this.positionFlag = false;
    this.wallMap = new Array(801);

    //the first parameter is the tileset name as specified in Tiled, the second is the key to the asset
    this.map.addTilesetImage('tiles', 'gameTiles2');
    this.map.addTilesetImage('tileset', 'gameTiles1');

    //create layer
    this.BackgroundLayer = this.map.createLayer('BackgroundLayer');
    this.BlockedLayer = this.map.createLayer('BlockedLayer');
    this.ObjectsLayer = this.map.createLayer('ObjectsLayer');
    //collision on blockedLayer
    this.map.setCollisionBetween(1, 3000, true, 'BlockedLayer');

    //resizes the game world to match the layer dimensions
    this.BackgroundLayer.resizeWorld();

    this.createHeal();
    this.createEnemy();
    this.createWallMap();

  },

  createWallMap : function(){

    for(var i=0;i<801;i++){
      this.wallMap[i] = new Array(801);
      for(var j=0;j<801;j++){
          this.wallMap[i][j] = 0;
        }
      }

    var blockedData = this.BlockedLayer.layer.data;

    blockedData.forEach(function(arr){
      arr.forEach(function(ctile){
        if(ctile.collides == false){
        for(var i=ctile.left;i<=ctile.right;i++){
          for(var j=ctile.top;j<=ctile.bottom;j++){
            this.wallMap[i][j] = 1;
            }
          }
        }
      },this);
    },this);


  },

  createHeal: function() {
    //create items
    this.items = this.game.add.group();
    this.items.enableBody = true;
    var result;
    result = this.findObjectsByType('heal', this.map, 'ObjectsLayer');
    result.forEach(function(element){
      this.createFromTiledObject(element, this.items);
    }, this);
  },

  //find objects in a Tiled layer that containt a property called "type" equal to a certain value
  findObjectsByType: function(type, map, layer) {
    var result = new Array();
    map.objects[layer].forEach(function(element){
      if(element.properties.type === type) {
        //Phaser uses top left, Tiled bottom left so we have to adjust
        //also keep in mind that the cup images are a bit smaller than the tile which is 16x16
        //so they might not be placed in the exact position as in Tiled
        element.y -= map.tileHeight;
        result.push(element);
      }
    });
    return result;
  },
  //create a sprite from an object
  createFromTiledObject: function(element, group) {
    var sprite = group.create(element.x, element.y,element.properties.sprite);
    if(element.properties.type === 'enemy'){
      sprite.xSpeed = 60;
      sprite.body.velocity.x = sprite.xSpeed;
      this.game.physics.arcade.enable(sprite);
    }
      //copy all properties to the sprite
      Object.keys(element.properties).forEach(function(key){
        sprite[key] = element.properties[key];
      });
  },
  createEnemy : function(){
    this.enemies = this.game.add.group();
    this.enemies.enableBody = true;
    var result ;
    result = this.findObjectsByType('enemy',this.map,'ObjectsLayer');
    result.forEach(function(element){
      this.createFromTiledObject(element, this.enemies);
    }, this);
  },
  setPlayer : function(){

      if(this.playerFlag == true){
        if(this.game.input.mousePointer.x < this.game.world.bounds.width && this.game.input.mousePointer.y < this.game.world.bounds.height){
            this.player = this.game.add.sprite(this.game.input.mousePointer.x, this.game.input.mousePointer.y, 'player');
            this.game.physics.arcade.enable(this.player);
            this.player.height = 14.5;
            this.player.width = 9.5;
            this.player.anchor.setTo(-0.07,-0.1);
            //the camera will follow the player in the world
            this.game.camera.follow(this.player);
        }
      }

  },

  setFinnish : function(){

      if(this.finnishFlag == true){
        if(this.game.input.mousePointer.x < this.game.world.bounds.width && this.game.input.mousePointer.y < this.game.world.bounds.height){
            this.finnish = this.game.add.sprite(this.game.input.mousePointer.x, this.game.input.mousePointer.y, 'finnish');
            this.game.physics.arcade.enable(this.finnish);
        }
      }

  },

  update: function() {
    //collision

    this.game.physics.arcade.collide(this.enemies,this.BlockedLayer,function(enemy){
      var randomNumber = Math.floor(Math.random() * (3 - 1 + 1)) + 1;
      enemy.xSpeed *= -1;
      if(randomNumber == 1){
        enemy.body.velocity.x = enemy.xSpeed;
      }
      else if(randomNumber == 2){
        enemy.body.velocity.y = enemy.xSpeed;
      }
      else {
        enemy.body.velocity.x = enemy.xSpeed;
        enemy.body.velocity.y = enemy.xSpeed;
      }
    });
    this.game.physics.arcade.overlap(this.player, this.items, this.collect, null, this);
    this.game.physics.arcade.collide(this.player,this.BlockedLayer,function(player){
      console.log("HIT!! ",Math.round(player.x),Math.round(player.y));
      console.log("Player Velocity X & Y: ",player.body.velocity.x,player.body.velocity.y);
    });

    if(this.player && this.finnish){
      this.game.physics.arcade.overlap(this.player,this.finnish,this.stopPlayer,null,this);
    }

    if(this.game.input.activePointer.isDown)
    {
      if(this.playerFlag == true){
        this.setPlayer();
        this.playerFlag = false;
      }
      else {
        if(this.game.input.mousePointer.x != this.player.x && this.game.input.mousePointer.y != this.player.y)
        {
          this.setFinnish();
          this.finnishFlag = false;
        }
      }
    }

    if(this.player && this.finnish){
      if(!this.playerBrain){
        this.playerBrain = new PlayerBrain(this.player,this.finnish,this.BlockedLayer.layer.data);
    }
      this.playerBrain.cognitiveStart(this.player);
  }

  },

  collect: function(player,collectable){
    collectable.destroy();
  },
  stopPlayer : function(player){
    player.stopGameFlag = true;
    player.body.velocity.x = 0;
    player.body.velocity.y = 0;
  }

};
