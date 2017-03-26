var AI_Game = AI_Game || {};

AI_Game.game = new Phaser.Game(800, 800, Phaser.AUTO, '');

AI_Game.game.state.add('Boot', AI_Game.Boot);
AI_Game.game.state.add('Preload', AI_Game.Preload);
AI_Game.game.state.add('Game', AI_Game.Game);

AI_Game.game.state.start('Boot');
