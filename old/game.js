var plane = document.querySelector("#plane");
var container = document.querySelector("#contentContainer");
document.addEventListener('DOMContentLoaded', beginDefaultMove(0,0,1,1));
window.ondragstart = function() { return false; };

// plane moves in a straight line by default
// and plane continues in a straight line after route *kinda*
// only mousedown on plane element begins routing
// route resets to null on mousedown
var route;
var mousedown = false;
var move;
plane.addEventListener("mousedown", () => {
  mousedown = true;
  clearInterval(move);
  clearInterval(defaultMove);
  route = null;
});
container.addEventListener("mouseup", () => {
  if (mousedown) {
    mousedown = false;
    console.log(route);
    var i = 0;
    if (route) {
      move = setInterval(function() {
        if ( i === route.length ) {
          clearInterval(move);

          const x1 = route[i-5].x;
          const y1 = route[i-5].y;
          const x2 = route[i-1].x;
          const y2 = route[i-1].y;

          const dx = x2 < x1 ? -1 : 1;
          const dy = y2 < y1 ? -1 : 1;

          console.log(`x1 = ${x1} | y1 = ${y1}`);
          console.log(`x2 = ${x2} | y2 = ${y2}`);
          console.log(`dx = ${dx} | dy = ${dy}`);

          const {x,y} = route[i-1];
          beginDefaultMove(x,y,dx,dy);
          i = 0;
          route = null;
        } else {
          const {x,y} = route[i];
          plane.style.transform = `translate3d(${x}px, ${y}px, 0)`;
          i++;
        }
      }, 50);
    }
  }
});
container.addEventListener("mousemove", recMousePos);
function recMousePos(e) {
  if (mousedown) {
    const parentPos = getPosition(e.currentTarget);
    const xPos = e.clientX - parentPos.x - (plane.clientWidth / 2);
    const yPos = e.clientY - parentPos.y - (plane.clientHeight / 2);
    if (!route) route = [];
    route.push({ x: xPos, y: yPos });
  }
}
var defaultMove;
function beginDefaultMove(x, y, dx, dy) {
  defaultMove = setInterval(function() {
    x += dx;
    y += dy;
    plane.style.transform = `translate3d(${x}px, ${y}px, 0)`;
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
