const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let camera_offset = {x: 0, y: 0};
class Player {
    constructor(x, y, width, height, color, weight, fuel) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.rotation = 0;
        this.totalRotation = 0;
        this.force = {x: 0, y: 0};
        // Points of the graphics, they are useful for the rotate method
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
    // Move the player updating each point of the list of points for the graphics
    move(x, y){
        this.x += x;
        this.y += y;
        for (let i = 0; i < this.lst.length; i++) {
            this.lst[i][0] += x;
            this.lst[i][1] += y;
        }
    }
    applyRotation() {
        // Using the 2d rotation matrix to rotate each point to the correct location after the rotation
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
        this.rotation = angle;
        this.totalRotation += angle;
        this.applyRotation();
    }
    update() {
        this.move(this.force.x, this.force.y);
        this.force.y += 0.000981*3 - this.force.y/this.weight/10;
        this.force.x *= 0.999;
    }
    draw() {
        ctx.beginPath();
        ctx.moveTo(this.lst[0][0]+camera_offset.x, this.lst[0][1]+camera_offset.y);
        for (let i = 1; i < this.lst.length/2; i++)  ctx.lineTo(this.lst[i][0]+camera_offset.x, this.lst[i][1]+camera_offset.y);
        ctx.closePath();
        ctx.moveTo(this.lst[this.lst.length/2-1][0]+camera_offset.x, this.lst[this.lst.length/2-1][1]+camera_offset.y);
        for (let i = this.lst.length/2; i < this.lst.length; i++)  ctx.lineTo(this.lst[i][0]+camera_offset.x, this.lst[i][1]+camera_offset.y);
        ctx.closePath();

        ctx.fillStyle = this.color;
        ctx.fill('evenodd');
    }
}
class Terrain {
    constructor() {
      this.points = [];
      for (let x = -1000; x <= canvas.width+1000; x += 200) {
        let y = Math.random() * canvas.height / 2 + canvas.height / 2;
        this.points.push({x, y});
      }
    }

    draw() {
      ctx.beginPath();
      ctx.moveTo(0, canvas.height);
      for (let point of this.points)
        ctx.lineTo(point.x+camera_offset.x, point.y+camera_offset.y);
      ctx.lineTo(canvas.width, canvas.height);
      ctx.closePath();
      ctx.fillStyle = "white";
      ctx.fill();

      ctx.strokeStyle = "black";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
}


const triangle = new Player(100, 10, 25, 50, "black", 50, 1000);
const terrain = new Terrain();
let xRotation = 0;

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ADD8E6";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    triangle.rotate(xRotation);
    camera_offset = {x: -triangle.x + canvas.width/2, y: -triangle.y + canvas.height/2};

    triangle.update();
    triangle.draw();
    terrain.draw();

    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText("Fuel: " + triangle.fuel, 10, 30);
    ctx.fillText("Y-velocity: " + -Math.floor(triangle.force.y*100)/100, 10, 60);
    requestAnimationFrame(animate);
}
animate();
triangle.draw();


document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp" && triangle.fuel > 0) {
        console.log(triangle.totalRotation, Math.cos(triangle.totalRotation), Math.sin(triangle.totalRotation));
        triangle.force.x += Math.sin(triangle.totalRotation)/90;
        triangle.force.y -= Math.cos(triangle.totalRotation)/40;
        triangle.fuel -= 1;
    }
    if (e.key === "ArrowRight") xRotation = -0.009;
    if (e.key === "ArrowLeft") xRotation = 0.009;
});
document.addEventListener("keyup", (e) => {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") 
        xRotation = 0;
});