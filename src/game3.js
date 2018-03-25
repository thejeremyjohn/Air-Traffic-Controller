var ticker;
function tick() {
  if (ready) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    // test.draw();
    lzs.forEach( lz => {
      lz.draw(ctx);
    });
    for (var i = 0; i < planes.length; i++) {
      planes[i].draw();
      planes[i].move();
      // console.log(`game on! ticker = ${ticker}`);
      detectCollision(i);
    }
    drawScore();
  }
  ticker = requestAnimationFrame(tick);
}
ticker = requestAnimationFrame(tick);

var ready, activePlane, ctx, planes, lzs, score, img, dead, test, gameOver;
const colors = ['blue', 'red'];
document.addEventListener('DOMContentLoaded', () => {
  happy = new Image(50, 50);
  dead = new Image(50, 50);
  worried = new Image(50, 50);
  happy.src = "../plane_img/eyeglasses-black-face-emoticon.png";
  dead.src = "../plane_img/astonished-black-emoticon-face.png";
  worried.src = "../plane_img/worried-black-face.png";
  // img.src = "../astonished-black-emoticon-face.png";
  // happy.src = "../eyeglasses-black-face-emoticon(2).png";
  // happy.src = "../sunglasses-black-emoticon-face.png";
  var collect = imgCollect()
  happy.onload = () => ( collect = collect() )
  dead.onload = () => ( collect = collect() )
  worried.onload = () => ( collect = collect() )
});

function imgCollect() {
  var count = 0;
  const collector = () => {
    count++
    if (count === 3) {
      const canvas = document.getElementById("contentContainer");
      ctx = canvas.getContext("2d");
      canvas.addEventListener("mousedown", mousedownReset);
      canvas.addEventListener("mouseup", () => ( activePlane = null ));
      canvas.addEventListener("mousemove", buildRoute);
      planes = spawnPlanes(3, happy);
      // test = new Plane( { happy, color: 'red', x:0, y:-5 } );
      lzs = spawnLZs(2);
      score = 0;
      ready = true;
    } else {
      return collector;
    }
  }
  return collector;
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
  ctx.font = "30px Arial";
  ctx.fillText(score,10,30);
  if (gameOver) {
    ctx.font = "130px Arial";
    ctx.textAlign='center'
    ctx.fillText('GAME',ctx.canvas.width/2, (ctx.canvas.height/2)-10);
    ctx.fillText('OVER',ctx.canvas.width/2, (ctx.canvas.height/2)+90);
  }
}

function detectCollision(i) {
  if ( planes[i].route.length >= 2 ) {
    for (var lzi = 0; lzi < lzs.length; lzi++) {
      if ( planes[i].color === lzs[lzi].color
      && planes[i].collidesWith(ctx, lzs[lzi]) ) {
        score++;
        console.log( 'plane landed' );
        planes.splice(i, 1);
        let newPlanes = spawnPlanes( Math.floor(score/5) || 1, happy );
        planes = planes.concat(newPlanes);
        return;
      }
    }
  }
  for (var j = 0; j < planes.length; j++) {
    if ( i === j ) continue;
    if ( planes[i].collidesWith(ctx, planes[j]) ) {
      gameOver = true;
      ctx.canvas.removeEventListener("mousedown", mousedownReset);
      // ctx.canvas.addEventListener("mouseup");
      ctx.canvas.removeEventListener("mousemove", buildRoute);
      window.cancelAnimationFrame(ticker);
      return;
    }
  }
}
function spawnPoint(ctx) {
  spawnAreas = [
    [[-50, 0], [-50, ctx.canvas.height+50]],
    [[0, ctx.canvas.width], [-50, 0]],
    [[ctx.canvas.width, ctx.canvas.width+50], [-50, ctx.canvas.height+50]],
    [[0, ctx.canvas.width], [ctx.canvas.height, ctx.canvas.height+50]]
  ]
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

function spawnPlanes(n, img) {
  const planesArr = [];
  for (var i = 0; i < n; i++) {
    const color = colors[Math.floor(Math.random()*colors.length)];
    const x = getRandomInt(0+25, ctx.canvas.width-25);
    const y = getRandomInt(0+25, ctx.canvas.height-25);
    // const { x, y } = spawnPoint(ctx)
    planesArr.push( new Plane(
      { ctx, img:img, color, x, y }
    ));
  }
  return planesArr;
}
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
    this.ctx = options.ctx
    this.img = options.img;
    this.radius = options.img.width/2;
    this.x = options.x;
    this.y = options.y;
    this.route = [];
    this.speed = options.speed || 1;
    this.vector = this.randomVector();
    this.color = options.color;
  }
  randomVector() {
    const angle = getRandomFloat(0, 2*Math.PI);
    var dx = this.speed * Math.cos(angle);
    var dy = this.speed * Math.sin(angle);
    const mx = this.ctx.canvas.width/2
    const my = this.ctx.canvas.height/2
    if (this.x >= mx) {
      dx = Math.abs(dx) * -1
    } else {
      dx = Math.abs(dx)
    }
    if (this.y >= my) {
      dy = Math.abs(dy) * -1
    } else {
      dy = Math.abs(dy)
    }
    return { dx, dy };
  }
  draw() {
    this.ctx.fillStyle = this.color;
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, this.radius+2, 0, 2 * Math.PI);
    this.ctx.fill();
    this.ctx.drawImage(
      this.img,
      this.x-(this.img.width/2),
      this.y-(this.img.height/2),
      this.img.width, this.img.height
    );
    // this.ctx.drawImage(
    //   this.img,
    //   this.x-(this.img.width/2),
    //   this.y-(this.img.height/2),
    //   this.img.width, this.img.height
    // );
    // this.ctx.strokeStyle=this.color;
    // this.ctx.lineWidth = 3;
    // this.ctx.beginPath();
    // this.ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    // this.ctx.stroke();
    if ( this.route.length >= 2 ) {
      this.ctx.strokeStyle = this.color;
      this.ctx.lineWidth = 5;
      for (var i = 1; i < this.route.length; i+=3) {
        let a = this.route[i-1];
        let b = this.route[i];
        this.ctx.beginPath();
        this.ctx.moveTo(a.x, a.y);
        this.ctx.lineTo(b.x, b.y);
        this.ctx.stroke();
      }
    }
  }
  withinBounds() {
    return (
      this.x+this.radius < this.ctx.canvas.width && this.x-this.radius > 0
      && this.y+this.radius < this.ctx.canvas.height && this.y-this.radius > 0
    )
  }
  bounce() {
    // if ( this.withinBounds() ) {
    //   console.log('within');
      if (
        this.x+this.radius > this.ctx.canvas.width
        || this.x-this.radius < 0
      ) {
        this.vector.dx *= -1;
      }
      if (
        this.y+this.radius > this.ctx.canvas.height
        || this.y-this.radius < 0
      ) {
        this.vector.dy *= -1;
      }
    // }
  }
  move() {
    if (this.route.length >= 2) {
      this.activeMove();
      if (this.route.length === 2) {
        this.getPassiveVector();
      }
    } else {
      this.passiveMove();
    }
  }
  activeMove() {
    this.route.splice(0, this.speed);
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
      dx: ax-bx,
      dy: ay-by
    };
  }
  passiveMove() {
    this.bounce();
    this.x += this.vector.dx;
    this.y += this.vector.dy;
  }
  collidesWith(ctx, that) {
    const distX = this.x - that.x;
    const distY = this.y - that.y;
    var distance = Math.sqrt(distX**2 + distY**2);
    if ( distance-30 < this.radius + that.radius ) {
      this.changeImg(ctx, worried);
    } else {
      this.changeImg(ctx, happy);
    }
    if ( distance < this.radius + that.radius ) {
      this.changeImg(ctx, dead);
      this.draw();
      this.vector = { dx:0, dy:0 };
      this.route = [];
      that.vector = { dx:0, dy:0 };
      that.route = [];
      return true;
    }
    return false;
  }
  changeImg(ctx, img) {
    if (this.img !== img) {
      this.img = img;
      this.draw()
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
    const dist = distanceBetween(lastPoint, currentPoint);
    const angle = angleBetween(lastPoint, currentPoint);

    for (var i = 0; i < dist; i++) {
      let x = lastPoint.x + (Math.sin(angle) * i);
      let y = lastPoint.y + (Math.cos(angle) * i);
      activePlane.route.push({ x, y });
    }
  }
}
function distanceBetween(a, b) {
  return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
}
function angleBetween(a, b) {
  return Math.atan2( b.x - a.x, b.y - a.y );
}

// Helper function to get an element's exact position
function getPosition(el) {
  var x = 0;
  var y = 0;
  while (el) {
    if (el.tagName === "BODY") {
      // deal with browser quirks with body/window/document and page scroll
      var xScroll = el.scrollLeft || document.documentElement.scrollLeft;
      var yScroll = el.scrollTop || document.documentElement.scrollTop;
      x += (el.offsetLeft - xScroll + el.clientLeft);
      y += (el.offsetTop - yScroll + el.clientTop);
    } else {
      // for all other non-BODY elements
      x += (el.offsetLeft - el.scrollLeft + el.clientLeft);
      y += (el.offsetTop - el.scrollTop + el.clientTop);
    }
    el = el.offsetParent;
  }
  return { x, y };
}
