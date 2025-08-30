
let diff = localStorage.getItem("difficulty");
let levels = [];
console.log(diff)
if (diff == "easy") levels = [0.001, 0.5, 5.0, 10000000000];
if (diff == "medium") levels = [0.005, 0.30, 4.0, 10000000];
if (diff == "hard") levels = [0.01, 0.2, 2.0, 10000];

export const SPAWN_ASTEROID_PROB = levels[0];
export const MAX_IMPACT_VEL = levels[1];
export const MIN_ALIGNMENT = levels[2];
export const INITIAL_FUEL = levels[3];
export const MIN_HEIGHT_DUST = 100;
export const N_DIFFERENT_TREES = 10;

