


export function setData(){
  let diff = localStorage.getItem("difficulty");
  let levels = [];
  console.log(diff)
  if (diff == "easy") levels = [0.001, 0.5, 5.0, 10000000000, 600, 0.07];
  if (diff == "medium") levels = [0.005, 0.30, 4.0, 5318008, 300, 0.07];
  if (diff == "hard") levels = [0.01, 0.2, 2.0, 8008, 200, 0.05];

  SPAWN_ASTEROID_PROB = levels[0];
  MAX_IMPACT_VEL = levels[1];
  MIN_ALIGNMENT = levels[2];
  INITIAL_FUEL = levels[3];
  const asteroid_factor = levels[4];
  PROB_TREE = levels[5];

  for (let _ = 0; _ < N_BIOMES; _++) {
    const amplitude = 200 + Math.random()*1000;
    const frequency = 200*(1000.0/amplitude) + (0.5 - Math.random())*100;
    const height = (0.5 - Math.random())*3000.0;
    const asteroid_rate = (frequency/amplitude)/asteroid_factor;
    console.log(amplitude, frequency, asteroid_rate);
    biomeData.push({
      "a" : amplitude,
      "f" : frequency,
      "h" : height,
      "da" : asteroid_rate,
    });
  }

}




// Data to set later
export let  SPAWN_ASTEROID_PROB = 0.0;
export let  MAX_IMPACT_VEL = 0.0;
export let  MIN_ALIGNMENT = 0.0;
export let  INITIAL_FUEL = 0.0;
export let biomeData = [];
export let PROB_TREE = 0.00;
/////////////////////////////


export const MIN_HEIGHT_DUST = 100;
export const N_DIFFERENT_TREES = 10;


export const GRAVITY_STRENGTH = 0.01;
export const ROBOT_FLOOR_DISTANCE = 10;

export const N_BIOMES = 20;
export const DIST_BIOME = 4000;
export const INTERSECTION_PERIOD = 500;






export const SATResult = {
  COLLISION: 1,
  NOT_COLLISION: 10000,
};


