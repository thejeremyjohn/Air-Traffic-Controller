var accTime=0, lastTime=Date.now(), paused=false,
    timeInterval=desiredTimeInterval,
    desiredTimeInterval=15, keyDown=false;
var ready, ctx, ticker, lzs, score, highScores, mousePos,
    player, gameOver, emojiTypes, emojis, selectedEmoji,
    happy, bigHappy, smallHappy, worried, dead, shocked;
var database, scoreSaved=false;
var music, eeung, collision, giggle, muted=false;
const colors = ['blue', 'red'];

function tick() {
  if (ready) {
    const deltaTime = Date.now() - lastTime;
    lastTime = Date.now();
    accTime += deltaTime;
    if (accTime >= timeInterval) {
      accTime = 0;
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      lzs.forEach( lz => lz.draw(ctx) );
      for (var i = 0; i < emojis.length; i++) {
        handleProximity(i);
        if (!emojis[i]) continue;
        emojis[i].move();
        emojis[i].draw();
        if (emojis[i].wayOff()) {
          emojis.splice(i, 1);
          emojis.push( spawnEmoji() );
        }
      }
      while ( emojis.length < Math.floor(score/5) ) {
        emojis.push( spawnEmoji() );
      }
      drawScore();
    }
  }
  ticker = requestAnimationFrame(tick);
}
ticker = requestAnimationFrame(tick);

document.addEventListener('DOMContentLoaded', () => {
  happy = new Image();
  worried = new Image();
  dead = new Image();
  shocked = new Image();
  bigHappy = new Image();
  smallHappy = new Image();
  happy.src = "./emojis/eyeglasses-black-face-emoticon.png";
  worried.src = "./emojis/worried-black-face.png";
  dead.src = "./emojis/astonished-black-emoticon-face.png";
  shocked.src = "./emojis/flashed-black-emoticon-face.png";
  bigHappy.src = "./emojis/moustache-male-black-emoticon-face.png";
  smallHappy.src = "./emojis/laughing-emoticon-black-happy-face.png";
  music = new sound("./sound/bensound-dreams.mp3", 0.25, true);
  eeung = new sound("./sound/eeung.wav", 0.5);
  collision = new sound("./sound/collision.wav", 0.25);
  giggle = new sound("./sound/cute-giggle.wav");

  var collect = assetCollect(10);

  happy.onload = () => ( collect = collect() );
  worried.onload = () => ( collect = collect() );
  dead.onload = () => ( collect = collect() );
  shocked.onload = () => ( collect = collect() );
  bigHappy.onload = () => ( collect = collect() );
  smallHappy.onload = () => ( collect = collect() );
  music.sound.onprogress = () => ( collect = collect() );
  eeung.sound.onprogress = () => ( collect = collect() );
  collision.sound.onprogress = () => ( collect = collect() );
  giggle.sound.onprogress = () => ( collect = collect() );
  emojiTypes = {
    regular: {
      faces: {happy, worried, dead, shocked},
      radius: 25, speed: 1
    },
    big: {
      faces: {happy:bigHappy, worried, dead, shocked},
      radius: 30, speed: .65
    },
    small: {
      faces: {happy:smallHappy, worried, dead, shocked},
      radius: 20, speed: 1.5
    }
  };
});

function assetCollect(n) {
  var count = 0;
  const collector = () => {
    count++;
    if (count === n) {
      const canvas = document.getElementById("contentContainer");
      ctx = canvas.getContext("2d");
      newGame();
      ready = true;
    } else {
      return collector;
    }
  };
  return collector;
}

function writeHighScore(player, score) {
  let key = database.push().key;
  database.update({
    [key]: {player, score}
  });
  // const highscores = [];
  // database.orderByChild('score').on('child_added', function(data) {
  //   highscores.unshift(data.val());
  // });
  // console.log(highscores);
}

function getHighScores() {
  // let scores;
  // database.orderByChild('score').limitToLast(10)
  //   .on('value', (data) => {
  //     scores = Object.values(data.val()).reverse();
  //   });
  // return scores;
  database.on('value', (data) => {
    highScores = Object.values(data.val()).sort(
      (a,b) => (b.score - a.score)
    );
  });
}

function drawHighScores(scores) {
  if (scores) {
    scores = scores.slice(0, 15);
    ctx.textAlign='left';
    ctx.fillStyle='orange';
    ctx.font = '20px Arial';
    ctx.fillText('RANK', 20, 70);
    ctx.fillText('NAME', ctx.canvas.width/2-40, 70);
    ctx.fillText('SCORE', ctx.canvas.width-100, 70);
    let height = 100;
    ctx.fillStyle='white';
    for (let i=0; i<scores.length; i++) {
      ctx.fillText(`${i+1}.`, 20, height);
      ctx.fillText(`${scores[i].player}`, ctx.canvas.width/2-40, height);
      ctx.fillText(`${scores[i].score}`, ctx.canvas.width-100, height);
      height += 20;
    }
  }
}

function sound(src, volume=1, _music=false) {
  this.sound = document.createElement("audio");
  this.sound.src = src;
  this.sound.setAttribute("preload", "auto");
  this.sound.setAttribute("controls", "none");
  this.sound.style.display = "none";
  this.oVol = volume;
  this.sound.volume = volume;
  document.body.appendChild(this.sound);
  this.play = () => this.sound.play();
  this.mute = () => { this.sound.volume = 0; };
  this.unmute = () => { this.sound.volume = this.oVol; };
  if (_music) {
    this.sound.autoplay = true;
    this.sound.onended = () => this.play();
  }
  // this.stop = function(){
  //     this.sound.pause();
  // };
}

// function playMusic() {
//   if (!music) {
//     music = new sound("./sound/bensound-dreams.mp3");
//     music.sound.volume = 0.35;
//     music.sound.onended = () => {
//       music.play();
//     };
//     music.play();
//   } else {
//     music.sound.playbackRate = 1;
//   }
// }

function newGame() {
  database = firebase.database().ref();
  // if (!music) music.play();
  scoreSaved = false;
  gameOver = false;
  ctx.canvas.removeEventListener("mousedown", newGame);
  ctx.canvas.addEventListener("mousedown", selectEmoji);
  document.body.onkeydown = (e) => {
    if(keyDown===false && (e.keyCode === 32 || e.key === ' ')) {
      keyDown = true; selectEmoji(e);
    }
  };
  ctx.canvas.addEventListener("mousedown", pause);
  ctx.canvas.addEventListener("mousedown", regularSpeed);
  ctx.canvas.addEventListener("mousedown", slowerSpeed);
  ctx.canvas.addEventListener("mousedown", mute);
  ctx.canvas.addEventListener("mouseup", () => (selectedEmoji = null));
  document.body.onkeyup = (e) => {
    if(e.keyCode === 32 || e.key === ' ') {
      keyDown = false; selectedEmoji = null;
    }
  };
  ctx.canvas.addEventListener("mousemove", getMousePos);
  ctx.canvas.addEventListener("mousemove", () => buildRoute(mousePos));
  emojis = [];
  emojis.push( spawnEmoji() );
  emojis.push( spawnEmoji() );
  lzs = spawnLZs(2);
  score = 0;
  timeInterval = desiredTimeInterval;
  music.sound.playbackRate = 1;
  eeung.sound.playbackRate = 1;
  collision.sound.playbackRate = 1;
  giggle.sound.playbackRate = 1;
}

class LandingZone {
  constructor(options) {
    this.radius = options.radius;
    this.x = options.x;
    this.y = options.y;
    this.color = options.color;
  }
  draw(ctx) {
    ctx.strokeStyle=this.color;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    ctx.arc(this.x, this.y, this.radius-10, 0, 2 * Math.PI);
    ctx.arc(this.x, this.y, this.radius-20, 0, 2 * Math.PI);
    ctx.stroke();
  }
}
// function mouseCollidesWith(lz) {
//   console.log(`mouseCollidesWith was called`);
//   var distance = distanceBetween(mousePos, lz);
//   if ( distance < mousePos + lz.radius ) {
//     console.log(`it does collide`);
//     return true;
//   }
//   console.log(`it does not collide`);
//   return false;
// }

function play() {
  if (paused) {
    ticker = requestAnimationFrame(tick);
    paused = false;
  }
}

function pause() {
  if ( mousePos.x < 30 && mousePos.y > ctx.canvas.height-25 ) {
    if (!paused) {
      ctx.fillStyle = 'orange';
      const y = ctx.canvas.height;
      ctx.fillRect(5, y-25, 10, 20);
      ctx.fillRect(20, y-25, 10, 20);
      ctx.fillStyle = 'grey';
      ctx.beginPath();
      ctx.moveTo(42, y-6);
      ctx.lineTo(42, y-23);
      ctx.lineTo(57, y-14);
      ctx.fill();

      cancelAnimationFrame(ticker);
      paused = true;
    }
  }
}

function regularSpeed(e) {
  if (
    mousePos.x > 30
    && mousePos.x < 60
    && mousePos.y > ctx.canvas.height-25
  ) {
    timeInterval = desiredTimeInterval;
    music.sound.playbackRate = 1;
    eeung.sound.playbackRate = 1;
    collision.sound.playbackRate = 1;
    giggle.sound.playbackRate = 1;
    play();
  }
}

function slowerSpeed(e) {
  if (
    mousePos.x > 60
    && mousePos.x < 90
    && mousePos.y > ctx.canvas.height-25
  ) {
    timeInterval *= 2;
    music.sound.playbackRate /= 2;
    eeung.sound.playbackRate /= 2;
    collision.sound.playbackRate /= 2;
    giggle.sound.playbackRate /= 2;
    play();
  }
}

function mute(e) {
  if (
    mousePos.x > 98
    && mousePos.x < 124
    && mousePos.y > ctx.canvas.height-25
  ) {
    if (muted === false) {
      music.mute();
      eeung.mute();
      collision.mute();
      giggle.mute();
      muted = true;
    } else {
      music.unmute();
      eeung.unmute();
      collision.unmute();
      giggle.unmute();
      muted = false;
    }
  }
}

function drawButtons() {
  const y = ctx.canvas.height;
  ctx.fillStyle = 'grey';
  ctx.strokeStyle = 'grey';

  // pause
  ctx.fillRect(5, y-25, 10, 20);
  ctx.fillRect(20, y-25, 10, 20);

  // play normal speed
  if ( desiredTimeInterval === timeInterval ) {
    ctx.fillStyle = 'orange';
  }
  ctx.beginPath();
  ctx.moveTo(42, y-6);
  ctx.lineTo(42, y-23);
  ctx.lineTo(57, y-14);
  ctx.fill();
  ctx.fillStyle = 'grey';

  // half current speed
  if ( desiredTimeInterval !== timeInterval ) {
    ctx.fillStyle = 'orange';
  }
  ctx.rect(65, y-25, 25, 20);
  ctx.font = 'bold 10px Arial';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillText('SLO', 67, y-12);
  ctx.fillStyle = 'grey';

  // sound
  ctx.fillRect(98, y-18.5, 6, 8);
  ctx.beginPath();
  ctx.moveTo(112, y-6);
  ctx.lineTo(112, y-23);
  ctx.lineTo(97, y-14);
  ctx.fill();
  let a = 1.5 * Math.PI;
  let b = 2.5 * Math.PI;
  ctx.beginPath();
  ctx.arc(111, y-15, 2, a, b);
  ctx.stroke();
  ctx.beginPath();
  if (!muted) ctx.strokeStyle = 'orange';
  ctx.arc(113, y-15, 4, a, b);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(115, y-15, 6, a, b);
  ctx.stroke();
  ctx.strokeStyle = 'grey';
}

function drawScore() {
  drawButtons();

  ctx.textAlign='center';
  ctx.fillStyle = 'white';
  ctx.font = "20px Arial";
  ctx.fillText(score, ctx.canvas.width/2, ctx.canvas.height-10);
  ctx.globalAlpha = 0.5;
  ctx.textAlign='left';
  ctx.font = "20px Arial";
  if (score<=2) {
    ctx.fillText( 'click and drag an emoji to draw its path home...', 20, 40 );
  }
  if (score >= 2 && score <= 4) {
    ctx.fillText( 'you can use SPACEBAR instead of LMB if you prefer...', 20, 60 );
  }
  if (score >= 3 && score <= 4) {
    ctx.fillText( 'they don\'t mind...', 20, 80 );
  }
  if (score >= 4 && score <= 5) {
    ctx.fillText( 'just don\'t let them collide...', 20, 100 );
  }
  if (score >= 5 && score <= 6) {
    ctx.fillText( 'emojis HATE collisions...', 20, 120 );
  }
  if (score >= 6 && score <= 6) {
    ctx.fillText( 'also they\'ll die', 245, 120 );
  }
  if (score >= 7 && score <= 8) {
    ctx.fillText( 'bouncing off walls is cool though...', 20, 140 );
  }
  if (score >= 8 && score <= 8) {
    ctx.fillText( '(not a recommended strategy)...', 20, 160 );
  }
  if (score >= 9 && score <= 10) {
    ctx.fillText( 'ENJOY :]', 20, 190 );
  }
  if (gameOver) {
    ctx.textAlign='center';
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.globalAlpha = 1;
    ctx.fillStyle='purple';
    ctx.font = "130px Arial";
    ctx.fillText('GAME',ctx.canvas.width/2, (ctx.canvas.height/2)-10);
    ctx.fillText('OVER',ctx.canvas.width/2, (ctx.canvas.height/2)+90);
    ctx.fillStyle = 'white';
    ctx.font = "20px Arial";
    ctx.fillText(
      'click anywhere to play again',
      ctx.canvas.width/2,
      ctx.canvas.height-40
    );
    drawHighScores(highScores);
  }
  ctx.globalAlpha = 1;
}

function handleProximity(i) {
  if ( emojis[i].route.length >= 2 && !emojis[i].lz ) {
    for (var lzi = 0; lzi < lzs.length; lzi++) {
      if (
      !emojis[i].landing
      && emojis[i].color === lzs[lzi].color
      && emojis[i].collidesWith(lzs[lzi])
      ) {
        // console.log( 'emoji landing' );
        if (!emojis[i].landing) { giggle.play(); }
        emojis[i].landing = true;
        emojis[i].route = pointsBetween(emojis[i], lzs[lzi]);
        score++;
        emojis[i].lz = lzs[lzi];
        if (score < 10) {
          emojis.push( spawnEmoji() );
        }
        // else {
        //   while ( emojis.length < Math.floor(score/5) ) {
        //   // while (
        //   //   emojis.filter(emoji => emoji.landing === false)
        //   //   < Math.floor(score/5)
        //   // ) {
        //     emojis.push( spawnEmoji() );
        //   }
        // }
        return;
      }
    }
  } else if (emojis[i].radius <= 5) emojis.splice(i, 1);
  for (var j = 0; j < emojis.length; j++) {
    if ( i === j || !emojis[i] ) continue;
    if ( emojis[i].nearlyCollidesWith(emojis[j]) ) {
      emojis[i].changeFace(emojis[i].faces.worried);
      eeung.play();
    } else {
      emojis[i].changeFace(emojis[i].faces.happy);
    }
    if ( emojis[i].collidesWith(emojis[j]) ) {
      emojis[i].changeFace(emojis[i].faces.dead);
      emojis[i].vector = { vx:0, vy:0 };
      emojis[i].route = [];
      if (!gameOver) {
        eeung.sound.volume = 0;
        collision.play();
      }
      gameOver = true;
      // let input = document.createElement('input');
      // input.type = 'text';
      // input.style.position = 'fixed';
      // input.style.left = ctx.canvas.width/2 + 'px';
      // input.style.top = ctx.canvas.height/2 + 'px';
      // input.onkeydown = handleEnter;
      // document.body.appendChild(input);
      // input.focus();
      if (!scoreSaved) {
        player = prompt(
          `You scored ${score}. Enter your name (no spaces).`, player
        ).split(' ')[0].slice(0, 15);
        writeHighScore(player||'?????', score);
        getHighScores();
        scoreSaved = true;
      }
      ctx.canvas.addEventListener("mousedown", newGame);
      ctx.canvas.removeEventListener("mousedown", selectEmoji);
      ctx.canvas.removeEventListener("mouseup", () => ( selectedEmoji = null ));
      ctx.canvas.removeEventListener("mousemove", buildRoute);
      return;
    }
  }
}

function handleEnter(e) {
  let keyCode = e.keyCode;
  if (keyCode === 13) {
    player = this.value;
    document.body.removeChild(this);
  }
}

function spawnPoint(ctx) {
  const spawnAreas = [
    [[-55, -5], [-55, ctx.canvas.height+55]],
    [[-5, ctx.canvas.width-5], [-55, -5]],
    [[ctx.canvas.width+5, ctx.canvas.width+55], [-55, ctx.canvas.height+55]],
    [[-5, ctx.canvas.width-5], [ctx.canvas.height+5, ctx.canvas.height+55]]
  ];
  const area = spawnAreas[Math.floor(Math.random()*spawnAreas.length)];
  const [x, y] = area.map( range => getRandomInt(...range) );
  return { x, y };
}
function getRandomFloat(min, max) {
  return Math.random() * (max - min) + min;
}
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}
function spawnEmoji() {
  // console.log(`spawnEmoji was called`);
  const color = colors[Math.floor(Math.random()*colors.length)];
  var types = ['regular', 'regular', 'big', 'small'];
  var type = types[Math.floor(Math.random()*types.length)];
  type = emojiTypes[type];
  var p = Object.assign({}, type, spawnPoint(ctx));
  var closeCall = true;
  while (closeCall) {
    closeCall = false;
    for (var i = 0; i < emojis.length; i++) {
      if (emojis[i].inVicinityOf(p)) {
        p = Object.assign({}, type, spawnPoint(ctx));
        closeCall = true;
        break;
      }
    }
  }
  let emoji = Object.assign({}, {ctx}, {color}, p);
  return new Emoji(emoji);
}
function spawnLZs(n) {
  const LZArr = [];
  for (var i = 0; i < colors.length; i++) {
    const x = getRandomInt(100, ctx.canvas.width-100);
    const y = getRandomInt(100, ctx.canvas.height-100);
    LZArr.push( new LandingZone(
      { radius:25, color: colors[i], x, y }
    ));
  }
  return LZArr;
}
function checkWithinBounds(point, radius=0) {
  return (
       point.x-radius >= 0
    && point.x+radius <= ctx.canvas.width
    && point.y-radius >= 0
    && point.y+radius <= ctx.canvas.height
  );
}
class Emoji {
  constructor(options) {
    this.withinBounds = false;
    this.canCollide = false;
    this.ctx = options.ctx;
    this.faces = options.faces;
    this.face = options.faces.happy;
    this.radius = options.radius;
    this.x = options.x;
    this.y = options.y;
    this.route = [];
    this.speed = (options.speed || 1);
    this.vector = this.randomVector();
    this.color = options.color;
    this.landing = false;
  }
  randomVector() {
    const angle = getRandomFloat(0, 2*Math.PI);
    var vx = Math.cos(angle) * this.speed;
    var vy = Math.sin(angle) * this.speed;
    const mx = this.ctx.canvas.width/2;
    const my = this.ctx.canvas.height/2;
    if (this.x >= mx) {
      vx = Math.abs(vx) * -1;
    } else {
      vx = Math.abs(vx);
    }
    if (this.y >= my) {
      vy = Math.abs(vy) * -1;
    } else {
      vy = Math.abs(vy);
    }
    return { vx, vy };
  }
  draw() {
    this.ctx.strokeStyle = this.color;
    this.ctx.fillStyle = this.color;
    if ( this.route.length >= 2 ) {
      this.ctx.lineWidth = Math.floor(this.radius/8.3);
      for (var i = 1; i < this.route.length; i+=10) {
        let a = this.route[i-5] || this;
        let b = this.route[i];
        this.ctx.beginPath();
        this.ctx.moveTo(a.x, a.y);
        this.ctx.lineTo(b.x, b.y);
        this.ctx.stroke();
      }
    }
    if (!this.canCollide) {
      this.ctx.strokeStyle = 'grey';
    } else {
      this.ctx.strokeStyle = this.color;
    }
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    this.ctx.fill();
    this.ctx.stroke();
    this.ctx.drawImage(
      this.face,
      this.x-(this.radius-1.5),
      this.y-(this.radius-1.5),
      this.radius*2-3, this.radius*2-3
    );
  }
  wayOff() {
   if (
        this.x < 0-55
     || this.x > this.ctx.canvas.width+55
   ) {
     return true;
   }
   if (
        this.y < 0-55
     || this.y > this.ctx.canvas.height+55
   ) {
     return true;
   }
  }
  bounce() {
    if ( this.withinBounds ) {
      if (
           this.x-this.radius <= 0
        || this.x+this.radius >= this.ctx.canvas.width
      ) {
        this.vector.vx *= -1;
      }
      if (
           this.y-this.radius <= 0
        || this.y+this.radius >= this.ctx.canvas.height
      ) {
        this.vector.vy *= -1;
      }
    }
  }
  move() {
    if (!this.landing && !this.canCollide) {
      this.canCollide = checkWithinBounds(this,0);
    }
    if (!this.withinBounds) {
      this.withinBounds = checkWithinBounds(this, this.radius);
    }
    if (this.route.length >= 2) {
      if (this.route.length === 2) {
      this.getPassiveVector();
      }
      this.activeMove();
    } else {
      this.passiveMove();
    }
    if (this.lz) {
      this.land();
    }
  }
  activeMove() {
    this.route.splice(0, 1);
    const { x, y } = this.route[0];
    this.x = x;
    this.y = y;
  }
  getPassiveVector() {
    const ax = this.route[1].x;
    const bx = this.route[0].x;
    const by = this.route[0].y;
    const ay = this.route[1].y;
    this.vector = {
      vx: ax-bx,
      vy: ay-by
    };
  }
  passiveMove() {
    this.bounce();
    this.x += this.vector.vx;
    this.y += this.vector.vy;
  }
  land() {
    if (this.route.length <= 5) {
      this.vector = { vx:0, vy:0 };
    }
    this.canCollide = false;
    this.radius *= 0.98;
  }
  collidesWith(that) {
    var distance = distanceBetween(this, that);
    if ( distance < this.radius + that.radius ) {
      if (that instanceof Emoji) {
        if ( this.canCollide && that.canCollide ) {
          return true;
        }
      } else {
        return true;
      }
    }
    return false;
  }
  nearlyCollidesWith(that) {
    var distance = distanceBetween(this, that) - 30;
    if ( distance < this.radius + that.radius ) {
      if ( this.canCollide && that.canCollide ) {
        return true;
      }
    }
    return false;
  }
  inVicinityOf(that) {
    var distance = distanceBetween(this, that) - 100;
    if ( distance < this.radius + that.radius ) {
      return true;
    }
    return false;
  }
  changeFace(face) {
    if (this.face !== face) {
      this.face = face;
    }
  }
}

function selectEmoji(e) {
  if (mousePos === undefined) {
    mousePos = getMousePos(e);
  }
  // console.log(`mousedown @ ${mousePos.x}, ${mousePos.y}`);
  emojis.forEach( emoji => {
    if ( Math.abs(mousePos.x-emoji.x) <= emoji.radius
      && Math.abs(mousePos.y-emoji.y) <= emoji.radius ) {
      emoji.route = [];
      selectedEmoji = emoji;
    }
  });
}

function getMousePos(e) {
  const parentPos = getPosition(e.currentTarget);
  const x = e.clientX - parentPos.x;
  const y = e.clientY - parentPos.y;
  mousePos = { x, y };
}

function pointsBetween(a, b) {
  const distance = distanceBetween(a, b);
  const angle = angleBetween(a, b);
  const points = [];
  for (var i = 0; i < distance; i+=1) {
    let x = a.x + (Math.sin(angle) * i);
    let y = a.y + (Math.cos(angle) * i);
    points.push({ x, y });
  }
  return points;
}

function buildRoute(pointB) {
  if (selectedEmoji) {
    var pointA = selectedEmoji.route[selectedEmoji.route.length-1]
              || selectedEmoji;
    const distance = distanceBetween(pointA, pointB);
    const angle = angleBetween(pointA, pointB);

    for (var i = 0; i < distance; i+=selectedEmoji.speed) {
      let x = pointA.x + (Math.sin(angle) * i);
      let y = pointA.y + (Math.cos(angle) * i);

      let a = selectedEmoji.route[selectedEmoji.route.length-1] || pointA;
      let b = { x, y };

      if ( distanceBetween(a, b) > 0 ) {
        selectedEmoji.route.push(b);
      }
    }
  }
}

function distanceBetween(a, b) {
  return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
}

function angleBetween(a, b) {
  return Math.atan2( b.x - a.x, b.y - a.y );
}

function getPosition(el) {
  var x = 0, y = 0;
  while (el) {
    if (el.tagName === "BODY") {
      var xScroll = el.scrollLeft || document.documentElement.scrollLeft;
      var yScroll = el.scrollTop || document.documentElement.scrollTop;
      x += (el.offsetLeft - xScroll + el.clientLeft);
      y += (el.offsetTop - yScroll + el.clientTop);
    } else {
      x += (el.offsetLeft - el.scrollLeft + el.clientLeft);
      y += (el.offsetTop - el.scrollTop + el.clientTop);
    }
    el = el.offsetParent;
  }
  return { x, y };
}
