import { Game } from "./game.js";


const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const player_vel = localStorage.getItem("velocity") / 10;
const player_gas = { y: 160 / player_vel, x: 180 / player_vel };
const player_weight = localStorage.getItem("weight");
const player_particles = 500;
const boost_duration = 200;


canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.game = new Game(canvas, ctx, player_weight, boost_duration, player_vel);


let lastTime = performance.now();
let dt;
function animate() {
  const now = performance.now();
  dt = (now-lastTime)/5;
  lastTime = now;

  game.update(dt);
  game.draw(ctx);
  game.drawText(ctx);
  if (game.dead_time > 1000) window.location.href = "game.html";
  if (game.pageNeeded == 1) window.location.href = "won.html"
  requestAnimationFrame(animate);
}

animate()

document.addEventListener("keydown", (e) => {
  game.handleKeyDown(e);
});
document.addEventListener("keyup", (e) => {
  game.handleKeyUp(e);
});

document.addEventListener("mousemove", (e) => {
  game.handleMouseMovement(e);
});
