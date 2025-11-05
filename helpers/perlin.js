// thanks https://www.michaelbromley.co.uk/blog/simple-1d-noise-in-javascript/ for the code

import { biomeData, DIST_BIOME, INTERSECTION_PERIOD, N_BIOMES } from "../settings.js";

var lerp = function(a, b, t ) {
    return a * ( 1 - t ) + b * t;
};

export var Simple1DNoise = function() {
    var MAX_VERTICES = 256;
    var MAX_VERTICES_MASK = MAX_VERTICES -1;
    var amplitude = 1;
    var scale = 1;

    var r = [];

    for ( var i = 0; i < MAX_VERTICES; ++i ) {
        r.push(Math.random());
    }

    var getVal = function( x ){
        var scaledX = x * scale;
        var xFloor = Math.floor(scaledX);
        var t = scaledX - xFloor;
        var tRemapSmoothstep = t * t * ( 3 - 2 * t );

        /// Modulo using &#038;
        var xMin = xFloor & MAX_VERTICES_MASK;
        var xMax = ( xMin + 1 ) & MAX_VERTICES_MASK;

        var y = lerp( r[ xMin ], r[ xMax ], tRemapSmoothstep );

        return y * amplitude;
    };
    const getDer = function( x ){
        var scaledX = x * scale;
        var xFloor = Math.floor(scaledX);
        var t = scaledX - xFloor;
        var tRemapSmoothstep = t * t * ( 3 - 2 * t );

        /// Modulo using &#038;
        var xMin = xFloor & MAX_VERTICES_MASK;
        var xMax = ( xMin + 1 ) & MAX_VERTICES_MASK;
        var dy = r[xMax]-r[xMin]

        //var y = lerp( r[ xMin ], r[ xMax ], tRemapSmoothstep );

        return dy * amplitude;
    }

    /**
    * Linear interpolation function.
    * @param a The lower integer value
    * @param b The upper integer value
    * @param t The value between the two
    * @returns {number}
    */

    // return the API
    return {
        getVal: getVal,
        getDer: getDer,
        setAmplitude: function(newAmplitude) {
            amplitude = newAmplitude;
        },
        setScale: function(newScale) {
            scale = newScale;
        }
    };
};


// returns the floor position at a specific x pos
export function getFloorValue(perlin, pos){
  if (pos < 0) pos *= -1.0;
  const biome = Math.floor(pos/DIST_BIOME)%N_BIOMES;
  const t = (pos - biome*DIST_BIOME)/INTERSECTION_PERIOD;
  const tRemapSmoothstep = t * t * ( 3 - 2 * t );
  const v = perlin.getVal(pos/biomeData[biome].f)*biomeData[biome].a + biomeData[biome].h;
  //console.log("hello: ", t, biome);
  if (t < 1.0 && (biome-1) >= 0){
    const vPrev = perlin.getVal(pos/biomeData[biome-1].f)*biomeData[biome-1].a + biomeData[biome-1].h;
    return lerp(vPrev, v, tRemapSmoothstep);
  }
  return v;
}

export function getFloorDer(perlin, pos){
  if (pos < 0) pos *= -1.0;
  const biome = Math.floor(pos/DIST_BIOME)%N_BIOMES;
  const t = (pos - biome*DIST_BIOME)/INTERSECTION_PERIOD;
  if (t < 1.0){
    const dx = 0.1;
    return (getFloorValue(perlin, pos+dx)-getFloorValue(perlin, pos))/dx;
  }
  return perlin.getDer(pos / biomeData[biome].f );
}


export function getBiome(pos){
  if (pos < 0) pos*=-1.0;
  return Math.floor(pos/DIST_BIOME)%N_BIOMES;
}


