export const make_vector2d = (x, y) => {
  return {
    x: x,
    y: y,
    distance: Math.sqrt(x * x + y * y),
    cross: (vec) => x * vec.y - y * vec.x,
    dot: (vec) => x * vec.x + y * vec.y,
  };
};


export const vector2Distance = (v1, v2) => {
  const sqr = (v1.x - v2.x)*(v1.x - v2.x) + (v1.y - v2.y)*(v1.y - v2.y);
  return Math.sqrt(sqr);
}
export const vector2dMult = (v1, v2) => make_vector2d(v1.x * v2.x, v1.y * v2.y);
export const vector2dMultScalar = (v1, s) => make_vector2d(v1.x * s, v1.y * s);
export const vector2dSub = (v1, v2) => make_vector2d(v1.x - v2.x, v1.y - v2.y);
export const vector2dAdd = (v1, v2) => make_vector2d(v1.x + v2.x, v1.y + v2.y);
export const vector2dNorm = (v1) => v1.distance != 0.0 ? make_vector2d(v1.x / v1.distance, v1.y / v1.distance) : make_vector2d(0.0, 0.0); 
// Calculate the minimum and maximum value of dot product with an axis (v) and each point of (points)
export const vector2dProjectMinMax = (v, points) => {
  let dottedPoints = [];
  let length = points.length;
  for (let i = 0; i < length; i++) dottedPoints.push(v.dot(points[i]));
  return [Math.min(...dottedPoints), Math.max(...dottedPoints)];
};


export const drawVectorPolygon = (ctx, pos, points, co) => {
  ctx.beginPath();
  ctx.moveTo(points[0].x+pos.x+co.x, points[0].y+pos.y+co.y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x+pos.x+co.x, points[i].y+pos.y+co.y);
  }
  ctx.closePath();
  ctx.strokeStyle = "white";
  ctx.lineWidth = 5;
  ctx.fillStyle = "#121211";

  ctx.stroke();
  ctx.fill();
}

export const rotateVectorShape = (shape, center, angle) => {
  let cos = Math.cos(angle);
  let sin = Math.sin(angle);
  let final_shape = [];
  for (let i = 0; i < shape.length; i++) {
    let x = shape[i].x - center.x;
    let y = shape[i].y - center.y;
    final_shape.push(make_vector2d(
        x * cos - y * sin + center.x,
        x * sin + y * cos + center.y
    ));
  }
  return final_shape;

}

