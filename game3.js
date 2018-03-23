const _plane = require("./plane");

var planeObj, canvas, ctx;
document.addEventListener('DOMContentLoaded', () => {
  const plane = new Image(50, 50);
  plane.src = "Without Source files -Game Assets/JU-87B2/Type_3/JU87B2 -progress_5.png";
  plane.onload = () => {
    planeObj = { plane, px: 0, py: 0 };
    canvas = document.getElementById("contentContainer");
    ctx = canvas.getContext("2d");
    ctx.strokeStyle='white';
    ctx.drawImage(planeObj.plane, planeObj.px, planeObj.py, 50, 50);
    canvas.addEventListener("mousedown", mousedownReset);
    canvas.addEventListener("mouseup", activeMove);
    canvas.addEventListener("mousemove", recMousePos);
  };
  passiveMove(1, 1);

  console.log('DOM loaded');
});

function drawRoute(context, _route) {
  for (var i = 1; i < _route.length; i++) {
    let a = _route[i-1];
    let b = _route[i];
    context.beginPath();
    context.moveTo(a.x, a.y);
    context.lineTo(b.x, b.y);
    context.stroke();
  }
}

// plane moves in a straight line by default
// and plane continues in a straight line after route *kinda*
// only mousedown on plane element begins routing
// route resets to null on mousedown
var route;
var routeCopy;
var mousedown = false;
var move;
var defaultMove;

function mousedownReset(e) {
  const { x, y } = getMousePos(e);
  console.log(planeObj.plane.width);
  console.log(`mousedown @ ${x}, ${y}`);
  const { plane, px, py } = planeObj;
  if ( Math.abs(x-px) < (plane.width/2) && Math.abs(y-py) < (plane.width/2) ) {
    mousedown = true;
    clearInterval(move);
    clearInterval(defaultMove);
    route = null;
    routeCopy = null;
  }
}

function activeMove() {
  if (mousedown) {
    mousedown = false;
    console.log(route);
    if (route) {
      move = setInterval(function() {
        if ( route.length===0 ) {
          clearInterval(move);

          const x1 = routeCopy[routeCopy.length-5].x;
          const y1 = routeCopy[routeCopy.length-5].y;
          const x2 = routeCopy[routeCopy.length-1].x;
          const y2 = routeCopy[routeCopy.length-1].y;

          const dx = x2 < x1 ? -1 : 1;
          const dy = y2 < y1 ? -1 : 1;

          console.log(`x1 = ${x1} | y1 = ${y1}`);
          console.log(`x2 = ${x2} | y2 = ${y2}`);
          console.log(`dx = ${dx} | dy = ${dy}`);

          const {x,y} = routeCopy[routeCopy.length-1];
          planeObj.px = x;
          planeObj.py = y;
          passiveMove(dx,dy);
          route = null;
        } else {
          const {x,y} = route.shift();
          planeObj.px = x;
          planeObj.py = y;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          let { plane, px, py } = planeObj;
          ctx.drawImage(plane, px-(plane.width/2), py-(plane.width/2), 50, 50);
          drawRoute(ctx, route);
          console.log(planeObj);
        }
      }, 50);
    }
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
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let { plane, px, py } = planeObj;
    ctx.drawImage(plane, px-(plane.width/2), py-(plane.width/2), 50, 50);

    if (!route) route = [];
    route.push( getMousePos(e) );
    routeCopy = route.slice();
    drawRoute(ctx, route);
  }
}

function passiveMove(dx, dy) {
  defaultMove = setInterval(function() {
    // console.log('moving');
    planeObj.px += dx;
    planeObj.py += dy;
    // console.log(planeObj);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let { plane, px, py } = planeObj;
    ctx.drawImage(plane, px-(plane.width/2), py-(plane.width/2), 50, 50);
  }, 50);
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
