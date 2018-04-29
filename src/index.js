import { Emoji } from './emoji';
import { LandingZone } from './landing_zone';
import { Util } from './util';

var accTime=0, lastTime=Date.now(), paused=false,
    timeInterval=desiredTimeInterval,
    desiredTimeInterval=15, keyDown=false;
var ready, ctx, ticker, lzs, score, mousePos,
    gameOver, emojiTypes, emojis, selectedEmoji,
    happy, bigHappy, smallHappy, worried, dead, shocked;
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
          console.log('deleted wayOff emoji');
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
  happy.src = "../emojis/eyeglasses-black-face-emoticon.png";
  worried.src = "../emojis/worried-black-face.png";
  dead.src = "../emojis/astonished-black-emoticon-face.png";
  shocked.src = "../emojis/flashed-black-emoticon-face.png";
  bigHappy.src = "../emojis/moustache-male-black-emoticon-face.png";
  smallHappy.src = "../emojis/laughing-emoticon-black-happy-face.png";
  var collect = imgCollect(6);
  happy.onload = () => ( collect = collect() );
  worried.onload = () => ( collect = collect() );
  dead.onload = () => ( collect = collect() );
  shocked.onload = () => ( collect = collect() );
  bigHappy.onload = () => ( collect = collect() );
  smallHappy.onload = () => ( collect = collect() );
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
function imgCollect(n) {
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
function newGame() {
  gameOver = false;
  ctx.canvas.removeEventListener("mousedown", newGame);
  ctx.canvas.addEventListener("mousedown", selectEmoji);
  document.body.onkeydown = (e) => {
    if(keyDown===false && (e.keyCode === 32 || e.key === ' ')) {
      keyDown = true; selectEmoji(e);
    }
  };
  ctx.canvas.addEventListener("mousedown", secretRegularSpeed);
  ctx.canvas.addEventListener("mousedown", secretSlowerSpeed);
  ctx.canvas.addEventListener("mousedown", pause);
  ctx.canvas.addEventListener("mouseup", () => (selectedEmoji = null));
  document.body.onkeyup = (e) => {
    if(e.keyCode === 32 || e.key === ' ') {
      keyDown = false; selectedEmoji = null;
    }
  };
  ctx.canvas.addEventListener("mousemove", (e) => {
    mousePos = Util.getMousePos(e);
  });
  ctx.canvas.addEventListener("mousemove", () => buildRoute(mousePos));
  emojis = [];
  emojis.push( spawnEmoji() );
  emojis.push( spawnEmoji() );
  lzs = spawnLZs(2);
  score = 0;
  timeInterval = desiredTimeInterval;
}
// function mouseCollidesWith(lz) {
//   console.log(`mouseCollidesWith was called`);
//   var distance = Util.distanceBetween(mousePos, lz);
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
      cancelAnimationFrame(ticker);
      paused = true;
    }
  }
}
function secretRegularSpeed(e) {
  if ( mousePos.x > 30
    && mousePos.x < 60
    && mousePos.y > ctx.canvas.height-25) {
    timeInterval = desiredTimeInterval;
    play();
  }
}
function secretSlowerSpeed(e) {
  if ( mousePos.x > 60
    && mousePos.x < 90
    && mousePos.y > ctx.canvas.height-25) {
    timeInterval += timeInterval;
    play();
    // console.log(timeInterval);
  }
}
function drawSpeedButtons() {
  // ctx.fillStyle = 'grey';
  // ctx.fillRect(0, 0, 40, 20);
  // ctx.fillStyle = 'black';
  // ctx.font = '10px Arial';
  // ctx.fillText('normal', 0, 10);
  // ctx.fillText('speed', 0, 18);
  const y = ctx.canvas.height;

  ctx.fillStyle = 'grey';
  ctx.strokeStyle = 'grey';
  // pause
  ctx.fillRect(5, y-25, 10, 20);
  ctx.fillRect(20, y-25, 10, 20);
  // ctx.fill();
  // play
  ctx.beginPath();
  ctx.moveTo(42, y-6);
  ctx.lineTo(42, y-23);
  ctx.lineTo(57, y-14);
  ctx.fill();

  ctx.rect(65, y-25, 25, 20);
  ctx.font = 'bold 10px Arial';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillText('SLO', 67, y-12);
}
function drawScore() {
  drawSpeedButtons();

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
  }
  ctx.globalAlpha = 1;
}
function handleProximity(i) {
  if ( emojis[i].route.length >= 2 ) {
    for (var lzi = 0; lzi < lzs.length; lzi++) {
      if (
      !emojis[i].landing
      && emojis[i].color === lzs[lzi].color
      && emojis[i].collidesWith(lzs[lzi])
      ) {
        console.log( 'emoji landing' );
        emojis[i].landing = true;
        emojis[i].route = pointsBetween(emojis[i], lzs[lzi]);
        score++;
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
    } else {
      emojis[i].changeFace(emojis[i].faces.happy);
    }
    if ( emojis[i].collidesWith(emojis[j]) ) {
      gameOver = true;
      ctx.canvas.addEventListener("mousedown", newGame);
      ctx.canvas.removeEventListener("mousedown", selectEmoji);
      ctx.canvas.removeEventListener("mouseup", () => ( selectedEmoji = null ));
      ctx.canvas.removeEventListener("mousemove", buildRoute);
      emojis[i].changeFace(emojis[i].faces.dead);
      emojis[i].vector = { vx:0, vy:0 };
      emojis[i].route = [];
      return;
    }
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
  const [x, y] = area.map( range => Util.getRandomInt(...range) );
  return { x, y };
}
function spawnEmoji() {
  console.log(`spawnEmoji was called`);
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
  // console.log(`new emoji below:`);
  // console.log(emoji);
  return new Emoji(emoji);
}
function spawnLZs(n) {
  const LZArr = [];
  for (var i = 0; i < colors.length; i++) {
    const x = Util.getRandomInt(100, ctx.canvas.width-100);
    const y = Util.getRandomInt(100, ctx.canvas.height-100);
    LZArr.push( new LandingZone(
      { radius:25, color: colors[i], x, y }
    ));
  }
  return LZArr;
}
function selectEmoji(e) {
  if (mousePos === undefined) {
    mousePos = Util.getMousePos(e);
  }
  console.log(`mousedown @ ${mousePos.x}, ${mousePos.y}`);
  emojis.forEach( emoji => {
    if ( Math.abs(mousePos.x-emoji.x) <= emoji.radius
      && Math.abs(mousePos.y-emoji.y) <= emoji.radius ) {
      emoji.route = [];
      selectedEmoji = emoji;
    }
  });
}
function pointsBetween(a, b) {
  const distance = Util.distanceBetween(a, b);
  const angle = Util.angleBetween(a, b);
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
    const distance = Util.distanceBetween(pointA, pointB);
    const angle = Util.angleBetween(pointA, pointB);

    for (var i = 0; i < distance; i+=selectedEmoji.speed) {
      let x = pointA.x + (Math.sin(angle) * i);
      let y = pointA.y + (Math.cos(angle) * i);

      let a = selectedEmoji.route[selectedEmoji.route.length-1] || pointA;
      let b = { x, y };

      if ( Util.distanceBetween(a, b) > 0 ) {
        selectedEmoji.route.push(b);
      }
    }
  }
}
