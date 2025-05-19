export function make_sky(ctx, nStars) {
  let lst = [];
  for (let i = 0; i < nStars; i++) {
    lst.push({
      x: Math.random() * canvas.width * 2,
      y: Math.random() * canvas.height * 2,
      size: Math.random() * 5 + 3,
    });
  }
  return {
    get_sky: lst,
    draw: (camera_offset) => {
      ctx.fillStyle = "white";
      let each;
      for (let i = 0; i < nStars; i++) {
        each = lst[i].x + camera_offset.x / 10;
        if (each < 0)
          ctx.fillRect(
            2 * canvas.width - (Math.abs(each) % (2 * canvas.width)),
            (lst[i].y + camera_offset.y / 20) % (2 * canvas.height),
            lst[i].size,
            lst[i].size,
          );
        else
          ctx.fillRect(
            each % (2 * canvas.width),
            (lst[i].y + camera_offset.y / 20) % (2 * canvas.height),
            lst[i].size,
            lst[i].size,
          );
      }
    },
  };
}
