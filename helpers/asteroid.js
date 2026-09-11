import { ASTEROID_SPEED, METEOR_SPEED } from "../settings.js";
import { getFloorValue } from "./perlin.js";
import { Polygon } from "./Polygon.js";
import { make_vector2d, vector2dAdd, vector2dMultScalar, vector2dNorm, vector2dSub } from "./Vector2.js";




function ccw_points(a, b, c) {
  const area = (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
  if (area < 0) return -1; // clockwise
  if (area > 0) return 1; // counter-clockwise
  return 0; // collinear
}
function compareFunction(ref, b, c){
  if (b == ref) return -1;
  if (c == ref) return 1;

  const ccw = ccw_points(ref, b, c);
  if (ccw == 0){
      if (b.x == c.y) return b.y < c.y ? -1 : 1;				
      else return b.x < c.x ? -1 : 1;				
  }
  return -ccw;
}

function convex_hull(points){
  let stack = [];
  const size = points.length;
  let verticesSorted = [];
  let indx = -1;
  let value = 10000000;
  for (let i = 0; i < size; i++){
    if (value > points[i].y){
      value = points[i].y;
      indx = i
    }
    verticesSorted.push(points[i]);
  }
  const f = (a, b) => compareFunction(points[indx], a, b);

  verticesSorted = verticesSorted.slice().sort(f);
  //verticesSorted.sort((a, b) => compareFunction(points[indx], a, b));
  stack.push(verticesSorted[0]);
  stack.push(verticesSorted[1]);

  for (let i = 2; i < points.length; i++) {
    const next = verticesSorted[i];
    let p = stack.pop();
    while (stack.length > 0 && ccw_points(stack[stack.length-1], p, next) <= 0)
      p = stack.pop();
    stack.push(p);
    stack.push(next);
  }
  const p = stack.pop();
  if (ccw_points(stack[stack.length-1], p, verticesSorted[0]) > 0)
    stack.push(p);
  //console.log(stack)
  return stack;
}


export class FallingBody extends Polygon{
  constructor(pos, modelBody, internal_color, particles_color, strength, ast_speed){
    super(pos, modelBody);
    this.rotSpeed = Math.random()*0.02;
    this.internal_color = internal_color;
    this.fillColor = internal_color;
    this.particles_color = particles_color;

    const asteroid_shape = this.getShape();
    const center =  vector2dAdd(this.center, this.pos); 
    this.sizeAsteroid = (center.x - asteroid_shape[0].x)*(center.x - asteroid_shape[0].x) + (center.y - asteroid_shape[0].y)*(center.y - asteroid_shape[0].y);
    this.speed = ast_speed;
  }

  update(perlin, particles, dt=1){
    let hasCollapsed = false;
    this.rot += this.rotSpeed*dt;
    this.pos = vector2dAdd(this.pos, vector2dMultScalar(this.dir, dt));
    this.modelBody.forEach((el) => {
      if (getFloorValue(perlin, el.x+this.pos.x) <= el.y + this.pos.y)
        hasCollapsed = true;
    });
    return hasCollapsed;
  }

  updateParticles(particles){
    const center = this.pos; 
    particles.emit({x: center.x, y: center.y } ,
      make_vector2d(-this.dir.x*this.speed, -this.dir.y*this.speed), this.particles_color, 
      make_vector2d(-this.dir.x*this.speed, -this.dir.y*this.speed), this.sizeAsteroid/600.0, this.sizeAsteroid/200, 0.008)
  }


  emitDeathParticles(particles){
    const center = this.pos;
    console.log("thisShitWork");
    for (let i = 0; i < 100; i++) {
      const vel = make_vector2d(Math.random() * 2 - 1,  Math.random() * 2 - 1 );
      particles.emit(
        {
          x: center.x,
          y: center.y,
        },
        vel,
        i % 2 == 0 ? "#fafaff" : "#929990", null, this.sizeAsteroid/500.0
      );
    }
  }
}



export class Asteroid extends FallingBody{
  constructor(player_pos){
    const generate_number = (min, max) =>
      Math.floor(Math.random() * (max - min) + min);
    const pol_n = generate_number(4, 9);
    const size = generate_number(20, 70);

    let points = [];
    const step = (Math.PI / pol_n) * 2;
    for (
      let init_angle = Math.PI / pol_n;
      init_angle <= Math.PI * 2;
      init_angle += step
    ) {
      points.push({
        x: size * Math.cos(init_angle) + generate_number(-10, 10),
        y: size * Math.sin(init_angle) + generate_number(-10, 10),
      });
    }

    points = convex_hull(points);
    const pos = make_vector2d(player_pos.x + generate_number(-canvas.width / 2, canvas.width / 2), player_pos.y - canvas.height * 1);

    super(pos, points, "#121211", "#916846", 1.0, ASTEROID_SPEED);


    this.dir = make_vector2d( generate_number(-5, 5), generate_number(1, 5))
  }
}


export class Meteor extends FallingBody {
  constructor(player_pos){
    const generate_number = (min, max) =>
      Math.floor(Math.random() * (max - min) + min);
    const pol_n = generate_number(6, 20);
    const size_x = generate_number(10, 30);
    const size_y = generate_number(10, 30);

    let points = [];
    const step = (Math.PI / pol_n) * 2;
    for (
      let init_angle = Math.PI / pol_n;
      init_angle <= Math.PI * 2;
      init_angle += step
    ) {
      points.push({
        x: size_x * Math.cos(init_angle) + generate_number(-10, 10),
        y: size_y * Math.sin(init_angle) + generate_number(-10, 10),
      });
    }

    points = convex_hull(points);
    const pos = make_vector2d(player_pos.x + generate_number(-canvas.width / 2, canvas.width / 2), player_pos.y - canvas.height * 1);
    super(pos, points, "#ffffff", "#ffffff", 2.0, METEOR_SPEED);

    this.dir = vector2dMultScalar(vector2dNorm(make_vector2d( generate_number(-10, 10), generate_number(1, 10))), 4.0);

  }
  updateParticles(particles){
    const center = vector2dAdd(this.center, this.pos); 
    particles.emit({x: center.x, y: center.y } ,
      make_vector2d(-this.dir.x*this.speed, -this.dir.y*this.speed), this.particles_color, 
      null, this.sizeAsteroid/200.0, this.sizeAsteroid/100, 0.003, 1.5)
  }
  emitDeathParticles(particles){
    const center = this.pos;
    for (let i = 0; i < 100; i++) {
      const vel = make_vector2d(Math.random() * 2 - 1,  Math.random() * 2 - 1 );
      particles.emit(
        {
          x: center.x,
          y: center.y,
        },
        vel,
        i % 2 == 0 ? "#fafaff" : "#929990", {x: vel.x, y: vel.y}, this.sizeAsteroid/100,
      );
    }
  }
}





export function make_asteroid(player_pos) {
  if (Math.random() < 0.9)
    return new Asteroid(player_pos);
  return new Meteor(player_pos);
}


