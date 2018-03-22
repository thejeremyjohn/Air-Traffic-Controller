var plane = document.querySelector("#plane");
document.addEventListener('DOMContentLoaded', beginDefaultMove(0,0,1,1));
window.ondragstart = function() { return false; };

var canvas = document.getElementById("contentContainer");
var ctx = canvas.getContext("2d");
ctx.strokeStyle='white';

// ctx.drawImage(plane, 10, 10, 50, 50);

var lastX, lastY;
function draw(context,x,y,size) {
  if (lastX && lastY && (x !== lastX || y !== lastY)) {
      context.fillStyle = "#000000";
      context.lineWidth = 2 * size;
      context.beginPath();
      // context.moveTo(lastX, lastY);
      context.lineTo(x, y);
      context.stroke();
  }
  context.fillStyle = "#000000";
  context.beginPath();
  context.arc(x, y, size, 0, Math.PI*2, true);
  context.closePath();
  context.fill();
  lastX = x;
  lastY = y;
}

// plane moves in a straight line by default
// and plane continues in a straight line after route *kinda*
// only mousedown on plane element begins routing
// route resets to null on mousedown
var route;
var routeCopy;
var mousedown = false;
var move;
// plane.addEventListener("mousedown", () => {
canvas.addEventListener("mousedown", () => {
  mousedown = true;
  clearInterval(move);
  clearInterval(defaultMove);
  route = null;
  routeCopy = null;
});
canvas.addEventListener("mouseup", () => {
  if (mousedown) {
    lastX = 0;
    lastY = 0;
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
          beginDefaultMove(x,y,dx,dy);
          route = null;
        } else {
          const {x,y} = route.shift();
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          route.map( r => {
            draw(ctx,r.x,r.y,2);
          });
          ctx.drawImage(plane, x-25, y-25, 50, 50);
        }
      }, 50);
    }
  }
});
canvas.addEventListener("mousemove", recMousePos);
function recMousePos(e) {
  if (mousedown) {
    const parentPos = getPosition(e.currentTarget);
    // const xPos = e.clientX - parentPos.x - (plane.clientWidth / 2);
    // const yPos = e.clientY - parentPos.y - (plane.clientHeight / 2);
    const xPos = e.clientX - parentPos.x;
    const yPos = e.clientY - parentPos.y;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!route) route = [];
    route.push({ x: xPos, y: yPos });
    routeCopy = route.slice();
    route.map( xy => {
      const {x,y} = xy;
      draw(ctx,x,y,2);
    });
  }
}
var defaultMove;
function beginDefaultMove(x, y, dx, dy) {
  defaultMove = setInterval(function() {
    x += dx;
    y += dy;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // console.log('clearRect was called');
    ctx.drawImage(plane, x-25, y-25, 50, 50);
  }, 50);
}

// // plane follows route omg !!!
// var route = [];
// var mousedown = false;
// var move;
// container.addEventListener("mousedown", () => {
//   mousedown = true;
// });
// container.addEventListener("mouseup", () => {
//   mousedown = false;
//   console.log(route);
//   var i = 0;
//   move = setInterval(function() {
//     if ( i >= route.length-1 ) {
//       clearInterval(move);
//       i = 0;
//       route = [];
//     } else {
//       const translation = `translate3d(${route[i].x}px, ${route[i].y}px, 0)`;
//       plane.style.transform = translation;
//       i++;
//     }
//   }, 100);
// });
// container.addEventListener("mousemove", recMousePos);
// function recMousePos(e) {
//   if (mousedown) {
//     const parentPos = getPosition(e.currentTarget);
//     const xPos = e.clientX - parentPos.x - (plane.clientWidth / 2);
//     const yPos = e.clientY - parentPos.y - (plane.clientHeight / 2);
//     route.push({ x: xPos, y: yPos });
//   }
// }

// // when mousedown and mousemove, store current mouse pos in route array
// // when mouseup, log route and reset route
// var route = [];
// var mousedown = false;
// container.addEventListener("mousedown", () => {
//   mousedown = true;
// });
// container.addEventListener("mouseup", () => {
//   mousedown = false;
//   console.log(route);
//   route = []; // really, this should happen when the plane finishes route
// });
// container.addEventListener("mousemove", recMousePos);
// function recMousePos(e) {
//   if (mousedown) {
//     const parentPos = getPosition(e.currentTarget);
//     const xPos = e.clientX - parentPos.x - (plane.clientWidth / 2);
//     const yPos = e.clientY - parentPos.y - (plane.clientHeight / 2);
//     route.push({ x: xPos, y: yPos });
//     // console.log(`${xPos}, ${yPos}`);
//   }
// }

// // when mousedown, inner html===true
// // when mouseup, inner html===false
// var mousedown = false;
// container.innerHTML = mousedown;
// container.addEventListener("mousedown", () => {
//   mousedown = true;
//   container.innerHTML = mousedown;
// });
// container.addEventListener("mouseup", () => {
//   mousedown = false;
//   container.innerHTML = mousedown;
// });

// // when mousedown, stores number in an array at regular intervals
// // array elements do not persist after mouse up
// var count = 0;
// var timer;
// container.addEventListener("mousedown", () => {
//   const nums = [];
//   timer=setInterval(function(){
//     nums.push(count++);
//     container.innerHTML = nums;
//   }, 200);
// });
// container.addEventListener("mouseup", () => {
//     if (timer) clearInterval(timer);
// });

// // sprite will move to click position
// container.addEventListener("mousedown", getClickPosition);
// function getClickPosition(e) {
//   const parentPos = getPosition(e.currentTarget);
//   const xPos = e.clientX - parentPos.x - (plane.clientWidth / 2);
//   const yPos = e.clientY - parentPos.y - (plane.clientHeight / 2);
//   plane.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
// }
// Helper function to get an element's exact position
function getPosition(el) {
  var xPos = 0;
  var yPos = 0;
  while (el) {
    if (el.tagName === "BODY") {
      // deal with browser quirks with body/window/document and page scroll
      var xScroll = el.scrollLeft || document.documentElement.scrollLeft;
      var yScroll = el.scrollTop || document.documentElement.scrollTop;
      xPos += (el.offsetLeft - xScroll + el.clientLeft);
      yPos += (el.offsetTop - yScroll + el.clientTop);
    } else {
      // for all other non-BODY elements
      xPos += (el.offsetLeft - el.scrollLeft + el.clientLeft);
      yPos += (el.offsetTop - el.scrollTop + el.clientTop);
    }
    el = el.offsetParent;
  }
  return {
    x: xPos,
    y: yPos
  };
}
