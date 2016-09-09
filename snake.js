/* Global variable mess */
var frontBuffer = document.getElementById('snake');
var frontCtx = frontBuffer.getContext('2d');
var backBuffer = document.createElement('canvas');
backBuffer.width = frontBuffer.width;
backBuffer.height = frontBuffer.height;
var backCtx = backBuffer.getContext('2d');
backCtx.font = "15px Courier";
var oldTime = performance.now();
var score = 0;
var innerScoreText = 'Score: ';
var SCOREINCREMENT = 100;
var applesGained = 0;
var scoreMultiplier = 1;

var mute = new Image();
mute.src = 'mute.png';
var unmute = new Image();
unmute.src = 'unmute.png';
var muted = false;

var BARRIERWIDTH = 20;
var BARRIERHEIGHT = 100;

var Barrier = function (x, y, width, height){
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
}

var barriers = []
barriers[0] = new Barrier(127, 100, BARRIERWIDTH, BARRIERHEIGHT)
barriers[1] = new Barrier(381, 100, BARRIERWIDTH, BARRIERHEIGHT)
barriers[2] = new Barrier(635, 100, BARRIERWIDTH, BARRIERHEIGHT)
barriers[3] = new Barrier(127, 280, BARRIERWIDTH, BARRIERHEIGHT)
barriers[4] = new Barrier(381, 280, BARRIERWIDTH, BARRIERHEIGHT)
barriers[5] = new Barrier(635, 280, BARRIERWIDTH, BARRIERHEIGHT)


var audioArray = []
audioArray[0] = new Audio('wall.mp3');
audioArray[1] = new Audio('honest.mp3')
audioArray[2] = new Audio('educated.mp3')
audioArray[3] = new Audio('losers.mp3')
audioArray[4] = new Audio('rich.mp3')
var currentAudio = 0;

var laugh = new Audio('laugh.mp3');
var laughPlayed = false;

var badPlacement = true;

var gameOver = false;
var direction = 'right';
var SNAKESIZE = 25;
var snake = [];
var speed = 1;
var wall = new Image();
wall.src = 'background2.jpg';

var Turn = function(direction, x, y){
  this.direction = direction;
  this.x = x;
  this.y = y;
}
var hillary = new Image();
hillary.src = 'newgameover.png';
var trump = new Image();
trump.src = 'trumpfloat.png';
var head = new Object();
head.image = trump;
head.x = 0;
head.y = 240;
head.height = SNAKESIZE;
head.width = SNAKESIZE;
head.direction = 'right';
head.turnIndex = 0;

var Apple = function(image, x, y, width, height){
  this.image = image;
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
}
var applePic = new Image();
applePic.src = 'moneybag.png';
var appleOut = false;
var apple;
var turnQueue = [];

snake[0] = head;

var gameTime = 0;
var keyDown = 0;

var fadeInHillary = 0.0;

/**
 * @function loop
 * The main game loop.
 * @param{time} the current time as a DOMHighResTimeStamp
 */
function loop(newTime) {
  var elapsedTime = newTime - oldTime;

  update(elapsedTime);
  render(elapsedTime);

  // Flip the back buffer
  frontCtx.clearRect(0, 0, 760, 480);
  frontCtx.drawImage(backBuffer, 0, 0);

  // Run the next loop
  window.requestAnimationFrame(loop);
}

/**
 * @function update
 * Updates the game state, moving
 * game objects and handling interactions
 * between them.
 * @param {elapsedTime} A DOMHighResTimeStamp indicting
 * the number of milliseconds passed since the last frame.
 */
function update(elapsedTime) {
  //spawn new snake segment based on time
  if(gameTime % 100 == 0 && !gameOver){
    var segment = new Object();
    switch(snake[snake.length - 1].direction){
      case 'up':
        segment.x = snake[snake.length - 1].x;
        segment.y = snake[snake.length - 1].y + SNAKESIZE;
        break;
      case 'down':
        segment.x = snake[snake.length - 1].x;
        segment.y = snake[snake.length - 1].y - SNAKESIZE;
        break;
      case 'left':
        segment.x = snake[snake.length - 1].x + SNAKESIZE;
        segment.y = snake[snake.length - 1].y;
        break;
      case 'right':
        segment.x = snake[snake.length - 1].x - SNAKESIZE;
        segment.y = snake[snake.length - 1].y;
        break;
    }
    segment.width = SNAKESIZE;
    segment.height = SNAKESIZE;
    segment.direction = snake[snake.length - 1].direction;
    segment.turnIndex = snake[snake.length - 1].turnIndex;
    snake.push(segment);
  }
  //spawn new apple & ensure it doesn't pop up outside the screen or in the barriers
  if(!appleOut){
    while(badPlacement){
      var appleX = Math.floor(Math.random() * 720 + 20);
      var appleY = Math.floor((Math.random() * 420) + 20);
      for(var i = 0; i < barriers.length; i++){
        if (edgeDetect(appleX, appleY, SNAKESIZE, SNAKESIZE, barriers[i].x, barriers[i].y, BARRIERWIDTH, BARRIERHEIGHT)){
          badPlacement = true;
          break;
        }
        badPlacement = false;
      }
    }
    apple = new Apple(applePic, Math.floor(Math.random() * 720 + 20), Math.floor((Math.random() * 420) + 20), SNAKESIZE, SNAKESIZE);
    appleOut = true;
    badPlacement = true;
  }
  //increase snake segment if apple found, play trump sound
  if(appleOut && edgeDetect(head.x, head.y, head.width, head.height, apple.x, apple.y, apple.width, apple.height)){
    var segment = new Object();
    switch(snake[snake.length - 1].direction){
      case 'up':
        segment.x = snake[snake.length - 1].x;
        segment.y = snake[snake.length - 1].y + SNAKESIZE;
        break;
      case 'down':
        segment.x = snake[snake.length - 1].x;
        segment.y = snake[snake.length - 1].y - SNAKESIZE;
        break;
      case 'left':
        segment.x = snake[snake.length - 1].x + SNAKESIZE;
        segment.y = snake[snake.length - 1].y;
        break;
      case 'right':
        segment.x = snake[snake.length - 1].x - SNAKESIZE;
        segment.y = snake[snake.length - 1].y;
        break;
    }
    segment.width = SNAKESIZE;
    segment.height = SNAKESIZE;
    segment.direction = snake[snake.length - 1].direction;
    segment.turnIndex = snake[snake.length - 1].turnIndex;
    snake.push(segment);
    appleOut = false;
    if(currentAudio == 0){
      audioArray[4].pause();
      audioArray[4].currentTime = 0;
    }
    else{
      audioArray[currentAudio - 1].pause();
      audioArray[currentAudio - 1].currentTime = 0;
    }
    if(!muted) audioArray[currentAudio].play();
    if(currentAudio <= 3){
      currentAudio++;
    }
    else{
      currentAudio = 0;
    }
    applesGained++;
    if(applesGained % 10 == 0){
      scoreMultiplier++;
    }
    score += scoreMultiplier * SCOREINCREMENT;
    score.innerHTML = innerScoreText + score;
  }
  //keypress handling for movement and game reset, including tracking turns
  window.onkeydown = function(event){
  	event.preventDefault();
    if(keyDown == 0){
      switch(event.keyCode){
        //up
        case 87:
        case 38:
          if(snake[0].direction != 'down'){
      			snake[0].direction = 'up';
            var newTurn = new Turn('up', snake[0].x, snake[0].y);
            turnQueue.push(newTurn);
          }
    			break;
    		//down
    		case 83:
        case 40:
          if (snake[0].direction != 'up'){
      			snake[0].direction = 'down';
            var newTurn = new Turn('down', snake[0].x, snake[0].y);
            turnQueue.push(newTurn);
          }
    			break;
    		//left
    		case 65:
        case 37:
          if(snake[0].direction != 'right'){
      			snake[0].direction = 'left';
            var newTurn = new Turn('left', snake[0].x, snake[0].y);
            turnQueue.push(newTurn);
          }
    			break;
    		//right
    		case 68:
        case 39:
          if(snake[0].direction != 'left'){
      			snake[0].direction = 'right';
            var newTurn = new Turn('right', snake[0].x, snake[0].y);
            turnQueue.push(newTurn);
          }
    			break;
        case 77:
          if (muted){
            muted = false;
          }
          else{
            muted = true;
          }
          laugh.pause();
          laugh.currentTime = 0;
          if(currentAudio == 0){
            audioArray[4].pause();
            audioArray[4].currentTime = 0;
          }
          else{
            audioArray[currentAudio - 1].pause();
            audioArray[currentAudio - 1].currentTime = 0;
          }
          break;
        //reset (R)
        case 82:
          score = 0;
          scoreMultiplier = 1;
          applesGained = 0;
          speed = 1;
          gameOver = false;
          appleOut = false;
          laughPlayed = false;
          currentAudio = 0;
          fadeInHillary = 0.0
          turnQueue = new Array;
          snake = new Array;
          snake[0] = head;
          head.x = 0;
          head.y = 240;
          head.direction = 'right';
          head.turnIndex = 0;
          break;
      }
    }
    keyDown = 1;
  }
  //handle keys being released
  window.onkeyup = function (event){
    keyDown = 0;
  }
  //process turnQueue ie make turns for segments if necessary
  if(turnQueue[0] != null){
    for(var r = 1; r < snake.length; r++ ){
      if(turnQueue[snake[r].turnIndex] != null && snake[r].x == turnQueue[snake[r].turnIndex].x && snake[r].y == turnQueue[snake[r].turnIndex].y){
        snake[r].direction = turnQueue[snake[r].turnIndex].direction;
        snake[r].turnIndex++;
      }
    }
  }


  //handle head + segment direction and movement
  for(var i = 0; i < snake.length; i++){
    switch(snake[i].direction){
      case 'up':
          snake[i].y -= speed;
        break;
      case 'down':
          snake[i].y += speed;
        break;
      case 'left':
          snake[i].x -= speed;
        break;
      case 'right':
          snake[i].x += speed;
        break;
    }
  }
  //detect running into tail segments and end game
  for(var i = 3; i < snake.length; i++){
    var snakeSeg = snake[i];
    if(edgeDetect(head.x, head.y, SNAKESIZE, SNAKESIZE, snakeSeg.x, snakeSeg.y, SNAKESIZE, SNAKESIZE)){
      speed = 0;
      gameOver = true;
      if(currentAudio == 0){
        audioArray[4].pause();
        audioArray[4].currentTime = 0;
      }
      else{
        audioArray[currentAudio - 1].pause();
        audioArray[currentAudio - 1].currentTime = 0;
      }
      if(!laughPlayed){
        if(!muted)laugh.play();
        laughPlayed = true;
      }
    }
  }
//detect running into barrier and end games
  for(var i = 0; i < barriers.length; i++){
    var barrierSeg = barriers[i];
    if(edgeDetect(head.x, head.y, SNAKESIZE, SNAKESIZE, barrierSeg.x, barrierSeg.y, BARRIERWIDTH, BARRIERHEIGHT)){
      speed = 0;
      gameOver = true;
      if(currentAudio == 0){
        audioArray[4].pause();
      }
      else{
        audioArray[currentAudio - 1].pause();
      }
      if(!laughPlayed){
        if(!muted)laugh.play();
        laughPlayed = true;
      }
    }
  }

  //handle out of bounds and end game
  if(head.x > 760 || head.x < 0 || head.y > 480 || head.y < 0){
    speed = 0;
    gameOver = true;
    if(!laughPlayed){
      if(!muted)laugh.play();
      laughPlayed = true;
    }
  }
  gameTime++;
}

/**
  * @function render
  * Renders the current game state into a back buffer.
  * @param {elapsedTime} A DOMHighResTimeStamp indicting
  * the number of milliseconds passed since the last frame.
  */
function render(elapsedTime) {
    backCtx.clearRect(0, 0, 760, 480);
    var snakeHead = snake[0];
    // TODO: Draw the game objects into the backBuffer
    backCtx.drawImage(trump, snakeHead.x, snakeHead.y, SNAKESIZE, SNAKESIZE)
    if(muted){
      backCtx.drawImage(mute, 720, 440, 25, 25);
    }
    else {
      backCtx.drawImage(unmute, 720, 440, 25, 25);
    }
    for(var i = 1; i < snake.length; i++){
      backCtx.drawImage(wall, snake[i].x, snake[i].y, snake[i].width, snake[i].height);
    }
    if(appleOut){
      backCtx.drawImage(apple.image, apple.x, apple.y, apple.width, apple.height);
    }
    for(var i = 0; i < barriers.length; i++){
      backCtx.fillRect(barriers[i].x, barriers[i].y, barriers[i].width, barriers[i].height);
    }
    if(gameOver){
      backCtx.fillStyle = "black";
      backCtx.fillRect(0, 0, 760, 480)
      backCtx.globalAlpha = fadeInHillary;
      fadeInHillary += 0.005;
      backCtx.drawImage(hillary, 197, 0, 367, 480);
      backCtx.globalAlpha = 1.0;
      backCtx.fillStyle = "white";
      backCtx.fillText(innerScoreText + score, 15, 15);
    }
    else{
      backCtx.fillStyle = "black";
      backCtx.fillText(innerScoreText + score, 15, 15);
    }

}

/**
 * @function edgeDetect
 * Compares the four corners of two rectangles to see if any of them intersect with each other
 * @param {rect1x} Upper left hand x position of the first rectangle
 * @param {rect1y} Upper left hand y position of the first rectangle
 * @param {rect1height} Height of first rectangle
 * @param {rect1width} Width of first rectangle
 * @param {rect2x} Upper left hand x position of the second rectangle
 * @param {rect2y} Upper left hand y position of the second rectangle
 * @param {rect2height} Height of second rectangle
 * @param {rect2width} Width of second rectangle
 */
function edgeDetect(rect1x, rect1y, rect1width, rect1height, rect2x, rect2y, rect2width, rect2height){
  if(rect1x >= rect2x && rect1x <= rect2x + rect2width && rect1y >= rect2y && rect1y <= rect2y + rect2height){
    return true;
  }
  if(rect1x >= rect2x && rect1x <= rect2x + rect2width && rect1y + rect1height >= rect2y && rect1y + rect1height <= rect2y + rect2height){
    return true;
  }
  if(rect1x + rect1width >= rect2x && rect1x + rect1width <= rect2x + rect2width && rect1y >= rect2y && rect1y <= rect2y + rect2height){
    return true;
  }
  if(rect1x + rect1width >= rect2x && rect1x + rect1width <= rect2x + rect2width && rect1y + rect1height >= rect2y && rect1y + rect1height <= rect2y + rect2height){
    return true;
  }
  //
  if(rect2x >= rect1x && rect2x <= rect1x + rect1width && rect2y >= rect1y && rect2y <= rect1y + rect1height){
    return true;
  }
  if(rect2x >= rect1x && rect2x <= rect1x + rect1width && rect2y + rect2height >= rect1y && rect2y + rect2height <= rect1y + rect1height){
    return true;
  }
  if(rect2x + rect2width >= rect1x && rect2x + rect2width <= rect1x + rect1width && rect2y >= rect1y && rect2y <= rect1y + rect1height){
    return true;
  }
  if(rect2x + rect2width >= rect1x && rect2x + rect2width <= rect1x + rect1width && rect2y + rect2height >= rect1y && rect2y + rect2height <= rect1y + rect1height){
    return true;
  }
  return false;
}
/* Launch the game */
window.requestAnimationFrame(loop);
