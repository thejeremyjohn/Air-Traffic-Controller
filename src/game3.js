var ticker;
function tick() {
  if (ready) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    lzs.forEach( lz => {
      lz.draw(ctx);
    });
    for (var i = 0; i < planes.length; i++) {
      planes[i].draw();
      planes[i].move();
      handleProximity(i);
    }
    drawScore();
  }
  ticker = requestAnimationFrame(tick);
}
ticker = requestAnimationFrame(tick);

var ready, activePlane, ctx, planes, lzs, score, img,
    test, gameOver, happy, worried, dead, shocked,
    speedModifier=1;

const colors = ['blue', 'red'];
document.addEventListener('DOMContentLoaded', () => {
  happy = new Image(50, 50);
  worried = new Image(50, 50);
  dead = new Image(50, 50);
  shocked = new Image(50, 50);
  happy.src = "./plane_img/eyeglasses-black-face-emoticon.png";
  dead.src = "./plane_img/astonished-black-emoticon-face.png";
  worried.src = "./plane_img/worried-black-face.png";
  shocked.src = "./plane_img/flashed-black-emoticon-face.png";
  // cool.src = "../plane_img/sunglasses-black-emoticon-face.png";
  var collect = imgCollect(4);
  happy.onload = () => ( collect = collect() );
  worried.onload = () => ( collect = collect() );
  dead.onload = () => ( collect = collect() );
  shocked.onload = () => ( collect = collect() );
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
  ctx.canvas.addEventListener("mousedown", mousedownReset);
  ctx.canvas.addEventListener("mousedown", secretRegularSpeed);
  ctx.canvas.addEventListener("mousedown", secretFasterSpeed);
  ctx.canvas.addEventListener("mouseup", () => ( activePlane = null ));
  ctx.canvas.addEventListener("mousemove", buildRoute);
  planes = [];
  planes.push( spawnPlane() );
  planes.push( spawnPlane() );
  lzs = spawnLZs(2);
  score = 0;
  speedModifier = 1;
}
function secretRegularSpeed(e) {
  const { x, y } = getMousePos(e);
  if ( x < 15 && y < 15 ) {
    speedModifier = 1;
  }
}
function secretFasterSpeed(e) {
  const { x, y } = getMousePos(e);
  if ( x > ctx.canvas.width-15 && y < 15 ) {
    speedModifier += 1;
  }
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

function drawScore() {
  ctx.textAlign='center';
  ctx.fillStyle = 'white';
  ctx.font = "20px Arial";
  ctx.fillText(score, ctx.canvas.width/2, ctx.canvas.height-10);
  ctx.globalAlpha = 0.5;
  if (score<3) {
    ctx.font = "20px Arial";
    ctx.fillText(
      'click and drag the emoji to its color-matched landing pad',
      ctx.canvas.width/2, 40
    );
  }
  if (gameOver) {
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
  if ( planes[i].route.length >= 2 ) {
    for (var lzi = 0; lzi < lzs.length; lzi++) {
      if ( planes[i].color === lzs[lzi].color
      && planes[i].collidesWith(lzs[lzi]) ) {
        score++;
        console.log( 'plane landed' );
        planes.splice(i, 1);
        if (score < 10) {
          planes.push( spawnPlane() );
          console.log('spawning');
        } else {
          // const times = 1;
          // const times = getRandomInt(1,3);
          // for (var i = 0; i < times; i++) {
          //   planes.push( spawnPlane() );
          // }
          while ( planes.length < Math.floor(score/5) ) {
            console.log('spawning');
            planes.push( spawnPlane() );
          }
        }
        return;
      }
    }
  }

  for (var j = 0; j < planes.length; j++) {
    if ( i === j ) continue;

    if ( planes[i].nearlyCollidesWith(planes[j]) ) {
      planes[i].changeImg(worried);
    } else {
      planes[i].changeImg(happy);
    }

    if ( planes[i].collidesWith(planes[j]) ) {
      gameOver = true;
      ctx.canvas.addEventListener("mousedown", newGame);
      ctx.canvas.removeEventListener("mousedown", mousedownReset);
      ctx.canvas.removeEventListener("mouseup", () => ( activePlane = null ));
      ctx.canvas.removeEventListener("mousemove", buildRoute);
      planes[i].changeImg(dead);
      planes[i].vector = { dx:0, dy:0 };
      planes[i].route = [];
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
  console.log(area);
  const [x, y] = area.map( range => getRandomInt(...range) );
  return { x, y };
}

function getRandomFloat(min, max) {
  return Math.random() * (max - min) + min;
}
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}
var planeTypes = {
  regular: {
    img: happy,
    radius: 25,
    speed: 1
  },
  big: {
    // img: monopolyguy,
    radius: 50,
    speed: 0.75
  },
  fast: {
    // img:
    radius: 25,
    speed: 1.25
  }
};
function spawnPlane() {
  const color = colors[Math.floor(Math.random()*colors.length)];
  const radius = happy.width/2;
  // var x = getRandomInt(0+radius, ctx.canvas.width-radius);
  // var y = getRandomInt(0+radius, ctx.canvas.height-radius);
  var { x, y } = spawnPoint(ctx);
  var p = { radius, x, y };

  var closeCall = true;
  while (closeCall) {
    closeCall = false;
    for (var i = 0; i < planes.length; i++) {
      if (planes[i].inVicinityOf(p)) {
        // console.log(`${i} this would be a closeCall`);
        // x = getRandomInt(0+radius, ctx.canvas.width-radius);
        // y = getRandomInt(0+radius, ctx.canvas.height-radius);
        var { x, y } = spawnPoint(ctx);
        p = { radius, x, y };
        closeCall = true;
        break;
      }
    }
  }
  return new Plane({ ctx, img: happy, color, x, y });
}
// function spawnPlanes(n, img) {
//   const planesArr = [];
//   for (var i = 0; i < n; i++) {
//     const color = colors[Math.floor(Math.random()*colors.length)];
//     const x = getRandomInt(0+25, ctx.canvas.width-25);
//     const y = getRandomInt(0+25, ctx.canvas.height-25);
//     // const { x, y } = spawnPoint(ctx)
//     planesArr.push( new Plane(
//       { ctx, img:img, color, x, y }
//     ));
//   }
//   return planesArr;
// }
function spawnLZs(n) {
  const LZArr = [];
  for (var i = 0; i < colors.length; i++) {
    const x = getRandomInt(0+25, ctx.canvas.width-25);
    const y = getRandomInt(0+25, ctx.canvas.height-25);
    LZArr.push( new LandingZone(
      { radius:25, color: colors[i], x, y }
    ));
  }
  return LZArr;
}

class Plane {
  constructor(options) {
    this.withinBounds = false;
    this.ctx = options.ctx;
    this.img = options.img;
    this.radius = options.img.width/2;
    this.x = options.x;
    this.y = options.y;
    this.route = [];
    this.speed = (options.speed || 1);
    this.vector = this.randomVector();
    this.color = options.color;
  }

  randomVector() {
    const angle = getRandomFloat(0, 2*Math.PI);
    var dx = this.speed * Math.cos(angle);
    var dy = this.speed * Math.sin(angle);
    const mx = this.ctx.canvas.width/2;
    const my = this.ctx.canvas.height/2;
    if (this.x >= mx) {
      dx = Math.abs(dx) * -1;
    } else {
      dx = Math.abs(dx);
    }
    if (this.y >= my) {
      dy = Math.abs(dy) * -1;
    } else {
      dy = Math.abs(dy);
    }
    return { dx, dy };
  }
  draw() {
    if ( this.route.length >= 2 ) {
      this.ctx.strokeStyle = this.color;
      this.ctx.lineWidth = 3;
      for (var i = 1; i < this.route.length; i+=7) {
        let a = this.route[i-1];
        let b = this.route[i];
        this.ctx.beginPath();
        this.ctx.moveTo(a.x, a.y);
        this.ctx.lineTo(b.x, b.y);
        this.ctx.stroke();
      }
    }
    if (!this.withinBounds) {
      this.ctx.fillStyle = 'grey';
    } else {
      this.ctx.fillStyle = this.color;
    }
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, this.radius+2, 0, 2 * Math.PI);
    this.ctx.fill();
    this.ctx.drawImage(
      this.img,
      this.x-(this.img.width/2),
      this.y-(this.img.height/2),
      this.img.width, this.img.height
    );
  }
  checkWithinBounds() {
    return (
         this.x-this.radius >= 0
      && this.x+this.radius <= this.ctx.canvas.width
      && this.y-this.radius >= 0
      && this.y+this.radius <= this.ctx.canvas.height
    );
  }
  bounce() {
    if (!this.withinBounds) {
      this.withinBounds = this.checkWithinBounds();
    }
    if ( this.withinBounds ) {
      if (
           this.x-this.radius <= 0
        || this.x+this.radius >= this.ctx.canvas.width
      ) {
        this.vector.dx *= -1;
      }
      if (
           this.y-this.radius <= 0
        || this.y+this.radius >= this.ctx.canvas.height
      ) {
        this.vector.dy *= -1;
      }
    }
  }
  move() {
    if (this.route.length >= 2) {
      this.getPassiveVector();
      this.activeMove();
      // if (this.route.length === 2) {
        // this.getPassiveVector();
      // }
    } else {
      this.passiveMove();
    }
  }
  activeMove() {
    this.route.splice(0, this.speed * speedModifier);
    const { x, y } = this.route[0];
    this.x = x;
    this.y = y;
  }
  getPassiveVector() {
    // const ax = this.route[1].x;
    // const bx = this.route[0].x;
    // const by = this.route[0].y;
    // const ay = this.route[1].y;
    const ax = this.route[this.route.length-1].x;
    const bx = this.route[this.route.length-2].x;
    const by = this.route[this.route.length-2].y;
    const ay = this.route[this.route.length-1].y;
    this.vector = {
      dx: ax-bx,
      dy: ay-by
    };
  }
  passiveMove() {
    this.bounce();
    this.x += this.vector.dx * speedModifier;
    this.y += this.vector.dy * speedModifier;
  }
  collidesWith(that) {
    var distance = distanceBetween(this, that);
    if ( distance < this.radius + that.radius ) {
      if (that instanceof Plane) {
        if (this.withinBounds && that.withinBounds) {
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
      return true;
    }
    return false;
  }
  inVicinityOf(that) {
    var distance = distanceBetween(this, that) - 75;
    if ( distance < this.radius + that.radius ) {
      return true;
    }
    return false;
  }
  changeImg(img) {
    if (this.img !== img) {
      this.img = img;
      this.draw();
    }
  }
}

function mousedownReset(e) {
  const mouse = getMousePos(e);
  console.log(`mousedown @ ${mouse.x}, ${mouse.y}`);
  planes.forEach( plane => {
    if ( Math.abs(mouse.x-plane.x) < plane.radius
    && Math.abs(mouse.y-plane.y) < plane.radius ) {
      activePlane = plane;
      plane.route = [];
    }
  });
}
function getMousePos(e) {
  const parentPos = getPosition(e.currentTarget);
  const x = e.clientX - parentPos.x;
  const y = e.clientY - parentPos.y;
  return { x, y };
}

function buildRoute(e) {
  if (activePlane) {
    var lastPoint;
    if (activePlane.route.length===0) {
      lastPoint = activePlane;
    } else {
      lastPoint = activePlane.route[activePlane.route.length-1];
    }
    const currentPoint = getMousePos(e);
    const distance = distanceBetween(lastPoint, currentPoint);
    const angle = angleBetween(lastPoint, currentPoint);

    for (var i = 0; i < distance; i+=activePlane.speed) {
      let x = lastPoint.x + (Math.sin(angle) * i);
      let y = lastPoint.y + (Math.cos(angle) * i);

      let a = activePlane.route[activePlane.route.length-1] || lastPoint;
      let b = { x, y };
      if ( distanceBetween(a, b) > 0 ) {
        activePlane.route.push({ x, y });
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
