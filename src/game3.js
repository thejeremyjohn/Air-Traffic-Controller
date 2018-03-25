var ticker;
function tick() {
  if (ready) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    // test.draw(ctx);
    drawScore();
    lzs.forEach( lz => {
      lz.draw(ctx);
    });
    for (var i = 0; i < planes.length; i++) {
      planes[i].draw(ctx);
      planes[i].move(ctx);
      // console.log(`game on! ticker = ${ticker}`);
      detectCollision(i);
    }
  }
  ticker = requestAnimationFrame(tick);
}
ticker = requestAnimationFrame(tick);

var ready, activePlane, ctx, planes, lzs, score, img, test;
const colors = ['blue', 'red'];
document.addEventListener('DOMContentLoaded', () => {
  img = new Image(50, 50);
  img.src = "../awesome-face-png-1.png";
  img.onload = () => {
    const canvas = document.getElementById("contentContainer");
    ctx = canvas.getContext("2d");
    canvas.addEventListener("mousedown", mousedownReset);
    canvas.addEventListener("mouseup", () => ( activePlane = null ));
    canvas.addEventListener("mousemove", buildRoute);
    planes = spawnPlanes(3, img);
    // test = new Plane( { img, color: 'red', x:0, y:-5 } );
    lzs = spawnLZs(2);
    score = 0;
    ready = true;
  };
});

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
  // ctx.font = "80px Arial";
  // ctx.fillText('GAME OVER',10,100);
}

function detectCollision(i) {
  if ( planes[i].route.length >= 2 ) {
    for (var lzi = 0; lzi < lzs.length; lzi++) {
      if ( planes[i].color === lzs[lzi].color
      && planes[i].collidesWith(lzs[lzi]) ) {
        score++;
        console.log( 'plane landed' );
        planes.splice(i, 1);
        let newPlanes = spawnPlanes( Math.floor(score/5) || 1, img );
        planes = planes.concat(newPlanes);
        return;
      }
    }
  }
  for (var j = 0; j < planes.length; j++) {
    if ( i === j ) continue;
    if ( planes[i].collidesWith(planes[j]) ) {
      console.log(`game over...?`);
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
    planesArr.push( new Plane(
      { img, color, x, y }
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
    this.img = options.img;
    this.radius = options.img.width/2;
    this.x = options.x;
    this.y = options.y;
    this.route = [];
    this.speed = options.speed || 1;
    this.vector = this.randomVector();
    this.color = options.color;
  }
  // randomVector() {
  //   var dx=0, dy=0;
  //   while (dx===0 && dy===0) {
  //     dx = getRandomInt(-1, 2);
  //     dy = getRandomInt(-1, 2);
  //   }
  //   return { dx, dy };
  // }
  randomVector() {
    const angle = getRandomFloat(0, 2*Math.PI);
    const dx = this.speed * Math.cos(angle);
    const dy = this.speed * Math.sin(angle);
    return { dx, dy };
  }
  draw(ctx) {
    ctx.drawImage(
      this.img,
      this.x-(this.img.width/2),
      this.y-(this.img.height/2),
      this.img.width, this.img.height
    );
    ctx.strokeStyle=this.color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    ctx.stroke();
    if ( this.route.length >= 2 ) {
      ctx.lineWidth = 3;
      for (var i = 1; i < this.route.length; i++) {
        let a = this.route[i-1];
        let b = this.route[i];
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }
  bounce(ctx) {
    if ( (this.x+this.radius > ctx.canvas.width)
    || (this.x-this.radius < 0) ) {
      this.vector.dx *= -1;
    }
    if ( (this.y+this.radius > ctx.canvas.height)
    || (this.y-this.radius < 0) ) {
      this.vector.dy *= -1;
    }
  }
  move(ctx) {
    if (this.route.length >= 2) {
      this.activeMove();
      if (this.route.length === 2) {
        this.getPassiveVector();
      }
    } else {
      this.passiveMove(ctx);
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
  passiveMove(ctx) {
    this.bounce(ctx);
    this.x += this.vector.dx;
    this.y += this.vector.dy;
  }
  collidesWith(that) {
    const distX = this.x - that.x;
    const distY = this.y - that.y;
    var distance = Math.sqrt(distX**2 + distY**2);
    if ( distance < this.radius + that.radius ) {
      return true;
    }
    return false;
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
