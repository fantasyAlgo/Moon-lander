import { Polygon } from "./Polygon.js";
import { make_vector2d } from "./Vector2.js";




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



export class Asteroid extends Polygon{
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
    super(pos, points);
    this.dir = make_vector2d( generate_number(-5, 5), generate_number(1, 5))
  }
  update(perlin, particles, dt=1){
    let hasCollapsed = false;
    this.modelBody.forEach((el) => {
      el.x += this.dir.x*dt;
      el.y += this.dir.y*dt;
      if (perlin.getVal((el.x + this.pos.x) / 200) * 500 <= el.y + this.pos.y)
        hasCollapsed = true;
    });
    return hasCollapsed;
  }
  emitDeathParticles(particles){
    const shape = this.getShape();
    let center = this.getCenter();
    const sizeAsteroid = (center.x - shape[0].x)*(center.x - shape[0].x) + (center.y - shape[0].y)*(center.y - shape[0].y);

    for (let i = 0; i < 100; i++) {
      const vel = { x: Math.random() * 2 - 1, y: Math.random() * 2 - 1 };
      particles.emit(
        {
          x: center.x,
          y: center.y,
        },
        vel,
        i % 2 == 0 ? "#fafaff" : "#929990", {x: vel.x, y: vel.y}, sizeAsteroid/700.0
      );
    }
  }
}



export function make_asteroid(player_pos) {
  return new Asteroid(player_pos);
}


