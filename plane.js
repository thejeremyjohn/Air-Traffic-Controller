// const MovingObject = require("./moving_object");

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
    // ctx.drawImage(plane, px-(plane.width/2), py-(plane.width/2), 50, 50);
    ctx.drawImage(
      this.img, this.x, this.y,
      this.img.width, this.img.height
    );
    // draw its route
    if ( this.route.length >= 2 ) {
      for (var i = 1; i < this.route.length; i++) {
        let a = this.route[i-1];
        let b = this.route[i];
        // context.fillStyle = "#000000";
        // context.lineWidth = 2;
        context.beginPath();
        context.moveTo(a.x, a.y);
        context.lineTo(b.x, b.y);
        context.stroke();
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

module.exports = Plane;
