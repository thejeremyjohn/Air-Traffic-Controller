import { Util } from './util';

export class Emoji {
  constructor(options) {
    this.withinBounds = false;
    this.canCollide = false;
    this.ctx = options.ctx;
    this.faces = options.faces;
    this.face = options.faces.happy;
    this.radius = options.radius;
    this.x = options.x;
    this.y = options.y;
    this.route = [];
    this.speed = (options.speed || 1);
    this.vector = this.randomVector();
    this.color = options.color;
    this.isLanding = false;
  }
  randomVector() {
    const angle = Util.getRandomFloat(0, 2*Math.PI);
    var vx = Math.cos(angle) * this.speed;
    var vy = Math.sin(angle) * this.speed;
    const mx = this.ctx.canvas.width/2;
    const my = this.ctx.canvas.height/2;
    if (this.x >= mx) {
      vx = Math.abs(vx) * -1;
    } else {
      vx = Math.abs(vx);
    }
    if (this.y >= my) {
      vy = Math.abs(vy) * -1;
    } else {
      vy = Math.abs(vy);
    }
    return { vx, vy };
  }
  draw() {
    this.ctx.strokeStyle = this.color;
    this.ctx.fillStyle = this.color;
    if ( this.route.length >= 2 ) {
      this.ctx.lineWidth = Math.floor(this.radius/8.3);
      for (var i = 1; i < this.route.length; i+=10) {
        let a = this.route[i-5] || this;
        let b = this.route[i];
        this.ctx.beginPath();
        this.ctx.moveTo(a.x, a.y);
        this.ctx.lineTo(b.x, b.y);
        this.ctx.stroke();
      }
    }
    if (!this.canCollide) {
      this.ctx.strokeStyle = 'grey';
    // } else {
    //   this.ctx.strokeStyle = this.color;
    }
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    this.ctx.fill();
    this.ctx.stroke();
    this.ctx.drawImage(
      this.face,
      this.x-(this.radius-1.5),
      this.y-(this.radius-1.5),
      this.radius*2-3, this.radius*2-3
    );
  }
  wayOff() {
   if (
        this.x < 0-55
     || this.x > this.ctx.canvas.width+55
   ) {
     return true;
   }
   if (
        this.y < 0-55
     || this.y > this.ctx.canvas.height+55
   ) {
     return true;
   }
  }
  bounce() {
    if ( this.withinBounds ) {
      if (
           this.x-this.radius <= 0
        || this.x+this.radius >= this.ctx.canvas.width
      ) {
        this.vector.vx *= -1;
      }
      if (
           this.y-this.radius <= 0
        || this.y+this.radius >= this.ctx.canvas.height
      ) {
        this.vector.vy *= -1;
      }
    }
  }
  move() {
    if (!this.isLanding && !this.canCollide) {
      this.canCollide = Util.isWithinBounds(this.ctx, this, 0);
    }
    if (!this.withinBounds) {
      this.withinBounds = Util.isWithinBounds(this.ctx, this, this.radius);
    }
    if (this.route.length >= 2) {
      if (this.route.length === 2) {
      this.getPassiveVector();
      }
      this.activeMove();
    } else {
      this.passiveMove();
    }
    if (this.landing) this.land();
  }
  activeMove() {
    this.route.splice(0, 1);
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
      vx: ax-bx,
      vy: ay-by
    };
  }
  passiveMove() {
    this.bounce();
    this.x += this.vector.vx;
    this.y += this.vector.vy;
  }
  land() {
    if (this.route.length <= 5) {
      this.vector = { vx:0, vy:0 };
    }
    this.canCollide = false;
    this.radius *= 0.98;
  }
  collidesWith(that) {
    if ( Util.isColliding(this, that, 0) ) {

      if (that instanceof Emoji) {
        if ( this.canCollide && that.canCollide ) {
          return true;
        }
      } else {
        return true;
      }

    }
    return false;
  }
  nearlyCollidesWith(that) {
    return Util.isColliding(this, that, 30);
  }
  inVicinityOf(that) {
    return Util.isColliding(this, that, 100);
  }
  changeFace(face) {
    if (this.face !== face) {
      this.face = face;
    }
  }
}
