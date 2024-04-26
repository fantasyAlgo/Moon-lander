const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Player {
    constructor(x, y, width, height, color, weight, fuel) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.rotation = 0;
        this.lst = [
            [this.x, this.y],
            [this.x + this.width, this.y + this.height],
            [this.x - this.width, this.y + this.height],
            [this.x, this.y + this.height / 1.5],
            [this.x + this.width, this.y + this.height],
            [this.x - this.width, this.y + this.height]
        ]
        this.fuel = fuel;
        this.weight = weight;
    }
    move(x, y){
        this.x += x;
        this.y += y;
        for (let i = 0; i < this.lst.length; i++) {
            this.lst[i][0] += x;
            this.lst[i][1] += y;
        }
    }
    applyRotation() {
        let cos = Math.cos(this.rotation);
        let sin = Math.sin(this.rotation);
        for (let i = 0; i < this.lst.length; i++) {
            let x = this.lst[i][0] - this.x;
            let y = this.lst[i][1] - this.y;
            this.lst[i][0] = x * cos - y * sin + this.x;
            this.lst[i][1] = x * sin + y * cos + this.y;
        }
    }
    rotate(angle){
        this.rotation += angle;
        this.applyRotation();
    }

    draw() {
      ctx.beginPath();
      for (let i = 0; i < this.lst.length/2; i++) 
        ctx.lineTo(this.lst[i][0], this.lst[i][1]);
      ctx.closePath();
      for (let i = this.lst.length/2-1; i < this.lst.length; i++) 
        ctx.lineTo(this.lst[i][0], this.lst[i][1]);
      ctx.closePath();
  
      ctx.fillStyle = this.color;
      ctx.fill('evenodd');
    }
}

const triangle = new Player(200, 200, 50, 100, "black", 50, 1000);
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    //triangle.rotate(0.0001);
    //triangle.move(0.1, 0.1);
    triangle.draw();
    requestAnimationFrame(animate);
}
animate();
triangle.draw();