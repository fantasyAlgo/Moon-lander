
//// Making a little Vector class /////
const make_vector2d = (x, y) => {
  return {
    x: x,
    y: y,
    distance: Math.sqrt(x * x + y * y),
    cross: (vec) => x * vec.y - y * vec.x,
    dot: (vec) => x * vec.x + y * vec.y,
  };
};
const vector2dSub = (v1, v2) => make_vector2d(v1.x - v2.x, v1.y - v2.y);
const vector2dAdd = (v1, v2) => make_vector2d(v1.x + v2.x, v1.y + v2.y);
const vector2dNorm = (v1) =>
  make_vector2d(v1.x / v1.distance, v1.y / v1.distance);
// Calculate the minimum and maximum value of dot product with an axis (v) and each point of (points)
const vector2dProjectMinMax = (v, points) => {
  let dottedPoints = [];
  let length = points.length;
  for (let i = 0; i < length; i++) dottedPoints.push(v.dot(points[i]));
  return [Math.min(...dottedPoints), Math.max(...dottedPoints)];
};
//////////////

function isConvexPoint(points) {
  const v1 = vector2dSub(points[1], points[0]);
  const v2 = vector2dSub(points[1], points[2]);
  return v2.cross(v1);
}

function isInTriangle(point, triangle) {
  const a = triangle[1];
  const b = triangle[0];
  const c = triangle[2];

  const ab = vector2dSub(b, a);
  const bc = vector2dSub(c, b);
  const ca = vector2dSub(a, c);

  const ap = vector2dSub(point, a);
  const bp = vector2dSub(point, b);
  const cp = vector2dSub(point, c);
  return ab.cross(ap) <= 0 && bc.cross(bp) <= 0 && ca.cross(cp) <= 0;
}

// I assume points is an array of objects with x and y; this code does not work if the polygon has:
// An Hole
// points with an angle of PI
export function earClipping(points) {
  let leg = points.length;
  let currTri;
  let isInsideTri;
  let tri_list = [];
  let indexArray = Array.from({ length: leg }, (_, i) => i);
  for (let i = 0; i < leg; ++i) {
    if (leg == 3) break;
    currTri = [
      indexArray[i - 1 < 0 ? leg - i - 1 : (i - 1) % leg],
      indexArray[i],
      indexArray[(i + 1) % leg],
    ];
    //console.log(currTri, isConvexPoint(currTri));
    isInsideTri = false;
    if (isConvexPoint(currTri) < 0) continue;
    for (let j = 0; j < leg; ++j) {
      if (
        indexArray[j] == currTri[0] ||
        indexArray[j] == currTri[1] ||
        indexArray[j] == currTri[2]
      )
        continue;
      if (
        isInTriangle(points[indexArray[j]], [
          points[currTri[0]],
          points[currTri[1]],
          points[currTri[2]],
        ])
      ) {
        isInsideTri = true;
        break;
      }
    }
    if (!isInsideTri) {
      tri_list.push(currTri);
      indexArray.splice(i, 1);
      i = -1;
      leg -= 1;
    }
  }
  //console.log("mounting the dear academy: ", points);
  tri_list.push(indexArray);
  return tri_list;
}

function normalVector(point1, point2) {
  let edge = vector2dSub(point2, point1);
  edge = vector2dNorm(edge);
  return make_vector2d(edge.y, -edge.x);
}
function getAxes(pol) {
  let axes = [];
  const length = pol.length;
  for (let i = 0; i < length; i++)
    axes.push(normalVector(pol[i], pol[i + 1 >= length ? 0 : i + 1]));
  return axes;
}

function howMuchOverlap(p1, p2) {
  if (p1[0] <= p2[0] && p2[0] <= p1[1] && p1[0] <= p2[1] && p2[1] <= p1[1])
    return Math.abs(p2[1] - p2[0]);
  else if (p1[0] <= p2[0] && p2[0] <= p1[1])
    return Math.min(Math.abs(p2[1] - p1[0]), Math.abs(p2[1] - p1[1]));
  else if (p1[0] <= p2[1] && p2[1] <= p1[1])
    return Math.min(Math.abs(p2[1] - p1[0]), Math.abs(p2[1] - p1[1]));
  else if (p2[0] <= p1[0] && p1[0] <= p2[1] && p2[0] <= p1[1] && p1[1] <= p2[1])
    return Math.abs(p1[1] - p1[0]);
  else return -1;
}
const doesOverlap = (p1, p2) =>
  (p1[0] < p2[0] && p2[0] < p1[1]) || (p1[0] < p2[1] && p2[1] < p1[1]);

export function collisionSAT(pol1, pol2) {
  const axes1 = getAxes(pol1);
  const axes2 = getAxes(pol2);
  let axLength = axes1.length;
  let p1;
  let p2;
  let overlapValue;
  let overlapFinalValue = 100000;
  for (let i = 0; i < axLength; i++) {
    p1 = vector2dProjectMinMax(axes1[i], pol1);
    p2 = vector2dProjectMinMax(axes1[i], pol2);
    //console.log(p1, p2, i);
    overlapValue = howMuchOverlap(p1, p2);
    if (overlapValue == -1) return 10000;
    else overlapFinalValue = Math.min(overlapValue, overlapFinalValue);
  }
  axLength = axes2.length;
  for (let i = 0; i < axLength; i++) {
    p1 = vector2dProjectMinMax(axes2[i], pol1);
    p2 = vector2dProjectMinMax(axes2[i], pol2);
    //console.log(p1, p2, i);
    overlapValue = howMuchOverlap(p1, p2);
    if (overlapValue == -1) return 10000;
    else overlapFinalValue = Math.min(overlapValue, overlapFinalValue);
  }
  return overlapFinalValue;
}

