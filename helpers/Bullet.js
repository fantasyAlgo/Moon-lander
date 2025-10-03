import { Polygon } from "./Polygon.js";
import { collisionSAT } from "./collisions.js";
import { drawVectorPolygon, make_vector2d, rotateVectorShape, vector2dAdd, vector2Distance, vector2dMult, vector2dMultScalar, vector2dNorm } from "./Vector2.js";
import { SATResult } from "../settings.js";

export class Bullet extends Polygon {
  constructor(pos, dir, vel){ // vel is a scalar ok?
    const body = [
      make_vector2d(0.0, 0.0),
      make_vector2d(5, 0.0),
      make_vector2d(5, -10),
      make_vector2d(0, -10),
    ]
    super(pos, body);
    this.inialPoint = make_vector2d(pos.x, pos.y);
    this.dir = vector2dNorm(dir);
    this.rot = Math.atan2(this.dir.y, this.dir.x);
    this.angle = this.rot;
    this.vel = vel;
    this.dead = false;
  }


  update(dt, asteroids, player){
    this.pos = vector2dAdd(this.pos, vector2dMultScalar(this.dir, this.vel*dt))
    const c = this.checkCollision(asteroids, player);
    if (c != -2){
      this.dead = true;
      return c
    }
    if (vector2Distance(this.pos, this.inialPoint) > 1000){
      this.dead = true;
      return;
    }
    return -2;
  }

  // returns the index of the asteroid that is colliding with, -1 for the player, and -2 if nothing collides with the bullet
  checkCollision(asteroids, player){
    const shape1 = this.getShape();
    for (let i = 0; i < asteroids.length; i++){
      const shapeA = asteroids[i].getShape();
      const c = collisionSAT(shape1, shapeA);
      if (c != SATResult.NOT_COLLISION) return i;
    }
    return -2;
  
  }
  Draw(ctx, co){
    const angle = Math.atan2(this.dir.y, -this.dir.x)
    drawVectorPolygon(ctx, this.body[0], rotateVectorShape(this.body, this.body[0], angle), co);
  }
}
