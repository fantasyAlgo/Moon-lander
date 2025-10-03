import { GRAVITY_STRENGTH, ROBOT_FLOOR_DISTANCE } from "../settings.js";
import { Bullet } from "./Bullet.js";
import { make_vector2d, vector2dAdd, vector2Distance, vector2dMult, vector2dSub, vector2dNorm, vector2dMultScalar, drawVectorPolygon, rotateVectorShape } from "./Vector2.js";


export class Rover {
  constructor(startPos){
    const width_rect = 50.0;
    const height_rect = 30.0
    this.width_rect = width_rect;
    this.height_rect = width_rect;

    this.DAMPING_FORCE = 0.4;
    this.SPRING_FORCE = 0.4;

    this.bodyBase1 = make_vector2d(startPos.x, startPos.y+height_rect);
    this.bodyBase1Vel = make_vector2d(0.0, 0.0);
    this.bodyBase2 = make_vector2d(startPos.x + width_rect, startPos.y+height_rect);
    this.bodyBase2Vel = make_vector2d(0.0, 0.0);

    this.body = [
      make_vector2d(0.0, 0.0),
      make_vector2d(width_rect, 0.0),
      make_vector2d(width_rect+10, -height_rect),
      make_vector2d(-10.0, -height_rect),
    ]
    
    // head (small rectangle with a slant for cuteness)
    this.head = [
      make_vector2d(width_rect-40, -height_rect),
      make_vector2d(width_rect-10, -height_rect),
      make_vector2d(width_rect-10, -height_rect-height_rect/2.0),
      make_vector2d(width_rect-40, -height_rect-height_rect/2.0),
    ];
    this.pointer = [ 
      make_vector2d(width_rect-20, -height_rect - height_rect/2.0),
      make_vector2d(width_rect-20, -height_rect*2.0),
    ]

    this.leftWheel = {x: 170 - 150, y: 210 - 150  -10, r: 15};
    this.rightWheel = {x: 230 - 150, y: 210 - 10 - 150, r: 15};
    this.bullet = new Bullet(make_vector2d(0.0, 0.0), make_vector2d(1.0, 0.0), 1.0);
    this.bullet.dead = true;
    this.angle = 0.0;
    

    this.dir = Math.random() > 0.5 ? -1.0 : 1.0;
    this.timer = 0.0;
  }

  updatePos(perlin, dt){
    const clamp = (x, minV, maxV) => x < minV ? minV : (x > maxV ? maxV : x)
    this.bodyBase1Vel.y += GRAVITY_STRENGTH;
    this.bodyBase2Vel.y += GRAVITY_STRENGTH;
    const dy = clamp(perlin.getDer((this.bodyBase2.x) / 200), -1.0, 1.0) ;
    this.bodyBase2Vel.x += dt*dy*this.dir;
    this.bodyBase2Vel.x = clamp(this.bodyBase2Vel.x, 0.4*this.dir, 0.7*this.dir);
    this.bodyBase2Vel.x *= 0.99;

    let ground_point = perlin.getVal((this.bodyBase1.x) / 200) * 500;
    let diff = (ground_point - ROBOT_FLOOR_DISTANCE) - this.bodyBase1.y;
    let spring_force = diff * this.SPRING_FORCE - this.bodyBase1Vel.y*this.DAMPING_FORCE;
    spring_force = Math.min(1.0, spring_force*2.0);
    this.bodyBase1Vel.y += spring_force;

    const diffR = vector2dMultScalar(vector2dNorm(vector2dSub(this.bodyBase2, this.bodyBase1)),(vector2Distance(this.bodyBase2, this.bodyBase1)-this.width_rect));
    const spring_force_r = vector2dSub(vector2dMultScalar(diffR, this.SPRING_FORCE*2.0), vector2dMultScalar(this.bodyBase1Vel,this.DAMPING_FORCE));
    this.bodyBase1Vel = vector2dAdd(this.bodyBase1Vel, spring_force_r );

    this.bodyBase1 = vector2dAdd(this.bodyBase1, this.bodyBase1Vel);

    ground_point = perlin.getVal((this.bodyBase2.x) / 200) * 500;
    diff = (ground_point - ROBOT_FLOOR_DISTANCE) - this.bodyBase2.y;
    spring_force = diff * this.SPRING_FORCE - this.bodyBase2Vel.y*this.DAMPING_FORCE;
    spring_force = Math.min(1.0, spring_force);
    this.bodyBase2Vel.y += spring_force;

    this.bodyBase2 = vector2dAdd(this.bodyBase2, this.bodyBase2Vel);
    this.lastDirAngle = 0.0;
  }

  getCenter(){
    let c = make_vector2d(0.0, 0.0);
    for (let i=0; i < this.head.length; i++){
      c.x += this.head[i].x + this.bodyBase1.x;
      c.y += this.head[i].y + this.bodyBase1.y;
    }
    c.x /= this.head.length;
    c.y /= this.head.length;
    return c;
  }
  updateBullet(coll, asteroids){
    const pointerShape = rotateVectorShape(this.pointer, this.body[0], this.angle);
    const bCenter = vector2dAdd(pointerShape[0], this.bodyBase1);
    let bestDistance = 401;
    let bestDir = make_vector2d(0.0, 0.0);
    for (let i = 0; i < asteroids.length; i++) {
      if (i == coll) continue;
      const el = asteroids[i];
      const center = vector2dAdd(el.getCenter(), el.dir);
      const dist = vector2Distance(center, bCenter);
      //console.log("dist: ", vector2Distance(c, bCenter) );
      if (dist < bestDistance && this.bullet.dead){
        const dir = vector2dSub(center, this.bodyBase1)
        bestDistance = dist;
        bestDir = dir;
        //this.bullet = new Bullet(bCenter, dir, 1.0);
      }
    }
    if (bestDistance < 401){
      bestDir = vector2dNorm(bestDir);
      this.lastDirAngle = Math.atan2(bestDir.y, bestDir.x)+Math.PI;
      this.bullet = new Bullet(bCenter, bestDir, 8.0);
    }
  }
  updateDir(dt){}
  update(perlin, asteroids, dt){
    this.updatePos(perlin, dt);
    this.updateDir(dt);
    const c = this.bullet.update(dt, asteroids, {});
    if (!this.bullet.dead) return;
    this.updateBullet(c, asteroids);
    return c;
  }


  Draw(ctx, camera_offset){
    if (!this.bullet.dead) this.bullet.draw(ctx, camera_offset);
    const edge = vector2dSub(this.bodyBase2, this.bodyBase1);
    const normal = vector2dNorm(make_vector2d(edge.y, -edge.x));
    let angle = Math.atan2(normal.y, normal.x)+Math.PI/2.0;
    if (angle > Math.PI){
      const x = this.bodyBase1.x;
      this.bodyBase1.x = this.bodyBase2.x;
      this.bodyBase2.x = x;
      return;
    }
    this.angle = angle;

    ctx.beginPath();
    ctx.arc(this.bodyBase2.x + camera_offset.x, this.bodyBase2.y + camera_offset.y, this.leftWheel.r/2.0, 0, Math.PI*2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(this.bodyBase1.x + camera_offset.x, this.bodyBase1.y + camera_offset.y, this.leftWheel.r/2.0, 0, Math.PI*2);
    ctx.stroke();


    drawVectorPolygon(ctx, this.bodyBase1, rotateVectorShape(this.body, this.body[0], angle), camera_offset);
    drawVectorPolygon(ctx, this.bodyBase1, rotateVectorShape(this.head, this.body[0], angle), camera_offset);


  }



} 


