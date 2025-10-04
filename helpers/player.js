import { MAX_IMPACT_VEL, MIN_ALIGNMENT } from "../settings.js";
import { Polygon } from "./Polygon.js";
import { make_vector2d, vector2dAdd, vector2dMultScalar } from "./Vector2.js";

let clamp = (num, min, max) => Math.min(Math.max(num, min), max);
let sameInInterval = (a, b, interval) => Math.abs(a - b) < interval;

// Some consts

/*
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

  update(dt=1) {
    this.move(this.force.x, this.force.y);
    this.force.y += ( 0.000981 * (2.3 + (this.weight - 50) / 100) +
                    clamp(this.force.y / this.weight / 20, -0.000981, 0.000981)) * dt;
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
    return  Math.abs(this.force.y) <= MAX_IMPACT_VEL && 
            sameInInterval(this.lst[1][1] + camera_offset.y, attractPoint[0], MIN_ALIGNMENT) && 
            sameInInterval(this.lst[2][1] + camera_offset.y, attractPoint[1], MIN_ALIGNMENT);
  }
  checkFloorCollision(attractPoint, camera_offset){
    return this.lst[1][1] + camera_offset.y > attractPoint[0] ||
           this.lst[2][1] + camera_offset.y > attractPoint[1] ||
           this.lst[0][1] + camera_offset.y > attractPoint[2];
  }
}
*/











export class Player extends Polygon {
  constructor(x, y, width, height, color, weight, fuel, player_gas) {
    const cm = 14.0*height/18.0
    const shape = [
      make_vector2d(0.0, 0.0 - cm),
      make_vector2d(0.0 + width, 0.0 + height - cm),
      make_vector2d(0.0 - width, 0.0 + height - cm),
      make_vector2d(0.0, 0.0 + height / 1.5  - cm),
      make_vector2d(0.0 + width, 0.0 + height - cm),
      make_vector2d(0.0 - width, 0.0 + height - cm),
    ];
    super(make_vector2d(x, y), shape);
    this.color = color;
    this.force = make_vector2d(0.0, 0.0);
    this.start_time = 0;
    this.fuel = fuel;
    this.weight = weight;
    this.goUp = false;
    this.tShape = this.getShape();
    console.log("pla: ", player_gas);
    this.player_gas = player_gas;
  }

  rotate_with(pointing_vec) {
    let angle = -Math.atan2(pointing_vec.x, pointing_vec.y);
    this.rot = angle;
  }

  updatePosition(vel) {
    this.pos = vector2dAdd(this.pos, vel);
  }
  updateForward(dt, increment = 1.0){
    this.force.x += (Math.sin(this.rot) / this.player_gas.x) * increment * dt;
    this.force.y -= (Math.cos(this.rot) / this.player_gas.y) * increment * dt;
    this.fuel -= 1;
    this.goUp = true;
  }

  update(dt=1, mouse_dir, acc) {
    if (this.goUp)
      this.updateForward(dt, acc);
    this.rotate_with(mouse_dir);
    this.updatePosition(vector2dMultScalar(this.force, dt));
    this.force.y += ( 0.000981 * (2.3 + (this.weight - 50) / 100) +
                    clamp(this.force.y / this.weight / 20, -0.000981, 0.000981)) * dt;
    this.force.x *= 0.9999 - this.weight / 85000;
    this.tShape = this.getShape();
  }




  isInRightPosition(attractPoint){
    return  Math.abs(this.force.y) <= MAX_IMPACT_VEL && 
            sameInInterval(this.tShape[1].y, attractPoint[0], MIN_ALIGNMENT) && 
            sameInInterval(this.tShape[2].y, attractPoint[1], MIN_ALIGNMENT);
  }
  checkFloorCollision(attractPoint){
    return this.tShape[1].y > attractPoint[0] ||
           this.tShape[2].y > attractPoint[1] ||
           this.tShape[0].y > attractPoint[2];
  }
  generateParticles(pSystem, is_boosting, boost_time){
    console.log("fuck you");
    pSystem.emit(
      {
        x: this.tShape[3].x,
        y: this.tShape[3].y
      },
      { x: -Math.sin(this.rot), y: Math.cos(this.rot) },
      is_boosting && boost_time > 0 ? "#cc9e78" : "#916846",
      { x: -this.force.x, y: -this.force.y },
      is_boosting && boost_time > 0 ? 2.3 : 1.0,
    );
  }
  draw(ctx, camera_offset){
    const tShape = this.getShape();
    ctx.beginPath();
    ctx.moveTo(
      tShape[0].x + camera_offset.x,
      tShape[0].y + camera_offset.y,
    );
    for (let i = 1; i < tShape.length / 2; i++)
      ctx.lineTo(
        tShape[i].x + camera_offset.x,
        tShape[i].y + camera_offset.y,
      );
    ctx.closePath();
    ctx.moveTo(
      tShape[tShape.length / 2 - 1].x + camera_offset.x,
      tShape[tShape.length / 2 - 1].y + camera_offset.y,
    );
    for (let i = tShape.length / 2; i < tShape.length; i++)
      ctx.lineTo(
        tShape[i].x + camera_offset.x,
        tShape[i].y + camera_offset.y,
      );
    ctx.closePath();

    ctx.fillStyle = this.color;
    ctx.fill("evenodd");
  }

}



