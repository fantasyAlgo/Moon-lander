

//export function make_tree(tAngle=Math.PI/4, tSize = 100, tLevel = 5, tRatio = 2) {
export function make_tree(tAngle=Math.PI/4, tSize = 100, tLevel = 5, tRatio = 2) {
  let pos = {x: 0.0, y: 0.0}
  let lst = [];
  let rot = 0.0;
  lst.push(pos)
  function make(size, level){
    if (level < 0) return;
    pos.x += Math.sin(rot)*size;
    pos.y += Math.cos(rot)*size;
    lst.push({x: pos.x, y: pos.y});
    console.log("new pos: ", pos)
    rot -= tAngle;
    make(size/tRatio, level-1);
    rot += tAngle*2.0;
    make(size/tRatio, level-1);
    rot -= tAngle;
    pos.x -= Math.sin(rot)*size;
    pos.y -= Math.cos(rot)*size;
    lst.push({x: pos.x, y: pos.y});
  }
  make(tSize, tLevel);
  console.log("baka");
  for (let i = 0; i < lst.length; i++) {
    const e = lst[i];
    console.log(e.x, e.y);
  }
  console.log("size baka: ", lst.length)
  return {
    points: lst,
    draw: (ctx, pos, camera_offset) => {
      const size = lst.length;
      ctx.beginPath()
      ctx.lineWidth = 1;
      ctx.lineCap     = "round";
      ctx.moveTo(pos.x, pos.y);
      for (let i = 0; i < size; i++) {
        ctx.lineTo(
          -lst[i].x + pos.x ,
          -lst[i].y + pos.y ,
        );
      }
      ctx.stroke();
    }
  }
}
