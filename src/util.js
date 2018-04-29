const Util = {
  getRandomFloat(min, max) {
    return Math.random() * (max - min) + min;
  },

  getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
  },

  distanceBetween(a, b) {
    return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
  },

  angleBetween(a, b) {
    return Math.atan2( b.x - a.x, b.y - a.y );
  },

  isWithinBounds(ctx, point, radius=0) {
    return (
         point.x-radius >= 0
      && point.x+radius <= ctx.canvas.width
      && point.y-radius >= 0
      && point.y+radius <= ctx.canvas.height
    );
  },

  isColliding(a, b, offset=0) {
    var distance = this.distanceBetween(a, b) - offset;
    if ( distance < a.radius + b.radius ) {
      return true;
    }
    return false;
  },

  getMousePos(e) {
    const el = e.currentTarget;
    let x, y;
    if (el.tagName === "BODY") {
      var xScroll = el.scrollLeft || document.documentElement.scrollLeft;
      var yScroll = el.scrollTop || document.documentElement.scrollTop;
      x = e.clientX - (el.offsetLeft - xScroll + el.clientLeft);
      y = e.clientY - (el.offsetTop - yScroll + el.clientTop);
    } else {
      x = e.clientX - (el.offsetLeft - el.scrollLeft + el.clientLeft);
      y = e.clientY - (el.offsetTop - el.scrollTop + el.clientTop);
    }
    return { x, y };
  }
};

export { Util };
