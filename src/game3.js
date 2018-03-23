var iTick = 0;
function tick() {
  if (ready) {
    iTick++;
    // console.log(iTick);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    planes.forEach( plane => {
      plane.draw(ctx);
      if ( plane.route.length >= 2 ) {
        if ( iTick%5===0 ) plane.activeMove();
      }
      else {
        plane.passiveMove();
      }

    });
  }
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

var ready, activePlane, move, defaultMove, canvas, ctx, planes;
document.addEventListener('DOMContentLoaded', () => {
  const img = new Image(50, 50);
  img.src = "../awesome-face-png-1.png";
  img.onload = () => {
    // let plane = new Plane({ img, x:-50, y:-50, route:[], speed:1 });
    // let plane2 = new Plane({ img, x:50, y:50, route:[], speed:1 });
    // planes = [plane, plane2];
    planes = spawnPlanes(3, img);
    canvas = document.getElementById("contentContainer");
    ctx = canvas.getContext("2d");
    canvas.addEventListener("mousedown", mousedownReset);
    canvas.addEventListener("mouseup", () => ( activePlane = null ));
    canvas.addEventListener("mousemove", recMousePos);
    ready = true;
  };
});

function randFromRange(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}
function spawnPlanes(n, img) {
  const planesArr = [];
  for (var i = 0; i < n; i++) {
    const x = randFromRange(-50, 0);
    const y = randFromRange(-50, 0);
    planesArr.push( new Plane({ img, x, y }) );
  }
  return planesArr;
}

class Plane {
  constructor(options) {
    this.img = options.img;
    this.x = options.x;
    this.y = options.y;
    this.route = [];
    this.speed = options.speed || 1;
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
    const { x, y } = this.route.shift();
    this.x = x;
    this.y = y;
  }
  passiveMove() {
    // will build this out later
    this.x += 1;
    this.y += 1;
  }
}

function mousedownReset(e) {
  const { x, y } = getMousePos(e);
  console.log(`mousedown @ ${x}, ${y}`);
  planes.forEach( plane => {
    if ( Math.abs(x-plane.x) < (plane.img.width/2) && Math.abs(y-plane.y) < (plane.img.width/2) ) {
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

function recMousePos(e) {
  if (activePlane) {
    activePlane.route.push( getMousePos(e) );
  }
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
