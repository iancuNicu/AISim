var AI_Game = AI_Game || {};

//loading the game assets
AI_Game.Preload = function(){};

AI_Game.Preload.prototype = {
  preload: function() {
    //show loading screen
    this.preloadBar = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'preloadbar');
    this.preloadBar.anchor.setTo(0.5);

    this.load.setPreloadSprite(this.preloadBar);

    //load game assets
    this.load.tilemap('jsonMap', 'assets/jsonMap.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.image('gameTiles1', 'assets/tileset.png');
    this.load.image('gameTiles2', 'assets/tiles.png');
    this.load.image('player', 'assets/player.png');
    this.load.image('firstaid', 'assets/bluecup.png');
    this.load.image('skeleton', 'assets/enemy_spawner.png');
    this.load.image('finnish','assets/browndoor.png');

  },
  create: function() {
    this.state.start('Game');
  }
};
