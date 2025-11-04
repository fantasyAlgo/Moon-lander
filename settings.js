


export function setData(){
  let diff = localStorage.getItem("difficulty");
  let levels = [];
  console.log(diff)
  if (diff == "easy") levels = [0.001, 0.5, 5.0, 10000000000];
  if (diff == "medium") levels = [0.005, 0.30, 4.0, 5318008];
  if (diff == "hard") levels = [0.01, 0.2, 2.0, 8008];

  SPAWN_ASTEROID_PROB = levels[0];
  MAX_IMPACT_VEL = levels[1];
  MIN_ALIGNMENT = levels[2];
  INITIAL_FUEL = levels[3];
}




// Data to set later
export let  SPAWN_ASTEROID_PROB = 0.0;
export let  MAX_IMPACT_VEL = 0.0;
export let  MIN_ALIGNMENT = 0.0;
export let  INITIAL_FUEL = 0.0;
/////////////////////////////


export const MIN_HEIGHT_DUST = 100;
export const N_DIFFERENT_TREES = 10;
export const PROB_TREE = 0.05;


export const GRAVITY_STRENGTH = 0.01;
export const ROBOT_FLOOR_DISTANCE = 10;


export const SATResult = {
  COLLISION: 1,
  NOT_COLLISION: 10000,
};


