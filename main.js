import { Simple1DNoise } from './perlin.js';

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const player_vel = localStorage.getItem("velocity");
const player_weight = localStorage.getItem("weight");

console.log(player_vel, player_weight);

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let perlin = new Simple1DNoise();
let camera_offset = {x: 0, y: 0};

let clamp = (num, min, max) => Math.min(Math.max(num, min), max);
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
        this.start_time = 0;
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
        this.force.y += 0.000981*2.3 + clamp(this.force.y/this.weight/20, -0.000981, 0.000981);
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
function drawTerrain(player) {
    ctx.beginPath();

    ctx.moveTo(player.x > 0 ? -player.x : -camera_offset.x, canvas.height);
    // i made this to always start at a number divisible by 40, in this way the starting point of each line don't change at each offset
    let start_pos = -Math.floor(camera_offset.x/40)*40 - 40;
    for (let i = start_pos; i < canvas.width + player.x; i+=40) 
        ctx.lineTo(i+camera_offset.x, perlin.getVal(i/200)*500+camera_offset.y);
    ctx.lineTo(canvas.width + (player.x > 0 ?  player.x : camera_offset.x), canvas.height);
    ctx.closePath();
    ctx.fillStyle = "#121211";
    ctx.fill();

    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.stroke();
}
class RocketParticleSystem {
    constructor() {
        this.active_particles = [];
    }
    emit(start_pos, vel){
        this.active_particles.push({
            time_rem: 1+(Math.random()*2-1)/10,
            pos: start_pos,
            vel: {
                x: vel.x + (Math.random()*2 - 1)/2,
                y: vel.y + (Math.random()*2 - 1)/10, 
            }
        });
    }
    update(){
        let length = this.active_particles.length;
        for (let i = 0; i < length; i++) {
            if (this.active_particles[i].time_rem < 0){
                this.active_particles.shift();
                console.log(this.active_particles)
                i -= 1;
                length -= 1;
                continue;
            }
            this.active_particles[i].pos.x += this.active_particles[i].vel.x;
            this.active_particles[i].pos.y += this.active_particles[i].vel.y;
            this.active_particles[i].time_rem -= 0.01;
        }
    }
    draw(){
        let length = this.active_particles.length;
        let pos;
        ctx.fillStyle = "#916846";
        for (let i = 0; i < length; i++) {
            pos = this.active_particles[i].pos;
            ctx.fillRect(pos.x, pos.y, 2, 2);
        }
    }
}
//class Terrain {}

const player = new Player(10, 1, 25, 50, "#929990", 50, 4000);
player.move(0, -400);

let goUp = false;
let xRotation = 0;
let attractPoint = [0,0]; 
let sameInInterval = (a, b, interval) => Math.abs(a-b) < interval;
let particles = new RocketParticleSystem();

let middlePoint = (player, camera_offset) => {
    return {x: (player.lst[1][0]+player.lst[2][0])/2 + camera_offset.x, 
            y: (player.lst[1][1]+player.lst[2][1])/2 + camera_offset.y};
};
function animate() {
    attractPoint = [perlin.getVal(player.lst[1][0]/200)*500 + camera_offset.y,
                    perlin.getVal(player.lst[2][0]/200)*500 + camera_offset.y];

    if (player.lst[1][1]+camera_offset.y > attractPoint[0] || player.lst[2][1]+camera_offset.y > attractPoint[1]) {
        if (Math.abs(player.force.y) <= 0.12 && sameInInterval(player.lst[1][1]+camera_offset.y, attractPoint[0], 1) && 
                                                sameInInterval(player.lst[2][1]+camera_offset.y, attractPoint[1], 1))
            window.location.href = "won.html";
        else window.location.href = "game.html";
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#1c1c1b";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    player.rotate(xRotation);
    camera_offset = {x: -player.x + canvas.width/2, y: -player.y + canvas.height/2};

    player.update();
    player.draw();
    drawTerrain(player);

    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText("Fuel: " + player.fuel, 10, 30);
    ctx.fillText("Y-velocity: " + -Math.floor(player.force.y*100)/100, 10, 60);
    if (goUp && player.fuel > 0) rocket_up();
    ctx.fillRect(player.lst[1][0]+camera_offset.x, attractPoint[0], 1, 40);
    ctx.fillRect(player.lst[2][0]+camera_offset.x, attractPoint[1], 1, 40);

    if (goUp)
        particles.emit({x: player.lst[3][0]+camera_offset.x, y: player.lst[3][1]+camera_offset.y}, 
                        {x: -player.force.x, y: -player.force.y});
    particles.update();
    particles.draw();

    requestAnimationFrame(animate);
}
animate();

let rocket_up = () =>{
    player.force.x += Math.sin(player.totalRotation)/180;
    player.force.y -= Math.cos(player.totalRotation)/160;
    player.fuel -= 1;
    goUp = true;
}
document.addEventListener("keydown", (e) => {
    if ((e.key === "ArrowUp" || goUp) && player.fuel > 0)
        goUp = true;
    if (e.key === "ArrowRight") xRotation = 0.009;
    if (e.key === "ArrowLeft") xRotation = -0.009;
});
document.addEventListener("keyup", (e) => {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") 
        xRotation = 0;
    else {
        goUp = false;
    }
});