
/*
export function make_tree(pos, tAngle, tSize = 5, tLevel = 0, tRatio = 2) {
  let lst = [];
  let rot = 0.0;
  lst.push(pos)
  function make(size, level){
    if (level < 0) return;
    pos.x += Math.cos(rot)*size;
    pos.y += Math.sin(rot)*size;
    lst.push(pos);
    rot -= tAngle;
    make(size/tRatio, level-1);
    rot += tAngle*2.0;
    make(size/tRatio, level-1);
    rot -= tAngle;
    pos.x -= Math.cos(rot)*size;
    pos.y -= Math.sin(rot)*size;
    lst.push(pos);
  }
  make(tSize, tLevel)
  return {
    points: lst,
    draw: (ctx, camera_offset) => {
      const size = points.size;
      for (let i = 0; i < size; i++) {
        ctx.lineTo(
          points[i].x + camera_offset.x,
          points[i].y + camera_offset.y,
        );
      }
    }
  }
}
*/
