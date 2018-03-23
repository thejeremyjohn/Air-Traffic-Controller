var iTick = 0;
function tick() {
  if (ready) {
    iTick++;
    // console.log(iTick);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    p1.draw(ctx);
    if ( p1.route.length >= 2 ) {
      if ( iTick%3===0 ) p1.activeMove();
    }
    else {
      p1.passiveMove();
    }
    // console.log(`route.length = ${p1.route.length}`);
    // console.log(p1.route);
  }
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

class Plane {
  constructor(options) {
    this.img = options.img;
    this.x = options.x;
    this.y = options.y;
    this.route = options.route;
    this.speed = options.speed;
  }
  draw(ctx) {
    // draw the actual plane
    ctx.drawImage(
      this.img,
      this.x-(this.img.width/2),
      this.y-(this.img.height/2),
      this.img.width, this.img.height
    );
    // draw its route
    if ( this.route.length >= 2 ) {
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

var ready, mousedown, move, defaultMove, canvas, ctx, p1, planes;
document.addEventListener('DOMContentLoaded', () => {
  const img = new Image(50, 50);
  img.src = "../Without Source files -Game Assets/JU-87B2/Type_3/JU87B2 -progress_5.png";
  img.onload = () => {
    // console.log('img loaded');
    p1 = new Plane({ img, x:0, y:0, route:[], speed:1 });
    // planes = [p1];
    canvas = document.getElementById("contentContainer");
    ctx = canvas.getContext("2d");
    ctx.strokeStyle='white';
    canvas.addEventListener("mousedown", mousedownReset);
    canvas.addEventListener("mouseup", () => ( mousedown = false ));
    canvas.addEventListener("mousemove", recMousePos);
    ready = true;
  };
});

// plane moves in a straight line by default
// and plane continues in a straight line after route *kinda*
// only mousedown on plane element begins routing
// route resets to null on mousedown

function mousedownReset(e) {
  const { x, y } = getMousePos(e);
  console.log(`mousedown @ ${x}, ${y}`);
  if ( Math.abs(x-p1.x) < (p1.img.width/2) && Math.abs(y-p1.y) < (p1.img.width/2) ) {
    mousedown = true;
    // p1.route = [];
  }
}

function getMousePos(e) {
  const parentPos = getPosition(e.currentTarget);
  const x = e.clientX - parentPos.x;
  const y = e.clientY - parentPos.y;
  return { x, y };
}

function recMousePos(e) {
  if (mousedown) {
    p1.route.push( getMousePos(e) );
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
