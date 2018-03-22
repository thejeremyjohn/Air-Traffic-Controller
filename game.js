var plane = document.querySelector("#plane");
var container = document.querySelector("#contentContainer");


var route = [];
var mousedown = false;
var move;
var i = 0;
container.addEventListener("mousedown", () => {
  mousedown = true;
});
container.addEventListener("mouseup", () => {
  mousedown = false;
  console.log(route);
  move = setInterval(function() {
    if ( i >= route.length-1 ) {
      clearInterval(move);
    } else {
      console.log('excuse ME!?');
      console.log(i);
      // plane.style.transform = `translate3d(${route[i].x}px, ${route[i].y}px, 0)`;
      i++;
    }
  }, 200);
  // plane.style.transform = `translate3d(${route[0].x}px, ${route[0].y}px, 0)`;
  route = []; // really, this should happen when the plane finishes route
});
container.addEventListener("mousemove", recMousePos);
function recMousePos(e) {
  if (mousedown) {
    const parentPos = getPosition(e.currentTarget);
    const xPos = e.clientX - parentPos.x - (plane.clientWidth / 2);
    const yPos = e.clientY - parentPos.y - (plane.clientHeight / 2);
    route.push({ x: xPos, y: yPos });
    // console.log(`${xPos}, ${yPos}`);
  }
}

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
