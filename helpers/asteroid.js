



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



export function make_asteroid(player_pos) {
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

  let position = {
    x: player_pos.x + generate_number(-canvas.width / 2, canvas.width / 2),
    y: player_pos.y - canvas.height * 1,
  };
  const direction = {
    x: generate_number(-5, 5),
    y: generate_number(1, 5),
  };
  return {
    points: points,
    position: position,
    direction: direction,
    update: (perlin, dt=1) => {
      let hasCollapsed = false;
      points.forEach((el) => {
        el.x += direction.x*dt;
        el.y += direction.y*dt;
        if (perlin.getVal((el.x + position.x) / 200) * 500 <= el.y + position.y)
          hasCollapsed = true;
      });
      return hasCollapsed;
    },
    getShape: (camera_offset) => {
      let shape = []
      for (let i = 0; i < points.length; i++) {
        shape.push({
          x: camera_offset.x + points[i].x + position.x,
          y: camera_offset.y + points[i].y + position.y,
        })
      }
      return shape
    },
    draw: (ctx, camera_offset) => {
      ctx.beginPath();
      ctx.moveTo(
        camera_offset.x + points[0].x + position.x,
        camera_offset.y + points[0].y + position.y,
      );
      points.forEach((el) => {
        ctx.lineTo(
          camera_offset.x + el.x + position.x,
          camera_offset.y + el.y + position.y,
        );
      });
      ctx.lineTo(
        camera_offset.x + points[0].x + position.x,
        camera_offset.y + points[0].y + position.y,
      );
      ctx.closePath();
      ctx.strokeStyle = "white";
      ctx.lineWidth = 5;
      ctx.fillStyle = "#121211";

      ctx.stroke();
      ctx.fill();
    },
  };
}


