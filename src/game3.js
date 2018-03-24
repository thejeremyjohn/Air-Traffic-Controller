var ticker;
function tick() {
  if (ready) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    lzs.forEach( lz => {
      lz.draw(ctx);
    });
    planes.forEach( plane => {
      plane.draw(ctx);
      if ( plane.route.length >= 2 ) {
        plane.activeMove();
      }
      else {
        plane.passiveMove(ctx);
      }
    });
    detectCollision();
  }
  ticker = requestAnimationFrame(tick);
}
ticker = requestAnimationFrame(tick);

var ready, activePlane, move, defaultMove, canvas, ctx, planes, lzs;
document.addEventListener('DOMContentLoaded', () => {
  const img = new Image(50, 50);
  img.src = "../awesome-face-png-1.png";
  img.onload = () => {
    canvas = document.getElementById("contentContainer");
    ctx = canvas.getContext("2d");
    canvas.addEventListener("mousedown", mousedownReset);
    canvas.addEventListener("mouseup", () => ( activePlane = null ));
    canvas.addEventListener("mousemove", buildRoute);
    planes = spawnPlanes(3, img);
    lzs = [ new LandingZone({ radius:25, x:275, y:175 }) ];
    ready = true;
  };
});

class LandingZone {
  constructor(options) {
    this.radius = options.radius;
    this.x = options.x;
    this.y = options.y;
  }
  draw(ctx) {
    ctx.strokeStyle='blue';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    // ctx.arc(275, 175, 25, 0, 2 * Math.PI);
    ctx.stroke();
  }
}

function detectCollision() {
  for (var i = 0; i < planes.length; i++) {
    for (var l = 0; l < lzs.length; l++) {
      if ( planes[i].collidesWith(lzs[l]) ) {
        console.log( 'plane landed' );
        planes.splice(i, 1);
      }
    }
    for (var j = i+1; j < planes.length; j++) {
      if ( planes[i].collidesWith(planes[j]) ) {
        console.log('collision detected');
        window.cancelAnimationFrame(ticker);
        return;
        // delete planes[i];
        // delete planes[j];
      }
    }
  }
}

// function getRandomArbitrary(min, max) {
//   const a = [];
//   for (var i = 0; i < 100; i++) {
//     let r = Math.random() * (max - min) + min;
//     a.push(r);
//   }
//   return a;
// }
// getRandomArbitrary(-1,2);
function randFromRange(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}
function spawnPlanes(n, img) {
  const planesArr = [];
  for (var i = 0; i < n; i++) {
    const x = randFromRange(0+25, canvas.width-25);
    const y = randFromRange(0+25, canvas.height-25);
    planesArr.push( new Plane({ img, x, y }) );
  }
  return planesArr;
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
  }
  randomVector() {
    var dx=0, dy=0;
    while (dx===0 && dy===0) {
      dx = randFromRange(-1, 2);
      dy = randFromRange(-1, 2);
    }
    return { dx, dy };
  }
  bounce(ctx) {
    if ((this.x+this.radius > ctx.canvas.width) || (this.x-this.radius < 0)) {
      this.vector.dx *= -1;
    }
    if ((this.y+this.radius > ctx.canvas.height) || (this.y-this.radius < 0)) {
      this.vector.dy *= -1;
    }
  }
  draw(ctx) {
    ctx.drawImage(
      this.img,
      this.x-(this.img.width/2),
      this.y-(this.img.height/2),
      this.img.width, this.img.height
    );
    if ( this.route.length >= 2 ) {
      for (var i = 1; i < this.route.length; i++) {
        ctx.strokeStyle='orange';
        ctx.lineWidth = 3;
        let a = this.route[i-1];
        let b = this.route[i];
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }
  activeMove() {
    if (this.route.length === 2) {
      this.getPassiveVector();
    }
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
    const dx = this.x - that.x;
    const dy = this.y - that.y;
    var distance = Math.sqrt(dx * dx + dy * dy);
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
