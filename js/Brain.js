'use strict';

 function PlayerBrain(player,finnish,dataLayerMap) {

   this.player = player;
   this.mapLayer = dataLayerMap;
   console.log("Tile Map: ",this.mapLayer);
   console.log("CTILE: ",this.mapLayer[Math.round(player.y/16)][Math.round(player.x/16)]);
   this.startPosition = {
     x : player.x,
     y : player.y
   };
   this.finnishPosition = {
     x : Math.round(finnish.x/16),
     y : Math.round(finnish.y/16)
   };
   this.path = [];
   this.obsolete = [];
   this.nextMove;
   this.centrateFlag = false;
   this.centratePosition = {
     x : 1000,
     y : 1000
   };
   console.log(this.path);
   console.log(this.obsolete);

 };

PlayerBrain.prototype = {

  cognitiveStart : function(player){

    if(this.nextMove == undefined){
      this._centratePlayer(player);
    }
    else{
          if(this.nextMove == 0){
            this.movePlayer(this._getSuroundings());
            this._moveTo(player,this.nextMove);
          }
          else if(Math.round(player.x) == this.nextMove.worldX && Math.round(player.y) == this.nextMove.worldY){
              player.body.velocity.x = 0;
              player.body.velocity.y = 0;
              this.movePlayer(this._getSuroundings());
              this._moveTo(player,this.nextMove);
          }
          else if(Math.round(this.player.x) != this.nextMove.worldX && Math.round(this.player.y) != this.nextMove.worldY){
              player.body.velocity.x = 0;
              player.body.velocity.y = 0;
              player.x = this.nextMove.worldX;
              this._moveTo(player,this.nextMove);
          }
        }

  },

  _centratePlayer : function(player){

    var j,
        i,
        tile;

      j = Math.round(player.x/16);
      i = Math.round(player.y/16);
      tile = this.mapLayer[i][j]
      player.x = tile.worldX;
      player.y = tile.worldY;
      this.nextMove = 0;

  },

  movePlayer : function(positionObj){

      var  computedMove,
           inPathObj;

      if(this._inPath(positionObj.x,positionObj.y)){

        inPathObj = this._retPathObj(positionObj.x,positionObj.y);

        computedMove = this._choosePath(inPathObj.paths);
        if(computedMove == undefined){
          this._addToObsolete(inPathObj);
          this._removeFromPath(inPathObj);
          this.nextMove = this.path[this.path.length-1];
        }
        else {
          this._setVisited(inPathObj,computedMove);
          this.nextMove = computedMove;
        }

      }
      else if (this._inObsolete(positionObj.x,positionObj.y)) {

        this.nextMove = this.path[this.path.length-1]

      }
      else {
        this._addToPath(positionObj);
        computedMove = this._choosePath(positionObj.paths);
        if(computedMove == undefined){
          this.obsolete._addToObsolete(positionObj);
          this.path._removeFromPath(positionObj);
          this.nextMove = this.path[this.path.length-1];
        }
        else {
          this._setVisited(positionObj,computedMove);
          this.nextMove = computedMove;
        }

      }


  },

  _removeFromPath : function(obj){

    for(var i=0;i<this.path.length;i++){
      if(this.path[i].x == obj.x && this.path[i].y == obj.y){
        this._addToObsolete(obj);
        this.path[i] = 'removed';
      }
    }
    var secondPath = [];
    for(var j=0;j<this.path.length;j++){
      if(this.path[j] != 'removed'){
        secondPath.push(this.path[j]);
      }
    }
    this.path = secondPath;

  },

  _addToObsolete : function(obj){

    var flag = false;
    if(this.obsolete.length == 0){
      this.obsolete.push(obj);
      return;
    }
    else {
    for(var i=0;i<this.obsolete.length;i++){
      if(this.obsolete[i].x == obj.x && this.obsolete[i].y == obj.y){
        flag = true;
      }
    }
  }
    if(flag == false){
      this.obsolete.push(obj);
    }

  },

  _retPathObj : function(x,y){

    var returnedObj;
    for(var i=0;i<this.path.length;i++){
      if(this.path[i].x == x && this.path[i].y == y){
        returnedObj = this.path[i];
      }
    }
    return returnedObj

  },

  _addToPath : function(obj){

    if(this._inPath(obj.x,obj.y)){
      return;
    }
    else {
      this.path.push(obj);
    }

  },

  _getSuroundings : function(){

    var x,y;
    x = Math.round(this.player.x/16);
    y = Math.round(this.player.y/16);

    var sign = [1,-1],
        directions = ['S','N','E','V'],
        retObj,
        suroundings = [];

      for(var k=0;k<2;k++){

        if(this.mapLayer[y+sign[k]][x].collides == false){
          var obj1 = {};
          if(y+sign[k]<0 || y+sign[k]>800){
            continue;
          }
          else {
            obj1.x = this.mapLayer[y+sign[k]][x].x;
            obj1.y = this.mapLayer[y+sign[k]][x].y;
            obj1.worldX = this.mapLayer[y+sign[k]][x].worldX;
            obj1.worldY = this.mapLayer[y+sign[k]][x].worldY;
            obj1.visited = false;
            obj1.proximity = Math.sqrt((this.finnishPosition.x-obj1.x)*(this.finnishPosition.x-obj1.x)+(this.finnishPosition.y-obj1.y)*(this.finnishPosition.y-obj1.y));
            obj1.direction = directions[k];
            suroundings.push(obj1);
          }
        }
        if(this.mapLayer[y][x+sign[k]].collides == false){
          var obj2 = {};
          if(y+sign[k]<0 || y+sign[k]>800){
            continue;
          }
          else {
            obj2.x = this.mapLayer[y][x+sign[k]].x;
            obj2.y = this.mapLayer[y][x+sign[k]].y;
            obj2.worldX = this.mapLayer[y][x+sign[k]].worldX;
            obj2.worldY = this.mapLayer[y][x+sign[k]].worldY;
            obj2.visited = false;
            obj2.proximity = Math.sqrt((this.finnishPosition.x-obj2.x)*(this.finnishPosition.x-obj2.x)+(this.finnishPosition.y-obj2.y)*(this.finnishPosition.y-obj2.y));
            obj2.direction = directions[k+2];
            suroundings.push(obj2);
          }
        }

      }
      retObj = {
        worldX : this.mapLayer[y][x].worldX,
        worldY : this.mapLayer[y][x].worldY,
        x : x,
        y : y,
        tile : this.mapLayer[y][x],
        paths : suroundings
      };
      return retObj;

  },

  _moveTo : function(player,nextPos){

    console.log("Next Move: ",nextPos);

    var x = Math.round(player.x),
        y = Math.round(player.y);

    if(x != nextPos.worldX){
      if(x < nextPos.worldX){
        player.body.velocity.x = 30;
      }
      else {
        player.body.velocity.x = -30;
      }
    }
    if(y != nextPos.worldY){
      if(y < nextPos.worldY){
        player.body.velocity.y = 30;
      }
      else {
        player.body.velocity.y = -30;
      }
    }

  },

  _setVisited : function(posObj,nextPos){

    this.path.forEach(function(pathObj){
      if(pathObj.x == posObj.x && pathObj.y == posObj.y){
        for(var i=0;i<posObj.paths.length;i++){
          if(posObj.paths[i].x == nextPos.x && posObj.paths[i].y == nextPos.y){
            posObj.paths[i].visited = true;
          }
        }
      }
    },this);

  },

  _inPath : function(x,y){

    var pathFlag = false
    this.path.forEach(function(obj){
      if(obj.x == x && obj.y == y){
      pathFlag = true;
      }
    },this);
    return pathFlag;

  },

  _inObsolete : function(x,y){

    var obsoleteFlag = false;
    this.obsolete.forEach(function(obj){
      if(obj.x == x && obj.y == y){
        obsoleteFlag = true
      }
    },this);
    return obsoleteFlag;

  },

  //returns the path with the lowest proximity
  _choosePath : function(possibleMoves){

    var lowProximity = {
      proximity : 10000
    };
    if(possibleMoves.length == 1){
      if(possibleMoves[0].visited != true){
      lowProximity = possibleMoves[0];
        return lowProximity;
      }
      else {
        return undefined;
      }
    }
    else {
      for(var i=0;i<possibleMoves.length;i++){
        if(possibleMoves[i].proximity < lowProximity.proximity &&
          possibleMoves[i].visited != true){
            lowProximity = possibleMoves[i];
        }
      }
    }
      if(lowProximity.proximity == 10000){
        return undefined;
      }
      else {
        return lowProximity;
      }
    }

  };
