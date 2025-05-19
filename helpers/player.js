let clamp = (num, min, max) => Math.min(Math.max(num, min), max);
let sameInInterval = (a, b, interval) => Math.abs(a - b) < interval;


export class Player {
  constructor(ctx, x, y, width, height, color, weight, fuel) {
    this.ctx = ctx;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
    this.rotation = 0;
    this.totalRotation = 0;
    this.force = { x: 0, y: 0 };
    this.start_time = 0;
    // Points of the graphics, they are useful for the rotate method
    this.lst = [
      [this.x, this.y],
      [this.x + this.width, this.y + this.height],
      [this.x - this.width, this.y + this.height],
      [this.x, this.y + this.height / 1.5],
      [this.x + this.width, this.y + this.height],
      [this.x - this.width, this.y + this.height],
    ];
    this.fuel = fuel;
    this.weight = weight;
  }
  // Move the player updating each point of the list of points for the graphics
  move(x, y) {
    this.x += x;
    this.y += y;
    for (let i = 0; i < this.lst.length; i++) {
      this.lst[i][0] += x;
      this.lst[i][1] += y;
    }
  }
  applyRotation() {
    // Using the 2d rotation matrix to rotate each point to the correct location after the rotation
    let cos = Math.cos(this.rotation);
    let sin = Math.sin(this.rotation);
    for (let i = 0; i < this.lst.length; i++) {
      let x = this.lst[i][0] - this.x;
      let y = this.lst[i][1] - this.y;
      this.lst[i][0] = x * cos - y * sin + this.x;
      this.lst[i][1] = x * sin + y * cos + this.y;
    }
  }
  rotate(angle) {
    this.rotation = angle;
    this.totalRotation += angle;
    this.applyRotation();
  }
  // the angle is not added
  static_rotate(angle) {
    this.rotation = -this.totalRotation - angle;
    this.totalRotation = -angle;
    this.applyRotation();
  }
  rotate_with(pointing_vec) {
    let angle = Math.atan2(pointing_vec.x, pointing_vec.y);
    this.static_rotate(angle);
  }
  update() {
    this.move(this.force.x, this.force.y);
    this.force.y +=
      0.000981 * (2.3 + (this.weight - 50) / 100) +
      clamp(this.force.y / this.weight / 20, -0.000981, 0.000981);
    this.force.x *= 0.9999 - this.weight / 85000;
  }
  getShapePosition(camera_offset){
    let points = [];
    for (let i = 0; i < this.lst.length; i++){
      points.push({
        x: this.lst[i][0] + camera_offset.x,
        y: this.lst[i][1] + camera_offset.y,
      });
    }
    return points;
  }

  draw(camera_offset) {
    this.ctx.beginPath();
    this.ctx.moveTo(
      this.lst[0][0] + camera_offset.x,
      this.lst[0][1] + camera_offset.y,
    );
    for (let i = 1; i < this.lst.length / 2; i++)
      this.ctx.lineTo(
        this.lst[i][0] + camera_offset.x,
        this.lst[i][1] + camera_offset.y,
      );
    this.ctx.closePath();
    this.ctx.moveTo(
      this.lst[this.lst.length / 2 - 1][0] + camera_offset.x,
      this.lst[this.lst.length / 2 - 1][1] + camera_offset.y,
    );
    for (let i = this.lst.length / 2; i < this.lst.length; i++)
      this.ctx.lineTo(
        this.lst[i][0] + camera_offset.x,
        this.lst[i][1] + camera_offset.y,
      );
    this.ctx.closePath();

    this.ctx.fillStyle = this.color;
    this.ctx.fill("evenodd");
  }
  isInRightPosition(attractPoint, camera_offset){
    return  Math.abs(this.force.y) <= 0.15 && 
            sameInInterval(this.lst[1][1] + camera_offset.y, attractPoint[0], 3) && 
            sameInInterval(this.lst[2][1] + camera_offset.y, attractPoint[1], 3);
  }
  checkFloorCollision(attractPoint, camera_offset){
    return this.lst[1][1] + camera_offset.y > attractPoint[0] ||
           this.lst[2][1] + camera_offset.y > attractPoint[1] ||
           this.lst[0][1] + camera_offset.y > attractPoint[2];
  }
}
