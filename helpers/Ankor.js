import { SIZE_ANKOR } from "../settings.js";
import { lineCollision } from "./collisions.js";
import { getFloorValue } from "./perlin.js";
import { Polygon } from "./Polygon.js";
import { drawVectorPolygon, make_vector2d, rotateVectorShape, vector2dAdd, vector2dMult } from "./Vector2.js";

export class Ankor {
  // Here i assume perlin to have .getVal(x)
  constructor(player_x, dist, perlin){
   const dir = Math.random() > 0.5 ? 1 : -1;
   const upper = [
     make_vector2d(-1, -1),
     make_vector2d(-0.5, -0.5),
     make_vector2d(0.5, -0.5),
     make_vector2d(1, -1),
   ]
   const lower = [
     make_vector2d(-0.5, 0),
     make_vector2d(-0.5, -0.5),
     make_vector2d(0.5, -0.5),
     make_vector2d(0.5, 0),
   ]
    for (let i = 0; i < 4; i++) upper[i] = make_vector2d(upper[i].x*SIZE_ANKOR, upper[i].y*SIZE_ANKOR);
    for (let i = 0; i < 4; i++) lower[i] = make_vector2d(lower[i].x*SIZE_ANKOR, lower[i].y*SIZE_ANKOR);

    this.x = player_x + dist * dir + (Math.random()-0.5)*(dist/5);
    this.y = getFloorValue(perlin, this.x)
    this.lPolygon = new Polygon(make_vector2d(this.x, this.y), lower);
    this.uPolygon = new Polygon(make_vector2d(this.x, this.y), upper);
   }
  changePos(pos){
    this.x = pos.x;
    this.y = pos.y;
    this.lPolygon.pos = pos;
    this.uPolygon.pos = pos;
  }
  setFakeColor(new_color){
    console.log("iopjerygtgresdiop");
    this.lPolygon.color = new_color;
    this.uPolygon.color = new_color;
  }
  checkPlayerCollision(player){ // Basically returns the line (if one) that the player insect with the up Ankor
    const uPShape = this.uPolygon.getShape(); 
    const pShape = player.getShape();
    const pLength = pShape.length;
    const uPLength = uPShape.length;
    console.log(pLength, uPLength);
    for (let i = 0; i < uPShape.length-1; i++) {
      const l1 = [uPShape[i], uPShape[(i+1)%uPLength]];
      for (let j = 0; j < pShape.length; j++) {
        const l2 = [pShape[j], pShape[(j+1)%pLength]];
        if (lineCollision(l1, l2)) return i;
j     }
    }
    return -1;
  }
  draw(ctx, co){
    this.lPolygon.draw(ctx, co, false);
    this.uPolygon.draw(ctx, co, false);

  }
}
