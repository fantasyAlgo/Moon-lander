import { Game } from "./game.js";
import { getCookie, setCookie } from "./helpers/cookieHelpers.js";
import { setData } from "./settings.js";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");


let player_vel; let player_gas;  let player_weight;  let player_particles; let boost_duration;
let game; let lastTime; let dt;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
window.game = game;


const loadButton = document.getElementById('loadButton');
const loader = document.getElementById('loader');
const progressText = document.getElementById('progressText');
const landingPage = document.getElementById('landingPage');
const gameContainer = document.getElementById('gameContainer');


function saveInput() {
  var weight = document.getElementById("weight").value;
  var velocity = document.getElementById("velocity").value;
  var difficulty = document.getElementById("difficulty").value;
  localStorage.setItem("weight", weight == "" ? 200 : weight);
  localStorage.setItem("difficulty", difficulty);
  localStorage.setItem(
      "velocity",
      velocity == "" ? 30 : velocity,
  );
}



function animate() {
  const now = performance.now();
  dt = (now-lastTime)/5;
  lastTime = now;

  game.update(dt);
  game.draw(ctx);
  game.drawText(ctx);
  if (game.dead_time > 100) game.reset(ctx, player_weight, boost_duration, player_vel);
  if (game.pageNeeded == 1){
    window.location.href = "won.html"

    const prev = getCookie("best_score");
    if (prev == undefined || prev < game.total_time) setCookie("best_score", game.total_time, 10);
  }
  requestAnimationFrame(animate);
}


function initGame(){
  lastTime = performance.now();
  player_vel = localStorage.getItem("velocity") / 10;
  player_gas = { y: 160 / player_vel, x: 180 / player_vel };
  player_weight = localStorage.getItem("weight");
  player_particles = 500;
  boost_duration = 200;

  setData();

  game = new Game(canvas, ctx, player_weight, boost_duration, player_vel);
  animate();
}


function loadGame(){
  saveInput();
  loadButton.disabled = true;
  loader.classList.add('active');
  try {
    initGame();
    gameContainer.classList.add('active');
  } catch (e) {
    console.error('Error loading game:', error);
    progressText.textContent = 'Error loading game';
    loadButton.disabled = false;
  }
}

const best_score = getCookie("best_score");
document.getElementById('best_score').innerText = best_score == undefined ? "" : "best score: "+ Math.floor(best_score*100.0)/10000.0; 


loadButton.addEventListener('click', loadGame);

document.addEventListener("keydown", (e) => {
  if (game != undefined)
    game.handleKeyDown(e);
});
document.addEventListener("keyup", (e) => {
  if (game != undefined)
    game.handleKeyUp(e);

});

document.addEventListener("mousemove", (e) => {
  if (game != undefined)
    game.handleMouseMovement(e);

});
