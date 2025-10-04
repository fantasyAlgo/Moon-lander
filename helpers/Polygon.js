import { drawVectorPolygon, make_vector2d, rotateVectorShape, vector2dAdd, vector2dMult } from "./Vector2.js";

export class Polygon {
  constructor(pos, modelBody){
    this.rot = 0.0;
    this.pos = make_vector2d(0.0, 0.0);
    this.modelBody = modelBody;
    this.center = this.getCenter();
    this.pos = pos;
  }
  getCenter(){
    let v = make_vector2d(0.0, 0.0);
    for (let i = 0; i < this.modelBody.length; i++) 
      v = vector2dAdd(v, this.modelBody[i])
    v.x /= this.modelBody.length;
    v.y /= this.modelBody.length;
    v = vector2dAdd(v, this.pos);
    return v;
  }
  getShape(){
    const l = this.modelBody.length;
    let usedShape = rotateVectorShape(this.modelBody, this.center, this.rot)
    let shape = [];
    for (let i=0; i < l; i++)
      shape.push(vector2dAdd(usedShape[i], this.pos))
    return shape
  }
  draw(ctx, co){
    drawVectorPolygon(ctx, this.pos, rotateVectorShape(this.modelBody, this.center, this.rot), co);
  }
};
